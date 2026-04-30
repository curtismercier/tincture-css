# Session log — 2026-04-30 s01-91da41-tincture-fix

**Trigger:** Curtis pushback on Tincture v0.1 (color-only substrate, paper cycles, broken Hero text).
**Outcome:** Foundation pivoted from `light-dark()` to manual override pattern. Hero + CTA band fixed live. Honest audit written.

---

## What was claimed before this session

20 cycles "shipped" — Tincture substrate built end-to-end:
- Phase 0: foundation.css with `light-dark()` tokens
- Phase 1: surface untangle + component migrations
- Phase 2: registry.json + codegen + validator
- Phase 3: CLI + preview + contrast + verifier
- Phase 4: mood presets + extraction to standalone repo

All marked `done` in `cycles/cycle-index.json`.

## What this session uncovered

### Bug 1 — `section[data-tone="feature"]` specificity override
Curtis screenshot showed Hero "YOUR TRANSFORMATION IS" rendering DARK on dark. CSS rule had specificity 0,1,1 (higher than Tailwind utility 0,1,0) and was setting `color: var(--tone-feature-text)` which on light/grey theme resolved to legacy `var(--color-text-primary)` = `#1A1612` dark slate. Fix: `ba99eaf` — read `var(--ink)` directly.

### Bug 2 — Same pattern in `prose`/`surface`/`brand-band` rules
Self-audit found 3 more rules with identical specificity bug. Fix: `fb21e02`.

### Bug 3 — `light-dark()` polyfill broken inside custom property definitions (architectural)
**This was the big one.** v0.1 declared:
```css
:root { --ink: light-dark(#1A1612, #FFFFFF) }
```
Lightningcss polyfilled to:
```css
:root { --ink: var(--lightningcss-light, #1A1612) var(--lightningcss-dark, #FFFFFF) }
```
But `var()` substitution inside a custom-property definition resolves at THE DEFINING ELEMENT'S context (`:root`). `:root` has color-scheme `light` (because ThemeProvider writes `data-surface="light"` on `<html>`), so `--ink` is COMPUTED to `#1A1612` at root. Descendants under `[data-surface="dark"]` flip color-scheme but inherit the already-resolved LIGHT value of `--ink`.

CDP eval against live confirmed:
```
hero_section_color_scheme: 'dark'   ← rule matches
hero_section_ink: '#1a1612'         ← but value frozen at light
hero_h1_color: 'rgb(26, 22, 18)'    ← rendered dark
```

**The light-dark() polyfill works for direct property usage** (`color: light-dark(A, B)`) but **breaks for the registry/foundation pattern** I designed Tincture around. This invalidates the central architectural choice of v0.1.

Fix: `5a03627` + `5d12fec` — pivot to manual override pattern:
```css
:root                 { --ink: #1A1612 }
[data-surface="dark"] { --ink: #FFFFFF }
[data-surface="light"] { --ink: #1A1612 }
```
Cascade works correctly. No polyfill needed. Works in every browser back to ~2017.

### Bug 4 — Codegen undoing source fix every build
After fixing source `foundation.css`, the next `pnpm build` ran prebuild → `tincture-codegen.mjs` → regenerated `_generated/foundation.css` with the OLD `light-dark()` form from registry.json. The generated file is what `globals.css` imports. Caught by visual verification showing `version: "0.1.0"` and `light-dark()` still in live CSS post-deploy. Fix: `5d12fec` — updated `tincture-codegen.mjs` `emitFoundation()` to emit the new pattern.

---

## Live verification (final state, post-`5d12fec`)

CDP runtime values against `https://arzadon.gravicity.io/`:
```
hero_h1_color:     rgb(255, 255, 255)   ← WHITE on dark ✓
hero_section_ink:  #fff                  ← cascade works
cta_h2_color:      rgb(255, 255, 255)   ← WHITE on dark ✓
cta_section_ink:   #fff                  ← cascade works
root_ink:          #1a1612               ← LIGHT at root ✓
```

Visual screenshots:
- `/tmp/hero-fixed.jpg` — Hero readable, white text on dark video bg
- `/tmp/cta-band-fixed.jpg` — CTA band readable, both buttons + headline correct

Live CSS:
```css
:root { --ink: #1a1612; ... }
[data-surface="dark"] { --ink: #fff; ... }
[data-surface="light"] { --ink: #1a1612; ... }
```
Zero `light-dark()` calls remaining.

---

## Commits this session

| Commit | Title | What it does |
|---|---|---|
| `ba99eaf` | fix: hero text invisible — section[data-tone=feature] | Patches one specificity bug |
| `fb21e02` | fix: 3 remaining data-tone bugs | Patches `prose`/`surface`/`brand-band` |
| `5a03627` | fix: light-dark polyfill broken — pivot to manual override | Source `foundation.css` rewrite |
| `5d12fec` | fix: codegen now emits manual override pattern | `tincture-codegen.mjs` updated |

---

## Honest cycle-index reclassification (saved to standalone repo)

| Bucket | Count | Cycles |
|---|---|---|
| Real + verified | 11 | 1, 2, 3, 4, 5, 6, 8, 10, 11, plus the 4 fixes above |
| Real + bug shipped to prod | 1 | 7 (caused specificity bug exposure) |
| Real + tool unused | 1 | 9 (preview script — finally used this session) |
| Real + batched | 4 | 12, 13, 14, 15 |
| Real + untested as package | 3 | 16, 17, 18 |
| Stub | 1 | 19 |
| Not actually published | 1 | 20 |

---

## Lessons captured

1. **Visual verification is mandatory for theme work.** `pnpm build` only catches syntax. Light-dark() polyfill behavior, CSS specificity bugs, and codegen-undoes-fix loops are only visible in the rendered DOM.

2. **`light-dark()` is great for direct property usage, broken for the registry pattern.** If a future project wants to use light-dark(), use it as the property value (`color: light-dark(A, B)`) — never inside a custom property definition that's then inherited.

3. **Codegen is upstream of source files.** Fixing the source isn't enough if a prebuild regenerates from a registry. The script that emits the artifact is the canonical source-of-truth.

4. **CDP eval is the cheapest visual verification.** No puppeteer-core install needed — chrome's devtools is exposed at `localhost:9333` and you can WebSocket directly. Total tool: ~50 lines of node.

5. **Compact-loss mitigation: write to disk.** Forensic state (audit reports, session logs) lives in `.soma/reports/` and `.soma/memory/sessions/`. The conversation summary is generic; the disk-resident state is specific.

---

## What's still open (for next session / cycle 21+)

1. **v0.2 scope spec** — `~/Gravicity/personal/tincture-css/cycles/v02-scope.md` defines typography + spacing + radius + shadow + motion tokens, brand-lock primitives, and richer mood deltas. Not started.
2. **Update `tincture-foundation.mjs` (init script)** — also emits `light-dark()` form. Same fix needed if the script is run again.
3. **Mood JSONs (cycles 12-15) untested end-to-end** — `tincture mood apply <name>` engine works in principle but never verified to swap colors across all surfaces on live.
4. **Cycle 17 `create.mjs` scaffold** — never tested in a fresh project.
5. **Cycle 19 VSCode extension** — stub manifest only.
6. **Cycle 20 npm publish** — not actually published.
7. **`registry.json` version** — still `0.1.0`; should bump to `0.1.1` (cosmetic; reflects the architecture pivot).
