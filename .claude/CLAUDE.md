# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
│   ├── config.py        # Pydantic Settings for env vars, JWT, Redis, Celery settings
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
│   ├── webhook.py       # Async webhook handler (queues Celery tasks, <500ms response)
│   └── metis_agent.py   # AI reviewer and summary writer (MetisAgent, AIReviewer)
├── schemas/             # Pydantic models for request/response validation
│   ├── metis_config.py  # ReviewerConfig, SummaryConfig with sensitivity levels
│   └── installation.py  # Installation API schemas (7 models)
├── tasks/               # Celery background tasks
│   ├── __init__.py      # Task registration
│   └── review_task.py   # process_pr_review task (async wrapped in sync)
└── utils/               # Utility functions
```

**Key flows**:
1. **Webhook Reception (Async)**: GitHub sends webhook → `api/webhooks.py` → signature verification → lookup Installation → create Review (PENDING) → queue Celery task → return 202 Accepted (<500ms)
2. **Background Review Processing**: Celery worker → pick task from Redis → update Review (PROCESSING) → fetch PR diff → generate AI review → post to GitHub → update Review (COMPLETED) with retry logic
3. **GitHub App Auth**: App generates JWT → exchanges for installation token → authenticated API calls
4. **User OAuth**: User clicks login → GitHub OAuth → callback → create/update user in DB → set JWT cookies → redirect to dashboard
5. **Protected Routes**: Request → `get_current_user()` dependency → verify JWT cookie → query user from DB → endpoint access
6. **Repository Enrollment**: User → Repositories page → Sync from GitHub → Create Installation records → Enable repository → Webhooks start working
7. **Workspace Context**: User selects repository → Saved to localStorage → Dashboard filters by selected repo → AI settings load repo config
8. **Database Access**: FastAPI endpoint → `get_db()` dependency → async SQLAlchemy session → automatic commit/rollback

### Frontend Structure (`frontend/src/`)

React + TypeScript with a neo-brutalist design system. Features landing, auth, and complete dashboard.

```
src/
├── main.tsx                    # Application entry point with StrictMode
├── App.tsx                     # Root with AuthProvider, ToastProvider, RepositoryProvider (dashboard only)
├── assets/                     # Static assets
├── components/
│   ├── ProtectedRoute.tsx      # Auth guard for dashboard routes
│   ├── UnsavedChangesBar.tsx   # Floating glassmorphic save bar
│   ├── dashboard/              # Dashboard layout components
│   │   ├── DashboardLayout.tsx # Main dashboard wrapper with sidebar
│   │   └── Sidebar.tsx         # Sidebar with repo selector in user dropdown
│   ├── landing/                # Landing page sections
│   │   ├── Navbar.tsx          # Top navigation
│   │   ├── Hero.tsx            # Hero section
│   │   ├── Marquee.tsx         # Scrolling marquee
│   │   ├── Features.tsx        # Feature highlights
│   │   ├── CodeTerminal.tsx    # Code preview terminal
│   │   └── Footer.tsx          # Page footer
│   └── ui/                     # shadcn/ui components (neo-brutalist styled)
│       ├── *.tsx               # button, card, badge, chart, table, alert-dialog
│       ├── alert.tsx           # Alert component for inline notifications
│       └── PixelBlast.tsx      # Animated pixel background component
├── contexts/
│   ├── AuthContext.tsx         # Auth state management (user, loading, logout, refetch)
│   ├── RepositoryContext.tsx   # Workspace state (selected repo, installations, persistence)
│   └── ToastContext.tsx        # Custom toast system using Alert component
├── hooks/
│   └── use-mobile.ts           # Mobile detection hook
├── lib/
│   ├── api-client.ts           # API client with cookie auth, installation endpoints
│   ├── language-icons.tsx      # Language logo utilities (17+ languages from react-icons)
│   └── utils.ts                # Utility functions (cn, truncateText)
├── types/
│   └── api.ts                  # TypeScript types (User, Installation, Review, etc.)
└── pages/
    ├── LandingPage.tsx         # Marketing landing page
    ├── LoginPage.tsx           # GitHub OAuth login with PixelBlast background
    ├── CallbackPage.tsx        # OAuth callback handler
    ├── NotFoundPage.tsx        # Creative 404 page with PixelBlast
    └── dashboard/
        ├── DashboardPage.tsx   # Dashboard with selected repo badge, metrics cards
        ├── AnalyticsPage.tsx   # Charts, stats, and issue tracking table
        ├── AIReviewPage.tsx    # Live config editor with floating save bar
        └── RepositoriesPage.tsx # Installation management (sync, enable, configure)
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

