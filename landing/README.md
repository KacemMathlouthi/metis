# Metis landing site

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
2. Set **Root Directory** to `landing`. Everything else comes from `vercel.json`.
3. Optional: once you attach a custom domain, set the `SITE_URL` environment variable to it,
   e.g. `https://getmetis.tech`.

## Docs cover images

Each docs page shows a cover banner when `src/assets/doc-covers/<slug>-800.webp` and `<slug>-1600.webp`
exist (`slug` is set per page in `src/site.ts`). Generate both from a source illustration with:

```bash
uv run --no-project --with pillow python landing/scripts/optimize_doc_cover.py <image> <slug>
```

## Adding a docs page

1. Add the route's metadata to `DOC_PAGES` in `src/site.ts`. This drives the sidebar, prev/next
   links, page titles, prerendering, and the sitemap.
2. Create the page in `src/pages/documentation/` using the primitives in
   `src/components/documentation/Prose.tsx`.
3. Register the route in `src/App.tsx`.

Don't name a source folder `docs`: the repository's root `.gitignore` ignores every `docs/`
directory, and Tailwind skips git-ignored files when it scans for classes.
