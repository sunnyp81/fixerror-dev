#!/usr/bin/env node
/**
 * Generate templated stub error MDX files from structured catalogues.
 *
 * Reads catalogues from `data/error-catalog/<service>.json` and generates
 * `src/content/errors/<service>/<slug>.mdx` for each entry that doesn't
 * already exist. Stubs are written with `quality: templated` and
 * `noindex: true` so they ship as URLs but don't appear in search until
 * manually curated.
 *
 * Catalogue format (data/error-catalog/<service>.json):
 *   [
 *     {
 *       "code": "rate_limit_exceeded",
 *       "slug": "rate-limit-exceeded",      // optional, derived if missing
 *       "plainTitle": "Too Many Requests",
 *       "httpStatus": 429,                  // optional
 *       "category": "rate-limit",           // see content.config.ts enum
 *       "shortCause": "...",                // 1-line cause
 *       "shortFix": "...",                  // 3-line fix
 *       "languages": ["python", "javascript"]
 *     },
 *     ...
 *   ]
 *
 * Usage: node scripts/generate-stub-errors.mjs [--service <id>] [--force]
 */
import { mkdir, readFile, readdir, writeFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CATALOG_DIR = join(ROOT, 'data', 'error-catalog');
const ERRORS_DIR = join(ROOT, 'src', 'content', 'errors');

const args = process.argv.slice(2);
const onlyService = args.includes('--service') ? args[args.indexOf('--service') + 1] : null;
const force = args.includes('--force');

const SERVICE_NAMES = {
  stripe: 'Stripe', aws: 'AWS', gcp: 'Google Cloud', github: 'GitHub',
  openai: 'OpenAI', anthropic: 'Anthropic', vercel: 'Vercel', cloudflare: 'Cloudflare',
  twilio: 'Twilio', shopify: 'Shopify', slack: 'Slack', auth0: 'Auth0',
  firebase: 'Firebase', supabase: 'Supabase', postgres: 'Postgres', mysql: 'MySQL',
  redis: 'Redis', mongodb: 'MongoDB', kubernetes: 'Kubernetes', docker: 'Docker',
  nginx: 'Nginx', nodejs: 'Node.js', python: 'Python', go: 'Go', rust: 'Rust',
  nextjs: 'Next.js', django: 'Django', rails: 'Rails', laravel: 'Laravel',
  express: 'Express', fastapi: 'FastAPI',
};

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function yamlEscape(s) {
  if (s == null) return '""';
  const str = String(s);
  if (/[:#&*!|>'"%@`{}\[\],]/.test(str) || /^\s|\s$/.test(str)) {
    return `"${str.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return str;
}

function buildMdx(service, entry) {
  const serviceName = SERVICE_NAMES[service] ?? service;
  const slug = entry.slug || slugify(entry.code);
  const title = `${serviceName} Error: ${entry.code} — ${entry.plainTitle} (Cause + Fix)`;
  const cause = entry.shortCause || `${serviceName} returned the error code ${entry.code}.`;
  const fix = entry.shortFix || `Investigate the cause in ${serviceName}'s logs and consult the official docs for ${entry.code}.`;
  const today = new Date().toISOString().slice(0, 10);

  const causes = entry.causes && entry.causes.length >= 3 ? entry.causes : [
    { title: 'Invalid input or configuration', body: `The most common trigger for ${entry.code} is bad input — wrong parameter, missing field, or stale config. Verify the request against ${serviceName}'s API reference.` },
    { title: 'Authentication or permission issue', body: `Check that the credentials used can perform the action that triggered ${entry.code}. ${serviceName} surfaces auth issues with a different code, but related failures sometimes leak through.` },
    { title: 'Service-side issue or rate limit', body: `Transient ${serviceName} issues, capacity throttling, or recent product changes can cause ${entry.code}. Check ${serviceName}'s status page and retry with exponential backoff.` },
  ];

  const fixes = entry.fixes && entry.fixes.length >= 2 ? entry.fixes : [
    { title: 'Verify your request matches the API contract', body: `Cross-reference the failing request body and headers against ${serviceName}'s ${entry.code} reference page. Pay attention to required fields, data types, and enum values.`, likelihood: 'high' },
    { title: 'Check credentials and scope', body: `Make sure the API key, token, or service account has the permission to perform this action and is for the right environment (live vs test).`, likelihood: 'medium' },
    { title: 'Retry with exponential backoff for transient failures', body: `If ${entry.code} is sporadic, implement retry with exponential backoff and jitter. Most ${serviceName} errors are transient when load spikes.`, likelihood: 'low' },
  ];

  const faq = entry.faq && entry.faq.length >= 4 ? entry.faq : [
    { q: `What does ${serviceName} ${entry.code} mean?`, a: `${entry.code} is ${serviceName}'s code for "${entry.plainTitle}". ${cause}` },
    { q: `Should I retry on ${entry.code}?`, a: `Only retry if the error is transient (server-side, rate limit, capacity). Validation and permission errors will not succeed on retry — fix the input or credentials first.` },
    { q: `How do I prevent ${entry.code} in production?`, a: `Validate inputs before calling ${serviceName}, use idempotency keys where supported, and monitor your ${entry.code} rate as a leading indicator of upstream issues.` },
    { q: `Where can I find more details about ${entry.code}?`, a: `Check ${serviceName}'s official documentation and status page. The error response body usually carries a more specific reason in addition to the top-level code.` },
  ];

  const lines = [];
  lines.push('---');
  lines.push(`service: ${service}`);
  lines.push(`code: ${yamlEscape(entry.code)}`);
  lines.push(`slug: ${slug}`);
  lines.push(`title: ${yamlEscape(title)}`);
  lines.push(`plainTitle: ${yamlEscape(entry.plainTitle)}`);
  if (entry.httpStatus) lines.push(`httpStatus: ${entry.httpStatus}`);
  lines.push(`category: ${entry.category || 'other'}`);
  lines.push(`severity: ${entry.severity || 'medium'}`);
  lines.push(`tldrCause: ${yamlEscape(cause)}`);
  lines.push(`tldrFix: ${yamlEscape(fix)}`);
  lines.push('causes:');
  for (const c of causes) {
    lines.push(`  - title: ${yamlEscape(c.title)}`);
    lines.push(`    body: ${yamlEscape(c.body)}`);
  }
  lines.push('fixes:');
  for (const f of fixes) {
    lines.push(`  - title: ${yamlEscape(f.title)}`);
    lines.push(`    likelihood: ${f.likelihood || 'medium'}`);
    lines.push(`    body: ${yamlEscape(f.body)}`);
  }
  if (entry.related && entry.related.length) {
    lines.push('related:');
    for (const r of entry.related) lines.push(`  - ${r}`);
  } else {
    lines.push('related: []');
  }
  if (entry.relatedHttp || entry.httpStatus) {
    lines.push(`relatedHttp: ${entry.relatedHttp ?? entry.httpStatus}`);
  }
  if (entry.relatedGuide) lines.push(`relatedGuide: ${entry.relatedGuide}`);
  lines.push('faq:');
  for (const item of faq) {
    lines.push(`  - q: ${yamlEscape(item.q)}`);
    lines.push(`    a: ${yamlEscape(item.a)}`);
  }
  if (entry.escalate) lines.push(`escalate: ${yamlEscape(entry.escalate)}`);
  if (entry.languages && entry.languages.length) {
    lines.push('languages:');
    for (const l of entry.languages) lines.push(`  - ${l}`);
  }
  if (entry.keywords && entry.keywords.length) {
    lines.push('keywords:');
    for (const k of entry.keywords) lines.push(`  - ${yamlEscape(k)}`);
  }
  lines.push('quality: templated');
  lines.push('noindex: true');
  lines.push(`publishedAt: ${today}`);
  lines.push(`updatedAt: ${today}`);
  lines.push('---');
  lines.push('');
  lines.push(`The ${serviceName} \`${entry.code}\` error indicates ${entry.plainTitle.toLowerCase()}. ${cause}`);
  lines.push('');
  lines.push(`This page is a stub — it documents the error and its general fix. For deeper guidance, see the cross-referenced errors and guides above, or the [${serviceName} docs](#).`);
  lines.push('');
  return lines.join('\n');
}

async function main() {
  if (!existsSync(CATALOG_DIR)) {
    console.error(`Catalog directory not found: ${CATALOG_DIR}`);
    console.error('Create data/error-catalog/<service>.json files to generate stubs.');
    process.exit(1);
  }

  const files = (await readdir(CATALOG_DIR)).filter((f) => f.endsWith('.json'));
  let totalGenerated = 0;
  let totalSkipped = 0;

  for (const file of files) {
    const service = file.replace(/\.json$/, '');
    if (onlyService && service !== onlyService) continue;

    const catalog = JSON.parse(await readFile(join(CATALOG_DIR, file), 'utf8'));
    const outDir = join(ERRORS_DIR, service);
    await mkdir(outDir, { recursive: true });

    let generated = 0;
    let skipped = 0;

    for (const entry of catalog) {
      const slug = entry.slug || slugify(entry.code);
      const outPath = join(outDir, `${slug}.mdx`);

      if (existsSync(outPath) && !force) {
        skipped++;
        continue;
      }

      const mdx = buildMdx(service, entry);
      await writeFile(outPath, mdx, 'utf8');
      generated++;
    }

    console.log(`${service}: ${generated} generated, ${skipped} skipped (existing)`);
    totalGenerated += generated;
    totalSkipped += skipped;
  }

  console.log(`\nTotal: ${totalGenerated} stubs generated, ${totalSkipped} skipped.`);
  console.log('All stubs are noindex: true. Promote to curated by editing the file:');
  console.log('  - Set quality: curated, noindex: false');
  console.log('  - Expand causes/fixes/faq with real, specific content');
  console.log('  - Add working code examples');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
