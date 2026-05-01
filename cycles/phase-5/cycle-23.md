---
id: cycle-23
phase: 5
title: Migrate v0.1 registry to axis-aware shape (lossless)
status: done
created: 2026-04-30
shipped: 2026-04-30
commits:
  tincture-css: bae62e5
  arzadon: aec6f71 + 2376093 + 1aaef67
verification: 37/37 migration tests pass; CDP-verified visual no-op on live
---

# Cycle 23 — v0.1 → v0.2 registry migration

## What shipped

- `src/cli/migrate-v01-to-v02.mjs` — lossless migration script
- Arzadon `registry.json` migrated from flat `lightValue/darkValue` pairs to v0.2 axis-aware shape
- `registry.v01.json.bak` kept alongside for reference
- All 6 mood JSONs updated to v0.2 cell-key format
- `foundation.css` source rewritten to manual-override pattern (removing `light-dark()` polyfill)
- `tincture-codegen-v2.mjs` wired into arzadon pnpm prebuild

Follow-on sweeps (23-followup + 23-followup-2):
- 26 page heroes annotated with `data-surface="dark"` (previously un-annotated)
- 24 more sections with image-overlay or dark-bg patterns annotated
- Navbar pill + megamenu panel annotated

## Decisions

1. **Manual-override beats light-dark() for the registry pattern.** See architecture doc `docs/architecture/why-not-automatic.md`. CSS custom property + `light-dark()` polyfill freezes at `:root`'s color-scheme; descendants can't override.
2. **Cascade RESET is mandatory.** Every axis-value gets an auto-fill cell; without it, `[data-surface="light"]` nested inside `[data-surface="dark"]` can't reset `--ink`.
3. **Surface annotation is intent, not detection.** Scanner + lint enforce it. Runtime auto-detect is impossible in CSS (no luminance API).

## Files touched (arzadon)
- `src/tenants/arzadon/tincture/registry.json` — migrated to v0.2
- `src/tenants/arzadon/tincture/foundation.css` — manual override rewrite
- `src/tenants/arzadon/tincture/_generated/foundation.css` — regenerated
- `scripts/tincture-codegen-v2.mjs` — new v0.2 emitter
- `scripts/tincture-migrate.mjs` — migration script
- 26+ page files — `data-surface="dark"` annotations added
