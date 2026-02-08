# CLAUDE.md

This file provides guidance to any coding agent working on this repository.

## Standards

This is a **production-grade codebase**. All contributions must meet the following bar:

- **Code quality**: Clean, readable, well-structured code. No shortcuts, no hacks, no "good enough" solutions. Every function should be purposeful and every abstraction justified.
- **Performance**: Optimized by default. Async where it matters, efficient data structures, minimal allocations, no N+1 queries, no unnecessary re-renders.
- **Security**: Zero tolerance for vulnerabilities. Input validation at boundaries, parameterized queries, proper auth checks, no secrets in code, OWASP top 10 awareness at all times.
- **Error handling**: Graceful degradation, meaningful error messages, proper logging. No silent failures, no bare excepts, no swallowed errors.
- **Type safety**: Full type hints (Python) and strict TypeScript. No `Any` unless absolutely unavoidable. Types are documentation.
- **Testing mindset**: Write code that is testable. Dependency injection, clear interfaces, no hidden side effects.
- **Consistency**: Follow existing patterns in the codebase. Match naming conventions, file organization, and architectural patterns already established.

## Project Overview

Metis is an AI-powered GitHub code reviewer that provides intelligent, context-aware feedback on pull requests. The system uses a GitHub App to receive webhook events, analyze code changes, and post automated reviews.

**Architecture**: Monorepo with separate backend (Python/FastAPI) and frontend (React/TypeScript/Vite).

## Commands

### Backend (Python/FastAPI)

Navigate to `backend/` for all backend commands:

```bash
cd backend

# Development
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Celery worker (async task processing)
celery -A app.core.celery_app worker --loglevel=info
celery -A app.core.celery_app flower --port=5555  # Monitoring UI

# Install dependencies (using uv)
uv sync

# Database
docker-compose -f docker-compose.dev.yml up -d  # Start PostgreSQL + Redis + pgAdmin + Redis Insight
alembic upgrade head                             # Run migrations
alembic revision --autogenerate -m "description" # Create migration
alembic downgrade -1                             # Rollback one migration
alembic history                                  # View migration history

# Code quality
ruff check .              # Lint
ruff format .             # Format
mypy app/                 # Type check
pytest                    # Run all tests
pytest tests/unit         # Run unit tests only
pytest tests/integration  # Run integration tests only
pytest -v -k test_name    # Run specific test

# Pre-commit hooks
pre-commit install
pre-commit run --all-files

# Services
docker-compose -f docker-compose.dev.yml up -d     # Start all services
docker-compose -f docker-compose.dev.yml logs -f   # View logs
docker-compose -f docker-compose.dev.yml down      # Stop all services
```

**Access services:**
- PostgreSQL: localhost:5432
- pgAdmin: http://localhost:5050 (admin@example.com / admin)
- Redis: localhost:6379
- Redis Insight: http://localhost:5540
- Flower: http://localhost:5555 (when running)

### Frontend (React/TypeScript/Vite)

Navigate to `frontend/` for all frontend commands:

```bash
cd frontend

# Development
pnpm dev                  # Start dev server (uses rolldown-vite@7.2.5)
pnpm build                # Build for production (TypeScript + Vite)
pnpm preview              # Preview production build
pnpm lint                 # Lint with ESLint
```

**Note**: Frontend uses `rolldown-vite@7.2.5` (Rolldown-based Vite fork) with React Compiler enabled for performance.

**Dependencies:**
- Core: React 19, TypeScript, Vite
- UI: shadcn/ui, Tailwind v4, Radix UI primitives
- Icons: lucide-react, react-icons (simple-icons for language logos)
- Routing: React Router v7
- State: React Context API (Auth, Repository, Toast)
- API: Native fetch with cookie credentials

## Architecture

### Backend Structure (`backend/app/`)

