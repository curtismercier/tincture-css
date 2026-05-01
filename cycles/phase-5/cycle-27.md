---
id: cycle-27
phase: 5
title: Migrate Hero h1 to typography tokens (first consumer migration)
status: done
created: 2026-04-30
shipped: 2026-04-30
commits:
  arzadon: bc742b4
note: >
  Original plan said "Add motion tokens." Motion tokens are deferred (cycle 34).
  Session delivered first component migration instead — Hero h1 now consumes
  all four typography token axes, proving the system works end-to-end.
verification: visual check — h1 renders correctly at all breakpoints; Performance mood weight change visible
---

# Cycle 27 — Hero h1 typography migration

## What shipped

`src/tenants/arzadon/components/Hero.tsx` h1 now uses:
```tsx
className="text-[length:var(--type-display-1)] font-[var(--weight-display)] tracking-[var(--track-display)] leading-[var(--leading-tight)] ..."
```

Was: `text-[1.75rem] sm:text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]`

`--type-display-1` adjusted to `clamp(1.75rem, 6vw, 4.5rem)` → later corrected to `clamp(3rem, 8vw, 6rem)` when Performance mood applied (cycle 28).

## Why this matters

Before cycle 27: Performance mood's `weight-display: 900` and `type-display-1: clamp(3rem,8vw,6rem)` had no consumer — they declared values that nothing read. After cycle 27: the Hero h1 reads these tokens and the mood's intent is visible.

This is the proof-of-concept for the full consumer migration (cycle 30).

## Motion tokens note

Deferred. Components still hardcode `transition-all duration-300`. The planned `--duration-fast/normal/slow` and `--ease-out/in-out/spring` tokens were added to the globals.css `:root` block (as CSS custom properties, not via tincture registry). Motion axis migration requires: (1) adding motion tokens to registry, (2) codegen emitting motion cells, (3) sweep replacing hardcoded transitions. Estimated 1 cycle.
