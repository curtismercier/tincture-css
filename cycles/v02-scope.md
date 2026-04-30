# Tincture v0.2 — scope

**Trigger:** Curtis self-audit pushback 2026-04-30 — "you went weak on this — what about typography — every single component."
**Audit:** `../arzadon-fitness/.soma/reports/tincture-cycle-audit-2026-04-30.md`
**Status:** scope-defined; no cycles started

---

## Why v0.2

v0.1 ships a color-only substrate. The mood vocabulary (4 token kinds: bg, ink, accent, border) cannot express the moods Curtis named:

- **"Performance"** = vivid red + heavy weights + tight spacing + sharp radius + dramatic shadows + fast motion
- **"Transformation"** = deep crimson + serif headlines + generous spacing + medium radius + subtle shadows + slow motion
- **"Editorial"** = warm parchment + serif display + loose spacing + organic radius + flat shadows + slow motion
- **"Clinical"** = cool blue + medium weights + tight spacing + sharp radius + flat shadows + instant motion

Each mood is a **coordinated 30+ token delta**, not a 7-token color tweak.

v0.2 closes the gap.

---

## Token kinds (target registry)

### color (already in v0.1)
- `--ink`, `--ink-soft`, `--ink-muted`
- `--bg`, `--bg-card`, `--bg-elev`
- `--accent`, `--accent-fg`, `--accent-warm`
- `--border`, `--border-soft`
- 11 semantic tokens, 21 primitives

### typography (NEW in v0.2)
```
--font-display          /* headings */
--font-body             /* body copy */
--font-mono             /* code, eyebrows */
--type-display-1..4     /* size scale: hero / page / section / card */
--type-body-1..3        /* size scale: lead / default / caption */
--weight-display        /* 700-900 typically */
--weight-body           /* 400-500 typically */
--weight-emphasis       /* 600-700 */
--leading-tight         /* 1.05-1.1 for display */
--leading-relaxed       /* 1.5-1.7 for body */
--track-display         /* -0.02em to 0 */
--track-eyebrow         /* 0.15em uppercase */
```
~13 tokens.

### spacing (NEW in v0.2)
```
--space-section         /* py-{n} on every section */
--space-rhythm          /* gap between siblings inside section */
--space-block           /* margin between major content blocks */
--space-tight           /* dense: cards, lists */
--space-loose           /* generous: hero, feature */
--space-content-max     /* max-w of content column */
```
~6 tokens.

### radius (NEW in v0.2)
```
--radius-sharp          /* 0 or 2px — clinical/aggressive */
--radius-soft           /* 8-12px — default */
--radius-pill           /* 9999px — buttons, pills */
--radius-organic        /* 24px+ — luxurious, editorial */
```
4 tokens.

### shadow (NEW in v0.2)
```
--shadow-flat           /* none or 1px hairline */
--shadow-lifted         /* default elevation */
--shadow-dramatic       /* hero / featured cards */
```
3 tokens.

### motion (NEW in v0.2)
```
--motion-instant        /* 0ms — clinical */
--motion-snap           /* 150ms ease-out — performance */
--motion-smooth         /* 300ms ease-in-out — default */
--motion-slow           /* 500ms cubic-bezier — luxurious */
```
4 tokens.

### brand-lock (NEW in v0.2)
```
--brand-mark-primary    /* #EF4123 — IMMUTABLE */
--brand-mark-secondary  /* #B82339 — IMMUTABLE */
--brand-mark-fg         /* #FFFFFF — IMMUTABLE */
```
3 tokens. Marked immutable in registry — moods cannot override.

**Total target registry: ~50 tokens (4× v0.1).**

---

## Mood deltas across all surfaces

Example — `performance.json`:
```json
{
  "id": "performance",
  "name": "Performance — vivid + tight + dramatic",
  "tokens": {
    "accent":         { "lightValue": "#E62719", "darkValue": "#FF3A1A" },
    "weight-display": { "value": "900" },
    "weight-body":    { "value": "500" },
    "leading-tight":  { "value": "1.0" },
    "track-display":  { "value": "-0.03em" },
    "space-section":  { "value": "5rem" },
    "space-rhythm":   { "value": "1rem" },
    "radius-soft":    { "value": "4px" },
    "radius-pill":    { "value": "9999px" },
    "shadow-lifted":  { "value": "0 8px 32px rgba(230,39,25,0.25)" },
    "motion-snap":    { "value": "100ms cubic-bezier(0.4, 0, 0.2, 1)" },
    "type-display-1": { "value": "clamp(3rem, 8vw, 6rem)" }
  }
}
```

