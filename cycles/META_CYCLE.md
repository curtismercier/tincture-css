# Tincture: Meta-Cycle Architecture

The Meta-Cycle defines how Tincture evolves across cycles. Each cycle is a
**shippable increment** of substrate, tooling, or polish — never a vague
waypoint. Cycles **reflect-and-expand**: closing cycle N updates its own doc
with what shipped + the decisions made, AND expands cycle N+1's spec with the
awareness gained.

---

## Phases

### Phase 1 — Substrate Foundation (Cycles 1–3)
Surface-aware token block, `data-surface` declarations, idempotent migration
scripts. Visual no-op; eliminates orphan-text-on-saturated-bg bugs by
construction. *(Note: v0.1 used `light-dark()` — pivoted to manual-override
pattern in v0.2 cycle 23. See `audits/2026-04-30-architecture-pivot.md`.)*

### Phase 2 — Registry + Codegen (Cycles 4–7)
Single source of truth at `tokens/registry.json`. Codegen produces CSS + TS
types + designer-studio manifest. Studio reads manifest, not strings.
*(Cycle 7 left 20 hardcoded-color files + 19 legacy-token files unswept —
deferred to cycle 34.)*

### Phase 3 — AI-Native Layer (Cycles 8–11)
MCP server exposing `tokens.*` and `mood.*` tools. Multi-state preview via
headless capture. Contrast guard in CI.

### Phase 4 — Library + Distribution (Cycles 12–20)
Component contracts, mood presets, extraction to standalone package, scaffold
CLI, docs site, npm publish, Tweakcn-style playground.
*(Cycles 17, 19, 20 shipped as stubs — see audit. Honestly deferred.)*

### Phase 5 — v0.2 Multi-Axis Substrate (Cycles 21–36)
Full multi-axis registry (color × surface × flavor × elevation × tone × mood),
multi-kind tokens (typography, spacing, radius, shadow, motion, brand-lock),
mood engine v0.2, body migration sweep, npm publish of v0.2.

---

## Recurring Patterns

- **Reflect-and-Expand** — every cycle close updates next cycle's spec with
  newly-known specifics
- **Codegen-First** — registry is source of truth; CSS/TS/manifest are
  derivative
- **Idempotent Sweeps** — every migration script supports `--dry / --check /
  --apply`; `--check` passes on clean tree before claiming done
- **Visual mosaic required** — for any cycle that touches CSS or component
  code, a mosaic capture MUST be produced and read before the cycle is marked
  done. `pnpm build` passing is necessary, not sufficient.
- **CDP eval over screenshot** — computed-style eval via browser CDP is cheaper
  and catches cascade bugs that screenshots miss. Do both.

## Closing the Loop (every cycle)

1. **Run acceptance** — every checkbox in cycle.md must pass
2. **Update cycle doc** — `[ ]` → `[x]`, append `## Changelog` (file:line of
   every change), append `## Decisions` (deviations from spec, why)
3. **Expand next cycle** — open cycle-(N+1).md and fill in concrete spec with
   this cycle's learnings
4. **Update cycle-index.json** — `status: "done"`, `next` pointer
5. **Commit** — single atomic commit per cycle, message format:
   `feat(tincture): cycle-N — <title>`

## Scope guardrails

- **Don't enlarge unprompted.** Cycle scope = the spec at start of cycle.
  Expansions land in subsequent cycles.
- **Show your work.** A cycle without a Changelog or Decisions section is not
  closed.
- **A future agent must reconstruct what shipped from the cycle doc alone.**

---

## Current State — 2026-05-01

### Shipped (30 cycles)

#### Phase 5 (v0.2) — cycles 21–30

