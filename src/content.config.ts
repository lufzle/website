import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.string(),
    readTime: z.string(),
    lede: z.string(),
    order: z.number().default(0),
  }),
});

export const collections = { posts };
