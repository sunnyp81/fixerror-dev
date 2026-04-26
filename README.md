# fixerror.dev

Plain-English fixes for every API, HTTP, framework, and library error.

Built for developers debugging in production — and indexable / citable by AI search systems (ChatGPT, Perplexity, Claude, Google AI Overviews).

## Stack

- Astro 5 + content collections + MDX
- Tailwind 4 (via @tailwindcss/vite)
- Shiki for syntax highlighting (multi-language)
- Cloudflare Pages (deployed via Wrangler CLI from GitHub)
- TypeScript strict

## Development

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # static output to dist/
npm run preview      # preview the build locally
```

## Project structure

```
src/
├── content/
│   ├── errors/<service>/<slug>.mdx   # one error per file
│   ├── guides/<slug>.mdx             # long-form guides
│   ├── data/services.json            # service registry
│   ├── data/http-codes.json          # HTTP status registry
│   └── comparisons/<slug>.mdx        # service vs service pages
├── pages/
│   ├── index.astro                   # home
│   ├── [service]/index.astro         # service hub
│   ├── [service]/[code].astro        # error page
│   ├── http/[code].astro             # HTTP code page
│   ├── guide/[slug].astro            # guide page
│   ├── compare/[...slug].astro       # comparison page
│   ├── llms.txt.ts                   # LLM-friendly content map
│   ├── ai.txt.ts                     # AI training/citation policy
│   └── robots.txt.ts                 # explicit allow for AI crawlers
└── components/                       # Header, Footer, TLDR, CodeBlock, etc.

scripts/
├── generate-stub-errors.mjs          # bulk-generate templated stubs (noindex)
└── generate-og.mjs                   # default OG image

data/error-catalog/                   # JSON catalogues per service for stub generation
```

## Adding a hand-curated error

Create `src/content/errors/<service>/<slug>.mdx` matching the schema in
`src/content.config.ts`. See existing files for tone/structure:

- `src/content/errors/stripe/card-declined.mdx`
- `src/content/errors/openai/rate-limit-exceeded.mdx`
- `src/content/errors/postgres/econnrefused.mdx`

Quality gate: 700+ words, original `causes` (3+), `fixes` (2+ with code), `faq` (4+),
`quality: curated`. Run `npm run build` to validate.

## Bulk-generating templated stubs

```bash
# 1. Drop a JSON catalogue into data/error-catalog/<service>.json
#    (see data/error-catalog/README.md for schema)

# 2. Generate
npm run generate:stubs

# 3. Stubs ship as noindex: true. Promote to indexed by editing the file:
#    set quality: curated, noindex: false, expand causes/fixes/faq.
```

## Deploy

Cloudflare Pages, GitHub-connected. Manual deploy:

```bash
npm run build
npx wrangler pages deploy dist --project-name fixerror-dev
```

## SEO

- Sitemap auto-generated, split at 5k entries per chunk
- `robots.txt` explicitly allows GPTBot, PerplexityBot, ClaudeBot, CCBot,
  Google-Extended, Applebot-Extended, OAI-SearchBot, Bytespider
- `/llms.txt` provides full content map for LLM ingestion
- `/ai.txt` declares training + citation policy
- IndexNow key in `public/`
- Per-page TechArticle + HowTo + FAQPage schema
- Canonical URLs, OG, Twitter Card metadata
