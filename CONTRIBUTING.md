# Contributing

Thanks for helping improve Metis. Bug reports, docs fixes, and pull requests are all welcome.

## Before you start

- For anything beyond a small fix, open an issue first so we can agree on the approach.
- Keep each pull request focused on one change.
- Never commit secrets, private keys (`*.pem`), or `.env` files.

## Setup

Requirements: Python 3.10+, [uv](https://docs.astral.sh/uv/), Node.js 20+, pnpm, and Docker.

```bash
make setup      # install dependencies
make infra-up   # PostgreSQL and Redis
make migrate    # apply database migrations
make backend-dev
make worker-dev
make frontend-dev
```

The [README](README.md) and the website docs cover configuring the GitHub App, LLM, and Daytona.

## Checks

Run these before opening a pull request:

```bash
make format
make ci-local   # ruff, mypy, pytest, and the frontend build
```

For the website: `cd website && pnpm lint && pnpm build`.

## Branches and commits

- Branch from `main` using `feat/…`, `fix/…`, `docs/…`, or `chore/…`.
- Use [Conventional Commits](https://www.conventionalcommits.org) with a scope, for example
  `fix(backend): rotate refresh cookie on session refresh`.

## Pull requests

Describe what changed, why, and how you tested it. Include screenshots for UI changes, and call out new environment variables, migrations, or security-sensitive changes (auth, tokens, webhooks, sandboxing).
