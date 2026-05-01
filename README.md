# Tincture

> A drop changes the whole pour.

A surface-aware, multi-axis design substrate for AI-mediated theming. One mood delta shifts an entire visual identity — typography, color, spacing, shadows, radius — coordinated across every surface simultaneously.

**Version:** 0.2.2 · **Status:** Active  
**Origin:** Built for [Arzadon Fitness](https://arzadonfitness.com) (Next.js 15 + Tailwind v4). Extracted as a standalone substrate.

---

## The problem it solves

Most design token systems solve the *storage* problem — where do values live? Tincture solves the *composition* problem — how do values relate?

A token in Tincture is a **value matrix**, not a pair. Its value depends on which axes are active: surface (light/dark/steel/slate), flavor (warm/cool), elevation, tone. A mood is a coordinated delta across all of them. Change the mood, every token that cares about it shifts together.

```bash
# Swap the entire visual identity
tincture mood apply performance

# Preview before committing
tincture mood preview luxurious-refined

# Scan for missing surface annotations before deploy
tincture scan
```

---

## How it looks

### Surfaces: one token, four resolutions

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 180" width="760" height="180">
  <defs>
    <style>
      .label { font: 11px/1.4 'SF Mono', 'Fira Code', monospace; fill: rgba(255,255,255,0.45); }
      .token { font: 10px/1.4 'SF Mono', 'Fira Code', monospace; fill: rgba(255,255,255,0.25); }
      .val   { font: 13px/1.4 'SF Mono', 'Fira Code', monospace; font-weight: 600; }
    </style>
  </defs>

  <!-- dark surface -->
  <rect x="0"   y="0" width="180" height="180" rx="10" fill="#12151C"/>
  <text x="16"  y="28" class="label">data-surface="dark"</text>
  <text x="16"  y="90" class="val" fill="#FFFFFF">--ink: #FFFFFF</text>
  <text x="16"  y="110" class="val" fill="#E82E11">--accent: #E82E11</text>
  <text x="16"  y="130" class="token">--bg: #12151C</text>

  <!-- slate surface -->
  <rect x="193" y="0" width="180" height="180" rx="10" fill="#242A36"/>
  <text x="209" y="28" class="label">data-surface="slate"</text>
  <text x="209" y="90" class="val" fill="#F0EDE8">--ink: #F0EDE8</text>
  <text x="209" y="110" class="val" fill="#E82E11">--accent: #E82E11</text>
  <text x="209" y="130" class="token">--bg: #242A36</text>

  <!-- steel surface -->
  <rect x="386" y="0" width="180" height="180" rx="10" fill="#1C1F28"/>
  <text x="402" y="28" class="label">data-surface="steel"</text>
  <text x="402" y="90" class="val" fill="#F0EDE8">--ink: #F0EDE8</text>
  <text x="402" y="110" class="val" fill="#E82E11">--accent: #E82E11</text>
  <text x="402" y="130" class="token">--bg: #1C1F28</text>

  <!-- light surface -->
  <rect x="579" y="0" width="180" height="180" rx="10" fill="#F7F4F0" stroke="#E0DBD4" stroke-width="1"/>
  <text x="595" y="28" class="label" style="fill:#888">data-surface="light"</text>
  <text x="595" y="90" class="val" fill="#1A1612">--ink: #1A1612</text>
  <text x="595" y="110" class="val" fill="#C2200E">--accent: #C2200E</text>
  <text x="595" y="130" class="token" style="fill:#aaa">--bg: #F7F4F0</text>
</svg>
```

The same component renders correctly on all four surfaces with **zero per-surface overrides**. One annotation (`data-surface="dark"`) — the cascade does the rest.

---

### Multi-axis token matrix

A token declares which axes it varies on. Codegen emits one CSS rule per axis-cell:

```json
{
  "ink": {
    "kind": "color",
    "axes": ["surface"],
    "values": {
      "default":                    "#1A1612",
      "surface=dark":               "#FFFFFF",
      "surface=dark,flavor=warm":   "#FAF7F2",
      "surface=steel":              "#F0EDE8"
    }
  }
}
```

→ Emits:

```css
:root                                        { --ink: #1A1612; }
[data-surface="dark"]                        { --ink: #FFFFFF; }
[data-surface="dark"][data-flavor="warm"]    { --ink: #FAF7F2; }
[data-surface="steel"]                       { --ink: #F0EDE8; }
```

No polyfills. No `light-dark()` (it freezes at `:root`'s `color-scheme`; see [`docs/architecture/why-not-automatic.md`](./docs/architecture/why-not-automatic.md)). Standard CSS cascade.

---

### Mood engine: coordinated delta

A mood is a JSON delta — token → axis-cell → new value. Apply one, every consumer token shifts together:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 200" width="720" height="200">
  <defs>
    <style>
      .mono { font: 11px/1.6 'SF Mono', 'Fira Code', monospace; }
      .head { font: 12px/1 'SF Mono', 'Fira Code', monospace; font-weight: 700; fill: #fff; }
      .dim  { fill: rgba(255,255,255,0.35); }
      .acc  { fill: #E82E11; }
      .grn  { fill: #4ade80; }
      .arr  { fill: none; stroke: rgba(255,255,255,0.2); stroke-width: 1.5; marker-end: url(#arr); }
    </style>
    <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="rgba(255,255,255,0.3)"/>
    </marker>
  </defs>
  <rect width="720" height="200" fill="#0D1017" rx="12"/>

  <!-- baseline -->
  <rect x="20" y="20" width="200" height="160" rx="8" fill="#12151C" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
  <text x="36" y="44" class="head">baseline</text>
  <rect x="36" y="56" width="60" height="16" rx="3" fill="#C2200E"/>
  <text x="104" y="68" class="mono dim">--accent</text>
  <text x="36" y="94" class="mono dim">weight-display: </text><text x="150" y="94" class="mono" fill="#fff">700</text>
  <text x="36" y="114" class="mono dim">type-display-1: </text><text x="150" y="114" class="mono" fill="#fff">clamp(3rem,7vw,5rem)</text>
  <text x="36" y="134" class="mono dim">shadow-lifted: </text><text x="36" y="150" class="mono dim" style="font-size:9px">0 4px 16px rgba(0,0,0,0.3)</text>

  <!-- arrow -->
  <path d="M226,100 L280,100" class="arr"/>
  <text x="238" y="92" class="mono dim" style="font-size:9px">mood apply</text>
  <text x="236" y="115" class="mono acc" style="font-size:10px;font-weight:700">performance</text>

  <!-- performance mood -->
  <rect x="286" y="20" width="200" height="160" rx="8" fill="#12151C" stroke="#E82E11" stroke-width="1" stroke-opacity="0.4"/>
  <text x="302" y="44" class="head">performance</text>
  <rect x="302" y="56" width="60" height="16" rx="3" fill="#FF3A1A"/>
  <text x="370" y="68" class="mono grn">▲ +saturation</text>
  <text x="302" y="94" class="mono dim">weight-display: </text><text x="416" y="94" class="mono grn">900</text>
  <text x="302" y="114" class="mono dim">type-display-1: </text><text x="302" y="130" class="mono grn" style="font-size:9px">clamp(3rem,8vw,6rem)</text>
  <text x="302" y="152" class="mono grn" style="font-size:9px">▲ tighter, larger</text>

  <!-- arrow -->
  <path d="M492,100 L546,100" class="arr"/>
  <text x="504" y="92" class="mono dim" style="font-size:9px">mood apply</text>
  <text x="498" y="115" class="mono" fill="#93c5fd" style="font-size:10px;font-weight:700">minimalist-quiet</text>

  <!-- minimalist -->
  <rect x="552" y="20" width="148" height="160" rx="8" fill="#12151C" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
  <text x="568" y="44" class="head">quiet</text>
  <rect x="568" y="56" width="60" height="16" rx="3" fill="#8B5A4A" opacity="0.7"/>
  <text x="568" y="94" class="mono dim">weight: </text><text x="624" y="94" class="mono" fill="#93c5fd">300</text>
  <text x="568" y="114" class="mono" fill="#93c5fd" style="font-size:9px">softer, lighter</text>
  <text x="568" y="140" class="mono" fill="#93c5fd" style="font-size:9px">accent barely breathes</text>
</svg>
```

One command. Zero component edits.

---

### Typography axis

Sixteen tokens cover display/body sizing (fluid `clamp()`), weight scale, leading, tracking, and font-family. When a heading uses `font-[var(--weight-heading)]` and `text-[length:var(--type-display-2)]`, any mood that declares a `type-display-2` delta visibly affects every heading on the site — no component changes required.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 220" width="700" height="220">
  <rect width="700" height="220" fill="#12151C" rx="12"/>
  <defs>
    <style>
      .mono { font: 10px/1.4 'SF Mono','Fira Code',monospace; fill: rgba(255,255,255,0.35); }
      .tok  { font: 10px/1.4 'SF Mono','Fira Code',monospace; fill: #E82E11; }
    </style>
  </defs>

  <!-- display-1 -->
  <text x="32" y="68" style="font-size:52px;font-weight:900;fill:#fff;letter-spacing:-0.03em;font-family:system-ui">Transform</text>
  <text x="32" y="86" class="tok">--type-display-1: clamp(3rem, 8vw, 6rem)</text>
  <text x="32" y="99" class="mono">--weight-display: 900 · --track-display: -0.03em</text>

  <!-- separator -->
  <line x1="32" y1="114" x2="668" y2="114" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>

  <!-- display-2 -->
  <text x="32" y="148" style="font-size:28px;font-weight:700;fill:rgba(255,255,255,0.85);font-family:system-ui">Results That Last</text>
  <text x="32" y="163" class="tok">--type-display-2: clamp(1.75rem, 4vw, 2.5rem)</text>
  <text x="32" y="176" class="mono">--weight-heading: 700</text>

  <!-- body-1 -->
  <text x="32" y="205" style="font-size:15px;fill:rgba(255,255,255,0.6);font-family:system-ui">Every session, every meal, every metric — intentional.</text>
  <text x="502" y="205" class="tok" style="font-size:9px">--type-body-1</text>
</svg>
```

---

### Brand-lock primitives

Certain tokens are `"locked": true`. The schema validator rejects any mood delta targeting them. The brand's primary mark color is a locked primitive — 30 palette iterations later, the logo is still exactly right.

```json
{
  "brand-mark-primary": {
    "kind": "color",
    "locked": true,
    "axes": [],
    "values": { "default": "#E82E11" },
    "doc": "Brand primary mark. Immutable — moods cannot override."
  }
}
```

```bash
$ tincture mood apply my-experimental-mood
✓ applied: accent #C2200E → #1A56DB
✓ applied: weight-display 700 → 900
✗ rejected: brand-mark-primary is locked (cannot be overridden by moods)
```

---

### Surface scanner

A build-time scanner flags dark-background sections without surface annotations before they ship:

```bash
$ tincture scan

scanning 47 component files...

⚠  src/components/Hero.tsx:34
   dark background detected without data-surface annotation
   class="... bg-[#12151C] ..."
   → add data-surface="dark" to ensure --ink, --accent resolve correctly

⚠  src/pages/about.tsx:88
   class="bg-gray-900" without data-surface
   → add data-surface="dark"

✓ 45 files clean
2 warnings
```

---

## Token kinds

| Kind | Tokens | Surface-aware |
|---|---|---|
| Color | `ink`, `ink-soft`, `ink-muted`, `accent`, `accent-warm`, `accent-fg`, `bg`, `bg-card`, `bg-elev`, `border`, `border-soft` | ✓ |
| Typography | `font-display`, `font-body`, `font-mono`, `weight-display`, `weight-heading`, `weight-body`, `type-display-{1,2,3}`, `type-body-{1,2,3}`, `leading-tight`, `leading-relaxed`, `track-display`, `track-eyebrow` | Partial |
| Shadow | `shadow-flat`, `shadow-lifted`, `shadow-dramatic` | ✓ |
| Radius | `radius-sm`, `radius-md`, `radius-lg`, `radius-full` | ✗ |
| Brand-lock | `brand-mark-primary`, `brand-mark-secondary`, `brand-mark-fg` | ✗ (immutable) |

---

## Mood presets

| Mood | Character |
|---|---|
| `default` | Baseline. All other moods are deltas from here. |
| `performance` | High-saturation accent, weight 900, tight large type, dramatic shadow |
| `clinical` | Cooler, sharper. Diagnostic precision |
| `editorial-warm` | Parchment + terracotta. Magazine-feature warmth |
| `luxurious-refined` | Champagne accents on slate. Confident restraint |
| `aggressive-bold` | High contrast, heavy weight, vivid |
| `minimalist-quiet` | Whisper-soft. Low contrast. The accent barely breathes |

---

## Quick start

### 1. Install

```bash
npm install @tincture/core
# or
npx @tincture/core init
```

### 2. Configure

Copy `tincture.config.example.json` to `tincture.config.json` at your project root and set your paths:

```json
{
  "registryPath": "src/tokens/registry.json",
  "outDir":       "src/tokens/_generated",
  "moodsDir":     "src/tokens/moods"
}
```

### 3. Generate CSS

```bash
tincture codegen
# → emits src/tokens/_generated/foundation.css + manifest.json + tokens.d.ts
```

### 4. Import

```css
/* globals.css */
@import "tailwindcss";
@import "./tokens/_generated/foundation.css";
```

### 5. Annotate surfaces

```tsx
<section data-surface="dark">
  <h1 style={{ color: 'var(--ink)' }}>Always white on dark</h1>
  <p style={{ color: 'var(--ink-muted)' }}>Always muted</p>
</section>
```

### 6. Apply moods

```bash
tincture mood apply performance
# → patches registry.json → re-runs codegen → new CSS committed
```

---

## Consumer integration: Next.js + Tailwind v4

```tsx
// layout.tsx
const oswald = Oswald({ subsets: ['latin'], variable: '--font-display-stack' });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={oswald.variable}>
        {/* Bridge Next/font vars to Tincture's --font-display */}
        <div className="[--font-display:var(--font-display-stack)]">
          {children}
        </div>
      </body>
    </html>
  );
}
```

```css
/* globals.css */
@import "tailwindcss";
@import "./tincture/_generated/foundation.css";
```

**Why the bridge?** Next/font CSS vars are scoped to the element that has the font `className`, not to `:root`. Tincture's `--font-display` needs to reach all descendants — so you bridge once at the layout root.

---

## CLI reference

```
tincture tokens list                    list all semantic tokens
tincture tokens get <id>               single token detail + affected files
tincture tokens find --role <r>        query by role
tincture tokens impact <id>            components + pages affected
tincture tokens set <id> --light <hex> --dark <hex>
                                       write to registry, run codegen
tincture mood list                     list mood presets
tincture mood apply <name>             apply a mood
tincture mood preview <name>           preview without committing
tincture codegen                       re-emit _generated/
tincture scan                          surface annotation scanner
tincture validate                      schema validator
tincture contrast                      WCAG contrast audit
```

---

## Why not X?

**Style Dictionary** (Amazon) — excellent for storing tokens and transforming to platforms (iOS, Android, CSS). Doesn't model surface-awareness, mood composition, or multi-axis tokens.

**Radix Colors** — best-designed color scale system available (12 semantic steps, P3 gamut, auto dark). These are complementary: Radix for generated neutral scales, Tincture for semantic brand tokens that need to be authored and locked.

**Panda CSS** — closest in philosophy. Handles typed tokens and recipes well. No native mood/preset composition. No surface-awareness. React-only. Tincture is framework-agnostic CSS.

**shadcn/ui** — component + theme system, not a substrate. ~40 `hsl()` custom properties with basic dark mode. No token coordination across types. Tincture can layer on top of shadcn primitives.

**Tailwind v4 `@theme`** — gets much closer than v3 did. Flat custom properties, no surface-aware axis model. Tincture's `_generated/foundation.css` imports after `@import "tailwindcss"` and adds the axis layer without conflict.

The core difference: most systems give you a better way to **declare** what your tokens are. Tincture gives you a way to **compose** them — surface × flavor × mood × elevation — so that changing one intent coordinate shifts the whole substrate coherently.

---

## Project structure

```
tincture-css/
├── src/
│   ├── cli/
│   │   ├── tincture.mjs          # CLI entry — tokens, mood, validate
│   │   ├── codegen-v2.mjs        # Registry → CSS + manifest + types
│   │   ├── codegen.mjs           # v0.1 codegen (compatibility)
│   │   ├── mood-v2.mjs           # Mood engine v0.2
│   │   ├── scan-surfaces.mjs     # Build-time annotation scanner
│   │   ├── contrast.mjs          # WCAG contrast audit
│   │   ├── validate.mjs          # Schema validator
│   │   ├── verify.mjs            # Registry integrity check
│   │   ├── preview.mjs           # Mood preview (opens browser)
│   │   ├── create.mjs            # New registry scaffolder
│   │   └── _resolve-config.mjs   # Config discovery (tincture.config.json)
│   ├── schema.mjs                # Registry + mood validator
│   ├── types.ts                  # TypeScript declarations
│   ├── foundation/
│   │   ├── foundation.css        # Source CSS (pre-codegen example)
│   │   └── flavors.css           # Flavor overlay (cool/warm/ember)
│   ├── moods/
│   │   ├── default.json          # Baseline mood (all moods delta from here)
│   │   ├── performance.json
│   │   ├── clinical.json
│   │   ├── editorial-warm.json
│   │   ├── luxurious-refined.json
│   │   ├── aggressive-bold.json
│   │   └── minimalist-quiet.json
│   └── registry.v02-example.json # Reference registry (all token kinds)
├── tests/
│   ├── test-schema.mjs           # 39 schema tests
│   ├── test-codegen.mjs          # 34 codegen tests
│   └── test-migration.mjs        # v0.1 → v0.2 migration tests
├── docs/
│   ├── ARCHITECTURE.md
│   ├── MOODS.md
│   ├── QUICKSTART.md
│   └── architecture/
│       └── why-not-automatic.md
├── tools/
│   └── vscode-tincture/          # VS Code extension (token hover + autocomplete)
├── tincture.config.example.json  # Consumer config template
├── package.json
└── LICENSE
```

---

## Origin

Tincture crystallised in April 2026 during a palette session on **Arzadon Fitness** — a Toronto personal training studio (site coming soon at [arzadonfitness.com](https://arzadonfitness.com)). After 30 commits of theme work, a single question about a secondary accent colour made the real problem clear: the *substrate* didn't model what we actually cared about. Surface-aware ink. Moods that coordinate. Tokens that know their axes.

The Arzadon site is the live proving ground — every mood, every surface annotation, every token in this repo runs in production there. It is not a demo project.

The name comes from the tincture process: a drop of concentrated extract changes the entire pour. One mood delta, one coordinated shift.

---

## License

MIT — see [LICENSE](./LICENSE)
