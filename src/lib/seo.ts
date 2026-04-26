export const SITE = {
  name: 'fixerror.dev',
  tagline: 'Fix any error. Fast.',
  description:
    'Plain-English fixes, working code, and detection tips for every API, HTTP, framework, and language error. Built for developers debugging in production.',
  url: 'https://fixerror.dev',
  twitter: '@fixerrordev',
  github: 'sunnyp81/fixerror-dev',
} as const;

export function canonical(path: string): string {
  const cleaned = path.startsWith('/') ? path : `/${path}`;
  return `${SITE.url}${cleaned.replace(/\/$/, '')}/`;
}

export function ogImage(_path: string): string {
  // v1: shared OG image. v2: per-page Satori-generated PNGs.
  return `${SITE.url}/og-default.svg`;
}

export function errorTitle(opts: {
  serviceName: string;
  code: string;
  plainTitle: string;
}): string {
  return `${opts.serviceName} Error: ${opts.code} — ${opts.plainTitle} (Cause + Fix)`;
}

export function errorDescription(opts: {
  serviceName: string;
  code: string;
  tldrCause: string;
}): string {
  const trimmed = opts.tldrCause.replace(/\s+/g, ' ').trim();
  const base = `${opts.serviceName} ${opts.code}: ${trimmed}`;
  if (base.length <= 160) return base + ' Working code + 3-5 ranked fixes.';
  return base.slice(0, 155) + '…';
}