| # | Title | Commit (arzadon) | Status |
|---|---|---|---|
| 21 | Multi-axis registry types + schema validator | `9971f38` (tincture-css) | ✅ done |
| 22 | Multi-axis codegen (cascade rules per cell + auto-fill reset) | `65a269f` (tincture-css) | ✅ done |
| 23 | Lossless v0.1 → v0.2 migration (deployed live) | `aec6f71` | ✅ done |
| 23-fu | Sweep 26 page heroes + Navbar pill (`data-surface="dark"`) | `2376093` | ✅ done |
| 23-fu2 | Broader sweep — image-overlay heroes + megamenu | `1aaef67` | ✅ done |
| 24 | Typography axis (16 tokens added to registry) | `cf3ae7b` | ✅ done |
| 25 | Spacing axis + surface scanner + auto-fill codegen | `fe10d6e` | ✅ done |
| 26 | Brand-lock primitives + mood engine v0.2 + Performance mood | `3de2532` | ✅ done |
| 27 | Migrate Hero h1 to typography tokens | `bc742b4` | ✅ done |
| 28 | Apply Performance mood (live demo) | `32ba457` | ✅ done |
| 29 | Font bridge + SectionHeading + Eyebrow → tokens | `73ac208` | ✅ done |
| 30 | Full heading sweep — 83 files, 382 lines (h1/h2/h3/h4) | `3d9ed42` | ✅ done |

*(For phases 1–4 / cycles 1–20, see `audits/2026-04-30-cycle-1-20-audit.md`.)*

### Live state on arzadon.gravicity.io (2026-05-01)

- Tincture v0.2.2 deployed
- Active mood: **Performance** (10-cell delta over baseline; reset via
  `node studio/scripts/tincture-mood-v2.mjs reset`)
- All h1/h2/h3/h4 tags: token-driven (weight, size, leading, tracking,
  font-family)
- Body text: **920 lines in 108 files still hardcoded** (cycle 34)
- ReviewWall.tsx has 1 hardcoded `font-semibold` on `<p>` (scanner flagged)
- Surface annotations: complete on all structural sections
- Font bridge: `--font-display` + `--font-body` → Archivo via layout wrapper div

---

## Remaining Work — Checklist

### Prelight (resolve before starting cycle 31)

> These questions block or shape the upcoming cycles. Answer them before
> writing implementation specs.

- [ ] **Transformation mood design brief** — "deep crimson + serif headlines +
  generous spacing" was mentioned but never specced. What are the exact token
  deltas? Does it need a new font-family (serif for display)? If so, font must
  be wired in Next/font before the mood can reference it.
  → Seam: `phase-5/cycle-31.md` (or a new cycle-31a if Transformation becomes
  its own cycle before clinical-v2)

- [ ] **Body typography token mapping** — the scanner found 920 lines.
  What token names cover body `<p>` sizes? `--type-body-1`, `--type-body-2`,
  `--type-body-3` exist in the registry. Do they cover the actual size ladder
  in the codebase? Need a mapping table before `tincture-apply-typography.mjs`
  can be extended for body context.
  → Seam: `phase-5/cycle-34.md`

- [ ] **Visual verification tooling** — `tincture-preview.mjs` exists but was
  never run (v0.1 cycle 9). Is Brave/CDP on `:9333` live right now? Does the
  mosaic tool (`screenshot-mosaic.py`) work against the tincture preview URLs?
  Confirm before cycle 33 tries to codify the protocol.
  → Seam: `phase-5/cycle-33.md`

- [ ] **Mood live state** — Performance mood is currently applied. Should we
  reset to baseline before starting mood-authoring cycles (31-32)? Or author
  moods against the Performance delta? Reset is one command.
  → `node studio/scripts/tincture-mood-v2.mjs reset`

- [ ] **Display font decision** (open from v02-scope.md) — system stack vs
  Playfair / Inter / arzadon-custom. Blocks Transformation mood if a serif
  display font is part of it. Curtis decision.

- [ ] **Cycle numbering reconciliation** — v02-scope.md planned cycles 29-30
  as Performance + Transformation moods. What actually shipped: font bridge
  (29) + heading sweep (30). Transformation mood was never cycled. Should it
  become cycle 31 (bumping clinical-v2 to 32, editorial-warm to 33, etc.)
  or fold into the existing cycle 31 spec?

