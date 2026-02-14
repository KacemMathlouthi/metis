"""Celery task for PR description summary generation and update."""

import asyncio
import logging

from sqlalchemy import and_, select

from app.agents.implementation.summary_agent import SummaryAgent
from app.agents.loop import AgentLoop
from app.agents.sandbox.manager import SandboxManager
from app.agents.tools.manager import get_summary_tools
from app.core.celery_app import BaseTask, celery_app
from app.core.client import get_llm_client
from app.db.base import AsyncSessionLocal, engine
from app.models.installation import Installation
from app.models.review import Review
from app.services.github import GitHubService
from app.services.pr_summary import compose_pr_description

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, base=BaseTask, time_limit=3600)
def process_pr_summary_with_agent(
    self,
    review_id: str,
    installation_id: int,
    repository: str,
    pr_number: int,
    mode: str = "append",
):
    """Generate and write PR summary into PR description body."""
    return asyncio.run(
        _process_pr_summary_with_agent_async(
            self,
            review_id=review_id,
            installation_id=installation_id,
            repository=repository,
            pr_number=pr_number,
            mode=mode,
        )
    )


async def _process_pr_summary_with_agent_async(
    task_self,
    review_id: str,
    installation_id: int,
    repository: str,
    pr_number: int,
    mode: str = "append",
):
    """Async implementation for summary generation and PR description patch."""
    sandbox = None
    sandbox_manager = None
    review = None

    normalized_mode = (mode or "append").strip().lower()
    if normalized_mode not in {"append", "replace"}:
        normalized_mode = "append"

    async with AsyncSessionLocal() as db:
        github = GitHubService()

        try:
            logger.info(
                "Loading summary context review=%s repository=%s pr=%s mode=%s",
                review_id,
                repository,
                pr_number,
                normalized_mode,
            )

            review_query = await db.execute(select(Review).where(Review.id == review_id))
            review = review_query.scalar_one_or_none()
            if not review:
                logger.warning("Review %s not found, skipping summary", review_id)
                return {
                    "status": "ignored",
                    "reason": "review_not_found",
                    "review_id": review_id,
                }

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
                logger.warning("Installation not found for %s", repository)
                return {
                    "status": "ignored",
                    "reason": "installation_not_found",
                    "review_id": review_id,
                }

            owner, repo = repository.split("/")
            pr_diff = await github.get_pr_diff(owner, repo, pr_number, installation_id)
            pr_data = await github.get_pull_request(owner, repo, pr_number, installation_id)

            head_branch = (
                review.pr_metadata.get("head_branch")
                or pr_data.get("head", {}).get("ref")
                or "main"
            )
            base_branch = (
                review.pr_metadata.get("base_branch")
                or pr_data.get("base", {}).get("ref")
                or "main"
            )
            language = (
                review.pr_metadata.get("language")
                or pr_data.get("base", {}).get("repo", {}).get("language")
                or "Unknown"
            )

            installation_token = await github.get_installation_token(installation_id)
            custom_instructions = (
                (installation.config or {}).get("summary_instructions", "").strip()
            )
            mode_from_config = (installation.config or {}).get("summary_mode")
            if isinstance(mode_from_config, str) and mode == "append":
                mode_candidate = mode_from_config.strip().lower()
                if mode_candidate in {"append", "replace"}:
                    normalized_mode = mode_candidate

            sandbox_language = "python"
            if isinstance(language, str):
                language_map = {
                    "Python": "python",
                    "TypeScript": "typescript",
                    "JavaScript": "javascript",
                }
                sandbox_language = language_map.get(language, "python")

            sandbox_manager = SandboxManager(
                git_username="x-access-token",
                git_token=installation_token,
            )
            sandbox = sandbox_manager.acquire(
                agent_id=f"{review_id}:summary",
                repository_url=f"https://github.com/{repository}.git",
                branch=head_branch,
                language=sandbox_language,
            )

            tools = get_summary_tools(sandbox=sandbox)
            llm_client = get_llm_client()

            agent = SummaryAgent(
                agent_id=f"{review_id}:summary",
                repository=repository,
                pr_number=pr_number,
                pr_title=pr_data.get("title") or review.pr_metadata.get("title", ""),
                pr_description=pr_data.get("body") or review.pr_metadata.get("description", ""),
                author=(pr_data.get("user") or {}).get("login")
                or review.pr_metadata.get("author", "unknown"),
                base_branch=base_branch,
                head_branch=head_branch,
                pr_diff=pr_diff,
                files_changed=int(pr_data.get("changed_files") or 0),
                lines_added=int(pr_data.get("additions") or 0),
                lines_removed=int(pr_data.get("deletions") or 0),
                language=language,
                custom_instructions=custom_instructions,
                tools=tools,
                llm_client=llm_client,
                max_iterations=25,
                max_tokens=600_000,
                max_tool_calls=120,
                max_duration_seconds=3000,
            )

            loop = AgentLoop(agent)
            final_state = await loop.execute()

            if final_state.status != "completed" or not final_state.result:
                reason = final_state.error or "agent_not_completed"
                logger.error("Summary agent failed review=%s reason=%s", review_id, reason)
                await db.refresh(review)
                review.pr_metadata = {
                    **(review.pr_metadata or {}),
                    "summary_status": "FAILED",
                    "summary_error": reason,
                }
                await db.commit()
                return {
                    "status": "failed",
                    "reason": reason,
                    "review_id": review_id,
                }

            summary_text = (final_state.result.get("summary_text") or "").strip()
            generated_pr_title = (final_state.result.get("pr_title") or "").strip()
            if not summary_text:
                reason = "missing_summary_text"
                logger.error("Summary agent completed without summary_text review=%s", review_id)
                await db.refresh(review)
                review.pr_metadata = {
                    **(review.pr_metadata or {}),
                    "summary_status": "FAILED",
                    "summary_error": reason,
                }
                await db.commit()
                return {
                    "status": "failed",
                    "reason": reason,
                    "review_id": review_id,
                }
            if not generated_pr_title:
                reason = "missing_pr_title"
                logger.error("Summary agent completed without pr_title review=%s", review_id)
                await db.refresh(review)
                review.pr_metadata = {
                    **(review.pr_metadata or {}),
                    "summary_status": "FAILED",
                    "summary_error": reason,
                }
                await db.commit()
                return {
                    "status": "failed",
                    "reason": reason,
                    "review_id": review_id,
                }

            compose_result = compose_pr_description(
                existing_body=pr_data.get("body"),
                summary_markdown=summary_text,
                mode=normalized_mode,
            )

            update_result = await github.update_pr_description(
                owner=owner,
                repo=repo,
                pr_number=pr_number,
                body=compose_result.body,
                title=generated_pr_title,
                installation_id=installation_id,
            )

            await db.refresh(review)
            review.pr_metadata = {
                **(review.pr_metadata or {}),
                "summary_status": "COMPLETED",
                "summary_mode": normalized_mode,
                "summary_generated_title": generated_pr_title,
                "summary_preview": summary_text[:2000],
                "summary_iterations": final_state.iteration,
                "summary_tokens_used": final_state.tokens_used,
                "summary_tool_calls": final_state.tool_calls_made,
                "summary_replaced_existing_block": compose_result.replaced_existing_block,
                "summary_inserted_new_block": compose_result.inserted_new_block,
                "summary_updated_pr_body_length": len(compose_result.body),
                "summary_updated_pr_number": update_result.get("number"),
            }
            await db.commit()

            return {
                "status": "success",
                "review_id": review_id,
                "pr_number": pr_number,
                "mode": normalized_mode,
                "pr_title": generated_pr_title,
            }

        except Exception as e:
            logger.error("Summary task failed review=%s error=%s", review_id, e, exc_info=True)
            await db.rollback()
            if review:
                await db.refresh(review)
                review.pr_metadata = {
                    **(review.pr_metadata or {}),
                    "summary_status": "FAILED",
                    "summary_error": str(e),
                }
                await db.commit()
            raise

        finally:
            if sandbox_manager and review_id:
                try:
                    sandbox_manager.release(f"{review_id}:summary")
                except Exception as e:
                    logger.error("Summary sandbox cleanup failed: %s", e)
            try:
                await engine.dispose()
            except Exception as e:
                logger.error("Engine dispose failed: %s", e)
