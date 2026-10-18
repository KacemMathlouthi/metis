# Metis website

The public site for Metis: what it does and how to self-host it. It is fully static and separate
from the dashboard in `../frontend`. It has no login, no API calls, and no backend.

## Develop

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm lint
pnpm format
```

## Build

```bash
pnpm build      # type-check, build, then prerender every route into dist/
pnpm preview    # serve dist/ on http://localhost:4173
```

`pnpm build` runs two Vite builds, a client bundle and an SSR bundle of `src/entry-server.tsx`.
Then `scripts/prerender.mjs` renders each route in `src/site.ts` to static HTML
(`dist/docs/quickstart.html` and so on), plus `404.html`, `sitemap.xml`, and `robots.txt`. React
hydrates the prerendered markup in the browser.

Canonical and Open Graph URLs use `SITE_URL` when set. Otherwise they use Vercel's production
domain, then `http://localhost:4173`.

## Deploy to Vercel

1. Import the repository in Vercel.
2. Set **Root Directory** to `website`. Everything else comes from `vercel.json`.
3. Optional: once you attach a custom domain, set the `SITE_URL` environment variable to it,
   e.g. `https://getmetis.tech`.

## How it works pictures

Drop images into `src/assets/how-it-works/` named after their step: `review-1` to `review-4` and `issue-1` to `issue-4` (`.png`, `.jpg`, `.webp`, `.avif`, or `.svg`). They are picked up at build time and shown in a 4:3 frame. Steps without a picture show their icon.

## Adding a docs page

1. Add the route's metadata to `DOC_PAGES` in `src/site.ts`. This drives the sidebar, prev/next
   links, page titles, prerendering, and the sitemap.
2. Create the page in `src/pages/documentation/` using the primitives in
   `src/components/documentation/Prose.tsx`.
3. Register the route in `src/App.tsx`.

Don't name a source folder `docs`: the repository's root `.gitignore` ignores every `docs/`
directory, and Tailwind skips git-ignored files when it scans for classes.
