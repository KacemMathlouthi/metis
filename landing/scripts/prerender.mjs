/**
 * Turns the client build into a fully static site.
 *
 * Runs after `vite build` (client, into dist/) and `vite build --ssr` (into dist-server/).
 * For every route in src/site.ts it writes dist/<route>.html with the rendered markup
 * and per-page <head> tags, plus 404.html, sitemap.xml and robots.txt.
 *
 * The absolute site URL (canonical links, Open Graph, sitemap) comes from SITE_URL, falling
 * back to Vercel's production domain, then to the local preview server.
 */
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(root, 'dist');
const serverDir = path.join(root, 'dist-server');

const APP_HTML_PLACEHOLDER = '<!--app-html-->';
const APP_HEAD_PLACEHOLDER = '<!--app-head-->';

function resolveSiteUrl() {
  const explicit = process.env.SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, '');
  const vercelDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelDomain) return `https://${vercelDomain}`;
  return 'http://localhost:4173';
}

/** "/" -> index.html, "/docs/quickstart" -> docs/quickstart.html (served clean via cleanUrls). */
function outputFileFor(routePath) {
  return routePath === '/'
    ? path.join(distDir, 'index.html')
    : path.join(distDir, `${routePath.slice(1)}.html`);
}

function fillTemplate(template, head, html) {
  if (!template.includes(APP_HTML_PLACEHOLDER) || !template.includes(APP_HEAD_PLACEHOLDER)) {
    throw new Error('dist/index.html is missing the prerender placeholders');
  }
  return template.replace(APP_HEAD_PLACEHOLDER, head).replace(APP_HTML_PLACEHOLDER, html);
}

async function writePage(file, contents) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, contents, 'utf8');
}

function buildSitemap(siteUrl, pages) {
  const urls = pages
    .map(({ path: routePath }) => {
      const loc = `${siteUrl}${routePath === '/' ? '/' : routePath}`;
      return `  <url><loc>${loc}</loc></url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

async function main() {
  const siteUrl = resolveSiteUrl();
  const template = await readFile(path.join(distDir, 'index.html'), 'utf8');
  const { render, renderHead, PAGES, NOT_FOUND_PAGE } = await import(
    pathToFileURL(path.join(serverDir, 'entry-server.js')).href
  );

  for (const page of PAGES) {
    const html = fillTemplate(template, renderHead(page, siteUrl), render(page.path));
    await writePage(outputFileFor(page.path), html);
    console.log(`prerendered ${page.path}`);
  }

  // Vercel serves dist/404.html for unknown paths. Any unmatched URL renders the not-found route.
  const notFoundHtml = fillTemplate(
    template,
    renderHead(NOT_FOUND_PAGE, siteUrl, { noindex: true }),
    render('/__not-found__')
  );
  await writePage(path.join(distDir, '404.html'), notFoundHtml);

  await writeFile(path.join(distDir, 'sitemap.xml'), buildSitemap(siteUrl, PAGES), 'utf8');
  await writeFile(
    path.join(distDir, 'robots.txt'),
    `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
    'utf8'
  );

  await rm(serverDir, { recursive: true, force: true });
  console.log(`prerendered ${PAGES.length} pages + 404 for ${siteUrl}`);
}

main().catch((error) => {
  console.error('Prerender failed:', error);
  process.exit(1);
});
