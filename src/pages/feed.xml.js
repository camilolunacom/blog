import rss from '@astrojs/rss';
import { site } from '../config/site.js';
import { getPublishedPosts } from '../utils/posts.js';
import { absoluteUrl, postPath } from '../utils/urls.js';

export async function GET(context) {
  const posts = await getPublishedPosts();
  return rss({
    title: site.title,
    description: site.description,
    site: context.site ?? site.url,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description ?? site.description,
      pubDate: post.data.date,
      link: absoluteUrl(postPath(post), site.url),
    })),
  });
}
