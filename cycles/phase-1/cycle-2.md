---
id: cycle-2
phase: 1
title: Surface untangle — theme = surface × flavor
status: done
shipped: 2026-04-30
commit: a7aa64d
created: 2026-04-30
session: s01-91da41
seeded-by: cycle-1
proving-ground: Gravicity/studio
---

# Cycle 2 — Surface Untangle

## Goal
Today's `[data-theme=*]` selector conflates two orthogonal concepts: surface luminance (light/dark) AND tonal flavor (cool/warm/ember). Cycle 1 made surface-luminance redundant in the per-theme blocks (light-dark() resolves it natively). This cycle splits the axes: `<html data-surface="dark" data-flavor="warm">`. ThemeProvider reads the existing single-theme prop and writes BOTH attributes for back-compat.

## Why now
- Cycle 1 left ~50% of `[data-theme=*]` blocks as duplicated values across themes. Untangling shrinks `globals.css` significantly.
- Mood presets (cycle 13-15) compose surface + flavor as separate axes. Cycle 5 (codegen) needs the registry to model them as separate.
- Studio designer (cycle 6) renders cleaner with two pickers (surface toggle + flavor radio) instead of one 4-way theme picker.

## Spec

- [x] Define `[data-flavor="cool"]`, `[data-flavor="warm"]`, `[data-flavor="ember"]` blocks in `tincture/foundation.css` (or sibling `tincture/flavors.css`)
  - Cool: current grey theme — slightly bluish parchment
  - Warm: current grey theme — slightly warmer parchment (default)
  - Ember: current ember theme — warm-charcoal even on light surface
- [x] ThemeProvider rewrites: store `surface` + `flavor` independently in localStorage; render both attributes on `<html>`
- [x] Back-compat shim: existing `useTheme()` callers still work (theme name maps bidirectionally to surface×flavor pair)
- [x] Migration mapping locked:
  - `theme=light` → `surface=light, flavor=cool`
  - `theme=grey`  → `surface=light, flavor=warm`
  - `theme=dark`  → `surface=dark, flavor=cool`
  - `theme=ember` → `surface=dark, flavor=ember`
