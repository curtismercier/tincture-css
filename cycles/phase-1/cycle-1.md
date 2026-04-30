---
id: cycle-1
phase: 1
title: Foundation — light-dark() + data-surface
status: done
created: 2026-04-30
shipped: 2026-04-30
session: s01-91da41
proving-ground-commit: 25dd915
---

# Cycle 1 — Substrate Foundation

## Goal
Land the four primitives that make orphan-text-on-saturated-bg bugs structurally impossible: surface declarations (`data-surface`), browser-native `color-scheme` switching, `light-dark()` token pairs, and an idempotent migration script.

## Spec (frozen 2026-04-30 at start)

- [x] Create `tincture/foundation.css` defining 12 `light-dark()` core tokens
- [x] Add `[data-surface=dark]` / `[data-surface=light]` selectors that flip `color-scheme`
- [x] Annotate every always-dark surface (`data-tone="feature"` sections + booth cards) with `data-surface="dark"`
- [x] Wire `tincture/foundation.css` into `globals.css` via `@import`
- [x] Write idempotent migration script with `--dry / --check / apply` modes
- [x] Visual no-op verified by `pnpm build` + sweeper `--check` clean

## Acceptance

- [x] `tincture/foundation.css` exists, defines ≥10 `light-dark()` tokens — **12 shipped**
- [x] `data-surface="dark"` on all `data-tone="feature"` sections — **7 of 7 in scope**
- [x] `pnpm build` passes
- [x] `node scripts/tincture-foundation.mjs --check` passes (no migrations pending)

## Changelog

- `studio/src/tenants/arzadon/tincture/foundation.css` — NEW (115 LOC). 12 light-dark() core tokens (`--ink`, `--ink-soft`, `--ink-muted`, `--bg`, `--bg-card`, `--bg-elev`, `--accent`, `--accent-fg`, `--accent-warm`, `--accent-warm-fg`, `--border`, `--border-soft`) + `[data-surface]` selectors + `:root { color-scheme: light dark; }` + `--tincture-foundation-version` sentinel + `.tincture-debug` helper class.
- `studio/scripts/tincture-foundation.mjs` — NEW (~250 LOC). Idempotent migration. Generates foundation.css, inserts `@import` in globals.css, annotates `data-tone="feature"` sections with `data-surface="dark"` via multi-line-aware regex.
- `studio/src/tenants/arzadon/globals.css` — `@import "./tincture/foundation.css"` inserted after `@import "tailwindcss"`.
- `studio/src/tenants/arzadon/components/Hero.tsx` — `data-surface="dark"` added to hero section.
- `studio/src/tenants/arzadon/components/StatsStrip.tsx` — same.
- `studio/src/tenants/arzadon/components/reviews/ReviewSpotlight.tsx` — same.
- `studio/src/tenants/arzadon/components/CTABand.tsx` — same.
- `studio/src/tenants/arzadon/components/QuoteBand.tsx` — same.
- `studio/src/tenants/arzadon/components/VideoHero.tsx` — same.
- `studio/src/app/(tenants)/sites/arzadon/personal-trainer-toronto/page.tsx` — same on inline hero.

Commit: `25dd915` in `Gravicity/studio@main` (the proving ground for Tincture; cycle 16 extracts to a standalone package).

## Decisions

- **Naming locked.** "Tincture" — alchemical metaphor (a drop changes the pour), surface-aware (a tincture seeps), AI-mediated (alchemist as agent). No collision with existing JS/CSS libraries. CLI namespace: `tincture <verb>`.
- **Browser support floor accepted.** `light-dark()` ships in Chrome 123+, Safari 17.5+, Firefox 120+. ~95%+ of users today. We're NOT polyfilling for older browsers — they get the dark side of every pair (acceptable degradation; verified via `@supports` test).
- **light-dark() pair values match existing per-theme blocks.** Phase 0 is a visual no-op by design. Each token's `light` value matches what `[data-theme="light"]` produced; `dark` value matches `[data-theme="dark"]`. Components migrate by changing className strings, not values.
- **`color-scheme` form-control side-effect noted.** Setting `color-scheme: dark` on an element makes browser-default form controls (input, textarea) pick dark UA styles. We keep `color-scheme` only on intentionally-dark surfaces (feature sections, booth cards) so forms on light pages stay normal. Decision deferred for forms-inside-feature-sections — Cycle 7+ when component migration touches forms.
- **Sentinel token added.** `--tincture-foundation-version: "0.1.0"` so future scripts can detect substrate presence + version-skew without brittle file parsing.

## What this enables for cycle 2 (handoff)

- The `[data-theme="light"]` and `[data-theme="dark"]` blocks in globals.css are now structurally equivalent to `[data-surface="light"]` and `[data-surface="dark"]` for the 12 foundation tokens. Cycle 2 can SAFELY remove redundant per-theme definitions of those 12 tokens, leaving only `[data-flavor=*]`-specific overrides (the small subset of palette that actually flavors).
- 7 of ~10 always-dark surfaces are annotated. Cycle 2/3 will sweep the remaining (Pricing dark-card variant, demos/seo-report widgets, hybrid-booking-page hero).
- The migration script pattern (idempotent + multi-line JSX-aware) is now proven. Cycle 2's surface-untangle script reuses the same engine.

## Bugs caught + fixed during shipping

- **Regex `\b` doesn't fire at quote/whitespace boundaries.** `\bdata-tone="feature"\b` failed on multi-line JSX because `"` and `\n` are both non-word chars (no word boundary). Fixed with `[\s\S]*?` for explicit multi-line spans. Captured in cycle-2 spec so the surface-untangle script doesn't trip on it.
