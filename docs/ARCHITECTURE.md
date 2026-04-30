# Architecture

## Four primitives

1. **Surface declares luminance.** `data-surface="dark"` flips `color-scheme`. Tokens with `light-dark(A, B)` resolve to A or B based on closest ancestor's color-scheme.
2. **Tokens are pairs, not singles.** Every semantic token has both light and dark values.
3. **Three orthogonal axes.** Surface (light/dark) × Flavor (cool/warm/ember) × Mood (clinical/editorial/aggressive/etc).
4. **Registry is data.** `registry.json` → codegen → CSS + TS types + manifest. Single source of truth.

## Layers

```
Mood preset       — coordinated delta across many tokens
    │
    ▼
Registry          — typed tokens with semantic metadata
    │
    ▼
Semantic tokens   — light-dark() pairs
    │
    ▼
Primitives        — raw values (never edited at runtime)
```

## Why not just shadcn/Tweakcn?

- shadcn token list is hand-curated; designer studios drift
- Tweakcn locks you to shadcn variants
- Neither models component contracts (which tokens does Hero ACTUALLY read?)
- Neither has agent-native query interface for natural-language edits
- Neither has multi-state preview (light × dark × current × proposed)

## Why not Style Dictionary or Panda CSS?

- Style Dictionary is great as a data layer but heavy build pipeline
- Panda is amazing for typed CSS-in-JS but requires migrating off Tailwind v4
- Tincture sits ABOVE Tailwind v4 + next-themes; doesn't replace them

## Bug class eliminated

The 16+ orphan-button bugs that motivated Tincture (s01-91da41 sweep) are now structurally impossible:

- A button's bg = `var(--accent)` → resolves correctly per surface
- A button's text = `var(--accent-fg)` → always white on saturated accent
- The button can't have black-text-on-red because `--accent-fg` is surface-invariant white

Add a new component? It uses `var(--ink)` and `var(--bg)` and gets correct contrast for free.
