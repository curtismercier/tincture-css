---
id: cycle-5
phase: 2
title: Codegen — registry → CSS + TS + manifest
status: active
created: 2026-04-30
seeded-by: cycle-4
proving-ground: Gravicity/studio
---

# Cycle 5 — Codegen

## Goal
`tincture-codegen.mjs` reads `registry.json` and emits 3 derivative artifacts: regenerated `foundation.css`, regenerated `flavors.css`, and a flat `manifest.json` for the designer studio + a `tokens.d.ts` for TS autocomplete. Codegen runs validator first; fails fast on drift. Hooks into prebuild so `pnpm build` always has fresh-generated tokens.

## Inherited from cycle 4 (carry-forward)

- Validator is load-bearing. Codegen MUST run it first.
- Balanced-paren parser is reusable; if needed, hoist to `tincture/_parser.mjs`.
- Generated files get a `/* generated — do not edit */` header.
- Codegen mirrors `tincture-foundation.mjs`'s `--dry/--check/apply`.

## Spec

- [ ] Write `tincture-codegen.mjs`:
  - Read registry.json
  - Run validator first (exit 1 on error)
  - Emit `tincture/_generated/foundation.css` (the same content as hand-authored, regenerated from registry)
  - Emit `tincture/_generated/flavors.css`
  - Emit `tincture/_generated/manifest.json` (flat shape: `{tokens: {id: {value-light, value-dark, doc, role}}, components: [...]}`)
  - Emit `tincture/_generated/tokens.d.ts` (`export type SemanticToken = 'ink' | 'bg' | ...`)
- [ ] Switch globals.css to import from `_generated/` (deprecate hand-authored foundation.css + flavors.css, keep them only as templates if needed)
- [ ] Add `tincture:codegen` script to package.json + run before next build via prebuild chain
- [ ] Verify: regen produces deterministic output (run twice, diff must be empty)
- [ ] Verify: pnpm build succeeds with regenerated CSS

## Decision tree

### Q1: Replace hand-authored foundation.css/flavors.css OR keep parallel?
- **A** Replace (single source from registry)
- **B** Parallel (hand-authored is template; generated is canonical)
- **Decision:** A. Hand-authored versions move to `tincture/_archive/` for reference and get gitignored. The generated versions are the only files components import.

### Q2: Where does prebuild integrate?
- **A** Add to existing prebuild chain in package.json (script: `tincture:codegen`)
- **B** Run via vite/next plugin
- **Decision:** A this cycle. Plugin is overkill until the substrate supports HMR.

### Q3: tokens.d.ts shape — union string OR objects with values?
- **A** `type Token = 'ink' | 'bg' | ...` (just IDs)
- **B** `type Token = { id, lightValue, darkValue }` (full object)
- **Decision:** A for cycle 5. Consumers do `Token` for autocomplete; component contract types come in cycle 11.

## Acceptance

- [ ] `tincture-codegen.mjs` runs successfully
- [ ] `tincture/_generated/{foundation.css, flavors.css, manifest.json, tokens.d.ts}` exist
- [ ] globals.css imports from `_generated/`
- [ ] `pnpm build` passes
- [ ] `tincture-validate-registry.mjs` passes (no drift introduced)
- [ ] Two consecutive `tincture:codegen` runs produce identical output (idempotent)
- [ ] Cycle 6 spec expanded

## Files

- NEW `studio/scripts/tincture-codegen.mjs`
- NEW `studio/src/tenants/arzadon/tincture/_generated/foundation.css`
- NEW `studio/src/tenants/arzadon/tincture/_generated/flavors.css`
- NEW `studio/src/tenants/arzadon/tincture/_generated/manifest.json`
- NEW `studio/src/tenants/arzadon/tincture/_generated/tokens.d.ts`
- MODIFY `studio/src/tenants/arzadon/globals.css` — switch imports to `_generated/`
- MODIFY `studio/package.json` — add `tincture:codegen` script + prebuild chain

## Risks

- **Generation differs from hand-authored** in subtle whitespace / comment placement. Acceptable; the generated version becomes canonical.
- **prebuild chain ordering.** `tincture:codegen` must run early (before scripts that read CSS). Place at start of prebuild chain.
- **gitignore vs commit `_generated/`.** Decision: COMMIT (cycle 4 Q5 locked this — reviewable diffs).

## Changelog (closing 2026-04-30, commit 2aa2d49)

- `studio/scripts/tincture-codegen.mjs` — NEW (~210 LOC). Reads registry, emits 4 artifacts deterministically. Idempotent (verified twice — second run shows all unchanged).
- `studio/src/tenants/arzadon/tincture/_generated/foundation.css` — generated (1.6 KB). Same content as hand-authored, regenerable.
- `studio/src/tenants/arzadon/tincture/_generated/flavors.css` — generated (1.1 KB).
- `studio/src/tenants/arzadon/tincture/_generated/manifest.json` — flat shape for studio (6.9 KB).
- `studio/src/tenants/arzadon/tincture/_generated/tokens.d.ts` — TS union types (~700 bytes).
- `studio/src/tenants/arzadon/globals.css` — imports switched from hand-authored to `_generated/`.

## Decisions (closing)

- Q1 → A confirmed. Hand-authored foundation.css/flavors.css deprecated. Cycle 6 moves to `_archive/`; cycle 7 deletes.
- Q2 → package.json prebuild integration deferred to cycle 6 (no need yet — manual run is fine while iterating).
- Q3 → A confirmed. tokens.d.ts is union strings; full object types come in cycle 11.

## Bugs caught + fixed during shipping
- **None.** Codegen ran clean first try. Validator's drift check from cycle 4 caught all the registry/foundation mismatches in cycle 4 — by cycle 5, registry was already truth.

## Handoff to cycle 6

Cycle 6 makes the designer studio READ `_generated/manifest.json` instead of the hand-curated `TOKEN_GROUPS` array (which the auditor flagged as 9/10 stale). Studio's token tree becomes correct-by-construction.

Cycle 6 spec carry-forward (NEW INSIGHTS):
- manifest.json shape is locked: `{tokens: {id: {lightValue, darkValue, doc, role, contrastPair, legacy}}, flavors, components, axes}`.
- Designer studio will need a small fetch wrapper to load manifest.json at mount.
- The 18 legacy aliases in registry give designer studio enough info to suggest "you're trying to set --color-text-primary, did you mean --ink?" — surface this as a UX nicety in cycle 6.
- Cycle 6 also moves hand-authored foundation.css/flavors.css to `tincture/_archive/` (informational, no longer imported).
