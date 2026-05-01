#!/usr/bin/env node
/**
 * tincture-contrast.mjs — cycle 10.
 *
 * Walks the manifest's contrastPair declarations and computes WCAG 2.1
 * relative-luminance ratios in BOTH surface contexts (light + dark).
 *
 * Thresholds:
 *   - text-* roles      → 4.5:1 (WCAG AA normal text)
 *   - text-* on accent  → 4.5:1 (same)
 *   - accent / ui roles → 3:1   (WCAG AA UI components)
 *
 * Exit 0 if all pass. Exit 1 with diagnostic on any fail.
 * Marginal pairs (3.0-4.5 for text) print to stderr as warnings (non-blocking).
 *
 * Pre-push integration: studio/scripts/git-hooks/pre-push runs this.
 * Skip with SKIP_TINCTURE_CONTRAST=1.
 */

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
import { MANIFEST_PATH as MANIFEST } from './_resolve-config.mjs';

const jsonOut = process.argv.includes('--json');
const verbose = process.argv.includes('--verbose');

if (!existsSync(MANIFEST)) {
  console.error('x manifest.json missing — run `tincture codegen` first');
  process.exit(3);
}

const m = JSON.parse(readFileSync(MANIFEST, 'utf8'));

// ── WCAG 2.1 relative luminance ────────────────────────────────────────
function parseColor(value) {
  // Hex
  let s = String(value).trim();
  if (s.startsWith('#')) {
    s = s.slice(1);
    if (s.length === 3) s = s.split('').map((c) => c + c).join('');
    return {
      r: parseInt(s.slice(0, 2), 16),
      g: parseInt(s.slice(2, 4), 16),
      b: parseInt(s.slice(4, 6), 16),
      a: 1,
    };
  }
  // rgba()
  const m = s.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const parts = m[1].split(',').map((p) => parseFloat(p.trim()));
    return { r: parts[0] | 0, g: parts[1] | 0, b: parts[2] | 0, a: parts[3] ?? 1 };
  }
  return null;
}

function relativeLuminance({ r, g, b }) {
  const linear = (v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

function contrast(fg, bg) {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

// ── Walk contrast pairs ────────────────────────────────────────────────
const pairs = [];
for (const [id, t] of Object.entries(m.tokens)) {
  if (!t.contrastPair) continue;
  const pair = m.tokens[t.contrastPair];
  if (!pair) continue;
  pairs.push({ fgId: t.contrastPair, bgId: id, role: t.role });
}

// Add implicit pairs: every text-* on every surface
const surfacePairs = [
  // ink on bg in both surfaces
  { fgId: 'ink', bgId: 'bg', role: 'text-primary' },
  { fgId: 'ink-soft', bgId: 'bg', role: 'text-secondary' },
  { fgId: 'ink-muted', bgId: 'bg', role: 'text-tertiary' },
  // ink on bg-card
  { fgId: 'ink', bgId: 'bg-card', role: 'text-primary' },
  { fgId: 'ink-soft', bgId: 'bg-card', role: 'text-secondary' },
];
for (const p of surfacePairs) {
  if (!pairs.some((x) => x.fgId === p.fgId && x.bgId === p.bgId)) {
    pairs.push(p);
  }
}

const results = [];
for (const p of pairs) {
  const fg = m.tokens[p.fgId];
  const bg = m.tokens[p.bgId];
  if (!fg || !bg) continue;
  for (const surface of ['light', 'dark']) {
    const fgVal = surface === 'light' ? fg.lightValue : fg.darkValue;
    const bgVal = surface === 'light' ? bg.lightValue : bg.darkValue;
    const fgC = parseColor(fgVal);
    const bgC = parseColor(bgVal);
    if (!fgC || !bgC) continue;
    // For rgba with alpha < 1 we'd composite over a default — skip those
    if (fgC.a < 1 || bgC.a < 1) continue;
    const ratio = contrast(fgC, bgC);
    const isText = (p.role ?? '').startsWith('text');
    const threshold = isText ? 4.5 : 3.0;
    const status = ratio >= threshold ? 'pass' : ratio >= 3.0 ? 'marginal' : 'fail';
    results.push({
      fg: p.fgId, bg: p.bgId, surface, ratio: Number(ratio.toFixed(2)),
      threshold, status, fgValue: fgVal, bgValue: bgVal, role: p.role,
    });
  }
}

// ── Report ─────────────────────────────────────────────────────────────
if (jsonOut) {
  console.log(JSON.stringify(results, null, 2));
} else {
  console.log('tincture-contrast — cycle 10');
  console.log('');
  console.log('  ' + ['fg', 'bg', 'surface', 'ratio', 'threshold', 'status', 'role']
    .map((h, i) => h.padEnd([16, 16, 8, 8, 10, 10, 18][i])).join(''));
  console.log('  ' + '─'.repeat(86));
  for (const r of results) {
    const widths = [16, 16, 8, 8, 10, 10, 18];
    const cells = [
      r.fg.padEnd(widths[0]),
      r.bg.padEnd(widths[1]),
      r.surface.padEnd(widths[2]),
      r.ratio.toFixed(2).padEnd(widths[3]),
      `≥${r.threshold}`.padEnd(widths[4]),
      r.status.padEnd(widths[5]),
      (r.role ?? '').padEnd(widths[6]),
    ];
    const marker = r.status === 'fail' ? '✗' : r.status === 'marginal' ? '~' : '✓';
    console.log(`  ${marker} ${cells.join('')}`);
  }
}

const fails = results.filter((r) => r.status === 'fail');
const marginals = results.filter((r) => r.status === 'marginal');

if (!jsonOut) {
  console.log('');
  console.log(`  ${results.length} pair(s) checked.`);
  console.log(`  ${fails.length} fail(s) · ${marginals.length} marginal · ${results.length - fails.length - marginals.length} pass.`);
}

if (fails.length > 0) {
  if (!jsonOut) {
    console.error('');
    console.error(`x ${fails.length} contrast failure(s) below WCAG threshold:`);
    for (const f of fails) {
      console.error(`  --${f.fg} on --${f.bg} (${f.surface}): ${f.ratio}:1 < ${f.threshold}:1`);
    }
  }
  process.exit(1);
}