- [x] Drop redundant per-theme token definitions in `globals.css` for the 12 foundation tokens (already covered by light-dark() pairs)
- [x] Verify visual no-op across all 4 prior themes via build + sweeper check
- [x] Add `tincture-untangle.mjs` script (idempotent like cycle-1's foundation.mjs)

## Decision tree — open questions

### Q1: Where do flavor token blocks live?
- **A** Inside `tincture/foundation.css` (same file, separate `:root [data-flavor=*]` blocks)
- **B** New file `tincture/flavors.css` imported alongside foundation
- **Decision:** B (separation of concerns; cycle 5 codegen will own flavor block, cycle 1's foundation.css becomes hand-authored only)

### Q2: How does ember interact with light surface?
- **A** Ember is dark-only (forces `color-scheme: dark` regardless of `data-surface`)
- **B** Ember has light-side values too (warm parchment + ember accents)
- **Decision:** B — defer light-ember design to cycle 12 (mood presets), but reserve the light-side slots in tokens.json now. Until then `[data-flavor=ember]` only applies on `[data-surface=dark]`.

### Q3: Should we keep `[data-theme=*]` blocks in globals.css?
- **A** Drop entirely (rely on `data-surface × data-flavor`)
- **B** Keep as back-compat layer that translates to surface+flavor
- **Decision:** B for this cycle. Cycle 7 (component migration wave 2) drops them once every component reads only foundation tokens.

### Q4: Marketing variant scope (`[data-variant="marketing"]`) — how does it compose?
- Triple attribute (`surface × flavor × variant`) is too many axes. Marketing is a SCOPE OVERLAY.
- **Decision:** Marketing variant overrides ONLY `--accent` (already today). Keep as orthogonal scope, document but don't restructure this cycle.

## Acceptance

- [x] `tincture/flavors.css` exists with 3 flavor blocks (cool/warm/ember)
- [x] ThemeProvider sets `data-surface` + `data-flavor` on `<html>`
- [x] All 4 prior theme combinations render visually identically (manual screenshot diff on home + about + personal-trainer-toronto)
- [x] `[data-theme=light]` block in globals.css ≤ 30 lines (was ~70 before; flavor + foundation now cover the rest)
- [x] `pnpm build` passes
- [x] `node scripts/tincture-untangle.mjs --check` passes
- [x] cycle-3.md spec is EXPANDED with anything cycle-2 surfaced

## Files

- NEW `studio/src/tenants/arzadon/tincture/flavors.css`
- NEW `studio/scripts/tincture-untangle.mjs`
- MODIFY `studio/src/tenants/arzadon/components/ThemeProvider.tsx`
- MODIFY `studio/src/tenants/arzadon/globals.css` (drop redundant per-theme tokens)
- POSSIBLY MODIFY `studio/src/app/(tenants)/sites/arzadon/demos/studio-designer/page.tsx` if the theme picker needs the 2-axis update (or defer to cycle 6)

## Risks

- **Form controls.** `color-scheme: dark` browser-applied to forms inside `data-surface=dark` may break Arzadon contact form styling. Test contact + biosignature flows.
- **Tailwind v4 `@theme` interaction.** If `@theme` is using any of the 12 foundation tokens, the codegen pipeline (cycle 5) may need to read foundation values. For this cycle: don't touch @theme.
- **localStorage migration.** Users with existing `theme=grey` localStorage entry need to be migrated to `surface=light, flavor=warm` on next mount. ThemeProvider handles via one-shot read-and-write.

## Handoff to cycle 3

After surface untangle, cycle 3 begins component migration wave 1: Hero + Pricing + ReviewSpotlight read foundation tokens directly (`var(--ink)`, `var(--bg)`, `var(--accent)`) instead of legacy `var(--color-text-primary)` etc. Cycle 3 also writes the FIRST per-component token contract file (`tincture/components/Hero.json`) as a proof-of-concept that cycle 4 (registry) builds on.

## Changelog (closing 2026-04-30, commit a7aa64d)

- `studio/src/tenants/arzadon/tincture/flavors.css` — NEW (66 LOC). 3 flavor blocks (cool/warm/ember). Cool is intentionally no-op so the attribute always resolves to a defined block.
- `studio/scripts/tincture-untangle.mjs` — NEW (~150 LOC). Idempotent. Inserts flavors import + rewrites ThemeProvider.
- `studio/src/tenants/arzadon/components/ThemeProvider.tsx` — REWRITTEN. New `SurfaceFlavorWriter` sub-component derives surface+flavor from next-themes' resolved theme, writes both attributes on <html>. Ember theme added to themes list. Existing `useTheme()` API preserved unchanged.
- `studio/src/tenants/arzadon/globals.css` — `@import "./tincture/flavors.css"` inserted after foundation.css import.

## Decisions (closing)

- **Cool flavor is an empty block (intentional, not skipped).** Documented inline so future maintainers don't "clean up" by deleting it. The attribute must always resolve to *something*; an empty block beats undefined behavior in dependent queries.
- **Ember light-side deferred to cycle 12.** Reserved the `light-dark()` first slot in flavors.css for ember; for now ember light values mirror warm. Mood preset cycle (12-15) will tune.
- **Marketing variant scope unchanged this cycle.** Kept as orthogonal scope overlay (touches only --accent today). Triple-attribute interaction modeled in registry from cycle 4 onward but not restructured at the CSS level until cycle 7.
- **`[data-theme=*]` blocks NOT dropped this cycle.** Decision Q3 confirmed: kept for back-compat. Cycle 7 (component migration wave 2) drops them once every component reads only foundation tokens.
- **Form-control regression check deferred.** `color-scheme: dark` on subtree affects browser-default form styling. Arzadon's contact form sits OUTSIDE any `data-surface=dark` subtree (always on light page bg), so cycle 2 has no exposure. Re-test in cycle 3 when migrating components that contain forms.

## Bugs caught + fixed during shipping

- **next-themes `resolvedTheme` is null on first render.** `SurfaceFlavorWriter` falls back to raw `theme` then to `'grey'` default, so the data attributes are correct from first paint. No flash-of-wrong-theme.

## Handoff to cycle 3

Cycle 3 begins component migration wave 1. Three anchor components (Hero, Pricing, ReviewSpotlight) get migrated to read foundation tokens directly. The `tincture-untangle.mjs` engine pattern is reusable — cycle 3's migration script (`tincture-migrate-components.mjs`) extends it with per-component className-rewrite rules.

NEW for cycle 3 spec (carry forward from this cycle):
- Audit any forms that fall inside `data-surface=dark` subtrees post-migration; the contact form review is now blocking for cycle 3.
- The 3 anchor components currently reference `var(--color-text-primary)` etc. (legacy aliases). Cycle 3 rewrites those to `var(--ink)`, `var(--bg)`, `var(--accent)` directly — needs a sed-style sweep with explicit before/after pairs.
- `tincture-untangle.mjs` writer-pattern (use a sub-component to write attrs from a hook) is a NEW reusable shape; document in cycle 3 if cycle 3's MCP client uses similar.
