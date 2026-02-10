<p align="center">
  <img src="static/metis-logo.svg" alt="Metis logo" width="520" />
</p>
<p align="center">AI-Powered GitHub Code Review Platform</p>

<p align="center">
  <a href="https://github.com/KacemMathlouthi/metis">
    <img src="https://img.shields.io/badge/METIS-SEE%20MORE%20DETAILS-FF9F1C?style=for-the-badge&labelColor=111111&logo=github&logoColor=FFFFFF" alt="Metis See More Details" />
  </a>
  <a href="docs/TECHNICAL_ARCHITECTURE.md">
    <img src="https://img.shields.io/badge/DOCS-TECHNICAL%20ARCHITECTURE-FFD800?style=for-the-badge&labelColor=111111&logo=readthedocs&logoColor=FFFFFF" alt="Docs Technical Architecture" />
  </a>
  <a href="docs/next-steps.md">
    <img src="https://img.shields.io/badge/ROADMAP-NEXT%20STEPS-FA500F?style=for-the-badge&labelColor=111111&logo=bookstack&logoColor=FFFFFF" alt="Roadmap Next Steps" />
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
  <img src="https://img.shields.io/badge/Helm-0F1689?style=for-the-badge&labelColor=111111&logo=helm&logoColor=white" alt="Helm" />
</p>

<p align="center">
  <img src="frontend/src/assets/Handshake-with-AI.png" alt="Human and AI handshake" width="100%" />
</p>

## Overview
Metis is an AI-powered GitHub code reviewer built as a GitHub App. It listens to pull request webhooks, analyzes changes in an isolated sandbox, and posts actionable findings directly on the PR.

This repository is a production-focused monorepo with:
- Backend: Python, FastAPI, Celery, SQLAlchemy, PostgreSQL, Redis
- Frontend: React 19, TypeScript, Vite, Tailwind, shadcn/ui
- Agent runtime: Daytona sandbox + tool-augmented agent loops

## Key Capabilities
- Asynchronous webhook processing for PR events
- Agent-based code review with progressive inline findings
- PR summary generation and title update flow
- Issue-to-PR background coding workflow
- Repository-level review configuration and analytics dashboard
- Multi-provider model support via LiteLLM

## Table of Contents
- [Architecture](#architecture)
- [Repository Structure](#repository-structure)
- [Quick Start](#quick-start)
- [Local Development](#local-development)
- [Configuration](#configuration)
- [Testing and Quality](#testing-and-quality)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

## Architecture
Core request flow:
1. GitHub sends webhook event for PR changes.
2. Backend validates signature and records a pending review.
3. Celery queues agent tasks for review and summary generation.
4. Agent executes in sandbox with controlled tool access.
5. Findings are posted to GitHub review comments and persisted.
6. Frontend dashboards expose progress, analytics, and repository controls.

Detailed design references:
- `docs/TECHNICAL_ARCHITECTURE.md`
- `docs/ARCHITECTURE.md`

## Repository Structure
```text
metis/
├── backend/        # FastAPI API, agents, tasks, models, repositories
├── frontend/       # React app (landing + dashboard)
├── docs/           # Architecture, plans, setup, tickets
├── static/         # Static assets used by the project
└── docker-compose.dev.yml
```

## Quick Start
### Prerequisites
- Python 3.10+
- Node.js 20+
- pnpm
- Docker + Docker Compose

### 1) Start infrastructure
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 2) Run backend
```bash
cd backend
uv sync
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3) Run worker
```bash
cd backend
celery -A app.core.celery_app worker --loglevel=info
```

### 4) Run frontend
```bash
cd frontend
pnpm install
pnpm dev
```

## Local Development
Backend commonly used commands:
```bash
cd backend
ruff check .
ruff format .
mypy app/
pytest
```

Frontend commonly used commands:
```bash
cd frontend
pnpm lint
pnpm build
```

## Configuration
Main runtime configuration is loaded from backend `.env` using Pydantic settings:
- GitHub App and OAuth credentials
- JWT and auth cookie settings
- Redis/Celery broker and backend
- Database connection
- LLM provider settings (LiteLLM model target)
- Daytona and LangSmith settings

Reference setup docs:
- `docs/GITHUB_APP_SETUP.md`

## Testing and Quality
Current quality tooling:
- Backend: Ruff, MyPy, Pytest
- Frontend: ESLint, TypeScript build

The repository is actively being prepared for stronger OSS quality gates and CI standardization.

## Security
- Webhook signature verification is enforced for GitHub events.
- OAuth tokens are encrypted at rest.
- Session auth uses HTTP-only cookies and refresh flow.

If you discover a vulnerability, open a private security report or contact the maintainer directly until `SECURITY.md` is finalized.

## Contributing
I am accepting contributions.

Please start with:
- `CONTRIBUTING.md` for workflow, setup, standards, and pull request checklist
- open issues in this repository for tasks and discussion

<p align="center">
  <img src="frontend/src/assets/lechat.gif" alt="LeChat" width="360" />
</p>

## License
This project is licensed under the MIT License.
See `LICENSE` for full terms.