### Event-Driven Architecture (Planned)

From `docs/TECHNICAL_ARCHITECTURE.md`, the system is designed for:
- **Asynchronous processing**: Redis queue for webhook jobs
- **Background workers**: Separate processes for code analysis
- **Multi-model AI**: Claude 3 (primary), GPT-4 (fallback), specialized models for security/performance
- **Context management**: Smart truncation to fit LLM context windows (150k tokens)
- **Caching**: Redis for PR diffs (5 min TTL), file analysis (24 hr TTL), GitHub tokens (55 min TTL)

**Current state**: Basic synchronous webhook handling. Queue/worker infrastructure not yet implemented.

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

### Backend

1. **Configuration**: All settings in `app/core/config.py` load from `.env` via Pydantic Settings
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
- **Complete UI** with landing, login, callback, dashboard, analytics, AI settings, repositories, 404
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

### GitHub Integration
- **GitHub App authentication** (installation tokens with 1-hour TTL)
- **Webhook handling** with signature verification (HMAC-SHA256)
- **Async task queueing** (webhooks don't block, return immediately)
- **AI code review** with configurable sensitivity and custom instructions
- **Installation lookup** by github_installation_id + repository (handles multi-repo installs)

## Not Yet Implemented

- Line-by-line GitHub review comments (currently PR-level only)
- Enhanced AI agent with tool calling (read files, search code)
- Redis caching for PR diffs and GitHub tokens (infrastructure ready)
- Priority queues for Celery (critical/default/low)
- WebSocket for real-time review status updates
- Docker containerization (multi-stage builds)
- Kubernetes deployment with Helm charts
- Distributed tracing and monitoring (Prometheus, Grafana, Jaeger)
- Advanced error tracking (Sentry integration)
- Performance testing and optimization

## Current Progress

### Phase 1: Database Foundation ✅ (COMPLETED)
- **Database Layer**: PostgreSQL with async SQLAlchemy engine and connection pooling
- **Database Models** (6 models with relationships):
  - `User` - GitHub OAuth users with encrypted access tokens
  - `Installation` - GitHub App installations (composite unique: github_installation_id + repository)
  - `Review` - PR reviews with status tracking + celery_task_id for async processing
  - `ReviewComment` - Line-specific code issues with severity and category enums
  - `UsageMetrics` - Daily aggregation of review metrics
  - `WebhookEvent` - Audit trail for all webhook events
- **Database Migrations**: Alembic configured with migrations for schema evolution
- **Session Management**: FastAPI `get_db()` dependency with automatic transaction handling
- **Indexes**: Composite indexes for query optimization (installation lookup, review filtering)

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

### Repository Enrollment System ✅ (COMPLETED)
- **Installation API**: List from GitHub, sync to DB, enable/disable, update config
- **Multi-repository support**: One GitHub installation → multiple repositories
- **Repository management UI**: Full page for managing installations
- **Workspace context**: Selected repository state with localStorage persistence
- **Language detection**: 17+ programming language icons with official logos
- **Configuration management**: Live editing with dirty tracking and floating save bar

### Frontend (Completed)
- **Landing Page**: Full marketing page with Navbar, Hero, Marquee, Features, CodeTerminal, Footer
- **Authentication Pages**: Login (PixelBlast), Callback, 404 (PixelBlast)
- **Dashboard Layout**: Sidebar with repository selector in user account dropdown
- **Dashboard Page**: Selected repository badge, metrics cards, quick action cards with charts
- **Analytics Page**: Stats row, area/bar charts (Recharts), expandable issues table
- **AI Review Page**: Live config editor, sensitivity selector, custom instructions, ignore patterns, floating save bar
- **Repositories Page**: GitHub installation sync, enable/disable repos, language icons, configure buttons
- **Workspace Context**: RepositoryContext for selected repository with persistence
- **Custom Toast System**: Alert-based toasts (bottom-left, auto-dismiss, emerald/rose colors)
- **Confirmation Dialogs**: AlertDialog for destructive actions (disable repos)
- **Language Icons**: react-icons/simple-icons for 17+ languages (TypeScript, Python, Go, Rust, etc.)
- **UI Components**: Complete shadcn/ui library with neo-brutalist styling

### Infrastructure (Completed)
- **Docker Compose**: PostgreSQL, Redis, pgAdmin, Redis Insight services
- **Redis**: localhost:6379 (DB 0 for Celery broker, DB 1 for results)
- **pgAdmin**: http://localhost:5050 for database management
- **Redis Insight**: http://localhost:5540 for Redis key inspection
- **Flower**: http://localhost:5555 for Celery task monitoring (when running)
