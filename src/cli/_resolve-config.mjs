/**
 * _resolve-config.mjs — shared config discovery for all Tincture CLI scripts.
 *
 * Resolution order (highest priority first):
 *   1. CLI flags  --registry <path>  --out <dir>  --moods <dir>
 *   2. tincture.config.json in CWD (or nearest parent directory)
 *   3. Defaults: CWD/tincture/registry.json, CWD/tincture/_generated, CWD/tincture/moods
 *
 * Consumer projects create a tincture.config.json at their project root:
 *   {
 *     "registryPath": "src/tenants/my-brand/tincture/registry.json",
 *     "outDir":       "src/tenants/my-brand/tincture/_generated",
 *     "moodsDir":     "src/tenants/my-brand/tincture/moods",
 *     "host":         "https://my-site.com"
 *   }
 */

import { existsSync, readFileSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';

const CWD = process.cwd();
const args = process.argv.slice(2);

function flagValue(name, fallback = null) {
  const i = args.findIndex(a => a === `--${name}` || a.startsWith(`--${name}=`));
  if (i < 0) return fallback;
  if (args[i].includes('=')) return args[i].split('=')[1];
  return args[i + 1] ?? fallback;
}

/** Walk up from dir to find tincture.config.json */
function findConfig(dir) {
  const candidate = join(dir, 'tincture.config.json');
  if (existsSync(candidate)) return JSON.parse(readFileSync(candidate, 'utf8'));
  const parent = dirname(dir);
  if (parent === dir) return {};      // reached fs root
  return findConfig(parent);
}

const fileConfig = findConfig(CWD);

export const REGISTRY_PATH = resolve(CWD,
  flagValue('registry') ??
  fileConfig.registryPath ??
  'tincture/registry.json'
);

export const OUT_DIR = resolve(CWD,
  flagValue('out') ??
  fileConfig.outDir ??
  'tincture/_generated'
);

export const MOODS_DIR = resolve(CWD,
  flagValue('moods') ??
  fileConfig.moodsDir ??
  'tincture/moods'
);

export const HOST =
  flagValue('host') ??
  fileConfig.host ??
  process.env.TINCTURE_HOST ??
  'localhost:3000';

export const MANIFEST_PATH = resolve(OUT_DIR, 'manifest.json');
export const BASELINE_PATH = resolve(REGISTRY_PATH.replace(/registry\.json$/, 'registry.baseline.json'));
