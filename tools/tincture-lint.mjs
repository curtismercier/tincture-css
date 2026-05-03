#!/usr/bin/env node
/**
 * tincture-lint.mjs — surface correctness auditor.
 *
 * Consumer config (tincture.config.json):
 *   componentsDir  — path to components, relative to project root
 *   pagesDir       — path to pages/routes, relative to project root
 *   brandName      — used in output header
 *
 * Companion to perf-lint.mjs. Same output shape, same exit codes.
 * Designed to run in the pre-push hook alongside perf-lint so surface
 * drift is caught before it multiplies across pages.
 *
 * Scans components FIRST (they multiply), pages second.
 *
 * Rules
 * ─────
 * CRITICAL
 *   raw-hex-section   bg-[#…] or text-[#…] on a <section> or layout <div>
 *                     (hard-coded color bypasses the entire cascade)
 *
 * HIGH
 *   legacy-token      --color-bg-accent-band anywhere in source
 *                     → replace with data-surface="slate" + bg-[var(--bg)]
 *   surface-mismatch  data-surface="X" present but bg= is NOT bg-[var(--bg)]
 *                     and is NOT a known intentional override (photo bg, etc.)
 *
 * MEDIUM
 *   bare-section      <section> carries a bg-* class but no data-surface attr
 *                     (unsurfaced section — won't inherit tincture cascade)
 *
 * LOW (info only, does not affect exit code)
 *   raw-tailwind-bg   bg-zinc-* / bg-gray-* / bg-slate-* / bg-neutral-* /
 *                     bg-black / bg-white on layout elements
 *                     (intentional in some places — nav pill, overlays — flag for review)
 *
 * Flags
 * ─────
 *   --check        exit 1 if any CRITICAL or HIGH finding (pre-push mode)
 *   --warn         exit 1 if any CRITICAL, HIGH, or MEDIUM finding
 *   --json         JSON output (for dashboard ingestion)
 *   --components   scan components only
 *   --pages        scan pages only
 *   --no-demos     skip /demos routes and demo components (default: included)
 *
 * Usage
 *   node scripts/tincture-lint.mjs
 *   node scripts/tincture-lint.mjs --check           # pre-push gate
 *   node scripts/tincture-lint.mjs --pages --no-demos
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = resolve(fileURLToPath(import.meta.url), '..');
const ROOT = resolve(__dirname, '..');

const CHECK   = process.argv.includes('--check');
const WARN    = process.argv.includes('--warn');
const JSON_OUT = process.argv.includes('--json');
const ONLY_COMPONENTS = process.argv.includes('--components');
const ONLY_PAGES      = process.argv.includes('--pages');
const NO_DEMOS        = process.argv.includes('--no-demos');

// ── File walker ────────────────────────────────────────────────────────────

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    try {
      const s = statSync(full);
      if (s.isDirectory()) {
        if (entry === 'node_modules' || entry === '.next' || entry === '.git' || entry === '.worktrees') continue;
        if (NO_DEMOS && entry === 'demos') continue;
        walk(full, out);
      } else if (entry.endsWith('.tsx') || entry.endsWith('.ts')) {
        out.push(full);
      }
    } catch { /* skip unreadable */ }
  }
  return out;
}

// ── Scan targets ───────────────────────────────────────────────────────────

// Read consumer config (tincture.config.json at project root or parent)
let _cfg = {};
const _cfgPath = [ROOT, join(ROOT, '..')].map(d => join(d, 'tincture.config.json')).find(p => {
  try { require; return true; } catch { return false; }
});
try {
  const _cfgFile = join(ROOT, 'tincture.config.json');
  if (existsSync(_cfgFile)) _cfg = JSON.parse(readFileSync(_cfgFile, 'utf8'));
} catch { /* no config — use defaults */ }

const COMPONENTS_DIR = resolve(ROOT, _cfg.componentsDir ?? 'src/components');
const PAGES_DIR      = resolve(ROOT, _cfg.pagesDir      ?? 'src/app');
const BRAND_NAME     = _cfg.brandName ?? 'project';

let files = [];
if (!ONLY_PAGES)      files.push(...walk(COMPONENTS_DIR));
if (!ONLY_COMPONENTS) files.push(...walk(PAGES_DIR));

// ── Finding accumulator ────────────────────────────────────────────────────

const SEVERITIES = ['critical', 'high', 'medium', 'low'];
const findings = [];          // { file, line, severity, rule, message, fix }

function find(file, lineNo, severity, rule, message, fix) {
  findings.push({ file: relative(ROOT, file), line: lineNo, severity, rule, message, fix });
}

