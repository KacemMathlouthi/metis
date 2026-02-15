<p align="center">
  <img src="static/metis-logo.svg" alt="Metis logo" width="520" />
</p>
<p align="center">AI-Powered GitHub Code Review Platform</p>

<p align="center">
  <a href="https://github.com/KacemMathlouthi/metis">
    <img src="https://img.shields.io/badge/METIS-SEE%20MORE%20DETAILS-FF9F1C?style=for-the-badge&labelColor=111111&logo=github&logoColor=FFFFFF" alt="Metis See More Details" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" />
  <img src="https://img.shields.io/badge/Celery-37814A?style=for-the-badge&logo=celery&logoColor=white" alt="Celery" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Daytona-Sandbox-111111?style=for-the-badge&logo=docker&logoColor=white" alt="Daytona Sandbox" />
  <img src="https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&labelColor=111111&logo=kubernetes&logoColor=white" alt="Kubernetes" />
</p>

<p align="center">
  <img src="frontend/src/assets/Handshake-with-AI.png" alt="Human and AI handshake" width="100%" />
</p>

## Overview

Metis is an AI-powered GitHub code reviewer built as a GitHub App. It listens to pull request webhooks, analyzes changes in isolated sandboxes, and posts actionable findings directly on PRs.

**Production-grade monorepo**:
- **Backend**: Python, FastAPI, Celery, PostgreSQL, Redis, AI Agents
- **Frontend**: React 19, TypeScript, Vite (Rolldown), Tailwind v4, Neo-brutalist UI
- **Agent Runtime**: Daytona sandbox + tool-augmented LLM agents
- **Multi-LLM Support**: LiteLLM (Vertex AI, OpenAI, Anthropic, Mistral)

## Key Capabilities

### AI-Powered Code Review
- **Autonomous agents** analyze PRs in isolated sandboxes
- **Progressive inline findings** posted directly on diff lines
- **Multi-provider LLM support** - switch providers with one env var
- **Configurable sensitivity** - from INFO to CRITICAL findings
- **Category tagging** - SECURITY, PERFORMANCE, BUG, STYLE, etc.

### Issue-to-PR Workflow
- Launch **autonomous coding agents** from GitHub issues
- Agents write code, run tests, commit, and create PRs
- Track progress in real-time with metrics and timelines
- Full conversation and tool trace persistence

### Repository Management
- **Multi-repository support** - one GitHub App, many repos
- **Per-repository configuration** - custom instructions, ignore patterns
- **GitHub OAuth integration** - secure user authentication

### Analytics Dashboard
- Review metrics and trends
- AI-detected issues table with filters
- Agent run history and performance metrics
- Real-time progress monitoring

## Table of Contents