```
app/
├── main.py              # FastAPI app initialization, CORS, health endpoints
├── api/                 # API route handlers
│   ├── auth.py          # Authentication endpoints (OAuth, login, logout, me)
│   ├── installations.py # Installation management (list, sync, enable, configure)
│   └── webhooks.py      # GitHub webhook endpoint (/webhooks/github) with async task queueing
├── core/                # Core configuration
│   ├── config.py        # Pydantic Settings for env vars, JWT, Redis, Celery, Daytona, LangSmith
│   ├── client.py        # LiteLLM client factory (multi-provider: Vertex AI, OpenAI, Mistral, etc.)
│   ├── security.py      # JWT generation/verification, token encryption (Fernet)
│   ├── auth_deps.py     # get_current_user() dependency for protected routes
│   ├── redis_client.py  # Redis singleton with connection pooling
│   └── celery_app.py    # Celery application with production config, BaseTask
├── db/                  # Database layer
│   ├── base.py          # Async SQLAlchemy engine, session factory
│   ├── session.py       # get_db() dependency with auto commit/rollback
│   └── base_class.py    # BaseModel with UUID, timestamps
├── models/              # SQLAlchemy ORM models
│   ├── user.py          # User accounts (GitHub OAuth)
│   ├── installation.py  # GitHub App installations (composite unique: installation_id + repository)
│   ├── review.py        # Review & ReviewComment models with celery_task_id
│   └── metrics.py       # UsageMetrics & WebhookEvent audit logs
├── repositories/        # Repository pattern (data access layer)
│   ├── user.py          # User CRUD with token encryption
│   ├── installation.py  # Installation CRUD (create, activate, deactivate, update_config)
│   └── review.py        # Review CRUD (create, create_pending_review, update_status)
├── services/            # Business logic
│   ├── github.py        # GitHub API client (JWT auth, installation tokens, fetch repos)
│   ├── oauth.py         # GitHub OAuth flow (login, token exchange, user info)
│   ├── webhook.py       # Async webhook handler (queues AI agent tasks, <500ms response)
│   └── metis_agent.py   # Legacy AI reviewer (superseded by agent system)
├── agents/              # AI Agent System (NEW)
│   ├── __init__.py      # Agent exports
│   ├── base.py          # BaseAgent with run() and should_stop() methods
│   ├── loop.py          # AgentLoop orchestrator
│   ├── implementation/  # Agent implementations
│   │   ├── review_agent.py      # ReviewAgent for PR reviews
│   │   └── background_agent.py  # BackgroundAgent for Issue → PR
│   ├── prompts/         # System prompts for agents
│   │   ├── reviewer_prompt.py   # Comprehensive code review prompt
│   │   └── coder_prompt.py      # Comprehensive coding prompt
│   ├── sandbox/         # Daytona sandbox integration
│   │   ├── client.py    # DaytonaClient wrapper with git auth
│   │   └── manager.py   # SandboxManager for lifecycle
│   └── tools/           # Tool system (22 tools)
│       ├── base.py              # BaseTool interface
│       ├── file_tools.py        # 6 file operations (read, list, search, replace, create, delete)
│       ├── git_tools.py         # 8 git operations (status, branch, add, commit, push, pull)
│       ├── process_tools.py     # 4 execution tools (command, code, tests, linter)
│       ├── completion_tools.py  # 2 completion tools (finish_review, finish_task)
│       ├── review_posting_tools.py  # 2 review posting tools (post_inline_finding, post_file_finding)
│       └── manager.py           # ToolManager with fine-grained tool sets
├── schemas/             # Pydantic models for request/response validation
│   ├── metis_config.py  # ReviewerConfig, SummaryConfig with sensitivity levels
│   └── installation.py  # Installation API schemas (7 models)
├── tasks/               # Celery background tasks
│   ├── __init__.py              # Task registration
│   ├── review_task.py           # Legacy PR review task
│   └── agent_review_task.py    # AI agent-powered review task
└── utils/               # Utility functions
    ├── prompts.py       # Legacy prompts
    └── agent_logger.py  # Structured file logging for agents
```

**Key flows**:
1. **Webhook Reception (Async)**: GitHub sends webhook → `api/webhooks.py` → signature verification → lookup Installation → create Review (PENDING) with PR metadata (head_branch, base_branch, language) → queue AI agent task → return 202 Accepted (<500ms)
2. **AI Agent Review Processing**: Celery worker → pick task from Redis → update Review (PROCESSING) → create Daytona sandbox → clone PR branch → initialize ReviewAgent with tools (including review posting tools) → run autonomous loop (plan → execute → evaluate) → agent uses tools to read files, search code, and **progressively posts inline/file-level findings** via `post_inline_finding`/`post_file_finding` → agent calls `finish_review()` with summary → post final review to GitHub → update Review (COMPLETED) → cleanup sandbox
3. **Issue → PR Workflow (PLANNED)**: User → Issues page → Launch agent with custom instructions → Create AgentRun (PENDING) → Queue BackgroundAgent task → Celery worker picks task → Create Daytona sandbox → Clone main branch → Initialize BackgroundAgent with coder tools → Run autonomous loop → Agent creates branch, writes code, runs tests, commits → Agent calls finish_task() with PR details → Create GitHub PR → Update AgentRun (COMPLETED) with PR URL → User redirected to AgentProgressPage
4. **GitHub App Auth**: App generates JWT → exchanges for installation token → authenticated API calls
5. **User OAuth**: User clicks login → GitHub OAuth → callback → create/update user in DB → set JWT cookies → redirect to dashboard
6. **Protected Routes**: Request → `get_current_user()` dependency → verify JWT cookie → query user from DB → endpoint access
7. **Repository Enrollment**: User → Repositories page → Sync from GitHub → Create Installation records → Enable repository → Webhooks start working
8. **Workspace Context**: User selects repository → Saved to localStorage → Dashboard filters by selected repo → AI settings load repo config
9. **Database Access**: FastAPI endpoint → `get_db()` dependency → async SQLAlchemy session → automatic commit/rollback

### Frontend Structure (`frontend/src/`)

React + TypeScript with a neo-brutalist design system. Features landing, auth, and complete dashboard.

