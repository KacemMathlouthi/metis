/**
 * Prerender entry, consumed by scripts/prerender.mjs at build time only.
 * Renders each route to static HTML so pages load instantly and are indexable without JS.
 */
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { App } from '@/App';
import { NOT_FOUND_PAGE, PAGES, SITE_NAME, type PageMeta } from '@/site';

export { NOT_FOUND_PAGE, PAGES };

export function render(url: string): string {
  return renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>
  );
}

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

/** Builds the per-page <head> tags. `siteUrl` is the absolute origin, without a trailing slash. */
export function renderHead(page: PageMeta, siteUrl: string, options: { noindex?: boolean } = {}) {
  const url = `${siteUrl}${page.path === '/' ? '' : page.path}`;
  const image = `${siteUrl}/social-preview.svg`;
  const title = escapeHtml(page.title);
  const description = escapeHtml(page.description);

  const tags = [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    options.noindex
      ? '<meta name="robots" content="noindex" />'
      : `<link rel="canonical" href="${escapeHtml(url)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${escapeHtml(url)}" />`,
    `<meta property="og:image" content="${escapeHtml(image)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${escapeHtml(image)}" />`,
  ];
  return tags.join('\n    ');
}
