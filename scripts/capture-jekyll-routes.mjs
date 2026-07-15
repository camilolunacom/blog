import fs from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';

const root = new URL('..', import.meta.url).pathname;
const siteDir = path.join(root, '_site');
const output = path.join(root, 'test/fixtures/jekyll-routes.json');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function routeFor(file) {
  const rel = path.relative(siteDir, file).replaceAll(path.sep, '/');
  if (rel === '404/index.html') return '/404.html';
  if (rel.endsWith('/index.html')) return `/${rel.slice(0, -'index.html'.length)}`;
  if (rel === 'index.html') return '/';
  if (rel === 'feed.xml' || rel === 'sitemap.xml' || rel === 'robots.txt') return `/${rel}`;
  return null;
}

const routes = walk(siteDir)
  .map((file) => ({ file, route: routeFor(file) }))
  .filter(({ route }) => route)
  .map(({ file, route }) => {
    const text = fs.readFileSync(file, 'utf8');
    if (!file.endsWith('.html')) return { path: route, title: null, canonical: null, h1: null };
    const document = new JSDOM(text).window.document;
    return {
      path: route,
      title: document.querySelector('title')?.textContent.trim() ?? null,
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null,
      h1: document.querySelector('h1')?.textContent.trim() ?? null,
    };
  })
  .sort((a, b) => a.path.localeCompare(b.path));

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(routes, null, 2)}\n`);
console.log(`Captured ${routes.length} routes from ${siteDir}`);
