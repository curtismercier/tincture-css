---
id: cycle-24
phase: 5
title: Add typography axis (16 tokens)
status: done
created: 2026-04-30
shipped: 2026-04-30
commits:
  arzadon: cf3ae7b
verification: registry validates; foundation.css emits all 16; dormant (consumers not yet wired)
---

# Cycle 24 — Typography axis

## What shipped

16 typography tokens added to the arzadon registry:

| Token | Kind | Axes | Value |
|---|---|---|---|
| `--font-display` | typography | [] | "Helvetica Neue" fallback (bridge via layout div in cycle 29) |
| `--font-body` | typography | [] | "Helvetica Neue" fallback (bridge via layout div in cycle 29) |
| `--font-mono` | typography | [] | ui-monospace stack |
| `--weight-display` | typography | [surface] | 900 (both surfaces; anti-aliasing compensation) |
| `--weight-body` | typography | [] | 400 |
| `--weight-emphasis` | typography | [] | 600 |
| `--type-display-1` | typography | [] | clamp(1.75rem, 6vw, 4.5rem) → updated to clamp(3rem, 8vw, 6rem) in cycle 27 |
| `--type-display-2` | typography | [] | clamp(2.25rem, 5.5vw, 3.75rem) |
| `--type-display-3` | typography | [] | clamp(1.5rem, 3vw, 2.25rem) |
| `--type-body-1` | typography | [] | 1.125rem |
| `--type-body-2` | typography | [] | 1rem |
| `--type-body-3` | typography | [] | 0.875rem |
| `--leading-tight` | typography | [] | 1.0 |
| `--leading-relaxed` | typography | [] | 1.6 |
| `--track-display` | typography | [] | -0.03em |
| `--track-eyebrow` | typography | [] | 0.15em → corrected to 0.3em in cycle 29 |

## Decisions

1. **Typography tokens are DORMANT at cycle 24.** Registry declares the vocabulary; component migration is deferred. This lets moods compose type deltas before any component is migrated.
2. **`--weight-display` is the only surface-aware typography token.** Dark surfaces eat stem width via anti-aliasing; 900 on dark compensates. All other type tokens are surface-invariant.
3. **`--font-display` / `--font-body` cannot reference Next/font vars at `:root`.** The CSS variable for Archivo (`--font-sans`) is scoped to the layout wrapper div, not `:root`. Bridging via `[--font-display:var(--font-sans)]` on that div is the solution (done in cycle 29).

## What was deferred

- Component migration → cycle 27+ (Hero h1 first, full sweep in cycle 30)
- Font bridge → cycle 29
- `--weight-heading: 700` (section-heading weight) → added in cycle 29
