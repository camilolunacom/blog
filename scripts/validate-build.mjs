import fs from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';

const root = new URL('..', import.meta.url).pathname;
const dist = path.join(root, 'dist');
const routes = JSON.parse(fs.readFileSync(path.join(root, 'test/fixtures/jekyll-routes.json'), 'utf8'));
const contentFixture = JSON.parse(fs.readFileSync(path.join(root, 'test/fixtures/site-metadata.json'), 'utf8'));
const errors = [];

function fileFor(route) {
  if (route === '/') return path.join(dist, 'index.html');
  if (route === '/404.html') return path.join(dist, '404.html');
  if (route.endsWith('/')) return path.join(dist, route, 'index.html');
  return path.join(dist, route.slice(1));
}

for (const route of routes) {
  const file = fileFor(route.path);
  if (!fs.existsSync(file)) errors.push(`Missing route output: ${route.path} -> ${path.relative(root, file)}`);
}

for (const required of ['/', '/archivo/', '/ahora/', '/yo/', '/404.html', '/feed.xml', '/sitemap-index.xml']) {
  if (!fs.existsSync(fileFor(required))) errors.push(`Missing required output: ${required}`);
}

for (const post of contentFixture.posts) {
  const file = fileFor(`/${post.slug}/`);
  if (!fs.existsSync(file)) {
    errors.push(`Missing post route: /${post.slug}/`);
    continue;
  }
  const document = new JSDOM(fs.readFileSync(file, 'utf8')).window.document;
  if (document.querySelectorAll('title').length !== 1) errors.push(`Expected one title in /${post.slug}/`);
  const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href');
  if (canonical !== `https://www.camiloluna.com/${post.slug}/`) errors.push(`Bad canonical for /${post.slug}/: ${canonical}`);
  if (document.querySelector('h1')?.textContent.trim() !== post.title) errors.push(`Bad h1 for /${post.slug}/`);
}

for (const htmlFile of fs.readdirSync(dist, { recursive: true }).filter((name) => String(name).endsWith('.html'))) {
  const full = path.join(dist, htmlFile);
  const text = fs.readFileSync(full, 'utf8');
  if (/\{\{|\{%|\{:target=/.test(text)) errors.push(`Unprocessed Liquid/Kramdown syntax in ${htmlFile}`);
  const document = new JSDOM(text).window.document;
  for (const link of document.querySelectorAll('a[target="_blank"]')) {
    const rel = link.getAttribute('rel') ?? '';
    if (!rel.includes('noopener') || !rel.includes('noreferrer')) errors.push(`Missing rel on target=_blank in ${htmlFile}: ${link.outerHTML}`);
  }
}

const feed = fs.readFileSync(fileFor('/feed.xml'), 'utf8');
if ((feed.match(/<item>/g) ?? []).length !== contentFixture.posts.length) errors.push('RSS does not include all posts');
if (feed.includes('localhost') || feed.includes('pages.dev')) errors.push('RSS contains non-production URL');
const sitemap = fs.readFileSync(fileFor('/sitemap-index.xml'), 'utf8');
if (!sitemap.includes('https://www.camiloluna.com')) errors.push('Sitemap index missing production domain');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log('Build parity validation passed.');
