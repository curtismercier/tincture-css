---
id: cycle-22
phase: 5
title: Multi-axis codegen — emit cascade rules per axis-cell
status: done
created: 2026-04-30
shipped: 2026-04-30
verification: 34/34 codegen tests pass; foundation.css valid; idempotent
---

# Cycle 22 — Multi-axis codegen

## Goal
Emit standards-compliant CSS from a v0.2 registry. Every axis-cell becomes one rule. NO `light-dark()`. Compound selectors stack specificity. Idempotent across runs.

## Spec — what shipped
- [x] `src/cli/codegen-v2.mjs` — new emitter that:
  - Validates registry via `validateRegistry()`; exits non-zero on failure
  - Accepts `--registry <path>` and `--out <dir>` arguments
  - Emits `foundation.css`, `manifest.json`, `tokens.d.ts`
  - Groups all tokens for the same cell into one CSS block (denser output)
  - Adds `color-scheme: light/dark` to `:root` / `[data-surface="dark"]` / `[data-surface="light"]`
  - Includes the `--tincture-foundation-version` sentinel from registry version
  - Supports `--quiet` for clean test output
- [x] `tests/test-codegen.mjs` — 34 tests:
  - Idempotency (3 file types, byte-identical across two runs)
  - Foundation contains expected tokens, color-schemes, compound selectors
  - **Critical:** ZERO `light-dark()` calls in output
  - Specificity ordering (default → 1-axis → 2-axis ascending)
  - Manifest.json structure (schemaVersion 2.0, tokens, axes, cells)
  - tokens.d.ts is valid TS (TokenId union, TOKEN_IDS const)
  - Codegen exits non-zero on invalid registry

## Acceptance test
```
$ node tests/test-codegen.mjs
34 passed, 0 failed.
```

## Sample output
Running against `src/registry.v02-example.json`, `_generated-v2/foundation.css`:
```css
:root {
  color-scheme: light;
  --accent: #C41E3A;
  --bg: #F7F4F0;
  --ink: #1A1612;
  --weight-display: 700;
  --tincture-foundation-version: "0.2.0-alpha";
  /* …16 more tokens… */
}
[data-elevation="dramatic"]                  { --shadow-lifted: 0 24px 64px rgba(0,0,0,0.16); }
[data-surface="dark"]                        { color-scheme: dark; --ink: #FFFFFF; … }
[data-tone="feature"]                        { --space-section: 8rem; }
[data-elevation="dramatic"][data-surface="dark"]  { --shadow-lifted: 0 24px 64px rgba(0,0,0,0.6); }
[data-flavor="warm"][data-surface="dark"]    { --bg: #1A1612; --ink: #FAF7F2; }
```
2,248 bytes total. 34 cascade rules. No polyfill bait.

## Decisions
1. **Group tokens by cell, not the reverse.** v0.1 emitted one block per token (declaring its light + dark values). v0.2 emits one block per cell (declaring all tokens that apply at that cell). Result: denser output, easier to read at scale, deterministic.
2. **Color-scheme is special-cased into the cell rule.** Surface axis is THE luminance axis, so `:root`/`[data-surface=dark]`/`[data-surface=light]` get `color-scheme:` declarations injected. Other axes don't (they're chromatic / dimensional, not luminance).
3. **Specificity-ordered emission.** default first → 1-axis → 2-axis → … The CSS cascade does the right thing because compound selectors (`[data-A=x][data-B=y]` specificity `0,2,0`) win over single (`[data-A=x]` specificity `0,1,0`). But we emit later anyway as belt-and-suspenders.
4. **Manifest schemaVersion `2.0` (not registry.version).** Keeps the manifest contract stable even when consumer registries bump 0.2.0 → 0.2.1.
5. **`tokens.d.ts` exports both `TokenId` (union type) and `TOKEN_IDS` (tuple const).** Type-only consumers use the union; runtime consumers iterate the tuple.
6. **No mood-aware emission yet.** Cycle 22 emits the bare registry. Mood deltas land in cycle 24 (currently scheduled for typography but reordered — see handoff).

