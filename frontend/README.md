# Metis Dashboard

The web app self-hosters sign in to: enable repositories, tune review settings, browse findings, and launch and follow Issue → PR agents. (The public landing page and docs live in [`../website`](../website).)

**Stack:** React 19 with the React Compiler, TypeScript, Vite (`rolldown-vite`), Tailwind CSS v4, shadcn/ui on Radix, React Router 7.

## Run locally

```bash
pnpm install
pnpm dev        # http://localhost:5173
```

The API URL comes from `VITE_API_URL` (default `http://localhost:8000`). Requests send cookies, so the API's `FRONTEND_URL` must match this app's origin.

## Pages

| Route                          | Purpose                                             |
| ------------------------------ | --------------------------------------------------- |
| `/login`, `/auth/callback`     | GitHub sign-in                                      |
| `/dashboard`                   | Overview of the selected repository                 |
| `/dashboard/repositories`      | Sync installations from GitHub and enable repos     |
| `/dashboard/ai-review`         | Sensitivity, custom instructions, ignore patterns   |
| `/dashboard/analytics`         | Review statistics and every AI finding              |
| `/dashboard/issues`            | Issues and agent runs; launch an Issue → PR agent   |
| `/dashboard/agents/:agentId`   | Live progress and replay of an agent run            |

App state lives in three contexts: `AuthContext` (current user), `RepositoryContext` (selected repository, persisted locally), and `ToastContext`. API calls go through `src/lib/api-client.ts`, which retries once after silently refreshing the session on a 401.

## Scripts

```bash
pnpm build          # type-check and production build
pnpm lint           # ESLint
pnpm format         # Prettier
```

For production, build the `production` target of the `Dockerfile` with `--build-arg VITE_API_URL=…`. It serves the static build with nginx on port 8080.
