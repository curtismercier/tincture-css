# Moods

A mood is a coordinated delta across multiple tokens. One command shifts the whole feel.

## Built-in moods

- **default** — baseline (the seed palette)
- **clinical** — cool blue + tighter spacing + sharper radius
- **editorial-warm** — terracotta + parchment + softer
- **aggressive-bold** — pure black/white + neon red + tight
- **minimalist-quiet** — whisper-soft, low-contrast, generous space
- **luxurious-refined** — champagne on slate, italic serif headlines

## Apply

```bash
npx tincture mood apply clinical
```

Writes deltas to `registry.json` and regenerates `_generated/`.

## Author your own

Drop a JSON file in `tincture/moods/<name>.json`:

```json
{
  "id": "my-mood",
  "name": "My Mood",
  "doc": "What this mood feels like, what it's for.",
  "base": "default",
  "tokens": {
    "accent": { "lightValue": "#1F75FE", "darkValue": "#5BA8FF" },
    "ink":    { "lightValue": "#0A0A0A", "darkValue": "#FAFAFA" }
  },
  "axis-defaults": { "surface": "light", "flavor": "cool" }
}
```

Then `npx tincture mood apply my-mood`.

## Diff between moods

```bash
npx tincture mood diff clinical editorial-warm
```

## Per-page activation (no CLI, runtime)

The CLI applies a mood site-wide by mutating the registry. There's a second
mode: activate a mood on **any wrapper element** at runtime via a
`data-mood` attribute. This is how you give one route, one persona, or one
feature card its own character without touching the rest of the site.

```html
<main data-mood="jennifer-editorial">
  <!-- This subtree resolves --accent, --font-display, etc. from
       jennifer-editorial. Everything outside stays default. -->
</main>
```

A per-page mood is the same JSON shape, but with two important differences
from a site-wide mood:

1. **Sparse tokens.** Override only what you actually want different from
   the surrounding default. A 12-token mood on a single route reads as
   *"why is this page on a different website?"* A 3- or 4-token mood reads
   as *a deliberate signal layer.*

2. **No CLI invocation.** The mood file ships in your bundle, the
   `[data-mood="X"]` block ships in `surface-extensions.css`, the attribute
   gets set by your framework when the route matches.

Full pattern (Next.js layout, partial-token discipline, activation
strategies, common pitfalls): [`docs/architecture/per-page-moods.md`](./architecture/per-page-moods.md).

Template: [`src/moods/per-page-example.json`](../src/moods/per-page-example.json).

Example: a fitness-studio consumer ships a `jennifer-editorial` mood on
`/about/<co-founder>` — swaps brand red for champagne gold and the
display typeface for an editorial serif, cascading through navbar, page,
and footer simultaneously.
