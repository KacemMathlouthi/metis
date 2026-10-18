# Metis Backend

FastAPI service and Celery workers that receive GitHub webhooks, run the AI agents, and serve the dashboard API.

**Stack:** Python 3.10, FastAPI, async SQLAlchemy + Alembic (PostgreSQL), Celery + Redis, LiteLLM, Daytona.

## Run locally

```bash
cp .env.example .env              # see "Configuration" below
uv sync
uv run alembic upgrade head
uv run uvicorn app.main:app --reload --port 8000
uv run celery -A app.core.celery_app worker --loglevel=info   # separate terminal
```

PostgreSQL and Redis come from `make infra-up` at the repository root. Interactive API docs are served at `http://localhost:8000/api/docs`. For a task monitor, run `uv run celery -A app.core.celery_app flower --port=5555`.

## Configuration

All settings are read by `app/core/config.py` from the environment or `.env`; `.env.example` lists them. Required: the GitHub App credentials (`GITHUB_APP_ID`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET_ID`, `GITHUB_WEBHOOK_SECRET`, `GITHUB_SECRET_KEY_PATH`), `MODEL_NAME` plus your provider's key, `DATABASE_URL`, `REDIS_URL`, the Celery URLs, `JWT_SECRET_KEY`, `ENCRYPTION_KEY`, `FRONTEND_URL`, and the `DAYTONA_*` settings. Set `LANGSMITH_TRACING=false` unless you use LangSmith.

## Layout

```
app/
├── api/           # routes: /webhooks/github, /auth, /api/{installations,issues,agents,review-comments,analytics}
├── core/          # settings, LiteLLM client, JWT/Fernet security, Redis, Celery app
├── db/, models/   # async engine and sessions; User, Installation, Review, ReviewComment, AgentRun
├── repositories/  # data access
├── services/      # GitHub App + OAuth clients, webhook handling, PR summary helpers
├── agents/        # agent loop, Review/Summary/Background agents, prompts, Daytona sandbox, tools
├── tasks/         # Celery tasks: review, summary, issue → PR
└── schemas/       # Pydantic request/response models
```

## How a review runs

1. `POST /webhooks/github` verifies the HMAC signature, ignores repositories that aren't enrolled, commits a `PENDING` review, and queues `process_pr_review_with_agent` and `process_pr_summary_with_agent`.
2. The worker fetches the diff and an installation token, then clones the PR branch into a Daytona sandbox.
3. `ReviewAgent` loops (LLM call → parallel tool calls) and posts inline findings as it goes, then calls `finish_review`. The worker submits the summary review and deletes the sandbox.

Issue → PR works the same way: `POST /api/agents/launch` creates an `AgentRun` and queues `process_issue_with_agent`. `BackgroundAgent` uses the coder tool set to branch, edit, test, commit, and push. The worker then verifies the branch on GitHub, opens the pull request, and stores the full conversation.

Agents only get the tools their job needs (`agents/tools/manager.py`): reviewer 11, summary 5, coder 19. Per-run debug logs are written to `logs/agents/`.

## Development

```bash
uv run ruff check . && uv run ruff format .
uv run mypy app/
uv run pytest
uv run alembic revision --autogenerate -m "describe change"
```
