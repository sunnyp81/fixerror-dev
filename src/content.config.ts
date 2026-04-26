import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

const codeExample = z.object({
  language: z.string(),
  filename: z.string().optional(),
  code: z.string(),
  caption: z.string().optional(),
});

const fix = z.object({
  title: z.string(),
  body: z.string(),
  code: codeExample.optional(),
  likelihood: z.enum(['high', 'medium', 'low']).default('medium'),
});

const cause = z.object({
  title: z.string(),
  body: z.string(),
});

const faqItem = z.object({
  q: z.string(),
  a: z.string(),
});

const dateLike = z.union([z.string(), z.date()]).transform((v) =>
  typeof v === 'string' ? v : v.toISOString().slice(0, 10),
);

const errors = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/errors' }),
  schema: z.object({
    service: z.string(),
    code: z.string(),
    slug: z.string(),
    title: z.string(),
    plainTitle: z.string(),
    httpStatus: z.number().optional(),
    category: z.enum([
      'auth',
      'rate-limit',
      'validation',
      'network',
      'billing',
      'permission',
      'not-found',
      'server',
      'config',
      'database',
      'runtime',
      'build',
      'deploy',
      'cors',
      'webhook',
      'other',
    ]),
    severity: z.enum(['critical', 'high', 'medium', 'low']).default('medium'),
    tldrCause: z.string(),
    tldrFix: z.string(),
    contextCode: codeExample.optional(),
    causes: z.array(cause).min(3),
    fixes: z.array(fix).min(2),
    detection: z.string().optional(),
    related: z.array(z.string()).default([]),
    relatedHttp: z.number().optional(),
    relatedGuide: z.string().optional(),
    faq: z.array(faqItem).min(4),
    escalate: z.string().optional(),
    languages: z.array(z.string()).default([]),
    keywords: z.array(z.string()).default([]),
    quality: z.enum(['curated', 'templated']).default('templated'),
    noindex: z.boolean().default(false),
    publishedAt: dateLike.optional(),
    updatedAt: dateLike.optional(),
  }),
});

const services = defineCollection({
  loader: file('./src/content/data/services.json'),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    tagline: z.string(),
    description: z.string(),
    longDescription: z.string(),
    docsUrl: z.string().url(),
    statusUrl: z.union([z.string().url(), z.literal('')]).optional(),
    supportUrl: z.union([z.string().url(), z.literal('')]).optional(),
    category: z.string(),
    color: z.string(),
    aliases: z.array(z.string()).default([]),
  }),
});

const httpCodes = defineCollection({
  loader: file('./src/content/data/http-codes.json'),
  schema: z.object({
    code: z.number(),
    name: z.string(),
    category: z.enum(['1xx', '2xx', '3xx', '4xx', '5xx']),
    description: z.string(),
    longDescription: z.string(),
    rfc: z.string(),
    typicalCauses: z.array(z.string()),
    isError: z.boolean(),
  }),
});

const guides = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    category: z.string(),
    keywords: z.array(z.string()).default([]),
    relatedErrors: z.array(z.string()).default([]),
    publishedAt: dateLike.optional(),
    updatedAt: dateLike.optional(),
  }),
});

const comparisons = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/comparisons' }),
  schema: z.object({
    serviceA: z.string(),
    serviceB: z.string(),
    slug: z.string(),
    title: z.string(),
    description: z.string(),
    intro: z.string(),
    keyDifferences: z.array(z.object({
      area: z.string(),
      a: z.string(),
      b: z.string(),
    })),
    sharedErrors: z.array(z.object({
      pattern: z.string(),
      aCode: z.string(),
      bCode: z.string(),
      note: z.string(),
    })).default([]),
    publishedAt: dateLike.optional(),
  }),
});

export const collections = { errors, services, httpCodes, guides, comparisons };
