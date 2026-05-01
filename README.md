# Tincture

> A drop changes the whole pour.

A surface-aware, multi-axis design substrate for AI-mediated theming. One command shifts an entire visual identity — typography, color, spacing, shadows, radius, motion — coordinated across every surface.

**Version:** 0.2.2 · **Status:** Active — live on [arzadon.gravicity.io](https://arzadon.gravicity.io) · **Proving ground:** Arzadon Fitness, Next.js 15 + Tailwind v4

---

## What it is

Most design token systems solve the *storage* problem. Tincture solves the *composition* problem.

Tokens in Tincture are **value matrices**, not pairs. A token's value depends on which axes are active — surface, flavor, elevation, tone — and a mood is a coordinated delta across all of them. Change the mood, every token that cares about it shifts together.

```bash
# Swap the entire visual identity in one command
node scripts/tincture-mood-v2.mjs apply performance

# Preview before committing
node scripts/tincture-mood-v2.mjs preview luxurious-refined

# Scan for un-annotated dark surfaces before deploy
node scripts/tincture-mood-v2.mjs apply performance
```

---

## Core concepts

### 1. Multi-axis token matrix

Each token declares which axes it varies on. Codegen emits one CSS rule per axis-cell, ordered by specificity:

```json
{
  "ink": {
    "kind": "color",
    "axes": ["surface"],
    "values": {
      "default":            "#1A1612",
      "surface=dark":       "#FFFFFF",
      "surface=dark,flavor=warm": "#FAF7F2"
    }
  }
}
```

→ Emits:
```css
:root                             { --ink: #1A1612; }
[data-surface="dark"]             { --ink: #FFFFFF; }
[data-surface="dark"][data-flavor="warm"] { --ink: #FAF7F2; }
```

No polyfills. No `light-dark()` (it freezes at `:root`'s color-scheme; see `docs/architecture/why-not-automatic.md`). Standard CSS cascade.

### 2. Mood engine

A mood is a JSON delta — token ID → axis-cell → new value. Apply it; every consumer token shifts together.

```json
{
  "id": "performance",
  "tokens": {
    "accent":         { "values": { "default": "#E62719", "surface=dark": "#FF3A1A" } },
    "weight-display": { "values": { "default": "900" } },
    "type-display-1": { "values": { "default": "clamp(3rem, 8vw, 6rem)" } },
    "track-display":  { "values": { "default": "-0.03em" } },
    "shadow-lifted":  { "values": { "surface=dark": "0 8px 32px rgba(255,58,26,0.25)" } }
  }
}
```

Apply → registry updated → codegen runs → new CSS emitted → commit. Rollback to baseline any time.

### 3. Surface-aware cascade

Every section that contains dark content declares its surface intent:

```tsx
<section data-surface="dark">
  <h1>White text on dark background</h1>  {/* var(--ink) resolves #FFFFFF */}
</section>
```

A build-time scanner flags missing annotations before they ship. Components that always-dark use `data-surface` once at definition; consumers never forget.

### 4. Typography axis

16 tokens covering display/body sizing (fluid `clamp()`), weight scale, line-height, tracking, and font-family. When a heading uses `font-[var(--weight-heading)]` and `text-[length:var(--type-display-2)]`, any mood that declares a `type-display-2` or `weight-heading` delta visibly affects every section heading on the site — without touching a single component.

### 5. Brand-lock primitives

Certain tokens are `locked: true`. The schema validator rejects any mood delta targeting them. The Arzadon logo's orange-red `#EF4123` is a locked primitive — 10 palette iterations later, the logo color is still exactly right.

---

## Token kinds

| Kind | Tokens | Surface-aware? |
|---|---|---|
| Color | ink, ink-soft, ink-muted, accent, accent-warm, accent-fg, bg, bg-card, bg-elev, border, border-soft | ✓ |
| Typography | font-display, font-body, font-mono, weight-display, weight-heading, weight-body, weight-emphasis, type-display-{1,2,3}, type-body-{1,2,3}, leading-tight, leading-relaxed, track-display, track-eyebrow | Partial (weight-display) |
| Shadow | shadow-flat, shadow-lifted, shadow-dramatic | ✓ |
| Radius | radius-sm, radius-md, radius-lg, radius-full | ✗ |
| Brand-lock | brand-mark-primary, brand-mark-secondary, brand-mark-fg | ✗ (immutable) |

**Motion axis** (duration, easing) is planned — currently hardcoded in components.

---

## Mood presets (Arzadon)

| Mood | Delta | Character |
|---|---|---|
| `arzadon-default` | baseline | Deep crimson on light, vivid red on dark |
| `performance` | 7 tokens | High-saturation reds, 900 weight, tight type, dramatic shadow |
| `clinical` | 7 tokens | Cooler, sharper. Diagnostic precision |
| `editorial-warm` | 8 tokens | Parchment + terracotta. Magazine-feature warmth |
| `luxurious-refined` | 8 tokens | Champagne accents on slate. Robb Report editorial |
| `aggressive-bold` | 7 tokens | High contrast, heavy weight, vivid |
| `minimalist-quiet` | 8 tokens | Whisper-soft. Low contrast. The accent barely breathes |

---

## Comparison

| | Tincture | Style Dictionary | Radix Colors | Panda CSS | shadcn/ui | Tailwind v4 |
|---|---|---|---|---|---|---|
| **Multi-axis tokens** | ✓ surface × flavor × tone × elevation | ✗ flat map | ✗ scale only | Partial (conditions) | ✗ | ✗ |
| **Mood presets** | ✓ multi-token coordinated deltas | ✗ | ✗ | ✗ | ✗ manual | ✗ |
| **AI-native ops** | ✓ JSON edit → codegen → commit | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Surface detection** | ✓ scanner + cascade | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Brand-lock** | ✓ schema-enforced | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Typography axis** | ✓ 16 tokens + fluid clamp | build-only | color only | ✓ | ✗ | via @theme |
| **Build-time scan** | ✓ surface annotation scanner | via transforms | ✗ | via lint | ✗ | ✗ |
| **Runtime theming** | CSS cascade | ✗ | CSS | CSS-in-JS | CSS | CSS |
| **Multi-platform** | CSS only | ✓ | CSS | ✓ | ✗ | CSS |
| **Zero-config start** | ✓ one-file drop-in | config-heavy | npm install | build setup | npm install | @theme |
| **Framework req** | none (Next.js optional) | none | none | React | React | none |

### The gap this fills

**Style Dictionary** (Amazon, 2015) is the de facto standard for *storing* tokens and *transforming* them to platforms. It's excellent for multi-platform design ops (iOS, Android, CSS, Figma). It doesn't model surface-awareness, mood composition, or AI-native mutation. Tincture's registry is Design Dictionary-inspired but adds the composition layer on top.

**Radix Colors** is the best-designed color scale system available — 12 semantic steps per hue, P3 gamut, automatic dark variants. If you need a neutral color system, use Radix Colors. Tincture's color tokens are hand-authored for brand identity, not generated from a scale. These are complementary: Radix for neutrals, Tincture for semantic brand tokens.

**Panda CSS** is the closest in philosophy — a codegen-first token system for React with TypeScript types. It handles recipes, patterns, and slot tokens well. The gap: Panda CSS models tokens as typed props, not as value matrices with axes. There's no native mood/preset composition. There's no surface-awareness built in. It's also React-only (CSS-in-JS philosophy), where Tincture is framework-agnostic CSS.

**shadcn/ui** / **Tweakcn** are component + theme systems, not substrates. They give you a dark mode and ~40 `hsl()` custom properties. Excellent starting point. The gap: no composition between tokens (changing the "accent" doesn't change "shadow" or "weight"), no mood engine, no scanner. Tincture can coexist with shadcn — run Tincture's semantic tokens on top of shadcn primitives.

**Tailwind v4** with `@theme` is closer than it looks — CSS custom properties as the token layer, framework-aware utilities. The gap: Tailwind doesn't model the *axes* (a `--color-accent` is a flat value, not a matrix of surface-dependent values). No mood composition. No scanner. Tincture's `_generated/foundation.css` imports directly after `@import "tailwindcss"` and adds the axis layer without conflict.

**vanilla-extract**: TypeScript-first CSS-in-JS with zero runtime. Themes via `createTheme` contract. Excellent type safety. No surface detection, no scanner, no mood system. Different tradeoff: full type safety at build time vs. runtime composability.

**Open Props** (Adam Argyle): Beautiful opinionated defaults. Best for "I want good defaults fast." Not designed for brand-specific token composition or mood systems.

**The core difference:** Most systems give you a better way to *declare* what your tokens are. Tincture gives you a way to *compose* them — surface × flavor × mood × elevation — so that changing one intent coordinate shifts the whole visual substrate coherently.

---

## Project structure

```
tincture-css/
├── src/
│   ├── cli/
│   │   ├── codegen-v2.mjs      # Registry → CSS + manifest + types
│   │   ├── scan-surfaces.mjs   # Build-time annotation scanner
│   │   └── migrate-v01-to-v02.mjs  # Lossless registry migration
│   ├── schema.mjs              # Registry + mood validator (plain JS)
│   ├── types.ts                # TypeScript type declarations
│   └── registry.v02-example.json  # Reference registry (all 7 token kinds)
├── tests/
│   ├── test-schema.mjs         # 39 schema tests
│   └── test-codegen.mjs        # 34 codegen tests (idempotency + correctness)
├── cycles/
│   ├── META_CYCLE.md           # Cycle architecture
│   ├── phase-5/cycle-{21-36}.md  # Current arc (v0.2)
│   └── audits/                 # Architecture pivot log + cycle-1-20 audit
├── docs/architecture/
│   └── why-not-automatic.md    # Why surface detection can't be automatic
└── consumers/
    └── arzadon-fitness.md      # Consumer integration pattern
```

---

## Consumer integration (Next.js + Tailwind v4)

1. **Copy** `src/tenants/arzadon/tincture/` into your tenant directory
2. **Import** in your tenant's `globals.css`:
   ```css
   @import "tailwindcss";
   @import "./tincture/_generated/foundation.css";
   @import "./tincture/_generated/flavors.css";
   ```
3. **Bridge** the font vars in your layout wrapper div:
   ```tsx
   <div className="... [--font-display:var(--font-sans)] [--font-body:var(--font-sans)]">
   ```
   *(Next/font CSS vars are scoped to the element that has the font className, not `:root`.)*
4. **Run** `pnpm tincture:codegen` after any registry edit
5. **Annotate** dark sections: `<section data-surface="dark">`
6. **Run** `pnpm tincture:scan` before deploys to catch missing annotations

---

## Cycles (shipped)

| Phase | Cycles | Theme |
|---|---|---|
| 1–4 | 1–11 | Color substrate, registry, codegen, migration, surface untangle |
| 5 (v0.2) | 21–22 | Multi-axis types + schema validator + codegen |
| 5 (v0.2) | 23 | v0.1 → v0.2 registry migration (lossless) |
| 5 (v0.2) | 24 | Typography axis (16 tokens) |
| 5 (v0.2) | 25 | Surface scanner + auto-fill codegen (cascade-reset fix) |
| 5 (v0.2) | 26 | Brand-lock primitives + mood engine v0.2 |
| 5 (v0.2) | 27–28 | Hero h1 migration + Performance mood demo |
| 5 (v0.2) | 29–30 | Font bridge + SectionHeading/Eyebrow + full heading sweep (83 files) |

**On arzadon.gravicity.io:** all structural headings (h1/h2/h3/h4) consume Tincture tokens. Mood swap changes typography site-wide.

## Up next

| Cycle | Title |
|---|---|
| 31 | Motion tokens (`--duration-*`, `--ease-*`) + component sweep |
| 32 | Mood: `luxurious-refined` v2 (schema migration + `font-display: var(--font-serif)`) |
| 33 | Component primitives `<Section variant>` — injects `data-surface` automatically |
| 34 | ESLint rule — fails CI on raw `<section>` with dark-bg + no annotation |
| 35 | Spacing axis (`--space-section`, `--space-rhythm`, density tiers) |
| 36 | `@tincture/core@0.2.0` npm publish |

---

## Origin

Crystallized 2026-04-30 during an Arzadon palette session. After 30 commits of theme work, Curtis: "what about that color-accent-secondary" — and from that, the cause of the iteration loop became clear: the *substrate* didn't model what we cared about. Surface-aware ink. Moods that coordinate. Tokens that know their axes. Tincture is what we needed.

The name comes from the tincture process: a drop of concentrated extract changes the entire pour. One mood delta, one coordinated shift.

---

## License

MIT
