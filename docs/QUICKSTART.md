# Tincture Quickstart

```bash
# In any Next.js + Tailwind v4 project:
npx @tincture/core create
```

This scaffolds `src/tincture/` with:
- `foundation/foundation.css` — light-dark() core tokens
- `foundation/flavors.css` — cool/warm/ember palette tints
- `registry.json` — single source of truth
- `moods/*.json` — preset mood library
- `_generated/` — codegen output (regenerate with `npx tincture codegen`)

## Manual setup

```css
/* in your globals.css, AFTER tailwind import */
@import "./tincture/foundation/foundation.css";
@import "./tincture/foundation/flavors.css";
```

```html
<!-- root layout — write surface + flavor on <html> -->
<html data-surface="light" data-flavor="cool">
```

```tsx
// any component — read foundation tokens directly
<button className="bg-[var(--accent)] text-[var(--accent-fg)]">
  Click me
</button>
```

The button is structurally guaranteed correct on every theme combination.
`var(--accent)` resolves to `light-dark(<your-light-color>, <your-dark-color>)`,
and the `<html data-surface="dark">` (or any nested `data-surface="dark"` block)
flips it automatically.

## Mood swap

```bash
npx tincture mood apply clinical
# All accent + ink + bg tokens shift to clinical-blue palette.
# Reverse with: npx tincture mood apply default
```

## Verbs

```bash
npx tincture tokens list
npx tincture tokens get accent
npx tincture tokens find --role accent-primary
npx tincture tokens impact accent       # reverse-lookup: components + pages affected
npx tincture tokens set accent --light "#D81818" --dark "#E62719"

npx tincture mood list
npx tincture mood apply clinical
npx tincture mood preview clinical      # show what would change
npx tincture mood diff clinical editorial-warm

npx tincture codegen                    # regenerate _generated/
npx tincture validate                   # schema + drift check
npx tincture verify                     # code ↔ registry coherence
npx tincture contrast                   # WCAG AA audit
npx tincture preview accent --light "#X" --dark "#Y"  # 4-state visual diff
```
