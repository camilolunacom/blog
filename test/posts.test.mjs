import test from 'node:test';
import assert from 'node:assert/strict';
import { postSlug, postPath, ensureTrailingSlash } from '../src/utils/urls.js';
import { sortPosts, assertUniqueSlugs, formatPostDate } from '../src/utils/posts.js';

test('post slug prefers explicit permalink, then slug, then historical filename', () => {
  assert.equal(postSlug({ id: '2024-02-05-haces-lo-mejor.md', data: { permalink: '/haces-lo-mejor/' } }), 'haces-lo-mejor');
  assert.equal(postSlug({ id: '2024-02-05-title.md', data: { slug: 'custom' } }), 'custom');
  assert.equal(postSlug({ id: '2019-11-03-42k-Cont.md', data: {} }), '42k-Cont');
});

test('paths keep trailing slash at root-level post routes', () => {
  assert.equal(postPath({ id: '2024-02-05-haces-lo-mejor.md', data: {} }), '/haces-lo-mejor/');
  assert.equal(ensureTrailingSlash('/archivo'), '/archivo/');
});

test('posts sort newest first and slugs are unique', () => {
  const posts = [
    { id: 'a.md', data: { date: new Date('2020-01-01T00:00:00-05:00') } },
    { id: 'b.md', data: { date: new Date('2021-01-01T00:00:00-05:00') } },
  ];
  assert.deepEqual(sortPosts(posts).map((post) => post.id), ['b.md', 'a.md']);
  assert.doesNotThrow(() => assertUniqueSlugs(posts));
  assert.throws(() => assertUniqueSlugs([{ id: '2020-01-01-x.md', data: {} }, { id: '2021-01-01-x.md', data: {} }]), /Duplicate post slug/);
});

test('dates render in America/Bogota format', () => {
  assert.equal(formatPostDate(new Date('2024-02-05T11:19:40-05:00')), '05/02/2024');
});
