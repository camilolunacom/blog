export function stripDatePrefix(id) {
  return id.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.mdx?$/, '');
}

export function normalizeSlug(value) {
  return String(value ?? '')
    .trim()
    .replace(/^\/+/, '')
    .replace(/\/+$/, '');
}

export function postSlug(post) {
  if (post.data.permalink) return normalizeSlug(post.data.permalink);
  if (post.data.slug) return normalizeSlug(post.data.slug);
  return normalizeSlug(stripDatePrefix(post.id));
}

export function ensureTrailingSlash(path) {
  if (path === '/') return '/';
  return path.endsWith('/') ? path : `${path}/`;
}

export function postPath(post) {
  return ensureTrailingSlash(`/${postSlug(post)}/`);
}

export function absoluteUrl(path, base = 'https://www.camiloluna.com') {
  return new URL(path, base).toString();
}
