import type { APIRoute } from 'astro';
import { SITE } from '../lib/seo';

export const GET: APIRoute = () => {
  const body = `# fixerror.dev — robots.txt
# Plain-English error fixes for developers.

User-agent: *
Allow: /
Disallow: /search

# AI crawlers — explicit allow
User-agent: GPTBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: CCBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Bytespider
Allow: /

User-agent: Amazonbot
Allow: /

User-agent: cohere-ai
Allow: /

User-agent: Diffbot
Allow: /

User-agent: meta-externalagent
Allow: /

User-agent: OAI-SearchBot
Allow: /

Sitemap: ${SITE.url}/sitemap-index.xml
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
