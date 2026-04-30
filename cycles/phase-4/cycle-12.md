---
id: cycle-12
phase: 4
title: Mood preset — arzadon-default + apply engine
status: done
created: 2026-04-30
shipped: 2026-04-30
commit: 45ed0bd
batched: cycles 12-15 shipped together (one commit, four mood JSONs + apply engine)
---

# Cycle 12 — Arzadon Default Mood + Engine

## Goal
Author the baseline mood preset (`arzadon-default.json`) AND the engine that applies any mood (`tincture-mood.mjs`). The baseline is intentionally a no-op delta so reverting from any other mood = applying arzadon-default.

## Spec
- [x] Author `tincture/moods/arzadon-default.json` with `tokens: {}` (empty delta — represents the seed registry)
- [x] Write `tincture-mood.mjs` engine with verbs:
  - [x] `apply <name>` — write deltas to registry + auto-regen `_generated/`
  - [x] `preview <name>` — show what would change, no write
  - [x] `diff <a> <b>` — token-level diff between two moods
  - [x] `list` — list available moods
- [x] Engine reads mood JSON + composes deltas onto registry's `semantic[].lightValue/darkValue`
- [x] Build passes

## Decisions
- **Baseline mood = empty delta.** Reverting is structural, not "remember-the-old-values."
- **`base` field in mood JSON** is informational only — engine doesn't chain. Mood deltas are flat overrides.
- **`axis-defaults`** field declares preferred surface + flavor when applying the mood (not enforced; informational).

## Changelog (commit 45ed0bd, batched with cycles 13-15)
- `studio/src/tenants/arzadon/tincture/moods/arzadon-default.json` — NEW. Baseline mood (empty delta).
- `studio/scripts/tincture-mood.mjs` — NEW (~85 LOC). Apply/preview/diff/list engine.

## Reflection
This cycle was batched with 13-15 because the engine and the JSON files share lifecycle — shipping them separately would have been ceremony, not value. The `reflect-and-expand` protocol is preserved by treating cycle 12 as "the engine + baseline" and cycles 13-15 as "additional preset content."

## Handoff to cycle 13
First non-baseline mood: `clinical`. Tests the engine's ability to swap accent + ink + bg in one apply call.