```
src/
├── main.tsx                    # Application entry point with StrictMode
├── App.tsx                     # Root with AuthProvider, ToastProvider, RepositoryProvider (dashboard only)
├── assets/                     # Static assets
│   └── lechat.gif              # LeChat AI agent animation for loading states
├── components/
│   ├── ProtectedRoute.tsx      # Auth guard for dashboard routes
│   ├── UnsavedChangesBar.tsx   # Floating glassmorphic save bar
│   ├── dashboard/              # Dashboard layout components
│   │   ├── DashboardLayout.tsx # Main dashboard wrapper with sidebar
│   │   └── Sidebar.tsx         # Sidebar with repo selector in user dropdown, Issues navigation
│   ├── issues/                 # Issue & Agent Run components (NEW)
│   │   ├── IssuesTable.tsx         # Table with pagination, status filtering, launch agent actions
│   │   ├── AgentRunsTable.tsx      # Agent runs table with metrics, PR links, status badges
│   │   ├── AgentStatusBadge.tsx    # Status badge (PENDING/RUNNING/COMPLETED/FAILED)
│   │   ├── LaunchAgentDialog.tsx   # Dialog for launching agents with custom instructions
│   │   ├── IssueCommentCard.tsx    # Card component for displaying issue comments
│   │   └── LabelBadge.tsx          # GitHub label badge component
│   ├── landing/                # Landing page sections
│   │   ├── Navbar.tsx          # Top navigation
│   │   ├── Hero.tsx            # Hero section with enhanced styling
│   │   ├── Marquee.tsx         # Scrolling marquee
│   │   ├── Features.tsx        # Feature highlights
│   │   ├── CodeTerminal.tsx    # Code preview terminal
│   │   └── Footer.tsx          # Page footer with LinkedIn link
│   └── ui/                     # shadcn/ui components (neo-brutalist styled)
│       ├── *.tsx               # button, card, badge, chart, table, alert-dialog
│       ├── alert.tsx           # Alert component for inline notifications
│       ├── pagination.tsx      # Pagination component (NEW)
│       └── PixelBlast.tsx      # Animated pixel background component
├── contexts/
│   ├── AuthContext.tsx         # Auth state management (user, loading, logout, refetch)
│   ├── RepositoryContext.tsx   # Workspace state (selected repo, installations, persistence)
│   └── ToastContext.tsx        # Custom toast system using Alert component
├── hooks/
│   └── use-mobile.ts           # Mobile detection hook
├── lib/
│   ├── api-client.ts           # API client with Issues & Agent Run endpoints (mock data)
│   ├── language-icons.tsx      # Language logo utilities (17+ languages from react-icons)
│   └── utils.ts                # Utility functions (cn, truncateText)
├── types/
│   └── api.ts                  # TypeScript types (User, Installation, Review, Issue, AgentRun, etc.)
└── pages/
    ├── LandingPage.tsx         # Marketing landing page
    ├── LoginPage.tsx           # GitHub OAuth login with PixelBlast background
    ├── CallbackPage.tsx        # OAuth callback handler
    ├── NotFoundPage.tsx        # Creative 404 page with PixelBlast
    └── dashboard/
        ├── DashboardPage.tsx       # Dashboard with enhanced layout, Issues card
        ├── AnalyticsPage.tsx       # Charts, stats with enhanced styling
        ├── AIReviewPage.tsx        # Live config editor with enhanced styling
        ├── RepositoriesPage.tsx    # Installation management with enhanced styling
        ├── IssuesPage.tsx          # Issues & Agent Runs management (NEW)
        ├── IssueDetailPage.tsx     # Single issue view with comments & agent runs (NEW)
        └── AgentProgressPage.tsx   # Agent run progress monitoring with LeChat animation (NEW)
```

**Design System**: Neo-brutalist with:
- Primary yellow: `#FCD34D`
- Bold black borders (`border-2 border-black`)
- Hard shadows (`shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`)
- Font-black typography

**Vite Config**: Uses `@` alias for `./src` imports.

### GitHub App Integration

The backend authenticates as a GitHub App using:
- **JWT authentication**: Private key (`.pem` file) → JWT → installation token
- **Webhook verification**: HMAC-SHA256 signature validation
- **Scopes**: Pull Requests (write), Contents (read), Checks (write)

