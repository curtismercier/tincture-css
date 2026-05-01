---
id: cycle-29
phase: 5
title: Font bridge + SectionHeading + Eyebrow to tokens
status: done
created: 2026-04-30
shipped: 2026-04-30
commits:
  arzadon: 73ac208
verification: build clean; --weight-heading:700 confirmed; visual verified via session s01-de76c7
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

## Post-cycle update (s01-de76c7, 2026-05-01)

**Font stack decision made.** The bridge initially pointed `--font-display` → Archivo (same as body — both tokens identical, no typographic contrast). In s01-de76c7 this was resolved:

- `--font-display` → **Oswald** (condensed sans, 400–700) via `--font-display-stack` CSS var
- `--font-serif` → **Marcellus** (400 only) — accent/pullquote role, NOT primary display
- `--font-body` → Archivo (unchanged)
- Archivo weights expanded to 400–900 (was 400–700; weight-display:900 was synthesised)
- Eyebrow component: `font-mono` → `[font-family:var(--font-display)]` + bumped to type-body-2 + semibold

Commits: `f5840c0` (Marcellus first attempt) → `b5a1e2f` (Oswald final). Oswald is now the canonical display font.

**D1 resolved.** Open decision "Display font choice" from v02-scope.md is now answered: Oswald for display, Marcellus for accent, Playfair Display queued for Transformation mood override.
