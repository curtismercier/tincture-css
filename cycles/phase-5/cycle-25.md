---
id: cycle-25
phase: 5
title: Surface scanner + auto-fill codegen (plan deviation from "spacing axis")
status: done
created: 2026-04-30
shipped: 2026-04-30
commits:
  tincture-css: fe10d6e + b747bee
  arzadon: f682cb6 (scanner bug fixes)
note: >
  Original plan said "Add spacing axis." Session pivoted to surface scanner
  + auto-fill codegen fix because the cascade-reset bug was critical and the
  surface annotation gap was causing visible rendering bugs.
verification: scanner: 4 real findings, 1 false-positive; cascade reset verified via CDP
---

# Cycle 25 — Surface scanner + auto-fill codegen

## What shipped (instead of spacing axis)

**`src/cli/scan-surfaces.mjs`** — build-time scanner:
- Finds JSX sections with dark-bg patterns missing `data-surface="dark"` annotation
- Patterns: `bg-black/N`, `<Image fill>` + dark overlay, `data-tone="feature|brand-band"`, `bg-[var(--bg-dark*)]`
- Outputs file:line, pattern matched, suggested fix
- `--check` mode exits 1 for CI

**Codegen auto-fill fix** (critical):
- Codegen-v2 now emits reset cells for EVERY axis-value of EVERY axis a token declares
- Without this, `[data-surface="light"]` nested inside `[data-surface="dark"]` couldn't reset `--ink` back to dark slate
- This was the root cause of the megamenu white-on-white bug

## Why the plan deviated

The original "spacing axis" plan would have added `--space-section`, `--space-rhythm` etc. tokens. But the surface scanner was blocking correct rendering on existing pages — cascade reset was broken and causing visible layout bugs. Unblocking correct token resolution was higher priority than adding new spacing tokens.

**Spacing axis is now deferred to phase 6.** See cycle-34.md for the plan.

## Surface scanner findings (arzadon initial run)

| Finding | Root cause | Fix |
|---|---|---|
| Megamenu panel white-on-white | `bg-white` + no `data-surface` | `data-surface="light"` on panel |
| Navbar pill text invisible | `bg-black` pill inheriting dark ink | `data-surface="dark"` on pill |
| Header turning white | legacy `data-theme="light"` | `data-surface="light"` on `<header>` |
| 3 more sections | image-overlay + dark-band patterns | Sweep via scanner output |
