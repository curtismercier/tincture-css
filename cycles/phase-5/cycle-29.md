---
id: cycle-29
phase: 5
title: Font bridge + SectionHeading + Eyebrow to tokens
status: done
created: 2026-04-30
shipped: 2026-04-30
commits:
  arzadon: 73ac208
verification: build clean; --weight-heading:700 live in container CSS; visual pending (Curtis review)
---

# Cycle 29 — Font bridge + first shared component migrations

## What shipped

**Font bridge** — closes the gap where `--font-display` and `--font-body` were dead tokens.

Root cause: `--font-display: "Helvetica Neue"...` in the Tincture `:root` block couldn't reference `var(--font-sans)` (Archivo, from Next/font) because Next/font CSS vars are scoped to the layout wrapper `<div>`, not `:root`.

Fix: add `[--font-display:var(--font-sans)] [--font-body:var(--font-sans)]` to the layout wrapper div's className. This is the only element where `var(--font-sans)` is in scope. Mood font-swapping now works via `[data-mood="X"] { --font-display: var(--font-serif); }` on any descendant.

**Registry additions:**
- `--weight-heading: 700` — section h2/h3 weight (distinct from `--weight-display: 900` for hero h1)
- `--track-eyebrow` corrected: 0.15em → 0.3em (matches actual site usage)

**SectionHeading.tsx** — all 3 size variants + lede now token-driven:
- `text-3xl/4xl/5xl/6xl` → `text-[length:var(--type-display-3/2/1)]`
- `font-bold` → `font-[var(--weight-heading)]`
- `tracking-tight` → `tracking-[var(--track-display)]`
- `leading-[1.05]` → `leading-[var(--leading-tight)]`
- `text-lg` (lede) → `text-[length:var(--type-body-1)]`
- Added: `[font-family:var(--font-display)]`

**Eyebrow.tsx:**
- `text-sm` → `text-[length:var(--type-body-3)]`
- `tracking-[0.3em]` → `tracking-[var(--track-eyebrow)]`

## Key constraint

The font bridge MUST be on the layout wrapper div, not in globals.css at body level and not in the Tincture codegen. This constraint is documented in `src/tenants/arzadon/globals.css` line ~176. Don't move it.
