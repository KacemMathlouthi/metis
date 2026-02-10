# Contributing to Metis

Thank you for considering a contribution to Metis. This guide defines the baseline workflow and quality expectations for all changes.

## Ground Rules
- Keep changes focused and scoped to one clear outcome.
- Follow existing architecture and naming conventions.
- Prefer small, reviewable pull requests over large rewrites.
- Include tests or validation steps for behavior changes.
- Do not commit secrets, private keys, or local credential files.

## Ways to Contribute
- Report bugs with reproducible steps.
- Propose features with a clear user impact.
- Improve documentation and developer experience.
- Submit fixes for open issues.

## Development Setup
### Prerequisites
- Python 3.10+
- Node.js 20+
- pnpm
- Docker + Docker Compose

### Run the project locally
1. Start infrastructure:
```bash
docker-compose -f docker-compose.dev.yml up -d
```
2. Backend:
```bash
cd backend
uv sync
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
3. Celery worker:
```bash
cd backend
celery -A app.core.celery_app worker --loglevel=info
```
4. Frontend:
```bash
cd frontend
pnpm install
pnpm dev
```

## Branching and Commits
- Create a feature branch from `main`.
- Branch naming:
  - `feat/<short-description>`
  - `fix/<short-description>`
  - `docs/<short-description>`
- Use clear commit messages. Conventional Commit format is preferred:
  - `feat: add repository switch invalidation`
  - `fix: rotate refresh cookie on session refresh`

## Code Quality Checklist
Before opening a PR, run:

Backend:
```bash
cd backend
ruff check .
ruff format .
mypy app/
pytest
```

Frontend:
```bash
cd frontend
pnpm lint
pnpm build
```

## Pull Request Process
1. Open an issue first for non-trivial features.
2. Link the issue in your PR description.
3. Describe:
- what changed
- why it changed
- how it was tested
4. Include screenshots/videos for UI changes.
5. Note any migration, env, or operational impact.

## Review Expectations
- Maintainers may request architecture, test, or naming changes.
- Keep discussion technical and focused on correctness.
- If a PR becomes stale or diverges in scope, it may be asked to split.

## Security and Sensitive Changes
- For security-sensitive changes (auth, tokens, webhooks, secrets), include threat/risk notes in the PR.
- Never expose credentials in logs, screenshots, or test fixtures.

## Documentation Requirements
- Update docs when behavior changes.
- Add or adjust API docs for endpoint contract updates.
- Keep README examples and setup steps accurate.

## Getting Help
- Open a GitHub issue with `question` context.
- For design or architecture proposals, open a discussion-style issue first.

We are accepting contributions and appreciate all high-quality improvements to Metis.
