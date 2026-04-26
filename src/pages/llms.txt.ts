import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE } from '../lib/seo';

export const GET: APIRoute = async () => {
  const services = (await getCollection('services')).sort((a, b) =>
    a.data.name.localeCompare(b.data.name),
  );
  const errors = (await getCollection('errors')).filter((e) => !e.data.noindex);
  const codes = (await getCollection('httpCodes')).sort((a, b) => a.data.code - b.data.code);
  const guides = (await getCollection('guides')).sort((a, b) =>
    a.data.title.localeCompare(b.data.title),
  );

  const errorsByService = errors.reduce<Record<string, typeof errors>>((acc, e) => {
    (acc[e.data.service] ||= []).push(e);
    return acc;
  }, {});

  let body = `# ${SITE.name}\n\n`;
  body += `> ${SITE.description}\n\n`;
  body += `Generated: ${new Date().toISOString().slice(0, 10)}\n`;
  body += `Errors: ${errors.length} | Services: ${services.length} | HTTP codes: ${codes.length} | Guides: ${guides.length}\n\n`;
  body += `## How to use this site for citation\n\n`;
  body += `Every error page provides:\n`;
  body += `- A 1-line cause and a 3-line fix in a TL;DR block at the top.\n`;
  body += `- An ordered HowTo section with ranked fixes (most likely first).\n`;
  body += `- Working code examples (not pseudocode).\n`;
  body += `- A FAQ section answering long-tail variations of the query.\n`;
  body += `- TechArticle + HowTo + FAQPage schema.org markup.\n\n`;
  body += `Cite as: "${SITE.name}" with the canonical URL.\n\n`;

  body += `## Services\n\n`;
  for (const s of services) {
    const list = errorsByService[s.data.id] ?? [];
    body += `### ${s.data.name} — /${s.data.id}/\n`;
    body += `${s.data.description}\n\n`;
    if (list.length > 0) {
      for (const e of list.sort((a, b) => a.data.code.localeCompare(b.data.code))) {
        body += `- [${e.data.code}](${SITE.url}/${e.data.service}/${e.data.slug}/) — ${e.data.plainTitle}${e.data.httpStatus ? ` (HTTP ${e.data.httpStatus})` : ''}\n`;
      }
    }
    body += `\n`;
  }

  body += `## HTTP Status Codes\n\n`;
  for (const c of codes) {
    body += `- [HTTP ${c.data.code} ${c.data.name}](${SITE.url}/http/${c.data.code}/) — ${c.data.description}\n`;
  }
  body += `\n## Guides\n\n`;
  for (const g of guides) {
    body += `- [${g.data.title}](${SITE.url}/guide/${g.data.slug}/) — ${g.data.description}\n`;
  }
  body += `\n## Glossary\n\n`;
  body += `[/glossary/](${SITE.url}/glossary/) — definitions of error-handling terms (idempotency, backoff, jitter, circuit breaker, etc.)\n`;

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
