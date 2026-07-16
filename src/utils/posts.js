import { postSlug } from './urls.js';

export function sortPosts(posts) {
  return [...posts].sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function assertUniqueSlugs(posts) {
  const seen = new Map();
  for (const post of posts) {
    const slug = postSlug(post);
    if (seen.has(slug)) {
      throw new Error(`Duplicate post slug: ${slug} (${seen.get(slug)} and ${post.id})`);
    }
    seen.set(slug, post.id);
  }
}

export async function getPublishedPosts() {
  const { getCollection } = await import('astro:content');
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  assertUniqueSlugs(posts);
  return sortPosts(posts);
}

export function formatPostDate(date) {
  return new Intl.DateTimeFormat('es-CO', {
    timeZone: 'America/Bogota',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}