---

### Cycle Queue (31–36)

> Each entry links to its cycle doc. Stubs below need specs filled before
> starting. Do not start a cycle with an empty spec.

#### Cycle 31 — Mood: `transformation`
→ [`phase-5/cycle-31.md`](phase-5/cycle-31.md)

**Current state:** stub (queued). Original plan was Transformation + clinical-v2
in this slot; clinical-v2 was the v02-scope plan. Transformation mood was
never authored.

Prelight needed:
- [ ] Transformation mood design brief from Curtis (colors, weight, spacing,
  font-family — is serif in scope?)
- [ ] Confirm display font decision before speccing

When ready, spec should define:
- Exact token deltas (all axes, all kinds)
- Live verification method (CDP eval + mosaic capture, specific pages)
- Whether `tincture-mood-v2.mjs reset` is needed first

---

#### Cycle 32 — Mood: `clinical` v2
→ [`phase-5/cycle-32.md`](phase-5/cycle-32.md)

**Current state:** stub. `moods/clinical.json` exists but is color-only (v0.1
shape). Needs multi-axis upgrade: typography + spacing deltas for the
"clinical" feel (clean, precise, data-forward).

Prelight:
- [ ] Define what "clinical" means beyond color: tight spacing? mono accents?
  lighter weight? No bold display? One sentence per axis.

---

#### Cycle 33 — Visual verification protocol
→ [`phase-5/cycle-33.md`](phase-5/cycle-33.md)

**Current state:** stub. `tincture-preview.mjs` was written in v0.1 cycle 9
but never run. The protocol it was meant to codify doesn't exist in practice.

This cycle's output: `scripts/tincture-verify-visual.mjs` — a script that:
1. Iterates mood list
2. For each mood: applies → captures mosaic → resets
3. Outputs `tincture-cache/<mood>-<date>.jpg` per run
4. Diffs against previous run (pixel-level or content-hash)

Prelight:
- [ ] Confirm Brave CDP on `:9333` is available in the build environment
- [ ] Confirm `screenshot-mosaic.py` works against localhost:3000

---

#### Cycle 34 — Body typography sweep
→ [`phase-5/cycle-34.md`](phase-5/cycle-34.md)

**Current state:** stub. Scanner baseline: **920 lines, 108 files hardcoded**.
Heading migration is done (cycle 30). Body is untouched.

Scope of sweep:
- `<p>` font-size classes → `text-[length:var(--type-body-{1,2,3})]`
- `font-bold` / `font-semibold` on `<p>` and `<span>` → TBD (not heading
  weight; needs a `--weight-body-emphasis` token or keep as-is?)
- Component internals: `StatsStrip` number displays, `Pricing` amounts,
  `ReviewStrip` eyebrow labels
- `ReviewWall.tsx` L73 hardcoded `font-semibold` eyebrow

Prelight:
- [ ] Audit body token coverage: do `--type-body-1/2/3` match the actual size
  ladder in the codebase? Run `tincture-scan-typography.mjs` with body-context
  mode (or read scanner output for non-heading-context lines).
- [ ] Decide: `font-bold` on body emphasis → token or leave?
- [ ] Extend `tincture-apply-typography.mjs` for body context, or write a
  separate `tincture-apply-body.mjs`?

---

#### Cycle 35 — Studio designer UI
→ [`phase-5/cycle-35.md`](phase-5/cycle-35.md)

**Current state:** stub. Designer page (`/studio`) reads the manifest but
only exposes color pickers. Typography + spacing axes need UI controls.

Prelight:
- [ ] Confirm `/studio` page loads and color pickers work today
- [ ] Decide axis picker shape: dropdowns, sliders, or preview tiles?

---

#### Cycle 36 — npm publish `@tincture/core@0.2.0`
→ [`phase-5/cycle-36.md`](phase-5/cycle-36.md)

