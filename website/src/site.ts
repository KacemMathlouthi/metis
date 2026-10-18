export const REPO_URL = 'https://github.com/KacemMathlouthi/metis';
export const REPO_BLOB_URL = `${REPO_URL}/blob/main`;
export const AUTHOR_GITHUB_URL = 'https://github.com/KacemMathlouthi';
export const AUTHOR_LINKEDIN_URL = 'https://linkedin.com/in/kacem-mathlouthi';

export const SITE_NAME = 'Metis';
export const DEFAULT_DESCRIPTION =
  'Metis is an open-source, self-hostable GitHub App that reviews pull requests, writes PR summaries, and turns issues into pull requests with the LLM of your choice.';

export interface PageMeta {
  path: string;
  title: string;
  description: string;
}

export interface DocPage extends PageMeta {
  /** Short label used in the docs sidebar and prev/next links. */
  label: string;
}

export const HOME_PAGE: PageMeta = {
  path: '/',
  title: 'Metis — Open-source AI code review for GitHub',
  description: DEFAULT_DESCRIPTION,
};

/** Ordered: drives the docs sidebar and prev/next navigation. */
export const DOC_PAGES: readonly DocPage[] = [
  {
    path: '/docs',
    label: 'Introduction',
    title: 'Introduction — Metis Docs',
    description:
      'What Metis is, the pieces you run when you self-host it, and what you need first.',
  },
  {
    path: '/docs/quickstart',
    label: 'Quickstart',
    title: 'Self-host quickstart — Metis Docs',
    description:
      'Run the full Metis stack with Docker Compose, connect it to GitHub, and get your first AI pull request review.',
  },
  {
    path: '/docs/github-app',
    label: 'GitHub App',
    title: 'Create the GitHub App — Metis Docs',
    description:
      'Register your own GitHub App for Metis: callback URL, webhook, permissions, events and credentials.',
  },
  {
    path: '/docs/configuration',
    label: 'Configuration',
    title: 'Configuration reference — Metis Docs',
    description:
      'Every environment variable Metis reads, how to switch LLM providers, and per-repository review settings.',
  },
  {
    path: '/docs/architecture',
    label: 'Architecture',
    title: 'Architecture — Metis Docs',
    description:
      'How Metis turns a GitHub webhook into a sandboxed agent run: components, request flow, agents and tools.',
  },
];

export const NOT_FOUND_PAGE: PageMeta = {
  path: '/404',
  title: 'Page not found — Metis',
  description: DEFAULT_DESCRIPTION,
};

/** Every route that is prerendered to static HTML and listed in the sitemap. */
export const PAGES: readonly PageMeta[] = [HOME_PAGE, ...DOC_PAGES];

export function findPage(pathname: string): PageMeta {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return PAGES.find((page) => page.path === normalized) ?? NOT_FOUND_PAGE;
}