**Configuration** (backend/.env):
- `GITHUB_APP_ID`: App identifier
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`: OAuth credentials
- `GITHUB_WEBHOOK_SECRET`: For signature verification
- `GITHUB_SECRET_KEY_PATH`: Path to private key PEM file

See `docs/GITHUB_APP_SETUP.md` for complete setup instructions.

### Multi-Provider LLM Integration (LiteLLM)

The backend uses **LiteLLM** for model-agnostic LLM access. Switching providers is a 1-line `.env` change:

- **Current**: `MODEL_NAME=vertex_ai/gemini-3-flash-preview` (Google Vertex AI)
- **Architecture**: `app/core/client.py` provides `LiteLLMClient` with `chat.completions.create()` interface
- **Auth**: Vertex AI uses Application Default Credentials (`gcloud auth application-default login`)
- **LangSmith**: Integrated via LiteLLM native callbacks (no `wrap_openai` needed)
- **Provider switching**: Change `MODEL_NAME` prefix to switch providers:
  - `vertex_ai/` → Google Vertex AI (ADC auth)
  - `gpt-4o` → OpenAI (`OPENAI_API_KEY`)
  - `mistral/` → Mistral (`MISTRAL_API_KEY`)
  - `azure/` → Azure OpenAI (`AZURE_API_KEY`, `AZURE_API_BASE`)

**Configuration** (backend/.env):
- `MODEL_NAME`: LiteLLM model identifier (e.g., `vertex_ai/gemini-3-flash-preview`)
- `VERTEX_PROJECT`: GCP project ID (for Vertex AI models)
- `VERTEX_LOCATION`: GCP region (use `global` for Gemini 3 models)

### Event-Driven Architecture

From `docs/TECHNICAL_ARCHITECTURE.md`, the system is designed for:
- **Asynchronous processing**: Redis queue for webhook jobs (implemented)
- **Background workers**: Celery workers for code analysis (implemented)
- **Multi-model AI**: LiteLLM supports 100+ providers (Vertex AI, OpenAI, Anthropic, Mistral, etc.)
- **Context management**: Smart truncation to fit LLM context windows (150k tokens)
- **Caching**: Redis for PR diffs (5 min TTL), file analysis (24 hr TTL), GitHub tokens (55 min TTL)

### AI Agent System Architecture (Phase 4)

**Agent System** (`backend/app/agents/`):
- **BaseAgent** (`base.py`): Core agent with `run()` method (plan → execute → evaluate in one iteration) and `should_stop()` for limit checking
- **AgentLoop** (`loop.py`): Simple orchestrator that calls `agent.run()` until `agent.should_stop()` returns True
- **ReviewAgent** (`implementation/review_agent.py`): Autonomous code reviewer with 11 tools (read-only + verification + review posting)
- **BackgroundAgent** (`implementation/background_agent.py`): Autonomous coder for Issue → PR workflow with 19 tools (full CRUD + git)
- **Tool System** (`tools/`): 22 Daytona-powered tools organized by category:
  - File Tools (6): read_file, list_files, search_files, replace_in_files, create_file, delete_file
  - Git Tools (8): git_status, git_branches, git_create_branch, git_checkout_branch, git_add, git_commit, git_push, git_pull
  - Process Tools (4): run_command, run_code, run_tests, run_linter
  - Review Posting Tools (2): post_inline_finding, post_file_finding
  - Completion Tools (2): finish_review, finish_task
- **Daytona Sandbox** (`sandbox/`): Safe code execution with git auth, branch cloning, auto-cleanup
- **Prompts** (`prompts/`): Comprehensive system prompts with workflows, examples, and guidelines

**Agent Execution Flow**:
1. Celery task creates Daytona sandbox with PR branch cloned
2. Initializes agent with appropriate tool set (reviewer: 11 tools, coder: 19 tools)
3. Agent runs autonomous loop:
   - **Plan**: LLM decides what tools to call based on context
   - **Execute**: Tools run in parallel via Daytona SDK
   - **Evaluate**: Check if task complete (finish_review/finish_task called)
   - **Repeat**: Continue until completion or limits (50 iterations, 200K tokens, 5min)
4. Extract results from final state
5. Post review/PR to GitHub
6. Cleanup sandbox and update database

**Limits & Safety**:
- Soft limits: 50 iterations, 200K tokens, 100 tool calls, 5 minutes
- Circuit breaker: Stops after 3 consecutive tool failures
- Path auto-prefixing: Relative paths automatically prefixed with `workspace/repo/`
- Token counting: Uses `response.usage.total_tokens` from LiteLLM response
- LangSmith tracing: Full conversation tracking via LiteLLM native callbacks

**Configuration**:
- `DAYTONA_API_KEY`: Daytona API key for sandbox creation
- `DAYTONA_API_URL`: Daytona API endpoint (cloud or self-hosted)
- `DAYTONA_TARGET`: Target region (eu, us, or local)
- `LANGSMITH_TRACING`: Enable LangSmith tracing (true/false)
- `LANGSMITH_API_KEY`: LangSmith API key
- `LANGSMITH_PROJECT`: LangSmith project name

### Code Quality Standards

**Backend**:
- Strict Ruff linting (100+ rules enabled, see `pyproject.toml`)
- MyPy with strict type checking (`disallow_untyped_defs = true`)
- Google-style docstrings (pydocstyle)
- 100-character line length
- All functions must have type hints

**Frontend**:
- ESLint with TypeScript strict config
- React Compiler enabled for automatic optimization
- Tailwind CSS v4 for styling

## Development Notes

### AI Agent System

1. **Daytona Setup**:
   - Sign up at https://app.daytona.io or self-host using `docker compose -f infrastructure/daytona/docker/docker-compose.yaml up -d`
   - Get API key from https://app.daytona.io/dashboard/api-keys
   - Set `DAYTONA_API_KEY` in `.env`
   - For cloud: Set `DAYTONA_TARGET=eu` or `us`
   - For self-hosted: Set `DAYTONA_API_URL=http://localhost:3000/api` and `DAYTONA_TARGET=local`

2. **LangSmith Tracing** (Optional):
   - Sign up at https://smith.langchain.com
   - Create API key
   - Set environment variables in `.env`:
     ```bash
     LANGSMITH_TRACING=true
     LANGSMITH_API_KEY=lsv2_pt_xxx
     LANGSMITH_PROJECT=your-project-name
     ```
   - Traces appear at https://smith.langchain.com
   - Shows full conversation, tool calls, token usage, latency

