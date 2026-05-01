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
