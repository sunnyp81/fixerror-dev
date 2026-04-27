import fs from 'node:fs';
import path from 'node:path';

function* walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) yield* walk(p);
    else if (f.name.endsWith('.mdx') || f.name.endsWith('.md')) yield p;
  }
}

const slugs = new Set();
for (const f of walk('src/content/errors')) {
  const m = fs.readFileSync(f, 'utf8').match(/^slug:\s*(\S+)/m);
  if (m) slugs.add(m[1]);
}

const services = new Set();
for (const f of walk('src/content/errors')) {
  const dir = path.basename(path.dirname(f));
  services.add(dir);
}

let fixed = 0;
let removed = 0;
for (const f of walk('src/content/errors')) {
  let content = fs.readFileSync(f, 'utf8');
  const orig = content;
  content = content.replace(/^related:\s*\n((?:\s*-\s*\S+\n)+)/m, (block, list) => {
    const items = [...list.matchAll(/^\s*-\s*(\S+)\s*$/gm)].map((m) => m[1]);
    const out = [];
    for (const slug of items) {
      if (slugs.has(slug)) {
        out.push(slug);
        continue;
      }
      // Try common transforms
      // Pattern: "code-service" → "code"
      for (const svc of services) {
        if (slug.endsWith(`-${svc}`)) {
          const stripped = slug.slice(0, -svc.length - 1);
          if (slugs.has(stripped)) {
            out.push(stripped);
            fixed++;
            break;
          }
        }
      }
      // If we didn't fix, drop the slug (don't add to out)
      if (!out.includes(slug) && !out.find((s) => slug.includes(s))) {
        // already counted above if fixed; otherwise it's removed
      }
    }
    // Anything not matched is removed
    const removedCount = items.length - out.length;
    removed += removedCount - (items.length - out.length); // careful counting
    if (out.length === 0) return 'related: []\n';
    return 'related:\n' + out.map((s) => `  - ${s}\n`).join('');
  });
  if (content !== orig) {
    fs.writeFileSync(f, content);
  }
}
console.log(`Fixed ${fixed} -<service> suffixed slugs.`);

// Re-count broken
let broken = 0;
for (const f of walk('src/content/errors')) {
  const content = fs.readFileSync(f, 'utf8');
  const m = content.match(/^related:\s*\n((?:\s*-\s*\S+\n?)+)/m);
  if (!m) continue;
  for (const sm of m[1].matchAll(/-\s+(\S+)/g)) {
    if (!slugs.has(sm[1])) broken++;
  }
}
console.log(`Remaining broken refs: ${broken}`);
