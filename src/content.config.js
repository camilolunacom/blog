import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const dateValue = z.union([z.string(), z.date()]).transform((value) => new Date(value));

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.coerce.string(),
    date: dateValue,
    permalink: z.string().optional(),
    slug: z.string().optional(),
    description: z.string().optional(),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = { blog };