3. **Agent Task** (`app/tasks/agent_review_task.py`):
   - `process_pr_review_with_agent()`: Main Celery task for AI-powered reviews
   - Workflow: Load config → Create sandbox → Clone PR branch → Initialize agent with review posting tools → Run loop → Agent posts inline findings progressively → Post final review summary → Cleanup
   - Uses `x-access-token` for GitHub token auth (standard for installation tokens)
   - Fetches installation token ONCE and passes it to posting tools (avoids duplicate JWT exchanges)
   - Clones PR's head branch directly (from webhook metadata)
   - Detects language from `pull_request.head.repo.language` (webhook payload)
   - Maps to Daytona runtime: Python, TypeScript, or JavaScript

4. **Tools** (`app/agents/tools/`):
   - All tools auto-prefix relative paths with `workspace/repo/` (e.g., `backend/app` → `workspace/repo/backend/app`)
   - Tools execute via Daytona SDK (no manual implementation needed)
   - Parallel execution: Multiple tools run concurrently via `asyncio.gather()`
   - Error handling: Each tool returns `ToolResult(success, data, error)`
   - Fine-grained sets: Different tool sets for different agent types
   - **Review Posting Tools** (`review_posting_tools.py`):
     - `PostInlineReviewFindingTool`: Posts inline comments at specific diff lines (requires `commit_sha`, `installation_token`)
     - `PostFileReviewFindingTool`: Posts file-level comments for whole-file issues
     - Both persist `ReviewComment` to database and post to GitHub API
     - IMPORTANT: Inline comments must target lines IN the PR diff (GitHub returns 422 for non-diff lines)

5. **Agent Loop** (`app/agents/loop.py` + `app/agents/base.py`):
   - **BaseAgent.run()**: Executes one iteration (LLM call → tool execution → result handling)
   - **BaseAgent.should_stop()**: Checks soft limits (iterations, tokens, tool calls, duration)
   - **AgentLoop.execute()**: Orchestrates loop until completion
   - **Circuit breaker**: Stops after 3 consecutive failures (all tools fail)
   - **Completion detection**: Agent calls `finish_review()` or `finish_task()` to signal done
   - **State tracking**: Iteration count, tokens used, tool calls made, conversation history

6. **Logs & Debugging**:
   - Agent logs saved to `backend/logs/agents/{agent_id}_{timestamp}.log` (JSON format)
   - Console logs: INFO level for monitoring
   - File logs: DEBUG level with full conversation history
   - LangSmith traces: Visual debugging in web UI
   - Celery logs: Worker-level task execution

7. **Testing Agents**:
   ```bash
   # Start services
   docker-compose -f docker-compose.dev.yml up -d
   uvicorn app.main:app --reload
   celery -A app.core.celery_app worker --loglevel=info

   # Trigger agent
   # - Open a PR on enrolled repository
   # - Agent runs automatically

   # Monitor
   # - Check Celery logs for agent iterations
   # - Check logs/agents/ for detailed JSON logs
   # - Check LangSmith UI for conversation traces
   ```

### Backend

1. **Configuration**: All settings in `app/core/config.py` load from `.env` via Pydantic Settings. Vertex AI settings are exported to `os.environ` for LiteLLM auto-detection.
2. **Celery Tasks** (`app/tasks/review_task.py`):
   - `process_pr_review()`: Sync wrapper that calls `asyncio.run()` for Celery compatibility
   - Task must be imported in `celery_app.py` to register with worker
   - Use `task.delay()` to queue tasks asynchronously
3. **GitHub Service** (`app/services/github.py`):
   - `GitHubService._generate_jwt()`: Creates 10-minute JWT for app authentication
   - `GitHubService.get_installation_token()`: Exchanges JWT for 1-hour installation token
   - `GitHubService.get_pr_diff()`: Fetches PR diff (requires installation_id, not token)
   - `GitHubService.create_pr_review()`: Posts review to PR (requires installation_id)
   - `GitHubService.get_user_installations_with_repos()`: Fetches installations for repository enrollment
4. **Webhook Handler** (`app/services/webhook.py`):
   - `verify_github_signature()`: HMAC-SHA256 validation against webhook secret
   - `handle_pull_request()`: Async handler that queues Celery task and returns 202 Accepted
   - Queries Installation by BOTH `github_installation_id` AND `repository` (composite key)
   - Only processes actions: opened, synchronize, reopened (code changes only)
5. **Installation Management** (`app/api/installations.py`):
   - `GET /api/installations/github`: Fetch from GitHub API (requires OAuth token)
   - `POST /api/installations/sync`: Sync installations to database
   - `POST /api/installations/enable`: Enable reviews for a repository
   - `PUT /api/installations/{id}/config`: Update review configuration
6. **Redis**: Use `RedisClient.get_instance()` for singleton connection pool
7. **Testing**: Use pytest with asyncio support. Fixtures in `tests/fixtures/`.

### Frontend

1. **Path Aliases**: Use `@/` for imports (e.g., `import { Component } from '@/components'`)
2. **Styling**: Tailwind v4 with Vite plugin (no config file needed)
3. **React Compiler**: Automatic memoization/optimization - avoid manual `useMemo`/`useCallback` unless necessary
4. **Context Providers**:
   - `AuthProvider`: Wraps entire app (available on all routes)
   - `ToastProvider`: Wraps entire app (toasts available everywhere)
   - `RepositoryProvider`: Wraps ONLY dashboard routes (not public pages to avoid unnecessary API calls)
