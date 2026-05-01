---
id: cycle-28
phase: 5
title: Apply Performance mood (live demo)
status: done
created: 2026-04-30
shipped: 2026-04-30
commits:
  arzadon: 32ba457 + ff98516 (cascade-reset fix)
note: >
  Original plan said "Brand-lock primitives." Brand-lock shipped in cycle 26.
  This cycle applied the Performance mood to the live arzadon site as a demo.
verification: CDP runtime values confirmed — hero h1 weight=900, accent vivid, shadow glow on dark
---

# Cycle 28 — Apply Performance mood

## What shipped

`node scripts/tincture-mood-v2.mjs apply performance` run against the live arzadon registry.

Registry values updated:
- `--type-display-1`: clamp(3rem, 8vw, 6rem) (expanded from cycle 27's 4.5rem max)
- `--weight-display`: 900 (both surfaces)
- `--track-display`: -0.03em
- `--leading-tight`: 1.0
- `--shadow-lifted`: 0 8px 32px rgba(255,58,26,0.25) on dark
- `--accent`: vivid reds (#E62719 light / #FF3A1A dark)

`registry.baseline.json` saved before apply — reset available via `tincture-mood-v2.mjs reset`.

## Bug caught + fixed

**Cascade-reset broken** — codegen was NOT emitting reset cells for all axis-values. When `[data-surface="light"]` was nested inside `[data-surface="dark"]`, the `[data-surface="light"]` rule had no `--ink` declaration → inherited the dark value. Fixed in `ff98516`: codegen-v2 now auto-fills every token × every declared axis-value.

## Current live state (arzadon)

Performance mood is the active mood. The registry reflects Performance values. To return to baseline:
```bash
node scripts/tincture-mood-v2.mjs reset
pnpm tincture:codegen
git add ... && git push
```
