import fs from 'node:fs';
import path from 'node:path';

function* walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) yield* walk(p);
    else if (f.name.endsWith('.mdx') || f.name.endsWith('.md')) yield p;
  }
}

const errors = {};
for (const f of walk('src/content/errors')) {
  const content = fs.readFileSync(f, 'utf8');
  const m = content.match(/^slug:\s*(\S+)/m);
  if (m) errors[m[1]] = f;
}

console.log('Total errors indexed:', Object.keys(errors).length);

const broken = [];
for (const f of walk('src/content/errors')) {
  const content = fs.readFileSync(f, 'utf8');
  const relatedMatch = content.match(/^related:\s*\n((?:\s*-\s*\S+\n?)+)/m);
  if (!relatedMatch) continue;
  const slugs = [...relatedMatch[1].matchAll(/-\s+(\S+)/g)].map((m) => m[1]);
  for (const s of slugs) {
    if (!errors[s]) broken.push({ from: f, slug: s });
  }
}

console.log('Broken related: refs:', broken.length);
const grouped = {};
for (const b of broken) {
  grouped[b.slug] = (grouped[b.slug] || 0) + 1;
}
console.log('\nMost-referenced missing slugs:');
Object.entries(grouped).sort((a, b) => b[1] - a[1]).slice(0, 20).forEach(([s, n]) => {
  console.log(`  ${n}x  ${s}`);
});
