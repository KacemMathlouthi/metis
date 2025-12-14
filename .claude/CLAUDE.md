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

# Install dependencies (using uv)
uv sync

# Database
docker-compose -f docker-compose.dev.yml up -d  # Start PostgreSQL
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
```

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

## Architecture

### Backend Structure (`backend/app/`)

```
app/
├── main.py              # FastAPI app initialization, CORS, health endpoints
├── api/                 # API route handlers
│   ├── auth.py          # Authentication endpoints (OAuth, login, logout, me)
│   └── webhooks.py      # GitHub webhook endpoint (/webhooks/github)
├── core/                # Core configuration
│   ├── config.py        # Pydantic Settings for env vars, JWT settings
│   ├── security.py      # JWT generation/verification, token encryption (Fernet)
│   └── auth_deps.py     # get_current_user() dependency for protected routes
├── db/                  # Database layer
│   ├── base.py          # Async SQLAlchemy engine, session factory
│   ├── session.py       # get_db() dependency with auto commit/rollback
│   └── base_class.py    # BaseModel with UUID, timestamps
├── models/              # SQLAlchemy ORM models
│   ├── user.py          # User accounts (GitHub OAuth)
│   ├── installation.py  # GitHub App installations with JSONB config
│   ├── review.py        # Review & ReviewComment models
│   └── metrics.py       # UsageMetrics & WebhookEvent audit logs
├── repositories/        # Repository pattern (data access layer)
│   ├── user.py          # User CRUD with token encryption
│   ├── installation.py  # Installation CRUD operations
│   └── review.py        # Review and ReviewComment CRUD
├── services/            # Business logic
│   ├── github.py        # GitHub API client (JWT auth, installation tokens, PR reviews)
│   ├── oauth.py         # GitHub OAuth flow (login, token exchange, user info)
│   ├── webhook.py       # Webhook signature verification and event handling
│   └── metis_agent.py   # AI reviewer and summary writer
├── schemas/             # Pydantic models for request/response validation
└── utils/               # Utility functions
```

**Key flows**:
1. **Webhook Reception**: GitHub sends webhook → `api/webhooks.py` → signature verification → event routing
2. **GitHub App Auth**: App generates JWT → exchanges for installation token → authenticated API calls
3. **User OAuth**: User clicks login → GitHub OAuth → callback → create/update user in DB → set JWT cookies → redirect to dashboard
4. **Protected Routes**: Request → `get_current_user()` dependency → verify JWT cookie → query user from DB → endpoint access
5. **PR Review**: Webhook triggers → fetch PR data → AI analysis → post review via `services/github.py`
6. **Database Access**: FastAPI endpoint → `get_db()` dependency → async SQLAlchemy session → automatic commit/rollback

### Frontend Structure (`frontend/src/`)

React + TypeScript with a neo-brutalist design system. Features landing page and dashboard.

```
src/
├── main.tsx                    # Application entry point
├── App.tsx                     # Root component with routing, AuthProvider wrapper
├── assets/                     # Static assets
├── components/
│   ├── ProtectedRoute.tsx      # Auth guard for dashboard routes
│   ├── dashboard/              # Dashboard layout components
│   │   ├── DashboardLayout.tsx # Main dashboard wrapper with sidebar
│   │   └── Sidebar.tsx         # Navigation sidebar with real user data
│   ├── landing/                # Landing page sections
│   │   ├── Navbar.tsx          # Top navigation
│   │   ├── Hero.tsx            # Hero section
│   │   ├── Marquee.tsx         # Scrolling marquee
│   │   ├── Features.tsx        # Feature highlights
│   │   ├── CodeTerminal.tsx    # Code preview terminal
│   │   └── Footer.tsx          # Page footer
│   └── ui/                     # shadcn/ui components (neo-brutalist styled)
│       ├── *.tsx               # button, card, badge, chart, table, etc.
│       └── PixelBlast.tsx      # Animated pixel background component
├── contexts/
│   └── AuthContext.tsx         # Auth state management (user, loading, logout)
├── hooks/
│   └── use-mobile.ts           # Mobile detection hook
├── lib/
│   ├── api-client.ts           # API client with cookie-based auth
│   └── utils.ts                # Utility functions (cn, etc.)
├── types/
│   └── api.ts                  # TypeScript types for API responses
└── pages/
    ├── LandingPage.tsx         # Marketing landing page
    ├── LoginPage.tsx           # GitHub OAuth login with PixelBlast background
    ├── CallbackPage.tsx        # OAuth callback handler
    ├── NotFoundPage.tsx        # Creative 404 page with PixelBlast
    └── dashboard/
        ├── DashboardPage.tsx   # Main dashboard with metrics & quick actions
        ├── AnalyticsPage.tsx   # Charts, stats, and issue tracking table
        └── AIReviewPage.tsx    # AI review configuration settings
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
- `GITHUB_INSTALLATION_ID`: Installation identifier (for testing)

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
2. **GitHub Service** (`app/services/github.py`):
   - `GitHubService._generate_jwt()`: Creates 10-minute JWT for app authentication
   - `GitHubService.get_installation_token()`: Exchanges JWT for 1-hour installation token
   - `GitHubService.create_pr_review()`: Posts review to PR (requires installation_id)
