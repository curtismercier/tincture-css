# Tincture v0.2 — multi-axis substrate

**Trigger:** Curtis self-audit on v0.1 — "what about the layers were seams — did our light-dark() consider any layer below — not just the background"
**Predecessor doc:** v0.1 audit at `cycles/audits/2026-04-30-cycle-1-20-audit.md`
**Architecture pivot log:** `cycles/audits/2026-04-30-architecture-pivot.md`
**Status:** scope defined; cycles 21-30 queued

---

## What v0.1 got wrong (one sentence)

`light-dark()` solved one axis (surface luminance) and we treated it as if it were the architecture, when it was always one selector for one layer of a multi-layer system.

## The seams that exist

Every token in a real substrate sits at the intersection of orthogonal layers. The arzadon proving ground revealed at least six:

```
  ┌────────────────────────────────────────────────────────────┐
  │  6. MOOD       — coordinated delta over the registry       │  ← top
  │  5. TONE       — data-tone (feature/prose/surface/brand)   │
  │  4. ELEVATION  — data-elevation (flat/lifted/dramatic)     │
  │  3. FLAVOR     — data-flavor (cool/warm/ember)             │
  │  2. SURFACE    — data-surface (light/dark)                 │
  │  1. BRAND-LOCK — immutable primitives                      │  ← bottom
  └────────────────────────────────────────────────────────────┘
```

Each layer can override the layer above it via cascade specificity. `light-dark()` in v0.1 only modeled layer 2 (surface). Below it (brand-lock) and above it (flavor, elevation, tone, mood) were on the table but not in the model.

## Tokens are matrices, not pairs

`--ink` is not `light-dark(#1A1612, #FFFFFF)`. It's a matrix:

| | cool | warm | ember |
|---|---|---|---|
| light | `#1A1612` | `#1A1612` | `#1A1612` |
| dark  | `#FFFFFF` | `#FAF7F2` | `#FAFAF8` |

`light-dark()` captures one row. Misses the column. Ignores the third dimension entirely.

Other tokens have different axis dependencies:
- `--weight-display` — surface only (heavier on dark for legibility)
- `--space-section` — tone only (feature breathes more than prose)
- `--shadow-lifted` — elevation × surface
- `--accent` — surface × flavor (deep crimson on light/cool, vivid red on dark/cool, crimson-warm on light/warm…)
- `--brand-mark-primary` — locked, no axes

## Registry shape (v0.2)

```jsonc
{
  "tokens": {
    "ink": {
      "kind": "color",
      "axes": ["surface", "flavor"],
      "values": {
        "default":                          "#1A1612",
        "surface=dark":                     "#FFFFFF",
        "surface=dark,flavor=warm":         "#FAF7F2",
        "surface=dark,flavor=ember":        "#FAFAF8"
      }
    },
    "weight-display": {
      "kind": "typography",
      "axes": ["surface"],
      "values": {
        "default":          "700",
        "surface=dark":     "800"
      }
    },
    "space-section": {
      "kind": "spacing",
      "axes": ["tone"],
      "values": {
        "default":              "5rem",
        "tone=feature":         "8rem",
        "tone=brand-band":      "4rem"
      }
    },
    "shadow-lifted": {
      "kind": "shadow",
      "axes": ["surface", "elevation"],
      "values": {
        "default":                                       "0 8px 24px rgba(0,0,0,0.08)",
        "surface=dark":                                  "0 8px 24px rgba(0,0,0,0.4)",
        "elevation=dramatic":                            "0 24px 64px rgba(0,0,0,0.16)",
        "surface=dark,elevation=dramatic":               "0 24px 64px rgba(0,0,0,0.6)"
      }
    },
    "brand-mark-primary": {
      "kind": "brand-lock",
      "axes": [],
      "locked": true,
      "values": { "default": "#EF4123" }
    }
  }
}
```

Codegen emits cascade rules for every cell that exists:

```css
:root                                        { --ink: #1A1612; }
[data-surface="dark"]                        { --ink: #FFFFFF; }
[data-surface="dark"][data-flavor="warm"]    { --ink: #FAF7F2; }
[data-surface="dark"][data-flavor="ember"]   { --ink: #FAFAF8; }

:root                                        { --weight-display: 700; }
[data-surface="dark"]                        { --weight-display: 800; }

:root                                        { --space-section: 5rem; }
[data-tone="feature"]                        { --space-section: 8rem; }
[data-tone="brand-band"]                     { --space-section: 4rem; }

/* …etc */

:root { --brand-mark-primary: #EF4123; }
/* No overrides allowed at any axis. Codegen rejects mood deltas that touch this. */
```

## Token kinds in v0.2

