---
id: cycle-7
phase: 2
title: Component migration wave 2 — ~2200 migrations / 50+ files
status: done
created: 2026-04-30
shipped: 2026-04-30
commit: 79e8b39
seeded-by: cycle-6
---

# Cycle 7 — Migration Wave 2

## Goal
Sweep every remaining component + page in the Arzadon tenant from legacy `--color-*` tokens to foundation tokens. Use the same 17-rule migration map from cycle 3, applied via glob.

## Spec / Acceptance — all checked
- [x] tincture-migrate-components.mjs upgraded to glob mode (`walk()` engine)
- [x] All `src/tenants/arzadon/components/**/*.tsx` swept
- [x] All `src/app/(tenants)/sites/arzadon/**/*.tsx` swept
- [x] Build passes
- [x] Sweep idempotent (--check passes after apply)

## Changelog (commit 79e8b39)
- 115 files changed, ~2547 insertions / ~2534 deletions
- Top-volume files: demos/styles (151), gym-memberships (106), personal-trainer-toronto (94)
- Migration script `walk()` reusable in future sweeps

## Decisions
- **[data-theme=*] blocks STAY in globals.css.** 69 files still reference legacy tokens not yet in foundation (--color-stat-*, --color-bg-accent-band, --color-brand-red, etc.). Dropping the blocks would break those. Cycle 8 expands the registry; cycle 7-followup (renamed to part of phase-3) sweeps the remaining 69.
- The migration map's 17 rules covered everything that maps cleanly. No new rules needed.

## Handoff to cycle 8
Cycle 8 begins phase 3 — AI-Native Layer. The MCP server reads `_generated/manifest.json` and exposes structured ops (tokens.list / tokens.set / tokens.find / mood.apply / etc.). Multi-state preview (cycle 9) builds on top. Contrast guard (cycle 10) walks the registry's `contrastPair` declarations.

Carry-forward to cycle 8:
- Manifest is fully populated (cycle 4) and codegen is wired (cycle 5).
- 11 semantic tokens + 18 legacy aliases give the MCP server enough surface to do natural-language resolution ("the dark cta" → --accent on data-surface=dark).
- tincture/manifest-loader.ts (cycle 6) is the read interface; reuse it in the MCP server's TS types.
- 69 unmigrated files (legacy tokens not in foundation) need registry expansion in cycle 8 — list them as a pre-task.
