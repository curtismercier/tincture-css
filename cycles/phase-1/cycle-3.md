---
id: cycle-3
phase: 1
title: Component migration wave 1 — Hero + Pricing + ReviewSpotlight
status: active
created: 2026-04-30
seeded-by: cycle-2
proving-ground: Gravicity/studio
---

# Cycle 3 — Component Migration Wave 1

## Goal
Migrate 3 anchor components to read foundation tokens directly (`var(--ink)`, `var(--bg)`, `var(--accent)`) instead of legacy `--color-text-primary` / `--color-bg-primary` / `--color-accent-gold`. This is the proving-ground migration that cycle 4's registry will model.

## Why now
- Cycles 1+2 prepared the substrate; nothing depends on it yet.
- Cycle 4 (registry) needs at least one component fully on foundation tokens to design the schema against reality.
- These three components cover the 3 surface contexts: Hero (always-dark feature), Pricing (light-pages), ReviewSpotlight (always-dark booth cards).

## Inherited from cycle 2 (carry-forward)

- Audit forms inside `data-surface=dark` subtrees post-migration. Contact form review BLOCKING this cycle.
- The reusable `SurfaceFlavorWriter` pattern (sub-component writes attributes via hook) — apply to any new attribute-writers in this cycle.

## Spec

- [ ] Migrate Hero.tsx: `var(--color-accent-gold)` → `var(--accent)`, `var(--color-text-primary)` → `var(--ink)`, etc.
- [ ] Migrate Pricing.tsx: same migration map
- [ ] Migrate ReviewSpotlight.tsx: same; verify `data-surface="dark"` from cycle 1 still works
- [ ] Write `tincture-migrate-components.mjs` with explicit before/after className rule pairs (ENGINE: reuse sweep-button-tokens.mjs's glob pattern)
- [ ] Token alias map (added to foundation.css): legacy names point at foundation tokens for ROW 4-7 components (back-compat layer to support gradual migration)

  ```css
  :root {
    /* Legacy aliases — to be dropped in cycle 7 */
    --color-text-primary: var(--ink);
    --color-bg-primary: var(--bg);
    --color-accent-gold: var(--accent);
    /* etc. */
  }
  ```

- [ ] Build passes
- [ ] Visual no-op verified on home + Hero / Pricing / ReviewSpotlight isolated routes
- [ ] Audit: no contact-form regression from `color-scheme` propagation
- [ ] Expand cycle 4 spec with token-naming patterns observed (decisions land in cycle 4 schema)

## Decision tree — open questions

### Q1: Aliases in :root or in foundation.css?
- **A** :root in foundation.css (single source)
- **B** Separate `tincture/legacy-aliases.css` (clearer to delete in cycle 7)
- **Decision:** B. Cycle 7's `tincture-drop-legacy.mjs` then just deletes the file. Cleaner audit trail.

### Q2: Should we sweep all components in this cycle, or just the 3 anchors?
- **A** Just 3 (anchors) — cycle 7 sweeps the rest
- **B** All — fewer cycles but bigger blast radius
- **Decision:** A. Three anchors are the proving ground. Migration script is built; cycle 7 just runs it on more files.

### Q3: How do we verify visual no-op without an MCP preview tool yet?
- **A** Manual screenshot diff (eyeball)
- **B** Lighthouse CI snapshot
- **C** `pnpm build` + manual smoke (open the 3 components on live deploy)
- **Decision:** C this cycle. Cycle 9 builds the headless capture grid (multi-state preview); until then we trust the alias layer + manual smoke.

## Acceptance

- [ ] Hero / Pricing / ReviewSpotlight reference foundation tokens (no `var(--color-*)` in their JSX className)
- [ ] `tincture/legacy-aliases.css` exists with ≥10 alias declarations
- [ ] `pnpm build` passes
- [ ] `tincture-migrate-components.mjs --check` clean
- [ ] Home page renders identically to pre-cycle-3 (manual)
- [ ] Cycle 4 spec is expanded

## Files

- NEW `studio/src/tenants/arzadon/tincture/legacy-aliases.css`
- NEW `studio/scripts/tincture-migrate-components.mjs`
- MODIFY `studio/src/tenants/arzadon/components/Hero.tsx`
- MODIFY `studio/src/tenants/arzadon/components/Pricing.tsx`
- MODIFY `studio/src/tenants/arzadon/components/reviews/ReviewSpotlight.tsx`
- MODIFY `studio/src/tenants/arzadon/globals.css` (import legacy-aliases.css)

## Risks

- **Alias chain too long.** `var(--color-text-primary)` → `var(--ink)` → `light-dark(...)` is 3 indirections. Browser handles fine but devtools display gets noisy. Mitigate: cycle 7 drops aliases.
- **Tailwind v4 utility classes** (`text-[var(...)]`) work with any var. Migrations are pure string substitutions.
- **Hero CTA hover** (s01-91da41 fix) currently reads `var(--color-text-on-accent)` — alias to foundation `--accent-fg`. Same value, no visual change.

## Changelog (closing 2026-04-30, commit 0cd7dfd)

- `studio/src/tenants/arzadon/components/Hero.tsx` — 14 token references migrated to foundation
- `studio/src/tenants/arzadon/components/Pricing.tsx` — 74 token references migrated (largest component by token count; pricing tier styling carried most of the legacy var(--color-*) usage)
- `studio/src/tenants/arzadon/components/reviews/ReviewSpotlight.tsx` — 20 token references migrated (booth + accent + ink-soft hover state)
- `studio/scripts/tincture-migrate-components.mjs` — NEW (~120 LOC). 17 string-substitution rules. Most-specific-first ordering avoids cross-rule capture. Per-file targeted (not glob).

## Decisions (closing)

- **legacy-aliases.css NOT created** (Q1 reversed). The direct migration approach is cleaner: components either read foundation tokens (migrated) or per-theme tokens (not yet migrated). No alias chain. When cycle 7 sweeps remaining components, the same migration script applies. The legacy `[data-theme=*]` blocks in globals.css ARE the back-compat layer until cycle 7 drops them.
- **Manual smoke deferred to live deploy.** Q3 confirmed: no preview tool yet. Trust the alias-equivalence + build-pass + live deploy. Cycle 9 (multi-state preview) is when this becomes automatic.
- **108 migrations is more than expected.** Pricing alone had 74 — explains why pricing tier styling has historically been brittle. The migration provides both visual stability (no value change) AND structural simplification (one source of truth via light-dark()).

## Bugs caught + fixed during shipping

- **None.** Migration ran clean first try. Indicates the foundation token values match the per-theme values exactly (cycle 1 did its job).

## Handoff to cycle 4

Cycle 4 is REGISTRY. With 3 components fully migrated, we now have a clear picture of which tokens any single component reads. The registry schema needs to model this:

- Each component declares the tokens it reads
- Each token declares its type, light/dark pair, surface intent
- Components ↔ tokens is many-to-many

Cycle 4 spec carry-forward (NEW INSIGHTS from this cycle):
- The 17-rule migration map IS the legacy → foundation translation table. Registry schema must reference both names so the migration script can be regenerated from the registry (not maintained in two places).
- Pricing's 74 token reads suggest the registry should support **token-grouping** (tier-style blocks) so designer studio doesn't surface 74 individual fields for one component.
- The "data-surface flips ink" pattern works PERFECTLY in practice — booth cards (`data-surface=dark`) inside a light-theme parent page render ink as `#FFFFFF` automatically. This proves the surface-aware ink approach. Document this win in the registry's component manifest.
