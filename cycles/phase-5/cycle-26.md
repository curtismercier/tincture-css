---
id: cycle-26
phase: 5
title: Brand-lock primitives + mood engine v0.2 + Performance mood
status: done
created: 2026-04-30
shipped: 2026-04-30
commits:
  arzadon: 3de2532
note: >
  Original plan said "Add radius + shadow tokens."
  Radius + shadow tokens were already in the registry from the v0.2 migration.
  Session delivered brand-lock enforcement + the v0.2 mood engine instead.
  See tokens in registry: --radius-sm/md/lg/full, --shadow-flat/lifted/dramatic.
verification: validator rejects locked-token mood delta; Performance preview shows 10-cell delta
---

# Cycle 26 — Brand-lock primitives + mood engine v0.2

## What shipped

**Brand-lock tokens** (IMMUTABLE in registry):
- `--brand-mark-primary: #EF4123` — Arzadon orange-red (SVG source of truth)
- `--brand-mark-secondary: #B82339` — brand-red on dark contexts
- `--brand-mark-fg: #FFFFFF` — ink on brand-mark surface

Schema validator (`schema.mjs`) rejects any mood delta that targets a `locked: true` token.

**Mood engine v0.2** (`scripts/tincture-mood-v2.mjs`):
- `list` — show available moods with delta count + doc
- `preview <name>` — show what changes without applying
- `apply <name>` — write mood deltas into registry; save baseline on first apply
- `reset` — restore from `registry.baseline.json`
- Multi-axis delta format: `{ "token-id": { "values": { "default": X, "surface=dark": Y } } }`

**Performance mood JSON** (`moods/performance.json`):
- 7 token deltas: accent (vivid reds), weight-display (900 both surfaces), leading-tight (1.0), track-display (-0.03em), type-display-1/2 (scaled sizes), shadow-lifted (glow on dark)
- Applied as demo in cycle 28

## Note on radius + shadow

These were NOT new in this cycle — they were added as part of the v0.2 registry in cycles 21-23. The original plan's "cycle 26 = radius + shadow" was based on a pre-v0.2 plan where they didn't exist yet. They're done:
- `--radius-sm/md/lg/full` — in registry
- `--shadow-flat/lifted/dramatic` — in registry, surface-aware on dark