5. **State Management**:
   - Use `useAuth()` for current user
   - Use `useRepository()` for selected repository (only in dashboard)
   - Use `useToast()` for notifications
6. **Avoiding Duplicate Requests**: Use `useRef` with `hasFetchedRef` pattern to prevent StrictMode double-fetching
7. **Language Icons**: Use `getLanguageIcon(language, className)` from `@/lib/language-icons`
8. **API Client**: Handles 204 No Content responses, throws errors for non-2xx status

### Private Key Security

**NEVER commit** the `.pem` file. It's in `.gitignore`. For local dev, place it in `backend/` and reference via `GITHUB_SECRET_KEY_PATH=./metis-ai-testing.2025-11-21.private-key.pem` (or similar).

## Testing

### Backend

Tests organized by type:
- `tests/unit/`: Unit tests for individual functions/classes
- `tests/integration/`: Integration tests for API endpoints
- `tests/fixtures/`: Shared test fixtures

**Run with coverage**:
```bash
pytest --cov=app --cov-report=html
```

Coverage report available at `htmlcov/index.html`.

## Implemented Features ✅

### Database & Models
- **PostgreSQL** with async SQLAlchemy and connection pooling
- **6 Database models**: User, Installation, Review, ReviewComment, UsageMetrics, WebhookEvent
- **Alembic migrations** with async support
- **Repository pattern** for data access (CRUD operations with flush/refresh)
- **Composite indexes** for query optimization
- **Composite unique constraint** on Installation (github_installation_id + repository)

### Authentication & Authorization
- **GitHub OAuth 2.0** user authentication flow
- **JWT tokens** (access + refresh) with HTTP-only cookies
- **Token encryption** (Fernet) for storing GitHub OAuth tokens in database
- **Protected routes** with `get_current_user()` dependency
- **Session management** with automatic token refresh
- **Ownership verification** on all installation endpoints

### Async Processing (Redis + Celery)
- **Redis** connection manager with singleton pattern and connection pooling
- **Celery** configured with production-grade settings (JSON serialization, acks_late, retry logic)
- **Background task** for PR reviews (async wrapped in sync for Celery compatibility)
- **Exponential backoff** retries (3 attempts: 5s, 25s, 125s with jitter)
- **Time limits** (10min hard, 9min soft warning)
- **Async webhook handler** (returns 202 Accepted in <500ms, queues task)
- **Task tracking** via celery_task_id in Review model
- **Status transitions** (PENDING → PROCESSING → COMPLETED/FAILED)
- **Flower monitoring** support (web UI for task monitoring)
- **Health checks** (/health/redis, /health/celery)

### Repository Enrollment System
- **Installation management API** (7 endpoints: list, sync, enable, disable, get, update config)
- **GitHub integration** for fetching user installations and accessible repositories
- **Multi-repository support** per installation (one GitHub App install = many repos)
- **Repository sync** from GitHub to database
- **Installation configuration** (sensitivity, custom instructions, ignore patterns, auto-review)
- **Graceful webhook handling** (ignores non-enrolled repositories)

### Frontend
- **Complete UI** with landing, login, callback, dashboard, analytics, AI settings, repositories, issues, 404
- **Auth integration** with AuthContext and ProtectedRoute guard
- **Workspace context** (RepositoryContext) for selected repository state
- **Repository management page** with sync, enable/disable, language-specific icons (17+ languages)
- **Real user data** in sidebar (GitHub profile, avatar, repository selector in user dropdown)
- **Custom toast system** using Alert component (bottom-left position, auto-dismiss)
- **Confirmation dialogs** (AlertDialog for destructive actions)
- **Live config editor** on AI Review page with floating save bar and dirty tracking
- **Language icons** using react-icons/simple-icons (TypeScript, Python, Go, Rust, etc.)
- **PixelBlast animations** on login, callback, and 404 pages
- **API client** with type-safe methods, 204 No Content handling, cookie-based auth
- **No duplicate requests** (useRef guards in contexts to prevent StrictMode double-fetching)

### Issues & Agent Runs UI
- **IssuesPage** with tabs for Issues and Agent Runs
- **IssuesTable** with pagination, status filtering, GitHub labels, launch agent actions
- **AgentRunsTable** with metrics (iterations, tokens, tool calls), PR links, elapsed time
- **IssueDetailPage** showing issue details, comments, and agent run history
- **AgentProgressPage** with real-time status monitoring and LeChat animation
- **LaunchAgentDialog** for triggering agents with custom instructions
- **AgentStatusBadge** component (PENDING/RUNNING/COMPLETED/FAILED with color coding)
- **IssueCommentCard** for displaying GitHub issue comments with avatars
- **LabelBadge** component for GitHub labels with color variants
- **Pagination component** for large datasets
- **Enhanced dashboard styling** with improved layouts and visual consistency
- **Issues navigation** added to sidebar
- **Issues card** on dashboard replacing Contributors card
- **Issues API integration** for list/detail/comments endpoints
- **Review comments analytics integration** with real backend data, tabs, and detail sheet
- **Agent runs still mocked** in API client (pending backend integration)

