import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const fixture = JSON.parse(fs.readFileSync(path.join(root, 'test/fixtures/site-metadata.json'), 'utf8'));

test('all 28 historical posts are represented with unique slugs', () => {
  assert.equal(fixture.posts.length, 28);
  assert.equal(new Set(fixture.posts.map((post) => post.slug)).size, 28);
});
