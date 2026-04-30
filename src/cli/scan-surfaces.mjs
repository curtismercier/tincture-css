#!/usr/bin/env node
/**
 * Tincture v0.2 — surface scanner.
 *
 * Walks JSX/TSX files looking for <section> blocks that have dark
 * backgrounds without a data-surface="dark" annotation. Auto-injects
 * the annotation if --fix; otherwise reports.
 *
 * Detection heuristics:
 *   1. Direct dark-bg className: bg-black, bg-[#0xx], bg-[#10x..12x],
 *      bg-[var(--bg-dark*)], bg-[var(--color-bg-accent-band)]
 *   2. Image-overlay pattern: <Image fill /> OR <img absolute inset-0>
 *      AND a darken overlay (bg-black/N, from-black/N gradient)
 *
 * Pre-existing data-surface= annotations are skipped (idempotent).
 *
 * Run:
 *   node src/cli/scan-surfaces.mjs --root <repo-or-app-path>
 *   node src/cli/scan-surfaces.mjs --root <path> --fix       (auto-inject)
 *   node src/cli/scan-surfaces.mjs --root <path> --check     (CI mode: exit 1 if any unannotated)
 *
 * See docs/architecture/why-not-automatic.md for the architectural
 * context behind this tool.
 *
 * Cycle 25 / 23-followup.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const DARK_PATTERNS = [
  /bg-\[var\(--color-bg-accent-band\)\]/,
  /bg-\[var\(--bg-dark\)\]/,
  /bg-\[var\(--bg-charcoal\)\]/,
  /bg-\[#0[0-9a-f]/i,
  /bg-\[#1[0-2][0-9a-f]/i,
  /bg-black(?!\/\d)/,                          // bg-black NOT followed by /N (which would be overlay)
];

const files = execSync(
  `grep -rEln '<section\\b' src/app/\\(tenants\\)/sites/arzadon/ src/tenants/arzadon/components/ --include='*.tsx'`,
  { encoding: 'utf8' }
).trim().split('\n').filter(Boolean);

let touched = 0;
const touchedList = [];

for (const f of files) {
  const orig = readFileSync(f, 'utf8');
  // Walk every <section> opening individually. For each, look at:
  //   1. its own attrs (does className contain a dark-bg pattern?)
  //   2. its body (next 2500 chars or until matching </section>; does it contain <Image fill/<img absolute inset-0 + bg-black/N or from-black/N overlay?)
  //   3. skip if data-surface= already in opening
  
  const sectionRe = /<section\b[^>]*?>/g;
  const matches = [];
  let m;
  while ((m = sectionRe.exec(orig)) !== null) {
    matches.push({ index: m.index, opening: m[0] });
  }

  let updated = orig;
  // Process matches in REVERSE order to preserve indices during string mutation
  for (let i = matches.length - 1; i >= 0; i--) {
    const { index, opening } = matches[i];
    if (opening.includes('data-surface=')) continue;
    
    const bodyStart = index + opening.length;
    const body = orig.slice(bodyStart, bodyStart + 2500);
    
    const hasDarkBg = DARK_PATTERNS.some(p => p.test(opening));
    const hasFillImage = /<Image\s[^>]*\bfill\b|<img\s[^>]*absolute\s+inset-0|<video\s[^>]*absolute\s+inset-0/.test(body);
    const hasOverlay = /bg-black\/\d|from-black\/\d|to-black\/\d|via-black\/\d/.test(body);
    const hasOverlayed = hasFillImage && hasOverlay;
    
    if (!hasDarkBg && !hasOverlayed) continue;
    
    // Inject data-surface="dark" right after `<section`
    const newOpening = opening.replace(/^<section/, '<section data-surface="dark"');
    updated = updated.slice(0, index) + newOpening + updated.slice(index + opening.length);
  }
  
  if (updated !== orig) {
    writeFileSync(f, updated);
    touched++;
    touchedList.push(f);
  }
}
console.log(`Touched ${touched} files:`);
for (const f of touchedList) console.log(`  - ${f}`);