### GitHub Integration
- **GitHub App authentication** (installation tokens with 1-hour TTL)
- **Webhook handling** with signature verification (HMAC-SHA256)
- **Async task queueing** (webhooks don't block, return immediately)
- **AI code review** with configurable sensitivity and custom instructions
- **Installation lookup** by github_installation_id + repository (handles multi-repo installs)
- **Structured inline review comments** posted directly on PR diff lines via GitHub API
- **File-level review comments** for issues spanning entire files
- **Progressive finding posting** - agent posts findings as it discovers them, not batched at the end
- **Review comment titles** generated and persisted for analytics-friendly UI
- **GitHub comment IDs stored as bigint** in `review_comments.github_comment_id`

### Review Comments APIs
- **`GET /api/review-comments`** implemented with pagination and filters
  - Required: `repository`
  - Optional: `review_id`, `severity`, `category`, `review_status`, `created_from`, `created_to`
  - Pagination: `page`, `page_size`
- **`GET /api/review-comments/{comment_id}`** implemented for single-comment detail
- **Query strategy**: repository-scoped review subquery joined to `review_comments`, sorted newest first

## Not Yet Implemented

### Backend APIs Needed
- **Agent Runs API endpoints** (frontend UI ready with mock data):
  - `POST /api/agents/launch` - Launch agent for an issue
  - `GET /api/agents/{agent_id}` - Get agent run details
  - `GET /api/agents` - List all agent runs for repository
- **Issue agent-runs endpoint** still pending:
  - `GET /api/issues/{issue_id}/agent-runs`
- **WebSocket for real-time agent progress updates** (AgentProgressPage ready)
- **GitHub Issues sync** to database (Issue model needs to be created)
- **BackgroundAgent task** for Issue → PR workflow (agent implementation exists)

### Infrastructure & Monitoring
- Redis caching for PR diffs and GitHub tokens (infrastructure ready)
- Priority queues for Celery (critical/default/low)
- SummaryAgent implementation (prompts ready, implementation pending)
- Docker containerization (multi-stage builds)
- Kubernetes deployment with Helm charts
- Distributed tracing and monitoring (Prometheus, Grafana, Jaeger)
- Advanced error tracking (Sentry integration)
- Performance testing and optimization

## Current Progress

### Phase 1: Database Foundation ✅ (COMPLETED)
- **Database Layer**: PostgreSQL with async SQLAlchemy engine and connection pooling
- **Database Models** (6 core models with relationships):
  - `User` - GitHub OAuth users with encrypted access tokens
  - `Installation` - GitHub App installations (composite unique: github_installation_id + repository)
  - `Review` - PR reviews with status tracking + celery_task_id for async processing
  - `ReviewComment` - Line-specific code issues with severity and category enums
  - `UsageMetrics` - Daily aggregation of review metrics
  - `WebhookEvent` - Audit trail for all webhook events
- **Database Migrations**: Alembic configured with migrations for schema evolution
- **Session Management**: FastAPI `get_db()` dependency with automatic transaction handling
- **Indexes**: Composite indexes for query optimization (installation lookup, review filtering)
- **ReviewComment schema updates**: `title` field added and `github_comment_id` migrated to bigint

### Phase 2: Authentication & User Management ✅ (COMPLETED)
- **GitHub OAuth 2.0**: Complete authentication flow (login, callback, refresh, logout)
- **JWT tokens**: Access (30min) + refresh (7 days) tokens in HTTP-only cookies
- **Token encryption**: Fernet symmetric encryption for GitHub OAuth tokens at rest
- **Protected routes**: `get_current_user()` dependency with ownership verification
- **Session persistence**: Automatic token refresh, secure cookie handling

### Phase 3: Async Processing (Redis + Celery) ✅ (COMPLETED)
- **Redis**: Singleton client with connection pooling (ready for caching + queue)
- **Celery**: Production-grade configuration (JSON serialization, acks_late, retry backoff)
- **Background task**: `process_pr_review` with asyncio.run() wrapper for compatibility
- **Async webhooks**: Returns 202 Accepted in <500ms (vs 30+ seconds before)
- **Retry logic**: Exponential backoff (5s, 25s, 125s) with jitter, max 3 retries
- **Time limits**: 10min hard limit, 9min soft limit for graceful handling
- **Task tracking**: celery_task_id stored in Review for status queries
- **Health checks**: Redis and Celery worker availability monitoring
- **Observability**: Celery signals for task lifecycle logging

### Phase 4: AI Agent System ✅ (COMPLETED)
- **Daytona Sandbox Integration**: Safe code execution in isolated environments with git auth
- **22 Tools**: File ops (6), Git ops (8), Process execution (4), Review posting (2), Completion (2)
- **Fine-grained tool sets**: Reviewer (11 tools), Coder (19 tools), Summary (3 tools)
- **BaseAgent & AgentLoop**: Autonomous plan → execute → evaluate loop with soft limits
- **ReviewAgent**: Production-ready code review agent with progressive inline finding posting
- **BackgroundAgent**: Autonomous coder for Issue → PR workflow (implementation ready)
- **Comprehensive prompts**: 500+ line prompts with workflows, examples, guidelines
- **LangSmith tracing**: Full LLM observability via LiteLLM native callbacks
- **GitHub integration**: Clones PR branch, posts inline/file-level review comments
- **Multi-language support**: Python, TypeScript, JavaScript sandbox runtimes
- **Production features**: Circuit breaker, error handling, token counting, file logging
- **Performance**: ~42s end-to-end (sandbox 2s, agent 5-7 iterations with inline posting)

### Phase 5: Multi-Provider LLM Support ✅ (COMPLETED)
- **LiteLLM integration**: Model-agnostic LLM client supporting 100+ providers
- **Vertex AI**: Primary provider (Gemini 3 Flash Preview) with ADC authentication
- **Provider switching**: Change `MODEL_NAME` in `.env` to switch (no code changes)
- **Supported providers**: Vertex AI (Google), OpenAI, Anthropic, Mistral, Azure OpenAI
- **LiteLLMClient wrapper**: Drop-in replacement for OpenAI client with `chat.completions.create()` interface
- **LangSmith callbacks**: Native LiteLLM callback integration (replaces `wrap_openai`)
- **Structured review findings**: Inline comments on PR diff lines + file-level comments
- **Review posting tools**: `post_inline_finding` (diff-anchored) and `post_file_finding` (whole-file)
- **Token pre-fetching**: Installation token fetched once and passed to posting tools (avoids 401s)

### Repository Enrollment System ✅ (COMPLETED)
- **Installation API**: List from GitHub, sync to DB, enable/disable, update config
- **Multi-repository support**: One GitHub installation → multiple repositories
- **Repository management UI**: Full page for managing installations
- **Workspace context**: Selected repository state with localStorage persistence
- **Language detection**: 17+ programming language icons with official logos
- **Configuration management**: Live editing with dirty tracking and floating save bar

### Frontend ✅ (COMPLETED)
- **Landing Page**: Full marketing page with Navbar, Hero (enhanced), Marquee, Features, CodeTerminal, Footer (LinkedIn link)
- **Authentication Pages**: Login (PixelBlast), Callback, 404 (PixelBlast)
- **Dashboard Layout**: Sidebar with repository selector, Issues navigation
- **Dashboard Page**: Enhanced layout, metrics cards, Issues card (replaces Contributors), quick actions
- **Analytics Page**: Tabbed `Statistics` + `AI Detected Issues`, backend-backed findings table, 5-item pagination, detail sheet
- **AI Review Page**: Enhanced styling, live config editor, sensitivity selector, custom instructions, ignore patterns, floating save bar
- **Repositories Page**: Enhanced styling, GitHub installation sync, enable/disable repos, language icons, configure buttons
- **Issues Page** (NEW): Tabs for Issues and Agent Runs, pagination, status filtering, launch agent actions
- **Issue Detail Page** (NEW): Issue details, GitHub comments with avatars, agent run history
- **Agent Progress Page** (NEW): Real-time status monitoring, LeChat animation, metrics, PR links
- **Workspace Context**: RepositoryContext for selected repository with persistence
- **Custom Toast System**: Alert-based toasts (bottom-left, auto-dismiss, emerald/rose colors)
- **Confirmation Dialogs**: AlertDialog for destructive actions (disable repos)
- **Language Icons**: react-icons/simple-icons for 17+ languages (TypeScript, Python, Go, Rust, etc.)
- **UI Components**: Complete shadcn/ui library with neo-brutalist styling + Pagination component
- **Issue Components**: IssuesTable, AgentRunsTable, LaunchAgentDialog, AgentStatusBadge, IssueCommentCard, LabelBadge
- **Analytics Components**: `AnalyticsStatisticsTab`, `AnalyticsIssuesTab`, `AnalyticsCommentSheet`
- **Enhanced Font Loading**: Moved to index.html for better performance

### Infrastructure (Completed)
- **Docker Compose**: PostgreSQL, Redis, pgAdmin, Redis Insight services
- **Redis**: localhost:6379 (DB 0 for Celery broker, DB 1 for results)
- **pgAdmin**: http://localhost:5050 for database management
- **Redis Insight**: http://localhost:5540 for Redis key inspection
- **Flower**: http://localhost:5555 for Celery task monitoring (when running)

### AI Agent System ✅ (COMPLETED)
- **Autonomous code review agent** with tool-augmented analysis and progressive inline posting
- **Daytona sandbox integration** for safe code execution
- **22 tools** across file ops, git ops, process execution, review posting
- **Fine-grained tool sets** (11 reviewer, 19 coder, 3 summary tools)
- **Multi-iteration agent loop** with soft limits and circuit breaker
- **LiteLLM integration** for model-agnostic LLM access (Vertex AI, OpenAI, Mistral, etc.)
- **LangSmith tracing** via LiteLLM native callbacks
- **Comprehensive prompts** for reviewer, coder, and summary agents
- **GitHub branch integration** (clones PR branch directly)
- **Structured review findings** (inline on diff lines + file-level comments)
- **Multi-language support** (Python, TypeScript, JavaScript sandboxes)
- **Production-ready** with error handling, logging, and cleanup