**Current state:** stub. v0.1 claimed "publish-ready" but `npm publish` was
never run. v0.2 is a better publish target.

Prelight:
- [ ] Confirm npm org scope (`@tincture` or personal?)
- [ ] Confirm package entry: does `tincture-css/` have a clean `package.json`
  with correct `exports` and `files` fields?
- [ ] Decide: publish from `~/Gravicity/personal/tincture-css/` directly, or
  CI-gated?

---

## Open Decisions (need Curtis input, not blocking except where noted)

| # | Decision | Blocks |
|---|---|---|
| D1 | Display font for Transformation mood (serif? which?) | Cycle 31 |
| D2 | Body emphasis weight → token or hardcode? | Cycle 34 |
| D3 | npm org scope (`@tincture` vs personal) | Cycle 36 |
| D4 | Axis picker shape in studio designer | Cycle 35 |
| D5 | Cycle 31 = Transformation? or clinical-v2 first? | Ordering |
| D6 | Mood reset before authoring new moods? | Cycles 31-32 |

---

## Known Bugs (live, not yet fixed)

From the 2026-04-30 cycle audit — patched `data-tone="feature"` but three
rules remain with the same pattern:

1. `section[data-tone="prose"]` → `color: var(--tone-prose-text)` (legacy)
2. `section[data-tone="surface"]` → `color: var(--tone-surface-text)` (legacy)
3. `section[data-tone="brand-band"]` → `color: var(--tone-brand-band-text)` (legacy)

These are the same specificity-override bug as `feature`. Patch shape: replace
with `color: var(--ink)` and remove the old `--tone-*-text` references.
*Cheap fix (~10 min) — worth doing before cycle 31 to avoid compounding.*

→ Can fold into cycle 34 sweep or fix standalone. Either way: **before any
  mood-authoring cycle**, so mood previews show accurate colors.

---

## Seam Map

```
META_CYCLE.md (this file)
│
├── cycles/v02-scope.md          — full token-kinds list, mood-delta format,
│                                   axis-collision rules, open decisions
├── cycles/audits/
│   ├── 2026-04-30-cycle-1-20-audit.md   — honest v0.1 cycle-by-cycle status
│   └── 2026-04-30-architecture-pivot.md — why light-dark() was wrong
│
├── cycles/phase-5/
│   ├── cycle-21.md  ✅ done — multi-axis registry types
│   ├── cycle-22.md  ✅ done — multi-axis codegen
│   ├── cycle-23.md  ✅ done — v0.1→v0.2 migration (live)
│   ├── cycle-24.md  ✅ done — typography axis
│   ├── cycle-25.md  ✅ done — spacing axis + scanner
│   ├── cycle-26.md  ✅ done — brand-lock + mood engine v0.2 + Performance mood
│   ├── cycle-27.md  ✅ done — Hero h1 to typography tokens
│   ├── cycle-28.md  ✅ done — Performance mood applied (live)
│   ├── cycle-29.md  ✅ done — font bridge + SectionHeading + Eyebrow
│   ├── cycle-30.md  ✅ done — full heading sweep (83 files, 382 lines)
│   ├── cycle-31.md  ⬜ stub — Transformation mood (prelight needed)
│   ├── cycle-32.md  ⬜ stub — clinical-v2 mood
│   ├── cycle-33.md  ⬜ stub — visual verification protocol
│   ├── cycle-34.md  ⬜ stub — body typography sweep (920 lines)
│   ├── cycle-35.md  ⬜ stub — studio designer UI
│   └── cycle-36.md  ⬜ stub — npm publish
│
└── consumers/arzadon-fitness.md  — consumer-side notes, font bridge
                                    constraint, live state pointer
```

---

*Last updated: 2026-05-01 (s01-de76c7). Next agent: read Prelight checklist
before touching any cycle 31+ work. The open decisions block the specs;
specs block the cycles; cycles block the ship.*
