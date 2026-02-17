import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const lessons = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/lessons',
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    day: z.string(),
    module: z.string(),
    exercise: z.number(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    estimatedMinutes: z.number(),
    isFree: z.boolean().default(true),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = { lessons };
