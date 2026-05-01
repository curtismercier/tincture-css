---
id: cycle-31
phase: 5
title: Mood — `transformation` (full multi-axis delta)
status: prelight
created: 2026-04-30
updated: 2026-05-01
parent_doc: ../v02-scope.md
---

# Cycle 31 — Mood: `transformation`

## Status

**prelight** — spec framework written; blocked on design decisions from Curtis
before implementation starts. Do not start this cycle until all prelight items
are resolved.

---

## Prelight checklist

> Resolve ALL of these before writing the mood JSON or touching any code.

- [ ] **D1 — Display font** — Transformation was described as "deep crimson +
  serif headlines + generous spacing." Is a serif font in scope? If yes: which
  font, and is it loaded in `layout.tsx` via `next/font`? (Font bridge
  constraint: `--font-display` only resolves via the layout wrapper div —
  see `consumers/arzadon-fitness.md`.)
  
- [ ] **D5 — Ordering** — Should this be cycle 31, or does clinical-v2 (the
  original v02-scope plan for this slot) come first? Curtis to decide.

- [ ] **D6 — Mood reset** — Performance mood is currently applied on
  arzadon.gravicity.io. Reset to baseline before starting:
  `node studio/scripts/tincture-mood-v2.mjs reset`
  Confirm: is the baseline snapshot at `tincture/registry.baseline.json` up to
  date? (It was saved when Performance was first applied in cycle 28.)

- [ ] **Bug fix first** — Three `data-tone="*"` specificity bugs remain live
  (prose, surface, brand-band — same shape as the feature bug fixed in
  `ba99eaf`). Fix these before applying any mood so the visual preview is
  accurate. ~10 min, fold into a standalone commit or prefix to this cycle.

---

## Intent

The Transformation mood is the **second showcase demo** after Performance.
Where Performance is tight, red, heavy, and fast — Transformation should feel:
earned, warm, generous, climactic.

Rough token delta direction (to be confirmed by Curtis):
- `--accent` → deep crimson (e.g. `#8B1A1A` light / `#C0392B` dark)
- `--weight-display` → possibly lighter than Performance's 900 (e.g. 700-800)
- `--space-section` → generous (feature sections breathe more)
- `--leading-tight` → slightly looser (1.05–1.1 vs Performance's 1.0)
- `--font-display` → TBD: serif if D1 resolves yes, else Archivo
- `--radius-soft` → softer than Performance (e.g. 8px vs 4px)
- `--shadow-lifted` → warm glow tint on dark (not neutral shadow)

---

## Implementation spec (fill in after prelight)

### Mood JSON

File: `studio/src/tenants/arzadon/tincture/moods/transformation.json`

```jsonc
{
  "id": "transformation",
  "version": "0.2",
  "tokens": {
    // Fill in after D1 + D6 resolved
  }
}
```

### Verification plan

1. `node studio/scripts/tincture-mood-v2.mjs reset` (confirm clean baseline)
2. Apply: `node studio/scripts/tincture-mood-v2.mjs apply transformation`
3. CDP eval: check `--accent`, `--weight-display`, `--space-section` on live
   `[data-surface="light"]` and `[data-surface="dark"]` elements
4. Mosaic capture: screenshot hero + CTA band + card section in both surfaces
5. Read mosaic — confirm warmth reads visually, no invisible text, spacing
   feels generous vs Performance
6. Reset: `node studio/scripts/tincture-mood-v2.mjs reset`
7. Commit mood JSON only — do NOT commit registry.json deltas (mood deltas are
   in the mood file, not baked into the registry)

### Acceptance criteria

- [ ] `transformation.json` validates (`pnpm tincture validate`)
- [ ] Applied mood changes at least: accent color, one typography token, one
  spacing token (proves multi-axis, not color-only)
- [ ] CDP eval confirms computed values match delta
- [ ] Mosaic captured and read — no invisible text, visual intent legible
- [ ] Reset to baseline succeeds after apply (idempotent round-trip)
- [ ] One commit: `feat(tincture): cycle-31 — transformation mood`

---

## Seams

- **Upstream:** cycle-30 (heading sweep done — all h-tags respond to mood)
- **Downstream:** cycle-32 (clinical-v2 mood)
- **Registry:** `studio/src/tenants/arzadon/tincture/registry.json`
- **Mood engine:** `studio/scripts/tincture-mood-v2.mjs`
- **Existing moods:** `studio/src/tenants/arzadon/tincture/moods/` (reference
  `performance.json` for delta format)
- **Bug fix target:** `studio/src/tenants/arzadon/globals.css` — three
  `data-tone="*"` rules (prose, surface, brand-band)

---

## Decisions log

*(Fill in after cycle closes)*
