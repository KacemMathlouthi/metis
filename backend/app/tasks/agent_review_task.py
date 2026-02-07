"""Celery task for AI agent-powered code reviews."""

import asyncio
import logging
from sqlalchemy import select, and_

from app.core.celery_app import celery_app, BaseTask
from app.core.client import get_llm_client
from app.db.base import AsyncSessionLocal, engine
from app.models.installation import Installation
from app.models.review import Review
from app.repositories.review import ReviewRepository
from app.services.github import GitHubService
from app.agents.sandbox.manager import SandboxManager
from app.agents.tools.manager import get_reviewer_tools
from app.agents.implementation.review_agent import ReviewAgent
from app.agents.loop import AgentLoop

logger = logging.getLogger(__name__)
INT32_MAX = 2_147_483_647


def _to_int32_or_none(value: object) -> int | None:
    """Convert numeric values to int32 when possible."""
    if value is None:
        return None
    try:
        int_value = int(value)
    except (TypeError, ValueError):
        return None
    if 0 <= int_value <= INT32_MAX:
        return int_value
    return None


@celery_app.task(bind=True, base=BaseTask, time_limit=3600)
def process_pr_review_with_agent(
    self,
    review_id: str,
    installation_id: int,
    repository: str,
    pr_number: int,
):
    """Process PR review using AI agent.

    Args:
        self: Celery task instance
        review_id: Review UUID
        installation_id: GitHub installation ID
        repository: Repository full name (owner/repo)
        pr_number: Pull request number
    """
    return asyncio.run(
        _process_pr_review_with_agent_async(
            self, review_id, installation_id, repository, pr_number
        )
    )


