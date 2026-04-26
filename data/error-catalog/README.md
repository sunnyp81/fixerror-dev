# Error Catalogue

Each `<service>.json` file is a list of error entries for that service. The
`scripts/generate-stub-errors.mjs` script reads these and generates stub MDX
files at `src/content/errors/<service>/<slug>.mdx`.

Stubs ship with `noindex: true` so they don't pollute search until curated.
Promote a stub to indexed content by editing the file: set `quality: curated`
and `noindex: false`, expand causes/fixes/faq, and add working code examples.

## Schema

```json
[
  {
    "code": "rate_limit_exceeded",
    "slug": "rate-limit-exceeded",
    "plainTitle": "Too Many Requests",
    "httpStatus": 429,
    "category": "rate-limit",
    "severity": "high",
    "shortCause": "1-line cause",
    "shortFix": "3-line fix",
    "languages": ["python", "javascript"],
    "related": ["other-error-slug"],
    "keywords": ["openai 429"]
  }
]
```

`category` enum: `auth`, `rate-limit`, `validation`, `network`, `billing`,
`permission`, `not-found`, `server`, `config`, `database`, `runtime`, `build`,
`deploy`, `cors`, `webhook`, `other`.

## Run

```bash
npm run generate:stubs              # all services
npm run generate:stubs -- --service stripe   # one service
npm run generate:stubs -- --force            # overwrite existing
```
