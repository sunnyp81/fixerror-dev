# fixerror-dev — Project Brain

> Per-repo brain, migrated from central claude-memory 2026-06-20. Canonical project memory now lives here.

## Current state

fixerror.dev — Astro 5 programmatic-SEO error-fixing encyclopedia (SEO portfolio site #45). Action-oriented domain mirrors search intent.

- **Stack:** Astro 5 + Tailwind 4 + MDX + Shiki + sitemap, TypeScript strict.
- **Pages:** 125 — 33 hand-curated 700+ word errors (Stripe 5, OpenAI 4, Anthropic 3, AWS 3, GitHub 2, Postgres 4, Redis 2, Next.js 3, Node.js 4, Python 1, K8s 2), 33 services, 50 HTTP codes, 2 guides, 1 comparison. Schema: TechArticle + HowTo + FAQPage + CollectionPage + BreadcrumbList per page. Build ~9s.
- **Repo:** `sunnyp81/fixerror-dev`. Local: `C:\Users\sunny\repos\fixerror-dev`. Branch: `master`.
- **Status:** Built Apr 26-27 2026; pushed to GitHub `master` (per MEMORY.md, ~May 16). At last note NOT yet on CF Pages / custom domain — verify live status. Hermes flagged DOWN because custom domain not live.
- **Deploy:** CF Pages — connect Git, build `npm run build`, output `dist`, `NODE_VERSION=22`. DNS: CNAME `fixerror.dev` → `fixerror-dev.pages.dev` (proxied).

## Key facts & warnings

- **Quality-over-quantity rule applied:** original brief asked for 5,200 pages; shipped 33 curated + stub generator instead (don't ship 5k thin pages day 1 — Google demotes the whole site). Sunny chose to build this despite his own "fix existing sites before building new" rule — do NOT re-flag that conflict; the call was made.
- **IndexNow key** `3a8f4e2b9c7d1f5a6e8b3c4d9a2f7e1b` — public verification file already in repo, not a secret.
- `git push` uses cached PAT (no gh CLI locally).
- **Stub generator:** drop `data/error-catalog/<service>.json`, run `npm run generate:stubs` (stubs ship `noindex: true`); promote by editing file → `quality: curated, noindex: false` + expand content.
- **Repo layout:** `src/content.config.ts` (schema), `src/content/errors/<service>/<slug>.mdx`, `src/content/data/services.json`+`http-codes.json`, `src/pages/[service]/[code].astro`, `scripts/generate-stub-errors.mjs`, `scripts/check-related.mjs`+`fix-related-slugs.mjs`.

## History

- 2026-04-26/27 — Built (3 commits, `master`). Audit fixes: 11 title trims, 81 broken `related:` slug fixes, 26 `relatedGuide` refs hidden, footer guides from getCollection, sitemap excludes /search/+/404/.
- ~2026-05-16 — Pushed to GitHub per MEMORY.md.
- v2 work: per-page Satori OG PNGs (only default SVG now); 28 of 30 brief-spec guides unwritten (template hides missing refs); service hubs use 200-word desc vs 1,200-word brief originals; 5 titles slightly over 70 chars.
