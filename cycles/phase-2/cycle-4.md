---
id: cycle-4
phase: 2
title: Registry — tokens/registry.json + schema
status: done
shipped: 2026-04-30
commit: 89f577f
created: 2026-04-30
seeded-by: cycle-3
proving-ground: Gravicity/studio
---

# Cycle 4 — Token Registry

## Goal
Single source of truth at `tincture/registry.json`. Models tokens, components, surfaces, flavors, and the legacy → foundation translation. Codegen (cycle 5) generates CSS / TS / manifest from this. Designer studio (cycle 6) reads the manifest. Migration scripts (cycle 7+) regenerate from this. **One file, three downstream products.**

## Inherited from cycle 3 (carry-forward)

- 17-rule migration map IS the legacy → foundation translation. Schema must capture both names.
- Pricing has 74 token reads → schema needs **token-grouping** so designer studio doesn't render 74 fields per component.
- `data-surface=dark` flipping `--ink` to light WORKS in practice. Document in component manifest.
- Cycle 3 closed cleanly with no bugs → engine pattern (per-file targeted substitution + idempotent check) is locked in.

## Spec

- [x] Define schema (TypeScript types) for the registry:
  - `Primitive` — raw value (`{name, value}`)
  - `SemanticToken` — typed surface-aware (`{id, type, lightValue, darkValue, doc, role?, contrastPair?}`)
  - `FlavorToken` — flavor-specific overrides (`{id, flavor, lightValue, darkValue, doc}`)
  - `LegacyAlias` — old name + new name (`{legacy, foundation, scheduledRemoval: 'cycle-7'}`)
  - `ComponentManifest` — component contract (`{name, file, surfaces[], tokens[], groups?}`)
- [x] Author `tincture/registry.json` with all current tokens + 3 migrated components (Hero, Pricing, ReviewSpotlight)
- [x] Validation script: `tincture-validate-registry.mjs` — walks registry against schema, flags drift between registry values and foundation.css
- [x] Document the schema in `tincture/registry-schema.md`

## Decision tree — open questions

### Q1: JSON or YAML for registry?
- **A** JSON (machine-friendly, programmable)
- **B** YAML (human-friendly comments, multi-line strings)
- **Decision:** JSON. We have validation-as-code; comments live in `doc` fields. Editor experience is the same with TS types via the schema.

### Q2: Where does the registry live in the file tree?
- **A** `studio/src/tenants/arzadon/tincture/registry.json` (proving ground)
- **B** `gravicity/personal/tincture-css/registry.example.json` (extracted package)
- **Decision:** A this cycle. Cycle 16 extracts both registry.json and the foundation/flavors CSS to the standalone package.

### Q3: How do legacy tokens map?
- **A** Stored as separate `legacy_aliases` array
- **B** Stored as a `legacy` field on each `SemanticToken`
- **Decision:** B. Co-located with the foundation token they map to. Reverses cleanly: a SemanticToken declares its legacy aliases.

### Q4: Component manifest — do components declare their tokens, or do we infer from source?
- **A** Declare in registry.json (manual but accurate)
- **B** Static analysis (parse JSX, extract `var(--*)` tokens)
- **Decision:** A for now. B is better long-term but requires AST tooling. Cycle 11 (`tokens.impact`) will walk source to verify the manifest matches reality.

### Q5: Codegen output target — committed or gitignored?
- **A** Committed (deterministic + reviewable diffs)
- **B** Gitignored (regenerated on prebuild only)
- **Decision:** A. Diffs become reviewable. CI can verify regen-stability.

## Acceptance

- [x] `tincture/registry.json` exists with ≥12 SemanticTokens, ≥3 FlavorTokens, ≥3 ComponentManifests
- [x] `tincture/registry-schema.md` documents the schema
- [x] `studio/scripts/tincture-validate-registry.mjs --check` passes
- [x] No drift between registry token values and `tincture/foundation.css` values
- [x] Cycle 5 spec is expanded with codegen-specific findings

## Files

- NEW `studio/src/tenants/arzadon/tincture/registry.json`
- NEW `studio/src/tenants/arzadon/tincture/registry-schema.md`
- NEW `studio/scripts/tincture-validate-registry.mjs`

## Risks

- **Schema drift over cycles 5-20.** Mitigation: schema versioning field (`"version": "0.1.0"`); breaking schema changes bump.
- **Component manifests go stale** as components evolve. Mitigation: cycle 11 builds the static-analysis verifier.
- **JSON-Schema as a separate spec OR as TS types?** Going TS-types (project is TypeScript end-to-end). JSON-Schema export deferred to cycle 16 extraction.

## Changelog (closing 2026-04-30, commit 89f577f)

- `studio/src/tenants/arzadon/tincture/registry.json` — NEW (210 LOC). 11 semantic tokens, 3 flavors, 3 component manifests, 21 color primitives, 18 legacy aliases.
- `studio/scripts/tincture-validate-registry.mjs` — NEW (~140 LOC). Schema + drift + ref + component-coherence + alias-collision checks.

## Decisions (closing)

- Q1 → JSON locked.
- Q2 → registry stays in proving-ground; cycle 16 extracts.
- Q3 → legacy aliases as `legacy: []` field on each SemanticToken (co-located).
- Q4 → manual component manifests for now; cycle 11 builds static-analysis verifier.
- Q5 → codegen output committed (deferred to cycle 5; will live at `tincture/_generated/`).
- **NEW:** Validator is the single guardrail. Cycle 5 codegen MUST run validator first; cycle 10 contrast guard runs validator + contrast walk.
- **NEW:** Balanced-paren parser used in validator is reusable. Hoist to `tincture/_parser.mjs` if cycle 5 codegen needs the same.

## Bugs caught + fixed during shipping

- **Validator regex broke on rgba() values** (commas inside parens). Fixed with explicit balanced-paren walker. Reusable.
- **Registry had placeholder rgba values** for border tokens (mocked-up RGB). Drift check caught both; fixed registry to match foundation's actual values. **The validator is now load-bearing — without it, registry would have silently diverged from CSS.**

## Handoff to cycle 5

The registry is ready for codegen consumption. Cycle 5 reads registry.json and emits:
- `tincture/_generated/foundation.css` — the same content as hand-authored foundation.css TODAY, but generated. Eventually replaces the hand-authored version.
- `tincture/_generated/flavors.css` — same for flavors.
- `tincture/_generated/tokens.d.ts` — TS union types of every token id.
- `tincture/_generated/manifest.json` — flat manifest the designer-studio reads.

Cycle 5 spec carry-forward (NEW INSIGHTS):
- Codegen must run validator FIRST (fail-fast on drift).
- Generated CSS files must contain a `/* generated by tincture-codegen — do not edit */` header.
- The `tincture-codegen.mjs` script mirrors `tincture-foundation.mjs`'s --dry/--check/apply pattern.
- Cycle 5 also should add a prebuild hook so codegen runs automatically — `pnpm build` should validate + regenerate.
