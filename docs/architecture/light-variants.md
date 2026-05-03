# Light Theme Variants

Tincture supports multiple named light themes that share `data-surface="light"` but
use different page-background colours. This lets users pick between subtle shades
(e.g. warm parchment, cool grey, blue-grey) without touching ink/border/accent tokens
— those are fixed per surface.

## How it works

`ThemeProvider` writes `data-surface="light"` on `<html>` for any light-tier theme.
The `[data-surface="light"]` block defines the base light palette.
Per-variant overrides are compound selectors that win when both `data-theme` and
`data-surface` co-exist on the same root element:

```css
/* Base light surface — Mist (default) */
[data-surface="light"] {
  --bg:      #ECEEF3;  /* cool blue-grey — harmonises with dark slate/steel */
  --bg-card: #FFFFFF;
  --bg-elev: #E2E4EC;
}

/* Variant A — Whisper: barely-there cool grey */
:root[data-theme="grey"][data-surface="light"],
:root[data-theme="grey"] [data-surface="light"] {
  --bg:      #F2F4F7;
  --bg-elev: #E8EAF0;
}

/* Variant C — Slate Ghost: strong blue-grey cast */
:root[data-theme="cool"][data-surface="light"],
:root[data-theme="cool"] [data-surface="light"] {
  --bg:      #E8EBF2;
  --bg-card: #F4F5F9;
  --bg-elev: #DDE0EA;
}
```

## Naming guidance

Name variants by **feel**, not by hex:

| Name | Hex | Hue feel | Use when |
|---|---|---|---|
| Whisper | `#F2F4F7` | Barely-there cool | Subtle; almost white; lowest contrast with cards |
| Mist | `#ECEEF3` | Mid cool-grey | Default clean light; cards pop well |
| Slate Ghost | `#E8EBF2` | Strong blue-grey | Intentional palette statement; echoes dark surfaces |
| Parchment | `#F7F4F0` | Warm / editorial | Warm-toned brand aesthetic (legacy Arzadon default) |

## Ink colour on cool-grey backgrounds

When switching from warm (`#F7F4F0`) to cool (`#ECEEF3`+) backgrounds, update
ink tokens to match — a warm-toned ink (`#1A1612`) looks slightly disconnected on
cool-toned page backgrounds. Shift ink toward a cool-neutral:

```css
/* Warm-bg ink */
--ink:       #1A1612;
--ink-soft:  #4A4540;
--ink-muted: #6A655E;

/* Cool-bg ink (blue-grey shift) */
--ink:       #1A1A22;
--ink-soft:  #42424E;
--ink-muted: #68687A;
```

## ThemeProvider wiring

Each variant maps to `data-surface="light"` — they all produce the same surface
for tincture purposes, but different `data-theme` values for CSS variant overrides:

```ts
const SURFACE_FOR = {
  light: 'light',  // Mist
  grey:  'light',  // Whisper
  cool:  'light',  // Slate Ghost
  dark:  'dark',
};
```

`ThemeToggle` can expose swatch pickers for light variants — small coloured circles
that call `setTheme('grey' | 'light' | 'cool')` directly.

## Palette design rule

Dark surfaces in a dark-primary site carry a blue-grey hue (~220–225°, low
saturation). Light variants should share that same hue to feel like the same
palette. `#ECEEF3` and `#F2F4F7` are both ~220° — they pair naturally with
`#12151C` / `#242A36` / `#1C1F28` dark surfaces.

Warm parchment (`#F7F4F0`) is 35° — warm/golden. It feels editorial and intentional,
but creates a hue contrast against cool darks. Use only if the brand has a warm editorial identity.
