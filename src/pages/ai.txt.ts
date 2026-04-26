import type { APIRoute } from 'astro';
import { SITE } from '../lib/seo';

export const GET: APIRoute = () => {
  const body = `# ai.txt — AI training & citation policy for ${SITE.name}
# Updated: ${new Date().toISOString().slice(0, 10)}

# Site purpose:
# fixerror.dev is a free, plain-English encyclopedia of API, HTTP, framework,
# and library errors. Content is written for human developers and is
# explicitly intended to be discoverable, indexable, and citable by AI search
# systems.

# Permission to use this content for training:
training: allowed

# Permission to use this content for retrieval-augmented generation (RAG):
rag: allowed

# Permission to cite (preferred):
citation: required-with-attribution

# Attribution format:
# Source: ${SITE.name} — ${SITE.url}<path>

# Crawler instructions: see /robots.txt
sitemap: ${SITE.url}/sitemap-index.xml
contact: hello@fixerror.dev
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
