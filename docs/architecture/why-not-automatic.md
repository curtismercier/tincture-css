# Why isn't surface detection automatic?

**Asked by Curtis, 2026-04-30:** "shouldn't the detection of dark/light layers underneath be somehow detected automatically?"

The honest answer: **no, not with current CSS**, and the reasons are worth understanding because they shape Tincture's design.

---

## What `light-dark()` actually does

A common misconception is that `light-dark()` reads the visual luminance of an element's backdrop and decides which side to use. It doesn't.

```css
:root { color-scheme: light dark; }   /* a label */

div {
  color: light-dark(black, white);    /* reads the label, not pixels */
}
```

The function reads the **`color-scheme` property** of the element. That property is just a string the author sets. The browser uses it for two things:

1. UA-rendered controls (scrollbars, form widgets) get themed light or dark.
2. `light-dark()` resolves to side A (light) or side B (dark).

It never looks at backdrop pixels. It never inspects ancestor backgrounds. It never measures contrast.

This means: **labelling is mandatory.** Either we use `color-scheme` directly on every dark subtree, or we use our own attribute (`data-surface="dark"`) and write CSS that flips per attribute. The pivot v0.1.1 → v0.1.2 chose the latter because the lightningcss polyfill broke the former for inherited custom properties.

## What CSS does NOT have today

| Capability | Status |
|---|---|
| **Read computed luminance of backdrop** | None. There's no CSS function that returns `luminance(parent)`. |
| **Pick highest-contrast color from a list** | `color-contrast()` was proposed (CSS Color 5), now dropped. Replaced by manual contrast in browsers. |
| **Detect "this element sits over a dark image"** | None. The backdrop is rendered pixels; CSS never reads them. |
| **`@media (effective-luminance: dark)`** | Not in any spec. |
| **Container-query for parent surface** | `@container` queries work on container size/style, not on color-scheme inheritance. |

## What we COULD do (and what Tincture v0.2 does)

### 1. Build-time scanner (shipped in v0.2 — `scan-surfaces.mjs`)
Scan JSX for known patterns:
- `bg-[<dark-hex>]` / `bg-[var(--bg-dark*)]` / `bg-black` (no `/N` opacity)
- `<Image fill>` or `<img absolute inset-0>` *plus* a `bg-black/N` or `from-black/N` overlay
- `data-tone="feature"` or `data-tone="brand-band"` (legacy convention)

Auto-inject `data-surface="dark"` on the `<section>` (or warn if `--check`). Idempotent. Runs in CI / pre-commit.

**This catches ~95% of cases mechanically** but misses:
- Components that compose the dark surface from props (`<Card variant={x ? 'dark' : 'light'}>` — author intent, not literal CSS)
- External images whose darkness isn't expressed in CSS

### 2. Component primitives (cycle 25)
Authors write `<Section variant="dark">` instead of `<section data-surface="dark" data-tone="feature">`. The component injects the attributes. **One decision per component, reusable everywhere.** Reduces miss rate from "every page" to "the small set of primitive components."

### 3. Lint rule (cycle 26)
ESLint plugin that fails CI when:
- A `<section>` has `bg-[<dark-pattern>]` without `data-surface`
- A `<section>` has a fill image + dark overlay without `data-surface`
- A token migration introduces `var(--ink)` text in a tree where no ancestor declares surface

Lint catches the misses in #1 + the props-based dark surfaces in #2.

### 4. Runtime sensing (rejected for v0.2)
We could `getComputedStyle(parent)`, sample the rendered bg image into a canvas, calculate luminance, set `data-surface` dynamically. Costs:
- Runtime JS execution per section
- Flash of wrong color before sense completes
- Doesn't work without JS (SSR pages)

Not worth it. The build-time + component-primitives + lint stack covers the same surface area without runtime cost.

### 5. CSS-only fallbacks (low value)
- `mix-blend-mode: difference` for ink — text becomes the inverse of whatever's behind it. Looks weird at boundaries.
- Backdrop-filter blur + saturate — doesn't change ink color.

Not pursued.

## The Tincture stance

**Surface annotation is INTENT, not detection.** A designer KNOWS this section is dark — they put a dark image there with a darken overlay because they wanted dramatic, high-contrast feature mode. Tincture's job is to make declaring that intent fast and impossible to forget.

The progression:
1. **v0.1** — every author hand-types `data-surface="dark"`. Brittle. Misses ~25% of cases.
2. **v0.2 (current)** — build scanner catches mechanical cases. Component primitives surface intent. Lint catches the gaps. Hand-typing is rare.
3. **Future (v0.3+)** — primitives become the only path. Raw `<section data-surface=…>` triggers a lint warning. The substrate's authors stop thinking about surface as a per-section concern; they think about it as a per-Component concern.

What we will NOT do:
- Pretend CSS auto-detects. (It doesn't.)
- Rely on runtime JS for surface detection. (Wrong cost model.)
- Make surface annotation optional. (Surfaces are part of the component's contract, not metadata.)

## Implementation guarantees

When you author with Tincture v0.2+:
- Every `<Section>` you place declares its surface (light/dark) explicitly via component prop
- Component injects the right `data-surface` attribute and inherits the right `--ink` automatically
- If you write a raw `<section>` with `bg-black` and no `data-surface`, the scanner + lint will flag it before merge
- If you write a section that COMPOSES dark from props at runtime, the lint rule has a "compute-time" check via type narrowing

**Result:** the author writes `<Section variant="dark" tone="feature">` once. The substrate handles the rest. No more hand-typing data attributes. No more sweep cycles.

## Open question (not solved by v0.2)

**Image-overlay sections where the image source is dynamic** — e.g., a Hero that loads its bg from a CMS field. The author can't statically know if the image is dark. v0.2 punts: requires the author to assume worst-case (dark) and provide a darken overlay. Future cycles could:
- Sample image dominant color at upload time, store in CMS
- Tincture component reads the stored value, picks surface
- Or: always-darken-overlay convention (what we already do for hero images)

For now, the convention is: **if your section has a fill image, also have a darken overlay, and declare surface=dark.** This is enforced by the scanner + lint.

---

**Origin:** This doc was written 2026-04-30 in response to Curtis's question after a sweep cycle missed sections with `<Image fill>` + dark overlay. The scanner was upgraded in the same session to catch image-overlay patterns; this doc captures the architectural reasoning for the future.