// ── Rules ──────────────────────────────────────────────────────────────────

// Intentional raw-color patterns — skip these
const SKIP_RAW_HEX = [
  /bg-black\/\d/,          // bg-black/80 style overlays — intentional photo overlays
  /bg-white\/\d/,          // bg-white/5 glass cards
  /bg-\[#0D1017\]/,        // progress-bar contrast text — migration panel (intentional)
  /text-\[#0D1017\]/,      // same — dark text on filled bar
  /text-\[#E82E11\]/,      // brand red (not in font subset — flagged separately)
];

// Files that are always-dark internal chrome — skip surface-mismatch on bg-black
const DEMO_CHROME_FILES = [
  'DemoNavbar.tsx',        // always-dark demo navbar — bg-black intentional
];

// Known intentional raw Tailwind bg classes (nav pill, overlay, etc.)
const SKIP_RAW_TAILWIND = [
  /rounded.*bg-black/,     // nav pill button
  /bg-black.*rounded/,
  /absolute.*bg-black/,    // photo overlay absolute divs
  /bg-black.*absolute/,
  /inset-0.*bg-black/,
];

const LEGACY_TOKEN_RE   = /--color-bg-accent-band/;
const RAW_HEX_RE        = /bg-\[#[0-9a-fA-F]{3,8}\]|text-\[#[0-9a-fA-F]{3,8}\]/;
// Match both static string (data-surface="dark") and dynamic expression (data-surface={...})
const SURFACE_RE        = /data-surface=(?:["'][^"']+["']|\{[^}]+\})/;
const BG_VAR_RE         = /bg-\[var\(--bg\)\]|bg-\[var\(--bg-card\)\]|bg-\[var\(--bg-elev\)\]/;
const BG_CLASS_RE       = /\bbg-(?!transparent|inherit|current|clip|none|gradient|opacity)(\[|black\b|white\b|zinc|gray|slate|neutral)/;
const SECTION_RE        = /<section\b/;
const SECTION_BG_RE     = /<section[^>]*\bclassName=[^>]*\bbg-/;

for (const file of files) {
  let src;
  try { src = readFileSync(file, 'utf8'); } catch { continue; }
  const lines = src.split('\n');

  lines.forEach((line, i) => {
    const lineNo = i + 1;

    // Rule: legacy-token — --color-bg-accent-band anywhere
    if (LEGACY_TOKEN_RE.test(line)) {
      find(file, lineNo, 'high', 'legacy-token',
        `--color-bg-accent-band used — replace with data-surface="slate" + bg-[var(--bg)]`,
        `data-surface="slate" className="... bg-[var(--bg)]"`);
    }

    // Rule: raw-hex-section — bg-[#…] on a section or obvious layout element
    if (RAW_HEX_RE.test(line)) {
      const skip = SKIP_RAW_HEX.some(re => re.test(line));
      if (!skip) {
        const isSection = /<section\b/.test(line) || /<div\b.*className/.test(line);
        const severity = isSection ? 'critical' : 'high';
        find(file, lineNo, severity, 'raw-hex-section',
          `Hard-coded hex color — bypasses tincture cascade`,
          `Use var(--bg), var(--ink), var(--accent) etc.`);
      }
    }

    // Rule: surface-mismatch — data-surface present but bg is not a var(--bg*) token
    const isDemoChrome = DEMO_CHROME_FILES.some(f => file.endsWith(f));
    if (SURFACE_RE.test(line) && BG_CLASS_RE.test(line) && !BG_VAR_RE.test(line) && !isDemoChrome) {
      // Allow: bg-[var(--color-bg-accent-band)] is caught by legacy-token above
      // Allow: bg-black/N overlays, demo chrome files
      if (!LEGACY_TOKEN_RE.test(line) && !SKIP_RAW_HEX.some(re => re.test(line))) {
        const raw = line.match(/bg-\S+/)?.[0] ?? '?';
        find(file, lineNo, 'high', 'surface-mismatch',
          `data-surface set but bg="${raw}" is not a tincture token — surface cascade won't apply`,
          `Replace with bg-[var(--bg)]`);
      }
    }

    // Rule: bare-section — <section> with bg-* class but no data-surface
    if (SECTION_BG_RE.test(line) && !SURFACE_RE.test(line)) {
      // Check the next 3 lines too (multiline section openings)
      const ctx = lines.slice(i, i + 4).join(' ');
      if (!SURFACE_RE.test(ctx)) {
        const skipTailwind = SKIP_RAW_TAILWIND.some(re => re.test(line));
        if (!skipTailwind) {
          find(file, lineNo, 'medium', 'bare-section',
            `<section> has bg-* class but no data-surface — won't inherit tincture surface cascade`,
            `Add data-surface="dark|slate|steel|light" to the section element`);
        }
      }
    }

    // Rule: raw-tailwind-bg — bg-zinc/gray/slate/neutral/black/white on layout (LOW, info only)
    if (/\b(bg-zinc|bg-gray|bg-neutral|bg-slate-\d)\b/.test(line)) {
      const skipTailwind = SKIP_RAW_TAILWIND.some(re => re.test(line));
      if (!skipTailwind) {
        find(file, lineNo, 'low', 'raw-tailwind-bg',
          `Raw Tailwind bg color — consider tincture token if this is a layout surface`,
          `Audit: is this intentional (overlay, badge) or should it be var(--bg-card) etc.?`);
      }
    }
  });
}

// ── Group by scope ─────────────────────────────────────────────────────────

function isComponent(f) { return f.startsWith(_cfg.componentsDir ?? 'src/components'); }
function isPage(f)      { return f.startsWith('src/app/'); }

const byScope = {
  components: findings.filter(f => isComponent(f.file)),
  pages:      findings.filter(f => isPage(f.file)),
};

// ── Score ──────────────────────────────────────────────────────────────────

const counts = { critical: 0, high: 0, medium: 0, low: 0 };
findings.forEach(f => counts[f.severity]++);
const score = Math.max(0, 100
  - counts.critical * 15  // blocking: bypasses cascade entirely
  - counts.high     * 5   // legacy token / surface mismatch
  - counts.medium   * 1   // bare-section: real but non-breaking
  - counts.low      * 0   // info only
);

// ── Output ─────────────────────────────────────────────────────────────────

if (JSON_OUT) {
  console.log(JSON.stringify({ score, counts, findings }, null, 2));
  process.exit(0);
}

const C = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
  red:    '\x1b[31m',
  orange: '\x1b[33m',
  yellow: '\x1b[93m',
  cyan:   '\x1b[36m',
  green:  '\x1b[32m',
  grey:   '\x1b[90m',
};

const SEV_COLOR = {
  critical: C.red,
  high:     C.orange,
  medium:   C.yellow,
  low:      C.grey,
};

console.log(`\n${C.bold}TINCTURE LINT — ${BRAND_NAME} surface audit${C.reset}`);
console.log('═'.repeat(56));

for (const [scope, items] of Object.entries(byScope)) {
  if (items.length === 0) continue;
  const label = scope === 'components' ? '⬡ COMPONENTS (fix these first — they multiply)' : '⬢ PAGES';
  console.log(`\n${C.bold}${label}${C.reset}`);

  const bySev = {};
  for (const sev of SEVERITIES) bySev[sev] = items.filter(f => f.severity === sev);

  for (const sev of SEVERITIES) {
    const group = bySev[sev];
    if (group.length === 0) continue;
    const label = `${sev.toUpperCase()} (${group.length})`;
    console.log(`\n  ${SEV_COLOR[sev]}${C.bold}${label}${C.reset}`);
    for (const f of group) {
      console.log(`  ${SEV_COLOR[sev]}✗${C.reset} ${C.bold}${f.file}:${f.line}${C.reset}`);
      console.log(`    ${f.message}`);
      console.log(`    ${C.grey}→ ${f.fix}${C.reset}`);
    }
  }
}

// ── Summary ────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(56)}`);
const scoreColor = score >= 90 ? C.green : score >= 70 ? C.yellow : C.red;
console.log(`${C.bold}Score: ${scoreColor}${score}/100${C.reset}  ·  ${C.red}${counts.critical} critical${C.reset}  ${C.orange}${counts.high} high${C.reset}  ${C.yellow}${counts.medium} medium${C.reset}  ${C.grey}${counts.low} low${C.reset}`);
console.log(`Files scanned: ${files.length}  ·  Component findings: ${byScope.components.length}  ·  Page findings: ${byScope.pages.length}`);

if (counts.critical > 0 || counts.high > 0) {
  console.log(`\n${C.orange}Tip: fix components first — each component finding may affect N pages.${C.reset}`);
}

if (score === 100) {
  console.log(`\n${C.green}${C.bold}✓ Surface audit clean.${C.reset}`);
}

// ── Exit ───────────────────────────────────────────────────────────────────

const hasBlocker = counts.critical > 0 || counts.high > 0;
const hasMedium  = counts.medium > 0;

if (CHECK && hasBlocker)        process.exit(1);
if (WARN  && (hasBlocker || hasMedium)) process.exit(1);
process.exit(0);