| Kind | Count | Examples |
|---|---|---|
| color | ~12 | ink, ink-soft, bg, bg-card, accent, accent-fg, border |
| typography | ~13 | font-display, font-body, type-display-1..4, weight-display, weight-body, leading-tight, leading-relaxed, track-display, track-eyebrow |
| spacing | ~6 | space-section, space-rhythm, space-block, space-tight, space-loose, content-max |
| radius | 4 | radius-sharp, radius-soft, radius-pill, radius-organic |
| shadow | 3 | shadow-flat, shadow-lifted, shadow-dramatic |
| motion | 4 | motion-instant, motion-snap, motion-smooth, motion-slow |
| brand-lock | 3 | brand-mark-primary, brand-mark-secondary, brand-mark-fg |
| **total** | **~45** | (4× v0.1's 11) |

## Mood as axis-aware delta

Moods compose ALL axes, not just colors. `performance.json`:

```jsonc
{
  "id": "performance",
  "tokens": {
    "accent": {
      "values": {
        "default":           "#E62719",
        "surface=dark":      "#FF3A1A"
      }
    },
    "weight-display":  { "values": { "default": "900", "surface=dark": "900" } },
    "leading-tight":   { "values": { "default": "1.0" } },
    "track-display":   { "values": { "default": "-0.03em" } },
    "space-section":   { "values": { "default": "5rem", "tone=feature": "6rem" } },
    "radius-soft":     { "values": { "default": "4px" } },
    "shadow-lifted":   { "values": { "surface=dark,elevation=dramatic": "0 8px 32px rgba(255,58,26,0.25)" } },
    "motion-snap":     { "values": { "default": "100ms cubic-bezier(0.4, 0, 0.2, 1)" } }
  }
}
```

Mood engine merges deltas at the cell level. A mood can override only the cells it cares about; others fall back to the registry default.

## Cycle 21+ (v0.2 work)

| Cycle | Title | Verification |
|---|---|---|
| 21 | Define axis types + registry shape (TypeScript types) | `pnpm tincture validate` accepts new schema |
| 22 | Update codegen to emit multi-axis CSS from new registry | `_generated/foundation.css` has all axis-cell rules |
| 23 | Migrate v0.1 registry to axis-aware shape (lossless) | every v0.1 token expressible; visual no-op |
| 24 | Add typography axis (surface, sometimes mood) | weight + scale tokens shipped |
| 25 | Add spacing axis (tone-aware) | section breathing varies with tone |
| 26 | Add radius + shadow tokens | cards consistent across surfaces |
| 27 | Add motion tokens + transition shorthand | hover states feel right |
| 28 | Brand-lock primitives (immutable) | mood delta to brand-mark rejected |
| 29 | Mood: `performance` (full axis delta) | live verification on arzadon |
| 30 | Mood: `transformation` (full axis delta) | live verification on arzadon |
| 31 | Mood: `clinical` v2 (surface-aware, multi-axis) | live verification |
| 32 | Mood: `editorial-warm` v2 | live verification |
| 33 | Visual-verification protocol — mandatory mosaic capture | scripts/tincture-verify-visual.mjs |
| 34 | Migration sweep — finish what cycle 7 started | grep clean |
| 35 | Studio designer — typography + spacing + axis pickers | manual UI test |
| 36 | npm publish — `@tincture/core@0.2.0` (real publish) | install in fresh project succeeds |

## Discipline contracts (carried from v0.1 audit)

1. **One cycle = one commit = one verifiable outcome.** No batching.
2. **Visual mosaic required** before any cycle marked done if it touches CSS or component code.
3. **`pnpm build` is necessary, NOT sufficient.** Acceptance test is the mosaic.
4. **Globals/page CSS scanned** for higher-specificity rules BEFORE any token-migration sweep.
5. **Two-source verification on live state** — content hash AND visual diff, not just `200 OK`.
6. **Self-audit at cycle 28** (halfway) — if v0.2 is drifting toward burst-mode, stop.

## Open decisions (need Curtis input — not blocking, but flag at v0.2 kickoff)

1. **Display font choice** — system stack vs Playfair / Inter / arzadon-custom. Affects mood definitions.
2. **Brand-lock enforcement** — soft warning vs hard error when a mood touches `--brand-mark-*`.
3. **Mood naming convention** — Curtis named "Performance" and "Transformation" verbally. Pin those, or aim for adjective-pairs ("vivid-tight", "deep-generous")?
4. **Spacing units** — rem vs `clamp()` vs `cqi/cqb`. Default = rem; `clamp()` where headlines need fluid.
5. **Axis-cell collision rules** — when two axes both apply to one element, what wins? Default proposal: more-specific axis (`surface=dark,flavor=warm`) wins over single-axis (`surface=dark`). Codegen enforces by emitting compound selectors with higher specificity.