async def _process_pr_review_with_agent_async(
    task_self,
    review_id: str,
    installation_id: int,
    repository: str,
    pr_number: int,
):
    """Async implementation of agent-powered PR review.

    Args:
        task_self: Celery task instance
        review_id: Review UUID
        installation_id: GitHub installation ID
        repository: Repository full name (owner/repo)
        pr_number: Pull request number
    """
    sandbox = None
    sandbox_manager = None
    review = None

    async with AsyncSessionLocal() as db:
        review_repo = ReviewRepository()
        github = GitHubService()

        try:
            # 1. Load Review and Installation
            logger.info(f"Loading review {review_id}")

            review_query = await db.execute(select(Review).where(Review.id == review_id))
            review = review_query.scalar_one_or_none()

            if not review:
                logger.warning(f"Review {review_id} not found; skipping task without retry")
                return {"status": "ignored", "reason": "review_not_found", "review_id": review_id}

            installation_query = await db.execute(
                select(Installation).where(
                    and_(
                        Installation.github_installation_id == installation_id,
                        Installation.repository == repository,
                    )
                )
            )
            installation = installation_query.scalar_one_or_none()

            if not installation:
                review.status = "FAILED"
                review.error = f"Installation not found for {repository}"
                await db.commit()
                return {
                    "status": "failed",
                    "reason": "installation_not_found",
                    "review_id": review_id,
                }

            # Update status to PROCESSING
            review.status = "PROCESSING"
            await db.commit()

            # 2. Get PR diff and extract metadata
            logger.info(f"Fetching PR #{pr_number} diff from {repository}")

            owner, repo = repository.split("/")
            diff = await github.get_pr_diff(owner, repo, pr_number, installation_id)

            # Extract branch and language from stored metadata (from webhook)
            head_branch = review.pr_metadata.get("head_branch", "main")
            base_branch = review.pr_metadata.get("base_branch", "main")
            pr_language = review.pr_metadata.get("language", "Python")

            logger.info(f"PR: {head_branch} → {base_branch}, language: {pr_language}")

            # 3. Get GitHub installation token for git auth
            logger.info("Getting installation token for git authentication")
            installation_token = await github.get_installation_token(installation_id)

            # 4. Load reviewer configuration
            config_dict = installation.config or {}
            sensitivity = config_dict.get("sensitivity", "MEDIUM")
            custom_instructions = config_dict.get("custom_instructions", "")
            ignore_patterns = config_dict.get("ignore_patterns", [])

            logger.info(f"Review config: sensitivity={sensitivity}, ignore_patterns={ignore_patterns}")

            # 5. Initialize Daytona sandbox
            logger.info("Creating Daytona sandbox")

            sandbox_manager = SandboxManager(
                git_username="x-access-token",
                git_token=installation_token
            )

            # Clone repository in sandbox (PR branch)
            repo_url = f"https://github.com/{repository}.git"

            # Determine sandbox language
            sandbox_language = "python"  # Default
            if pr_language:
                # Map GitHub languages to Daytona languages
                language_map = {
                    "Python": "python",
                    "TypeScript": "typescript",
                    "JavaScript": "javascript",
                }
                sandbox_language = language_map.get(pr_language, "python")

            logger.info(f"Creating sandbox with language: {sandbox_language}")

            sandbox = sandbox_manager.acquire(
                agent_id=review_id,
                repository_url=repo_url,
                branch=head_branch,  # Clone PR branch directly
                language=sandbox_language,
            )

            logger.info(f"Sandbox created: {sandbox.id}")

            # 6. Initialize tools for reviewer
            tools = get_reviewer_tools(
                sandbox=sandbox,
                review_id=review_id,
                installation_token=installation_token,
                owner=owner,
                repo=repo,
                pr_number=pr_number,
                commit_sha=review.commit_sha,
            )

            logger.info(f"Registered {len(tools.list_tool_names())} tools for reviewer")

            # 7. Initialize LLM client
            llm_client = get_llm_client()

            # 8. Create ReviewAgent
            logger.info("Creating ReviewAgent")

            agent = ReviewAgent(
                agent_id=review_id,
                pr_title=review.pr_metadata.get("title", ""),
                pr_description=review.pr_metadata.get("description", ""),
                pr_diff=diff,
                sensitivity=sensitivity,
                custom_instructions=custom_instructions,
                ignore_patterns=ignore_patterns,
                tools=tools,
                llm_client=llm_client,
                max_iterations=50,
                max_tokens=1_000_000,
                max_tool_calls=100,
                max_duration_seconds=6000,
            )

            # 9. Run agent loop
            logger.info("Starting agent loop")

            loop = AgentLoop(agent)
            final_state = await loop.execute()

            logger.info(
                f"Agent finished: status={final_state.status}, "
                f"iterations={final_state.iteration}, "
                f"tokens={final_state.tokens_used}"
            )

            # 10. Extract final summary/verdict from result
            if final_state.status == "completed" and final_state.result:
                summary = final_state.result.get("summary")
                verdict = final_state.result.get("verdict", "COMMENT")
                overall_severity = final_state.result.get("overall_severity", "medium")

                if not summary:
                    reason = final_state.result.get("reason") or "missing_summary"
                    review.status = "FAILED"
                    review.error = (
                        f"Agent completed without finish_review output (reason={reason})"
                    )
                    await db.commit()
                    logger.error(review.error)
                    return {
                        "status": "failed",
                        "reason": "missing_summary",
                        "review_id": review_id,
                    }

                logger.info(
                    f"Review summary generated: {len(summary)} chars, verdict={verdict}, severity={overall_severity}"
                )

                # 11. Post final summary review to GitHub
                logger.info("Posting review to GitHub")

                gh_review = await github.create_pr_review(
                    owner=owner,
                    repo=repo,
                    pr_number=pr_number,
                    review_body=summary,
                    event=verdict,
                    installation_id=installation_id,
                )

                # 12. Update Review status
                review.status = "COMPLETED"
                review.review_text = summary
                review.github_review_id = _to_int32_or_none(gh_review.get("id"))
                review.pr_metadata = {
                    **(review.pr_metadata or {}),
                    "overall_severity": overall_severity,
                    "verdict": verdict,
                    "github_review_id_raw": gh_review.get("id"),
                    "iterations": final_state.iteration,
                    "tokens_used": final_state.tokens_used,
                    "tool_calls": final_state.tool_calls_made,
                }
                await db.commit()

                logger.info(f"Review {review_id} completed successfully")

            else:
                # Agent failed or hit limits
                error_msg = final_state.error or "Agent did not complete review"
                logger.error(f"Agent failed: {error_msg}")

                review.status = "FAILED"
                review.error = error_msg
                await db.commit()

        except Exception as e:
            logger.error(f"Review task failed: {e}", exc_info=True)
            await db.rollback()

            # Update review status
            if review:
                review.status = "FAILED"
                review.error = str(e)
                await db.commit()

            raise

        finally:
            # Cleanup sandbox
            if sandbox_manager and review_id:
                try:
                    logger.info(f"Cleaning up sandbox for {review_id}")
                    sandbox_manager.release(review_id)
                except Exception as e:
                    logger.error(f"Sandbox cleanup failed: {e}")
            # Celery retries can run in a new event loop in the same worker process.
            # Dispose pooled async connections to avoid cross-loop reuse.
            try:
                await engine.dispose()
            except Exception as e:
                logger.error(f"Engine dispose failed: {e}")
