#!/usr/bin/env node
/**
 * Generate a static OG image for the site.
 *
 * For v1, all pages share the same OG image. v2 will pre-generate per-error
 * OG images via Satori + resvg-js in a getStaticPaths-driven endpoint.
 */
import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a0e14"/>
      <stop offset="100%" stop-color="#0d1117"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#58a6ff"/>
      <stop offset="100%" stop-color="#79b8ff"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>

  <g transform="translate(80, 80)">
    <circle cx="12" cy="12" r="8" fill="#f85149"/>
    <text x="32" y="22" font-family="ui-monospace, SF Mono, Menlo, monospace" font-size="22" font-weight="600" fill="#8b949e">fixerror.dev</text>
  </g>

  <g transform="translate(80, 220)">
    <text font-family="Inter, system-ui, sans-serif" font-size="84" font-weight="700" fill="#e6edf3" letter-spacing="-2">
      <tspan x="0" y="0">Fix any error.</tspan>
      <tspan x="0" y="100" fill="url(#accent)">Fast.</tspan>
    </text>
  </g>

  <g transform="translate(80, 480)">
    <text font-family="Inter, system-ui, sans-serif" font-size="28" fill="#8b949e">
      Plain-English fixes • working code • for every API, HTTP, framework, and language error.
    </text>
  </g>

  <g transform="translate(80, 560)" font-family="ui-monospace, SF Mono, Menlo, monospace" font-size="18" fill="#6e7681">
    <text>$ curl fixerror.dev/openai/rate-limit-exceeded</text>
  </g>

  <g transform="translate(900, 80)">
    <rect width="220" height="48" rx="8" fill="#161b22" stroke="#30363d"/>
    <text x="110" y="31" font-family="ui-monospace, SF Mono, Menlo, monospace" font-size="14" font-weight="600" fill="#58a6ff" text-anchor="middle">5,000+ errors</text>
  </g>
</svg>`;

await writeFile(join(ROOT, 'public', 'og-default.svg'), svg, 'utf8');
console.log('Wrote public/og-default.svg');

console.log('\nNote: PNG generation requires Satori + resvg-js. For v1, the SVG');
console.log('is referenced directly. Most social platforms accept SVG OG images,');
console.log('though some legacy tools (Slack desktop, older Twitter) prefer PNG.');
console.log('To upgrade: npm i satori @resvg/resvg-js, then render to PNG here.');
