#!/usr/bin/env node
/**
 * tincture-validate-registry.mjs — cycle 4.
 *
 * Walks tincture/registry.json and verifies:
 *   1. Schema integrity (required fields per token type)
 *   2. Primitive references resolve ({primitives.color.X} exists)
 *   3. Foundation token VALUES match registry's lightValue/darkValue
 *      (so registry can't drift from the actual CSS)
 *   4. Component manifests reference tokens that exist in registry
 *   5. Legacy aliases don't conflict (no two tokens claim same legacy name)
 *
 * Exit 0 if clean. Non-zero with diagnostic on failure.
 *
 * Usage:
 *   node scripts/tincture-validate-registry.mjs
 *   node scripts/tincture-validate-registry.mjs --verbose
 */

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
import { REGISTRY_PATH as REGISTRY } from './_resolve-config.mjs';
const FOUNDATION = REGISTRY.replace('registry.json', 'foundation.css');


const verbose = process.argv.includes('--verbose');
const errors = [];
const warnings = [];

if (!existsSync(REGISTRY)) {
  console.error(`✗ registry.json not found at ${REGISTRY}`);
  process.exit(1);
}

const reg = JSON.parse(readFileSync(REGISTRY, 'utf8'));

// 1. Schema integrity
function need(obj, field, ctx) {
  if (obj[field] === undefined) errors.push(`missing field "${field}" in ${ctx}`);
}
need(reg, 'version', 'root');
need(reg, 'name', 'root');
need(reg, 'primitives', 'root');
need(reg, 'semantic', 'root');
need(reg, 'flavors', 'root');
need(reg, 'components', 'root');
need(reg, 'axes', 'root');

// 2. Resolve primitive references
function resolveRef(value, prim) {
  if (typeof value !== 'string') return value;
  const m = value.match(/^\{primitives\.color\.([^}]+)\}$/);
  if (!m) return value;
  const v = prim?.color?.[m[1]];
  if (!v) {
    errors.push(`primitive ref "${m[0]}" doesn't exist`);
    return null;
  }
  return v.value;
}

for (const [id, tok] of Object.entries(reg.semantic ?? {})) {
  need(tok, 'id', `semantic.${id}`);
  need(tok, 'type', `semantic.${id}`);
  need(tok, 'lightValue', `semantic.${id}`);
  need(tok, 'darkValue', `semantic.${id}`);
  resolveRef(tok.lightValue, reg.primitives);
  resolveRef(tok.darkValue, reg.primitives);
}

// 3. Foundation CSS drift check
// Parse light-dark(A, B) with balanced-paren walker (rgba() etc. has commas inside).
function parseLightDarkPair(haystack, tokenId) {
  const start = haystack.indexOf(`--${tokenId}:`);
  if (start < 0) return null;
  const ldIdx = haystack.indexOf('light-dark(', start);
  if (ldIdx < 0 || ldIdx > haystack.indexOf(';', start)) return null;
  // Walk past 'light-dark(' to find matching close paren
  let i = ldIdx + 'light-dark('.length;
  let depth = 1;
  let split = -1;
  while (i < haystack.length && depth > 0) {
    const ch = haystack[i];
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (ch === ',' && depth === 1 && split === -1) split = i;
    i++;
  }
  if (depth !== 0 || split < 0) return null;
  const closeIdx = i - 1;
  return {
    light: haystack.slice(ldIdx + 'light-dark('.length, split).trim(),
    dark:  haystack.slice(split + 1, closeIdx).trim(),
  };
}

if (existsSync(FOUNDATION)) {
  const fs = readFileSync(FOUNDATION, 'utf8');
  for (const [id, tok] of Object.entries(reg.semantic ?? {})) {
    const pair = parseLightDarkPair(fs, id);
    if (!pair) {
      warnings.push(`foundation.css missing --${id}: light-dark(...) declaration`);
      continue;
    }
    const regLight = resolveRef(tok.lightValue, reg.primitives);
    const regDark = resolveRef(tok.darkValue, reg.primitives);
    // Normalize whitespace for comparison
    const norm = (s) => (s ?? '').replace(/\s+/g, '').toLowerCase();
    if (regLight && norm(pair.light) !== norm(regLight)) {
      errors.push(`drift on --${id} lightValue: foundation=${pair.light}  registry=${regLight}`);
    }
    if (regDark && norm(pair.dark) !== norm(regDark)) {
      errors.push(`drift on --${id} darkValue: foundation=${pair.dark}  registry=${regDark}`);
    }
  }
}

// 4. Component manifests reference real tokens
for (const [name, comp] of Object.entries(reg.components ?? {})) {
  for (const tokenId of comp['tokens-read'] ?? []) {
    if (!reg.semantic[tokenId]) {
      errors.push(`component "${name}" reads unknown token "${tokenId}"`);
    }
  }
}

// 5. Legacy alias collision check
const seenLegacy = new Map();
for (const [id, tok] of Object.entries(reg.semantic ?? {})) {
  for (const legacy of tok.legacy ?? []) {
    if (seenLegacy.has(legacy)) {
      errors.push(`legacy alias "${legacy}" claimed by both "${seenLegacy.get(legacy)}" and "${id}"`);
    }
    seenLegacy.set(legacy, id);
  }
}

// Report
console.log(`tincture-validate-registry — cycle 4`);
console.log('');
console.log(`  semantic tokens: ${Object.keys(reg.semantic ?? {}).length}`);
console.log(`  flavors:         ${Object.keys(reg.flavors ?? {}).length}`);
console.log(`  components:      ${Object.keys(reg.components ?? {}).length}`);
console.log(`  primitives:      ${Object.keys(reg.primitives?.color ?? {}).length} colors`);
console.log(`  legacy aliases:  ${seenLegacy.size}`);
console.log('');

if (verbose) {
  console.log('  semantic ids:');
  for (const id of Object.keys(reg.semantic ?? {})) console.log(`    --${id}`);
  console.log('');
}

if (warnings.length) {
  console.log(`  ${warnings.length} warning(s):`);
  for (const w of warnings) console.log(`    ⚠ ${w}`);
  console.log('');
}

if (errors.length) {
  console.error(`  ${errors.length} error(s):`);
  for (const e of errors) console.error(`    ✗ ${e}`);
  process.exit(1);
}

console.log(`  ✓ valid.`);