Example — `transformation.json`:
```json
{
  "id": "transformation",
  "name": "Transformation — crimson + generous + slow",
  "tokens": {
    "accent":         { "lightValue": "#A8112B", "darkValue": "#C41E3A" },
    "font-display":   { "value": "'Playfair Display', Georgia, serif" },
    "weight-display": { "value": "700" },
    "weight-body":    { "value": "400" },
    "leading-tight":  { "value": "1.15" },
    "track-display":  { "value": "-0.01em" },
    "space-section":  { "value": "10rem" },
    "space-rhythm":   { "value": "2.5rem" },
    "radius-soft":    { "value": "16px" },
    "radius-organic": { "value": "32px" },
    "shadow-lifted":  { "value": "0 24px 64px rgba(0,0,0,0.08)" },
    "motion-smooth":  { "value": "600ms cubic-bezier(0.16, 1, 0.3, 1)" }
  }
}
```

Each mood is a **coordinated identity**, not a palette swap.

---

## Cycle plan (v0.2)

| Cycle | Title | Verification |
|---|---|---|
| 21 | Typography tokens — registry + foundation.css emit | `pnpm tincture:codegen && grep --font-display _generated/foundation.css` |
| 22 | Component sweep — typography migration (Tailwind utility → token) | mosaic capture before/after on Hero + Pricing |
| 23 | Spacing tokens — registry + emit + Tailwind plugin or arbitrary values | mosaic capture on density-sensitive sections |
| 24 | Radius + shadow tokens — emit + sweep | mosaic capture on cards |
| 25 | Motion tokens — emit + sweep transitions | scrubbing capture on hover states |
| 26 | Brand-lock primitives — registry marks immutable; engine refuses overrides | `tincture mood apply <bad-mood>` should error |
| 27 | Mood: `performance` — full 30-token delta | `tincture mood apply performance && capture` |
| 28 | Mood: `transformation` — full 30-token delta | same |
| 29 | Mood: `editorial-warm` v2 — extend v0.1 to all surfaces | same |
| 30 | Mood: `clinical` v2 — extend | same |
| 31 | Visual-verification protocol — mandatory mosaic before every commit | scripts/tincture-verify-visual.mjs |
| 32 | Migration sweep — finish cycle 7 honestly + audit globals.css for new specificity bugs | grep clean |
| 33 | Studio designer — typography + spacing pickers | manual UI test |
| 34 | npm publish — actually run `npm publish` for @tincture/core@0.2.0 | `npm install @tincture/core@0.2.0` in fresh project succeeds |

**Discipline contracts:**
1. **One cycle = one commit = one verifiable outcome.** No batching.
2. **Visual mosaic required** before any cycle marked "done" if it touches CSS or component code.
3. **`pnpm build` is necessary, NOT sufficient.** The acceptance test is the mosaic.
4. **Globals.css scanned** for higher-specificity rules BEFORE any token-migration sweep.
5. **Self-audit at cycle 27** (halfway) — if v0.2 is drifting toward burst-mode, stop and re-spec.

---

## Open decisions (need Curtis input — not blocking, but flag at v0.2 kickoff)

1. **Display font choice** — currently inherits Tailwind's default. Options: keep system stack vs ship Playfair / Inter / something custom for arzadon.
2. **Brand-lock enforcement level** — soft warning vs hard error when a mood tries to override `--brand-mark-*`.
3. **Mood naming** — Curtis named "Performance" and "Transformation" verbally. Want to pin those names, or aim for adjective-pairs ("vivid-tight", "deep-generous")?
4. **Spacing units** — rem (current Tailwind default) vs `clamp()` for fluid scaling vs `cqi/cqb` for container queries. v0.2 default = rem; clamp where headlines need fluid.
5. **Animation primitive** — duration tokens only, vs full `transition: all <duration> <easing>` shorthand tokens. Recommend duration + easing as separate tokens; components compose.