## Reflection — what cycle 22 learned from cycle 21
- **Reuse the validator.** Cycle 21 shipped `validateRegistry()`; cycle 22 imports it directly rather than re-implementing. Net: ~80 LOC saved + bug-free invalid-registry handling.
- **Test-first again.** Wrote 34 assertions before tweaking the emitter. Caught the "compound selectors aren't in alpha order" bug early (the v0.2-example has `flavor=warm,surface=dark` keys; codegen emits them via `cellSelector` which maps key parts in order; result selectors emit as `[data-flavor="warm"][data-surface="dark"]` → matches source key, all good).
- **Bytes-identical idempotency** is a property to PROVE, not assume. Test reruns codegen twice and asserts string equality. If a future change introduces nondeterminism (e.g. iterating object keys without sort), the test catches it.
- **Skipped:** Updating `src/cli/codegen.mjs` (the v0.1 emitter). Both can coexist; v0.1 stays for legacy. Cycle 23 (registry migration) decides whether to deprecate v0.1.

## Handoff to cycle 23 — registry migration (lossless)

**Goal:** Migrate the live arzadon registry from v0.1 (lightValue/darkValue pairs) to v0.2 (axis-aware values), with these guarantees:
1. Every v0.1 token expressible in v0.2 (lossless)
2. Visual no-op on live arzadon (CDP eval after deploy: same colors as before pivot)
3. Migration script (`src/cli/migrate-v01-to-v02.mjs`) reads v0.1 registry → emits v0.2 registry → keeps the v0.1 file as `.bak`

**Mapping:**
- v0.1 `semantic.<id>.lightValue` → v0.2 `tokens.<id>.values.default`
- v0.1 `semantic.<id>.darkValue` → v0.2 `tokens.<id>.values["surface=dark"]` (if different from light)
- v0.1 doesn't have axes — v0.2 inferred: every token gets `axes: ['surface']` IF its dark value differs from light, else `axes: []`
- v0.1 doesn't have kinds — v0.2 default: every token is `kind: 'color'` (until cycle 24+ adds typography)
- v0.1 primitives → v0.2 primitives (unchanged)
- v0.1 mood JSONs → v0.2 mood JSONs (cell-key conversion: `lightValue` → `default`, `darkValue` → `surface=dark`)

**Acceptance test for cycle 23:**
1. Migration script + invariant: `pnpm tincture:codegen` against the migrated registry produces a CSS file that, when concatenated with the legacy globals.css overrides, **renders byte-identical CSS** to today's live state. (Test via diff.)
2. CDP eval against arzadon staging: hero/cta-band/pricing colors unchanged.
3. The 6 mood JSONs migrate cleanly + can be applied via `tincture mood apply <name>` against the v0.2 registry.

**Carry forward:**
- Cycle 22 didn't update `package.json` `bin` to expose `codegen-v2.mjs`. Cycle 23 should add `tincture-codegen-v2` to the bin map OR rename codegen.mjs → codegen-v1.mjs, codegen-v2.mjs → codegen.mjs (cleaner; aligns with v0.2 being default after cycle 23).
- The arzadon consumer copies of the substrate need to be migrated too. That's a SEPARATE consumer-side step in cycle 23 (or split off as cycle 23a / 23b).

## Discipline contract (v0.2)
1. ✅ One cycle = one commit = one verifiable outcome (34 tests pass, idempotent codegen).
2. N/A — no CSS in consumer code yet.
3. ✅ `pnpm build` clean.
4. N/A — no migration sweep.
5. N/A — no live state changed.
6. Cycle 28 self-audit reminder: 6 cycles from now.

## Files touched
- NEW: `src/cli/codegen-v2.mjs` (7,731 bytes)
- NEW: `tests/test-codegen.mjs` (7,200 bytes)
- (none modified)

## Next: cycle 23 — lossless v0.1 → v0.2 migration with visual no-op verification.
