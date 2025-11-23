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
│   └── webhooks.py      # GitHub webhook endpoint (/webhooks/github)
├── core/                # Core configuration
│   └── config.py        # Pydantic Settings for env vars
├── services/            # Business logic
│   ├── github.py        # GitHub API client (JWT auth, installation tokens, PR reviews)
│   └── webhook.py       # Webhook signature verification and event handling
├── schemas/             # Pydantic models for request/response validation
├── models/              # Database models (future)
└── utils/               # Utility functions
```

**Key flows**:
1. **Webhook Reception**: GitHub sends webhook → `api/webhooks.py` → signature verification → event routing
2. **GitHub Authentication**: App generates JWT → exchanges for installation token → authenticated API calls
3. **PR Review**: Webhook triggers → fetch PR data → (future: AI analysis) → post review via `services/github.py`

### Frontend Structure (`frontend/src/`)

Basic React + TypeScript setup. Currently minimal boilerplate.

```
src/
├── main.tsx            # Application entry point
├── App.tsx             # Root component
└── assets/             # Static assets
```

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

## Planned Features (Not Implemented)

Based on architecture docs, these are planned but not yet built:
- Redis-based job queue for async processing
- Celery workers for background review tasks
- AI/LLM integration (Claude, GPT-4)
- Static code analysis service
- PostgreSQL database for review storage
- Web dashboard for viewing reviews
- Multi-region deployment with failover
- Distributed tracing (OpenTelemetry/Jaeger)

When implementing new features, refer to `docs/TECHNICAL_ARCHITECTURE.md` for detailed design patterns.