3. **Webhook Handler** (`app/services/webhook.py`):
   - `verify_github_signature()`: HMAC-SHA256 validation against webhook secret
   - `handle_pull_request()`: Routes PR events (opened, synchronize, etc.)
4. **Testing**: Use pytest with asyncio support. Fixtures in `tests/fixtures/`.

### Frontend

1. **Path Aliases**: Use `@/` for imports (e.g., `import { Component } from '@/components'`)
2. **Styling**: Tailwind v4 with Vite plugin (no config file needed)
3. **React Compiler**: Automatic memoization/optimization - avoid manual `useMemo`/`useCallback` unless necessary

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
- **Repository pattern** for data access (CRUD operations)
- **Composite indexes** for query optimization

### Authentication & Authorization
- **GitHub OAuth 2.0** user authentication flow
- **JWT tokens** (access + refresh) with HTTP-only cookies
- **Token encryption** (Fernet) for storing GitHub OAuth tokens in database
- **Protected routes** with `get_current_user()` dependency
- **Session management** with automatic token refresh

### Frontend
- **Complete UI** with landing, login, callback, dashboard, analytics, AI settings, 404 pages
- **Auth integration** with AuthContext and ProtectedRoute guard
- **Real user data** displayed in sidebar (GitHub profile, avatar)
- **PixelBlast animations** on login, callback, and 404 pages
- **API client** with type-safe methods and cookie-based auth

### GitHub Integration
- **GitHub App authentication** (installation tokens)
- **Webhook handling** with signature verification
- **AI code review** with configurable sensitivity

## Not Yet Implemented

- Repository enrollment API (list installations, enable repos)
- Redis-based job queue for async processing
- Celery workers for background review tasks
- Line-by-line GitHub review comments (currently PR-level only)
- Enhanced AI agent with tool calling (read files, search code)
- Docker containerization
- Kubernetes deployment with Helm
- Distributed tracing and monitoring

## Current Progress

### Backend (Completed)
- **Database Layer**: PostgreSQL with async SQLAlchemy engine and connection pooling
- **Database Models** (6 models with relationships):
  - `User` - GitHub OAuth users with encrypted access tokens
  - `Installation` - GitHub App installations with JSONB review configuration
  - `Review` - PR reviews with status tracking (PENDING/PROCESSING/COMPLETED/FAILED)
  - `ReviewComment` - Line-specific code issues with severity and category enums
- **Database Migrations**: Alembic configured with initial schema migration
- **Session Management**: FastAPI `get_db()` dependency with automatic transaction handling
- **Indexes**: Composite indexes for query optimization
- **GitHub App Integration**: JWT authentication, webhook verification, PR diff fetching
- **AI Review Engine**: Basic synchronous review generation with configurable sensitivity

### Frontend (Completed)
- **Landing Page**: Full marketing page with Navbar, Hero, Marquee, Features, CodeTerminal, Footer
- **Dashboard Layout**: Sidebar navigation with DashboardLayout wrapper
- **Dashboard Page**: Metrics cards (PRs Reviewed, Issues Detected, Time Saved), quick action cards with mini charts
- **Analytics Page**: Stats row, area/bar charts (Recharts), expandable issues table with severity badges
- **AI Review Settings Page**: Sensitivity selector, custom instructions textarea, ignore patterns management, toggle switches
- **UI Components**: Full shadcn/ui component library with neo-brutalist styling (button, card, badge, chart, table, tabs, etc.)

### Next Steps
- User authentication with GitHub OAuth
- Repository enrollment API
- Backend API integration for frontend
- Redis + Celery for async processing
- Docker containerization

When implementing new features, refer to `docs/TECHNICAL_ARCHITECTURE.md` for detailed design patterns.
