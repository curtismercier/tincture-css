---
id: cycle-21
phase: 5
title: Multi-axis registry — types + schema validator + example
status: done
created: 2026-04-30
shipped: 2026-04-30
verification: 39/39 schema tests pass
---

# Cycle 21 — Multi-axis registry: types + schema validator + example

## Goal
Define the v0.2 registry shape as code, prove it with positive + negative tests, and ship a reference example registry that exercises every axis kind. **No CSS changes, no consumer impact this cycle** — types-and-schema only.

## Why this is cycle 1 of v0.2
v0.1's audit (cycles/audits/2026-04-30-cycle-1-20-audit.md) and architecture-pivot log made clear that the v0.1 registry shape (flat `lightValue/darkValue` per token) couldn't model the system's six layers (brand-lock, surface, flavor, elevation, tone, mood). v0.2 reframes registry as **value matrices indexed by orthogonal axes**. Cycle 21 lays the foundation in code so cycles 22+ can build on a verified shape instead of designing-by-typing.

## Spec — what shipped
- [x] `src/types.ts` — TypeScript type declarations: `Axis`, `AxisValueMap`, `TokenKind`, `AxisCellKey`, `TokenDefinition`, `Registry`, `MoodDefinition`. Plus runtime constants `AXES`, `AXIS_VALUES`, `TOKEN_KINDS`. Plus parse/serialise helpers for axis-cell keys.
- [x] `src/schema.mjs` — runtime JS mirror with `validateRegistry()` + `validateMood()`. Returns `{ ok, errors[] }`, never throws on input. CLI mode: `node src/schema.mjs <registry.json> [<mood.json>]`.
- [x] `src/registry.v02-example.json` — reference registry exercising all 7 token kinds (color, typography, spacing, radius, shadow, motion, brand-lock) and all 4 axes (surface, flavor, tone, elevation), plus locked brand-lock primitives, plus compound axis-cells.
- [x] `tests/test-schema.mjs` — 39 tests covering parse/serialise round-trips, positive registry validation, 9 negative cases (unknown kind, undeclared axis, missing default, malformed key, locked-with-axes, locked-with-extra-cells, empty value, etc.), positive mood validation, 3 negative mood cases (unknown token, locked token, undeclared axis).

## Acceptance test
`node tests/test-schema.mjs` exits 0 with `39 passed, 0 failed.` Verified.

## Decisions
1. **Mood is NOT a registry axis.** It's a delta layer ON TOP of the registry. Internal axes are the closed set: `surface`, `flavor`, `tone`, `elevation`. This keeps the matrix bounded; moods compose at apply-time.
2. **Axis-cell keys are alphabetised.** `flavor=warm,surface=dark` is canonical; `surface=dark,flavor=warm` is rejected. Forces deterministic comparison + diff.
3. **`default` cell is required.** Every token must specify a fallback for `:root`. Eliminates the "what does this token resolve to with no axis match" question.
4. **`locked: true` ⇒ `axes: []` + only `default` cell.** Brand-lock primitives can't have variants by definition. Validator enforces both.
5. **Cells must use only declared axes.** A token with `axes: ['surface']` rejected if it tries `flavor=warm`. Schema catches this at validate time, not at codegen time.
6. **Empty string values are invalid.** `''` is a common foot-gun; explicit rejection.
7. **Schema validator is plain JS (`schema.mjs`), not TypeScript.** Runtime needs to load anywhere — pre-build hooks, CLIs, browsers if needed. TS types in `types.ts` mirror the JS for editor support; consumers using TS get both.
8. **Compound-axis specificity.** Codegen (cycle 22) will rely on CSS specificity stacking: `[data-surface=dark][data-flavor=warm]` (specificity `0,2,0`) wins over `[data-surface=dark]` (specificity `0,1,0`). Recorded here so cycle 22 doesn't re-discuss.

## Reflection — what this cycle did differently from v0.1
- **One commit, one verifiable outcome.** Just types + schema + tests. No CSS changes (yet). No coupling to codegen (yet).
- **Test FIRST, ship SECOND.** Wrote 39 tests against the schema as I authored it. Caught 3 schema bugs during authoring (initial parser missed alphabetisation; locked-token rules were too lenient; mood validator didn't check axis declaration).
- **No globals.css edits.** Cycle 7's bug came from sweeping tokens before auditing globals. This cycle has zero migration risk.
- **Visual verification deferred.** Types-and-schema cycles don't need mosaic capture. CSS cycles do (22+).

## Handoff to cycle 22 — codegen (multi-axis CSS emit)
**Spec for cycle 22:**
1. Update `src/cli/codegen.mjs` to read v0.2 registries via `validateRegistry()`. Reject invalid registries with non-zero exit.
2. Emit one CSS rule per axis-cell using compound attribute selectors:
   ```css
   :root                                       { --ink: <default-value>; }
   [data-surface="dark"]                       { --ink: <surface=dark value>; }
   [data-surface="dark"][data-flavor="warm"]   { --ink: <flavor=warm,surface=dark value>; }
   ```
3. **Do NOT use `light-dark()` anywhere** (lesson from cycle 21's predecessor).
4. Order rules within `_generated/foundation.css` by axis-count ascending (default first, then 1-axis, then 2-axis, etc.) for deterministic specificity layering.
5. Emit a `--tincture-foundation-version` sentinel pointing at registry's version field (so `0.2.0-alpha` etc. shows up in DevTools).
6. Emit `_generated/manifest.json` (flat shape: `tokens[id].defaultValue`, `tokens[id].cells[]`) so studio designer + manifest-loader can iterate.
7. Update `_generated/tokens.d.ts` to be a TS union of token IDs.
8. **Acceptance:** running codegen against `src/registry.v02-example.json` produces 4 deterministic files; running again produces byte-identical output (idempotency). Add a quick test in `tests/test-codegen.mjs` that asserts byte-identity across two consecutive runs.

**Open from cycle 21 (carry forward):**
- The v0.1 codegen at `src/cli/codegen.mjs` is for the OLD registry shape. Cycle 22 either updates it in-place or ships a new `src/cli/codegen.mjs` alongside. Prefer in-place + a v0.1-compat fallback: if registry has no `tokens.<id>.kind` field, treat as v0.1 and emit the manual-override CSS as before.
- Codegen's input registry path is currently hardcoded. Cycle 22 should accept `--registry <path>` so it can be invoked from arbitrary consumers (preparing for the npm-published case in cycle 36).

## Discipline contract (v0.2)
1. ✅ One cycle = one commit = one verifiable outcome (this cycle: 39 tests pass).
2. N/A — no CSS or component changes.
3. ✅ `pnpm build` clean (no JS imports were broken).
4. N/A — no migration sweep.
5. N/A — no live state to verify.
6. ✅ Self-audit at cycle 28 reminder logged.

## Files touched
- NEW: `src/types.ts` (6,982 bytes)
- NEW: `src/schema.mjs` (7,921 bytes)
- NEW: `src/registry.v02-example.json` (3,927 bytes)
- NEW: `tests/test-schema.mjs` (7,248 bytes)
- (none modified)

## Stats
- Lines of code: ~1,050 (types + schema + tests + example)
- Test coverage: 39 assertions, 100% of public API surfaces (`parseAxisCellKey`, `serialiseAxisCellKey`, `validateRegistry`, `validateMood`)
- Time estimate: ~25 min (types-only cycles are fast; the discipline is to STOP when tests pass and not bolt-on codegen)
