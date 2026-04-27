#!/usr/bin/env node
import fs from 'node:fs';

function audit(file) {
  const html = fs.readFileSync(file, 'utf8');
  const article = html.match(/<article[\s\S]*?<\/article>/);
  if (!article) return { error: 'no article tag' };
  const body = article[0];

  // Strip code blocks for content analysis
  const noCode = body.replace(/<pre[\s\S]*?<\/pre>/g, '').replace(/<code[\s\S]*?<\/code>/g, '');

  // Intro section (between H1 and first H2)
  const h1End = body.indexOf('</h1>');
  const h2Start = body.indexOf('<h2', h1End);
  const intro = noCode.slice(h1End, h2Start > 0 ? h2Start : noCode.length);
  const introInternalLinks = (intro.match(/<a [^>]*href="\/[a-z]/g) || []).length;

  // Per-section link density
  const sections = noCode.split(/<h2[^>]*>/).slice(1);
  let sectionsWithMultipleLinks = 0;
  let totalSectionLinks = 0;
  for (const sec of sections) {
    const links = (sec.match(/<a [^>]*href="\/[a-z]/g) || []).length;
    totalSectionLinks += links;
    if (links > 1) sectionsWithMultipleLinks++;
  }

  // Counts
  const h1Count = (body.match(/<h1[^>]*>/g) || []).length;
  const h2Count = (body.match(/<h2[^>]*>/g) || []).length;
  const h3Count = (body.match(/<h3[^>]*>/g) || []).length;
  const codeBlocks = (body.match(/<pre[\s\S]*?<\/pre>/g) || []).length;
  const faqItems = (body.match(/<summary[\s\S]*?<\/summary>/g) || []).length;
  const tldrPresent = body.includes('TL;DR');
  const internalLinksTotal = (body.match(/href="\/[a-z]/g) || []).length;

  // Strip all HTML for word count
  const text = body.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();
  const words = text.split(' ').length;

  // Sentence start analysis (start-with-answer)
  const sentences = text.match(/[A-Z][^.!?]{20,}[.!?]/g) || [];
  const fluffStarts = ['It is important', "It's important", 'When it comes to', 'In today', 'In this section',
    'Furthermore', 'Moreover', 'Additionally', 'However,', 'In conclusion', 'That said', 'Overall'];
  const fluffSentences = sentences.filter((s) => fluffStarts.some((f) => s.startsWith(f)));

  // LLM fluff word check
  const fluffWords = ['delve', 'unlock', 'embark', 'seamless', 'elevate', 'plethora', 'myriad',
    'leverage', 'utilize', 'facilitate', 'paradigm', 'synergy'];
  const fluffHits = fluffWords.filter((w) => new RegExp(`\\b${w}`, 'i').test(text));

  // First sentence after H1 (post-TLDR)
  const firstParagraphMatch = noCode.slice(h1End).match(/<p[^>]*>([\s\S]*?)<\/p>/);
  const firstSentence = firstParagraphMatch
    ? firstParagraphMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 120)
    : '';

  return {
    file: file.replace(/\\/g, '/').replace('dist/', '').replace('/index.html', ''),
    words,
    h1Count, h2Count, h3Count,
    codeBlocks,
    faqItems,
    tldrPresent,
    introInternalLinks,
    sectionsWithMultipleLinks,
    totalSectionLinks,
    internalLinksTotal,
    fluffWordHits: fluffHits,
    fluffSentenceCount: fluffSentences.length,
    firstSentence,
  };
}

const pages = [
  'dist/stripe/card-declined/index.html',
  'dist/openai/rate-limit-exceeded/index.html',
  'dist/anthropic/overloaded-error/index.html',
  'dist/aws/access-denied-exception/index.html',
  'dist/nextjs/hydration-failed/index.html',
  'dist/postgres/econnrefused/index.html',
  'dist/kubernetes/imagepullbackoff/index.html',
  'dist/redis/wrongtype/index.html',
  'dist/guide/handling-rate-limits/index.html',
];

for (const p of pages) {
  const r = audit(p);
  console.log(`\n=== /${r.file}/ ===`);
  console.log(`  Words: ${r.words}`);
  console.log(`  H1/H2/H3: ${r.h1Count}/${r.h2Count}/${r.h3Count}`);
  console.log(`  Code blocks: ${r.codeBlocks} | FAQ items: ${r.faqItems} | TL;DR: ${r.tldrPresent}`);
  console.log(`  Intro internal links (Koray: 0): ${r.introInternalLinks}`);
  console.log(`  Sections >1 internal link (Koray: 0 ideal): ${r.sectionsWithMultipleLinks}/${r.totalSectionLinks ? '*' : 0}`);
  console.log(`  Fluff word hits: ${r.fluffWordHits.length ? r.fluffWordHits.join(', ') : 'NONE'}`);
  console.log(`  Fluff sentence starts: ${r.fluffSentenceCount}`);
  console.log(`  First sentence: ${r.firstSentence}...`);
}
