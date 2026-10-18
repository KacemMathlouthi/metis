<p align="center">
  <img src="static/metis-logo.svg" alt="Metis" width="420" />
</p>

<p align="center">
  <b>Open-source AI code review for GitHub.</b><br />
  Reviews every pull request you open, and turns the issues you pick into pull requests.
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-FF8205?style=flat-square&labelColor=111111" alt="MIT license" /></a>
  <a href="CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-welcome-FF8205?style=flat-square&labelColor=111111" alt="PRs welcome" /></a>
</p>

---

## What it does

Metis is a GitHub App you host yourself. It runs two flows on the same agent engine:

- **Review a pull request (automatic).** When a PR is opened or updated, an agent clones the branch into an isolated [Daytona](https://www.daytona.io) sandbox, reads the surrounding code, runs your tests and linters, and posts findings inline on the diff. Each finding is tagged with a severity and a category. A summary review with a verdict follows, and a second agent rewrites the PR title and description.
- **Turn an issue into a PR (on demand).** Pick an issue in the dashboard and a coding agent branches, edits, tests, commits, and pushes. Metis then opens the pull request and keeps the full run so you can replay it.

It works with any model [LiteLLM](https://docs.litellm.ai) supports (Gemini, GPT, Claude, Mistral, Azure OpenAI, and more), and every repository gets its own sensitivity, custom instructions, and ignore patterns.

## Quickstart

You need Docker, a GitHub App you create, an LLM API key, and a Daytona API key.

```bash
git clone https://github.com/KacemMathlouthi/metis.git && cd metis
cp backend/.env.example backend/.env   # fill in GitHub App, LLM and Daytona credentials
make dev                               # API, worker, dashboard, PostgreSQL and Redis
```

Then point your GitHub App's webhook at `https://<public-api-url>/webhooks/github`, sign in at `http://localhost:5173`, and enable a repository.

The step-by-step guides live in the website docs (source in [`website/`](website/)):
quickstart, GitHub App setup, configuration reference, and architecture.

## How it works

```
GitHub webhook ─► FastAPI (verify, record, enqueue) ─► Redis ─► Celery worker
                                                                   │
                     Daytona sandbox ◄── agent loop ──► LLM (via LiteLLM)
                                                                   │
                     findings, reviews and PRs ──► GitHub · PostgreSQL ──► dashboard
```

## Repository layout

| Path        | Contents                                                     |
| ----------- | ------------------------------------------------------------ |
| `backend/`  | FastAPI API, Celery tasks, agents, tools, Alembic migrations |
| `frontend/` | React dashboard (repositories, settings, findings, agent runs) |
| `website/`  | Public landing page and docs, deployed as a static site      |
| `daytona/`  | Daytona submodule, only needed to self-host sandboxes        |

## Development

```bash
make setup        # install backend (uv) and frontend (pnpm) dependencies
make infra-up     # PostgreSQL, Redis and pgAdmin only
make migrate      # alembic upgrade head
make backend-dev  # API on :8000
make worker-dev   # Celery worker
make frontend-dev # dashboard on :5173
make ci-local     # lint, type-check and tests
```

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md). Report vulnerabilities privately as described in [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE) © Kacem Mathlouthi

<a href="https://star-history.com/#KacemMathlouthi/metis&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=KacemMathlouthi/metis&type=Date&theme=dark&legend=bottom-right&cache=2026-02-15" />
    <img alt="Star history" src="https://api.star-history.com/svg?repos=KacemMathlouthi/metis&type=Date&legend=bottom-right&cache=2026-02-15" />
  </picture>
</a>
