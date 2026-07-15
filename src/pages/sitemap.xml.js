import { site } from '../config/site.js';
import { getPublishedPosts } from '../utils/posts.js';
import { absoluteUrl, postPath } from '../utils/urls.js';

export async function GET() {
  const posts = await getPublishedPosts();
  const staticPaths = ['/', '/archivo/', '/ahora/', '/yo/', '/404.html'];
  const urls = [...staticPaths, ...posts.map(postPath)];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((path) => `  <url><loc>${absoluteUrl(path, site.url)}</loc></url>`).join('\n')}
</urlset>
`;
  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
