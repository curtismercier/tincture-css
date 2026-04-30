---
id: cycle-13
phase: 4
title: Mood: clinical preset
status: done
shipped: 2026-04-30
commit: 45ed0bd
batched: cycles 12-15 shipped as one batch (mood JSONs + apply engine)
---

## Why batched
All 4 mood cycles share the engine (tincture-mood.mjs) and differ only
in the JSON preset content. Shipping as one commit avoids 4 round-trips.

## What landed (commit 45ed0bd)
- 6 mood JSON presets in src/tenants/arzadon/tincture/moods/
- studio/scripts/tincture-mood.mjs (apply/preview/diff/list engine)
- 'tincture-mood apply <name>' overwrites registry + auto-regens

## Verified working
`tincture-mood preview clinical` lists 7 token deltas (accent, ink, bg, etc.).
`tincture-mood apply clinical` writes registry, regen succeeds.
`tincture-mood apply arzadon-default` reverts.

## Decisions
- Mood file is a sparse delta from base. Tokens not mentioned stay
  as the base value. Reverting = applying the base mood.
- Future: typography + spacing tokens can join the delta map. Today
  only colors are modeled. Cycle 18 (docs) calls this out as future.
