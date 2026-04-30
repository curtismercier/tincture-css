---
id: cycle-6
phase: 2
title: Studio reads manifest (kill stale TOKEN_GROUPS)
status: done
created: 2026-04-30
shipped: 2026-04-30
commit: add0a32
seeded-by: cycle-5
---

# Cycle 6 — Studio Reads Manifest

## Goal
Replace hand-curated TOKEN_GROUPS in studio-designer/page.tsx with manifest-driven groups built from `tincture/_generated/manifest.json`. Adding a token to registry → running codegen → token appears in studio next reload.

## Spec / Acceptance — all checked
- [x] `tincture/manifest-loader.ts` reads `_generated/manifest.json`
- [x] `buildTokenGroups()` groups tokens by `role` field
- [x] studio-designer page imports + uses `buildTokenGroups()`
- [x] Hand-curated TOKEN_GROUPS removed
- [x] `pnpm tincture:codegen` script added
- [x] Prebuild chain runs codegen first
- [x] Build passes

## Changelog (commit add0a32)
- `studio/src/tenants/arzadon/tincture/manifest-loader.ts` — NEW (85 LOC). Loads manifest, groups by role, exports helpers.
- `studio/src/app/(tenants)/sites/arzadon/demos/studio-designer/page.tsx` — TOKEN_GROUPS replaced with manifest-driven derivation.
- `studio/package.json` — added tincture:codegen + tincture:validate, integrated codegen into prebuild chain.

## Decisions
- Default value uses LIGHT side of the light-dark pair (most common starting context for designers). Cycle 9 (multi-state preview) shows both sides side-by-side anyway.
- `getFlavorOverrides()` and `getComponentManifest()` exported preemptively for cycles 8-11 (MCP server consumes them).

## Handoff to cycle 7
Studio is now manifest-aware. Cycle 7 sweeps the remaining ~15 components to use foundation tokens, then drops the per-theme `[data-theme=*]` blocks from globals.css. Validator must continue to pass after the drop.
