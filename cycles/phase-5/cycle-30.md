---
id: cycle-30
phase: 5
title: Full heading typography sweep (83 files, 382 lines)
status: done
created: 2026-05-01
shipped: 2026-05-01
commits:
  arzadon: 3d9ed42
verification: build clean (smoke passed); scanner: 408 heading-context → 1 remaining (intentional mono label)
---

# Cycle 30 — Heading typography sweep

## What shipped

**`scripts/tincture-apply-typography.mjs`** — auto-migration script for heading typography:
- Only processes lines containing `<h1/h2/h3/h4` tags (body text never touched)
- Collapses responsive size ladders (e.g. `text-4xl md:text-5xl`) to single fluid tokens
- Replaces weight/tracking/leading with token equivalents
- Adds `[font-family:var(--font-display)]` to heading lines that don't have `font-serif`
- Modes: `--dry` (default), `--apply`, `--check` (CI gate), `--file <path>`

**Applied to arzadon:** 382 changes across 83 files. All structural `<h1/h2/h3/h4>` tags now use Tincture tokens.

**`scripts/tincture-scan-typography.mjs`** — scanner updated:
- Fixed false-positive: `{feat.title}` in template expressions no longer triggers "heading context"
- HEADING_CONTEXT regex now matches only actual `<h*>` tags and heading component names

## Mapping applied

| Before | After | Tag |
|---|---|---|
| `text-4xl md:text-6xl lg:text-7xl` | `text-[length:var(--type-display-1)]` | h1 |
| `text-4xl md:text-5xl` | `text-[length:var(--type-display-2)]` | h2 |
| `text-3xl md:text-4xl` | `text-[length:var(--type-display-3)]` | h2/h3 |
| `text-xl / text-lg` | `text-[length:var(--type-body-1)]` | h3 |
| `font-bold` on h1 | `font-[var(--weight-display)]` | h1 |
| `font-bold` on h2/h3 | `font-[var(--weight-heading)]` | h2/h3 |
| `tracking-tight` | `tracking-[var(--track-display)]` | any h* |
| `leading-tight` / `leading-[1.05]` | `leading-[var(--leading-tight)]` | any h* |
| `leading-relaxed` | `leading-[var(--leading-relaxed)]` | any h* |

## What's NOT yet migrated (900 lines remain in scanner)

- Body copy `<p>` sizes (intentional — body sizing is a separate pass)
- Component internals (`StatsStrip` number displays, `Pricing` amounts, etc.)
- `font-bold` on `<p>` and `<span>` (body emphasis — not heading-weight)
- 1 intentional h3 mono label (`text-xs font-mono tracking-wider` — UI label, not a heading)

## Visual delta

Fluid `clamp()` replaces stepped Tailwind breakpoints. Headings are slightly larger at desktop (up to 3.75rem instead of 3rem for h2). Leading is 1.0 on all headings (was 1.05 on some). Both are improvements. Moods can now override ALL heading sizes, weights, and font-family from a single delta.
