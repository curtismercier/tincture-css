---
id: cycle-34
phase: 5
title: Body typography sweep — 920 lines, 108 files
status: prelight
created: 2026-04-30
updated: 2026-05-01
parent_doc: ../v02-scope.md
---

# Cycle 34 — Body typography sweep

## Status

**prelight** — scanner baseline known; blocked on two decisions before
`tincture-apply-typography.mjs` can be extended for body context.

---

## Scanner baseline (2026-05-01)

```
108 files · 920 lines with hard-coded typography
Heading-context (already done, cycle 30): 1 line remaining (intentional mono label)
Body-context (this cycle): ~919 lines
```

Run to refresh: `node scripts/tincture-scan-typography.mjs`

---

## Prelight checklist

- [ ] **D2 — Body emphasis weight** — `font-bold` / `font-semibold` on `<p>`
  and `<span>` (emphasis, callouts, stat labels). Should these become a token
  (e.g. `--weight-body-emphasis: 600`) or stay as Tailwind utilities? The
  heading sweep used `--weight-display` / `--weight-heading`. A body-weight
  token follows the same pattern; hardcoding leaves them mood-blind.

- [ ] **Body token coverage audit** — Confirm `--type-body-1/2/3` values
  match the actual class ladder in the codebase. The scanner shows what classes
  exist; the registry shows what tokens exist. Run both and build a mapping
  table before extending the apply script:

  ```
  text-base   → --type-body-1 ?
  text-sm     → --type-body-2 ?
  text-xs     → --type-body-3 ?
  text-lg     → ? (no body-0 token yet?)
  ```

  If gaps exist, add missing tokens to registry BEFORE sweep.

- [ ] **Three `data-tone="*"` bug fix** — patch `globals.css` before the
  sweep (prose, surface, brand-band rules). If the bug is live during the
  sweep, body text in those sections will look wrong in verification.

- [ ] **Script strategy** — extend `tincture-apply-typography.mjs` with a
  `--body` mode, or write a separate `tincture-apply-body.mjs`? The heading
  script is already in use; a separate script keeps concerns isolated and makes
  the body sweep independently re-runnable.

---

## Known scope of body hardcoding

From scanner output (non-heading-context lines):

### Component internals (not just `<p>` tags)
- `StatsStrip` — number display sizes (`text-4xl`, `text-5xl` on stat values)
- `Pricing` — price amounts (`text-3xl font-bold`)
- `ReviewStrip.tsx` — eyebrow `<p>` L53: `font-semibold tracking-[0.3em]`
- `ReviewWall.tsx` — eyebrow `<p>` L73: `font-semibold tracking-[0.3em]`
- `ResultsGallery.tsx` — result labels
- `MigrationTimeMachine.tsx` — UI label text

### Body copy `<p>` sizes across pages
Standard prose: `text-base`, `text-lg`, `text-sm`, `text-xl` (lead paragraph).

### Font-bold on non-headings
`font-bold` and `font-semibold` on `<p>`, `<span>`, `<li>`, `<td>`.

---

## Implementation spec (fill in after prelight)

### Mapping table

| Current class | Token | Notes |
|---|---|---|
| `text-lg` | `--type-body-1` (confirm) | Lead paragraph / large body |
| `text-base` | `--type-body-2` (confirm) | Standard prose |
| `text-sm` | `--type-body-3` (confirm) | Secondary / caption |
| `text-xs` | `--type-body-3` or leave? | Very small — check if token fits |
| `font-semibold` on `<p>` | `--weight-body-emphasis` (TBD) | Needs D2 resolved |
| `tracking-[0.3em]` on eyebrows | `--track-eyebrow` (already exists) | ReviewStrip / ReviewWall |

### Script mode

`node scripts/tincture-apply-typography.mjs --body --apply`

Or: `node scripts/tincture-apply-body.mjs --apply`

Either way: `--dry` first, review diff, `--check` in CI gate.

### Acceptance

- [ ] Scanner: 920 → ≤ 20 lines (allow intentional non-token patterns)
- [ ] `pnpm build` clean
- [ ] CDP eval: a `<p>` in a feature section picks up the right body size token
- [ ] Mosaic capture of body-heavy pages (about, blog, results prose sections)
- [ ] `--check` mode passes on clean tree (CI gate ready)

---

## Seams

- **Upstream:** cycle-30 (heading sweep done — heading tokens won't conflict)
- **Upstream:** cycle-33 (visual verification protocol should be ready before
  this cycle marks "done" — use it for mosaic acceptance)
- **Downstream:** cycle-35 (studio designer needs body tokens to have pickers)
- **Registry:** add body-weight-emphasis token if D2 resolves to "token"
- **Scanner:** `scripts/tincture-scan-typography.mjs` — run before + after

---

## Decisions log

*(Fill in after cycle closes)*
