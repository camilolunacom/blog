import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = new URL('..', import.meta.url).pathname;
const fixture = JSON.parse(fs.readFileSync(path.join(root, 'test/fixtures/site-metadata.json'), 'utf8'));
const sourceDir = path.join(root, '_posts');
const destDir = path.join(root, 'src/content/blog');

function parseMarkdown(file) {
  const text = fs.readFileSync(file, 'utf8');
  const match = text.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) throw new Error(`Missing frontmatter: ${file}`);
  const frontmatter = match[1];
  const body = match[2].replace(/\r\n/g, '\n').trim();
  const value = (key) => frontmatter.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'))?.[1]?.trim().replace(/^['"]|['"]$/g, '');
  return { title: value('title'), date: value('date'), permalink: value('permalink'), bodySha256: crypto.createHash('sha256').update(body).digest('hex') };
}

const errors = [];
const migrated = fs.existsSync(destDir) ? fs.readdirSync(destDir).filter((name) => name.endsWith('.md')).sort() : [];
if (migrated.length !== fixture.posts.length) errors.push(`Expected ${fixture.posts.length} migrated posts, found ${migrated.length}`);

for (const expected of fixture.posts) {
  const dest = path.join(destDir, expected.file);
  if (!fs.existsSync(dest)) { errors.push(`Missing migrated post: ${expected.file}`); continue; }
  const actual = parseMarkdown(dest);
  for (const key of ['title', 'date', 'permalink', 'bodySha256']) {
    if ((actual[key] ?? null) !== (expected[key] ?? null)) errors.push(`${expected.file}: ${key} changed`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Content migration validated: ${fixture.posts.length} posts, bodies unchanged.`);