- [Architecture](#architecture)
- [Repository Structure](#repository-structure)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Development](#development)
- [Testing and Quality](#testing-and-quality)
- [Deployment](#deployment)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

## Architecture

### High-Level System Design

```
┌─────────────┐
│   GitHub    │
│   Webhooks  │
└──────┬──────┘
       │ Pull Request Event
       ▼
┌───────────────────────────────────┐
│       FastAPI Backend             │
│  ┌─────────────────────────────┐  │
│  │   Webhook Handler           │  │
│  │   - Verify signature        │  │
│  │   - Create Review (PENDING) │  │
│  │   - Queue Celery tasks      │  │
│  │   - Return 202 Accepted     │  │
│  └─────────────┬───────────────┘  │
│                │                  │
└────────────────┼──────────────────┘
                 │
                 ▼
         ┌───────────────┐
         │  Redis Queue  │
         └───────┬───────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│       Celery Worker                 │
│  ┌───────────────────────────────┐  │
│  │   AI Agent System             │  │
│  │                               │  │
│  │  1. Create Daytona Sandbox    │  │
│  │  2. Clone PR Branch           │  │
│  │  3. Run Agent Loop:           │  │
│  │     - Plan (LLM)              │  │
│  │     - Execute Tools           │  │
│  │     - Post Findings           │  │
│  │     - Evaluate                │  │
│  │  4. Post Final Review         │  │
│  │  5. Cleanup Sandbox           │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Core Request Flow

1. **GitHub sends webhook** for PR changes (opened, synchronize, reopened)
2. **Backend validates signature** and records pending review
3. **Celery queues agent tasks** for review and summary generation
4. **Agent executes in sandbox** with controlled tool access:
   - Reads files and analyzes code
   - Runs tests and linters
   - Posts inline findings progressively
   - Generates final review summary
5. **Findings posted to GitHub** as review comments and persisted to database
6. **Frontend dashboards** expose progress, analytics, and repository controls

### Agent Tools

**Tools Available (23 total)**:
- File Operations (6): read, list, search, replace, create, delete
- Git Operations (8): status, branches, create_branch, checkout, add, commit, push, pull
- Process Execution (4): command, code, tests, linter
- Review Posting (2): post_inline_finding, post_file_finding
- Completion (3): finish_review, finish_task, finish_summary

### Multi-LLM Support

Switch AI providers with a single environment variable:

```bash
# Vertex AI (Google)
MODEL_NAME=vertex_ai/gemini-3-flash-preview

# OpenAI
MODEL_NAME=gpt-4o

# Anthropic
MODEL_NAME=claude-3-5-sonnet-20241022

# Mistral
MODEL_NAME=mistral/mistral-large-latest
```

No code changes required. LiteLLM handles provider differences.

## Repository Structure

```
metis/
├── backend/                    # FastAPI backend (Python)
│   ├── app/
│   │   ├── api/                # API route handlers
│   │   ├── core/               # Configuration & infrastructure
│   │   ├── db/                 # Database layer
│   │   ├── models/             # SQLAlchemy ORM models
│   │   ├── repositories/       # Repository pattern (data access)
│   │   ├── services/           # Business logic
│   │   ├── agents/             # AI Agent System
│   │   │   ├── base.py         # BaseAgent
│   │   │   ├── loop.py         # AgentLoop orchestrator
│   │   │   ├── implementation/ # ReviewAgent, BackgroundAgent, SummaryAgent
│   │   │   ├── prompts/        # System prompts
│   │   │   ├── sandbox/        # Daytona integration
│   │   │   └── tools/          # 23 tools
│   │   ├── schemas/            # Pydantic models
│   │   ├── tasks/              # Celery background tasks
│   │   └── utils/              # Utilities
│   ├── alembic/                # Database migrations
│   ├── tests/                  # Test suite
│   └── README.md               # Backend documentation
│
├── frontend/                   # React frontend (TypeScript)
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── ui/             # shadcn/ui components
│   │   │   ├── dashboard/      # Dashboard components
│   │   │   ├── landing/        # Landing page sections
│   │   │   └── issues/         # Issue & agent components
│   │   ├── contexts/           # React Context providers
│   │   ├── pages/              # Route pages
│   │   ├── lib/                # Utilities (API client, icons)
│   │   └── types/              # TypeScript definitions
│   └── README.md               # Frontend documentation
│
├── static/                     # Static assets
│   └── metis-logo.svg
│
├── docker-compose.dev.yml      # Development infrastructure
├── CONTRIBUTING.md             # Contribution guidelines
├── CODE_OF_CONDUCT.md          # Code of conduct
├── SECURITY.md                 # Security policy
└── README.md                   # This file
```

## Quick Start

### Prerequisites

- **Python 3.10+**
- **Node.js 20+** with pnpm
- **Docker & Docker Compose**
- **GitHub App** credentials
- **Daytona Account** (https://app.daytona.io)
- **UV** package manager

### 1. Start Infrastructure

```bash
# Start PostgreSQL, Redis, pgAdmin, Redis Insight
docker-compose -f docker-compose.dev.yml up -d
```

**Services**:
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- pgAdmin: `http://localhost:5050` (admin@example.com / admin)

### 2. Setup Backend

```bash
cd backend

# Install dependencies
uv sync

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Run migrations
alembic upgrade head

# Start backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3) Run worker
```bash
# Start Celery worker
cd backend
celery -A app.core.celery_app worker --loglevel=info
```

**Optional - Celery monitoring**:

```bash
# Start Flower
celery -A app.core.celery_app flower --port=5555
# Visit http://localhost:5555
```

Backend available at: `http://localhost:8000`

### 4. Setup Frontend

```bash
cd frontend

# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

Frontend available at: `http://localhost:5173`

### 5. Configure GitHub App

**Quick summary**:
1. Create GitHub App with required permissions
2. Generate and download private key (`.pem` file)
3. Set webhook URL to `http://your-domain/webhooks/github`
4. Add credentials to backend `.env`

### 6. Access the Application

1. **Visit frontend**: `http://localhost:5173`
2. **Click "Login with GitHub"** - redirects to GitHub OAuth
3. **Authorize the app** - redirected back to dashboard
4. **Sync repositories** - on Repositories page, click "Sync from GitHub"
5. **Enable reviews** - toggle repositories you want Metis to review
6. **Open a PR** on an enabled repository - Metis automatically reviews it!

## Documentation

### Core Documentation

- **[Backend README](backend/README.md)** - Complete backend architecture, API reference, agent system
- **[Frontend README](frontend/README.md)** - React app structure, components, state management

## Development

### Development Workflow

**Backend**:
```bash
cd backend

# Code quality
ruff check .              # Lint
ruff format .             # Format
mypy app/                 # Type check
pytest                    # Run tests

# Database
alembic revision --autogenerate -m "description"
alembic upgrade head

# Pre-commit hooks
pre-commit install
pre-commit run --all-files
```

**Frontend**:
```bash
cd frontend

# Code quality
pnpm lint                 # ESLint
pnpm format               # Prettier
pnpm build                # Type check + build

# Development
pnpm dev                  # Dev server with HMR
```

### Development Stack

**Backend**:
- FastAPI for async API endpoints
- Celery for background task processing
- SQLAlchemy 2.0 for async ORM
- Alembic for database migrations
- Redis for task queue and caching
- LiteLLM for multi-provider LLM access
- Daytona for isolated code execution

**Frontend**:
- React 19 with React Compiler
- TypeScript for type safety
- Vite (Rolldown) for fast builds
- Tailwind CSS v4 for styling
- shadcn/ui for component library
- React Router v7 for routing

### Continuous Integration

**GitHub Actions workflows**:
- Backend: Ruff, MyPy, Pytest (on push)
- Frontend: ESLint, TypeScript, build (on push)
- CodeQL: Security scanning

### Environment Variables

**Backend** (`.env`):
```bash
# Database
DATABASE_URL=postgresql+asyncpg://...

# GitHub
GITHUB_APP_ID=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_WEBHOOK_SECRET=...
GITHUB_SECRET_KEY_PATH=./app.private-key.pem

# LLM Provider
MODEL_NAME=vertex_ai/gemini-3-flash-preview
VERTEX_PROJECT=...
VERTEX_LOCATION=global

# Daytona
DAYTONA_API_KEY=...
DAYTONA_TARGET=eu
```

**Frontend** (`.env.production`):
```bash
VITE_API_URL=https://api.metis.example.com
```


## Security
- Webhook signature verification is enforced for GitHub events.
- OAuth tokens are encrypted at rest.
- Session auth uses HTTP-only cookies and refresh flow.

If you discover a vulnerability, open a private security report or contact the maintainer directly until `SECURITY.md` is finalized.

## Contributing

We welcome contributions! Please read our contributing guidelines first.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** following our code standards
4. **Run quality checks**:
   - Backend: `ruff check . && mypy app/ && pytest`
   - Frontend: `pnpm lint && pnpm format:check && pnpm build`
5. **Commit your changes**: `git commit -m 'feat: add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**


<p align="center">
  <img src="frontend/src/assets/lechat.gif" alt="LeChat" width="360" />
</p>

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## Star History

If you find Metis useful, please consider starring the repository!

<a href="https://star-history.com/#KacemMathlouthi/metis&Date">
  <picture>
	    <source
	      media="(prefers-color-scheme: dark)"
	      srcset="https://api.star-history.com/svg?repos=KacemMathlouthi/metis&type=Date&theme=dark&legend=bottom-right&cache=2026-02-15"
	    />
	    <source
	      media="(prefers-color-scheme: light)"
	      srcset="https://api.star-history.com/svg?repos=KacemMathlouthi/metis&type=Date&legend=bottom-right&cache=2026-02-15"
	    />
    <img
      alt="Star History Chart"
      src="https://api.star-history.com/svg?repos=KacemMathlouthi/metis&type=Date&legend=bottom-right&cache=2026-02-15"
    />
  </picture>
</a>

---

<p align="center">Made with ❤️ for better code reviews</p>
