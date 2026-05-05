# Changelog

All notable changes to Tincture CSS are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).  
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- **Per-page moods** — documented and tooled. The same `--mood-*` indirection
  layer that powers site-wide moods also activates a mood on any DOM wrapper
  via `data-mood="X"`. Cascades through nested data-surface blocks (page +
  navbar + footer if they're under the wrapper). No CLI invocation, no
  registry mutation — the mood JSON ships in the bundle and the framework
  sets the attribute when the route matches.
  - `docs/architecture/per-page-moods.md` — full pattern, activation strategies
    (Next.js layout / page component / per-section), partial-token discipline,
    common pitfalls.
  - `src/moods/per-page-example.json` — minimal 4-token template demonstrating
    partial-token override (accent + accent-warm + accent-fg + font-display).
  - README + `docs/MOODS.md` — sections added pointing at the new docs.
  - First production consumer: [Arzadon Fitness](consumers/arzadon-fitness.md)'s
    `jennifer-editorial` mood on `/about/jennifer-arzadon`. Validates the
    pattern in production: champagne accents + DM Serif Display cascading
    through navbar, page, and footer simultaneously, with everything
    outside that route untouched.

- `src/foundation/foundation.css` — `slate` and `steel` surface declarations.
  `slate` (#242A36-range) for section breaks between dark content blocks;
  `steel` (#1C1F28-range) for calculators and data-heavy interactive surfaces.
  Both set `color-scheme: dark` — ink/accent/border tokens inherit dark-side
  values; only bg/bg-card/bg-elev need consumer overrides.
- `docs/architecture/light-variants.md` — light theme variant pattern.
  Documents Mist/Whisper/Slate Ghost cool-grey palette variants, compound
  CSS selector approach (`[data-theme="X"][data-surface="light"]`), ink colour
  shifts for cool backgrounds, and ThemeProvider wiring.
- `docs/architecture/theme-surface-pattern.md` — ThemeSurface component pattern.
  Solves the server-component/client-theme gap in Next.js (and similar SSR
  frameworks): minimal client wrapper that applies `data-surface` at runtime
  while all children stay server-rendered. Includes when-to-use decision table.
- `tools/tincture-lint.mjs` — static surface-correctness auditor ported from
  Arzadon Fitness production build. Reads consumer config from `tincture.config.json`.
  Rules: `raw-hex-section` (CRITICAL), `legacy-token`/`surface-mismatch` (HIGH),
  `bare-section` (MEDIUM). Score: `100 - (critical×15) - (high×5) - (medium×1)`.
  Flags: `--check` (exit 1 on C/H), `--no-demos`, `--json`.
  Dynamic `data-surface={...}` expressions recognised as valid.

### Added (continued — 2026-05-03)
- `docs/architecture/surface-extensions-pattern.md` — the mood bridge pattern.
  How to create a `surface-extensions.css` that re-declares surface tokens as
  `var(--mood-TOKEN, fallback)` so mood overrides cascade through `data-surface`
  blocks. Covers: import order, which tokens need passthrough vs which inherit
  freely, adding surfaces outside the codegen, updating mood generators to emit
  `--mood-*` keys. Root insight: generated CSS gets clobbered by same-specificity
  hand-written rules later in the cascade — `surface-extensions.css` must be the
  LAST import for its overrides to win.
- `tools/tincture-lint.mjs` — added `--mood-border` / `--mood-border-soft` to
  the MOOD_PASSTHROUGH set documentation (border tone is mood-relevant).

  `tincture-lint-ignore` directive: add `// tincture-lint-ignore` or
  `{/* tincture-lint-ignore */}` on the line before any intentional exception
  (demo chrome, semantic status colours, string literals in data arrays).

### Changed
- `src/foundation/foundation.css` — `[data-surface]` comment block expanded with
  slate and steel use-case descriptions.

---

## [0.2.2] — 2026-05-01

### Added
- `src/cli/_resolve-config.mjs` — shared config discovery module. Reads
  `tincture.config.json` by walking up from CWD, falling back to
  `tincture/registry.json` defaults. Eliminates all hardcoded consumer
  project paths from public CLI scripts.
- `tincture.config.example.json` — consumer config template. Copy to
  project root and set `registryPath`, `outDir`, `moodsDir`.
- `src/moods/default.json` — generic baseline mood. Replaces
  `arzadon-default` as the public default; all other presets base on this.
- `tincture.skill.md` — Tier 2 Claude skill for implementing Tincture in
  a new project. Covers install, config, token authoring, mood application,
  surface annotation, and common errors.
- `assets/` — SVG diagrams for README: `surfaces.svg`, `mood-engine.svg`,
  `typography.svg`. Rendered as images on GitHub.
- `CHANGELOG.md` — this file.

### Changed
- `src/cli/tincture.mjs` — replaced hardcoded `src/tenants/arzadon/tincture/`
  paths with `_resolve-config.mjs` imports (`REGISTRY_PATH`, `MANIFEST_PATH`,
  `MOODS_DIR`). Component scan now walks `process.cwd()` instead of the
  package's own `src/`. Stale script name refs updated
  (`tincture-codegen.mjs` → `codegen.mjs`, `tincture-validate-registry.mjs`
  → `validate.mjs`).
- `src/cli/codegen.mjs` — `ROOT` changed from `__dirname/../` to
  `process.cwd()` so codegen runs against the consumer project.
- `src/cli/mood-v2.mjs` — `ROOT` changed to `process.cwd()`. `CODEGEN`
  path corrected from non-existent `scripts/tincture-codegen-v2.mjs` to
  sibling `codegen-v2.mjs`. Paths imported from `_resolve-config.mjs`.
- `src/cli/scan-surfaces.mjs` — confirmed correct: already uses
  `arg('--root', process.cwd())`. No change needed.
- `src/cli/verify.mjs` — `ROOT` changed to `process.cwd()`. Consumer
  component files now resolved against project root, not package dir.
- `src/cli/validate.mjs` — unused `ROOT = resolve(__dirname, '..')` removed.
  Registry path via `_resolve-config.mjs`.
- `src/cli/contrast.mjs` — unused `ROOT` removed. Manifest via
  `_resolve-config.mjs`.
- `src/cli/preview.mjs` — `ROOT` changed to `process.cwd()`. Cache dir
  written to consumer project (`.tincture-cache`), not package dir. `HOST`
  from `_resolve-config.mjs`.
- `src/cli/migrate-v01-to-v02.mjs` — `--in` default changed from the
  now-gitignored `registry.example.json` to `registry.json` in CWD.
- All mood presets (`aggressive-bold`, `clinical`, `editorial-warm`,
  `luxurious-refined`, `minimalist-quiet`, `performance`) — `base` field
  changed from `"arzadon-default"` to `"default"`.
- `src/registry.v02-example.json` — "Arzadon wordmark" doc string → generic.
- `src/types.ts` — example string `"arzadon-fitness/tincture"` → generic
  `"my-brand/tincture"`.
- `docs/MOODS.md`, `docs/QUICKSTART.md` — `arzadon-default` references
  updated to `default`.
- `README.md` — full rewrite: SVG diagrams, comparison table (Style
  Dictionary, Radix Colors, Panda CSS, shadcn/ui, Tailwind v4), quickstart,
  consumer integration section. Origin section updated: built for
  Arzadon Fitness's new site (coming soon).

### Removed (from git index — files preserved locally as `_internal/`)
- `consumers/arzadon-fitness.md` — project-specific integration doc.
- `cycles/` — internal development history (36 cycle files).
- `src/_generated/`, `src/_generated-v2/` — codegen output containing
  consumer project paths. Generated files should never be committed to the
  package repo.
- `src/cli/init.mjs` — project-specific wiring for Arzadon's directory
  structure.
- `src/cli/migrate-components.mjs` — walks Arzadon component directories.
- `src/cli/untangle.mjs` — wires Arzadon's `globals.css` + `ThemeProvider`.
- `src/cli/mood.mjs` — v0.1 mood script, superseded by `mood-v2.mjs`.
- `src/registry.example.json` — contained Arzadon component file paths.

### Fixed
- `src/cli/tincture.mjs` `mood list` command — `moodsDir` variable was
  referenced before assignment after `_resolve-config.mjs` refactor. All
  local `moodsDir` refs updated to `MOODS_DIR`.

---

## [0.2.1] — 2026-04-30

### Added
- Typography axis: 16 tokens covering display/body sizing (fluid `clamp()`),
  weight scale, leading, tracking, and font-family stacks.
- Surface scanner (`scan-surfaces.mjs`) — build-time annotation detection.
  Flags `<section>` elements with dark background classes but missing
  `data-surface` annotation.
- Brand-lock primitives — `"locked": true` schema field. Validator rejects
  mood deltas targeting locked tokens.
- Mood engine v0.2 (`mood-v2.mjs`) — multi-token coordinated delta.
  Baseline snapshot (`registry.baseline.json`) enables rollback.

### Changed
- Schema migrated to v2.0: multi-axis `values` object replaces flat
  `light`/`dark` pair. `migrate-v01-to-v02.mjs` ships for lossless upgrade.
- Codegen v2 (`codegen-v2.mjs`) — emits one CSS rule per axis-cell, ordered
  by specificity. Replaces v1 codegen for v0.2 registries.

---

## [0.2.0] — 2026-04-29

### Added
- Multi-axis token schema: tokens declare which axes they vary on
  (`surface`, `flavor`, `elevation`, `tone`). Codegen emits rules per cell.
- TypeScript type declarations (`src/types.ts`).
- Schema validator (`schema.mjs`) — validates registry + mood JSON at
  author time.
- `codegen-v2.mjs` — v0.2 codegen with axis-aware emission.
- `migrate-v01-to-v02.mjs` — lossless v0.1 → v0.2 registry migration.
- Tests: `test-schema.mjs` (39 cases), `test-codegen.mjs` (34 cases),
  `test-migration.mjs`.

### Changed
- Mood format upgraded to v2.0: `tokens` is now a map of token-id →
  `{ values: { "axis=val": "..." } }` instead of flat color map.

---

## [0.1.1] — 2026-04-28

### Added
- Flavor overlay system (`flavors.css`) — `data-flavor="warm|cool|ember"`
  overlays on top of surface tokens.
- VS Code extension (`tools/vscode-tincture/`) — token hover + autocomplete
  for registry IDs in `.tsx`/`.css` files.
- `tincture.mjs` CLI — `tokens list|get|find|impact|set`, `mood list|apply`,
  `validate`, `codegen`, `contrast`.

### Fixed
- Surface cascade reset — `data-surface` elements now re-declare all tokens
  at their level to prevent inheritance bleed from parent surfaces.

---

## [0.1.0] — 2026-04-27

### Added
- Initial substrate: `foundation.css` with four surfaces (`dark`, `slate`,
  `steel`, `light`), 11 semantic color tokens, radius scale, shadow scale.
- Registry format v0.1: flat `{ "token-id": { "light": "...", "dark": "..." } }`.
- `codegen.mjs` — registry → `_generated/foundation.css` + `manifest.json` +
  `tokens.d.ts`.
- `validate.mjs` — registry integrity check.
- `contrast.mjs` — WCAG AA/AAA audit across surface × token pairs.
- Mood presets: `performance`, `clinical`, `editorial-warm`, `luxurious-refined`,
  `aggressive-bold`, `minimalist-quiet`.
- `manifest-loader.ts` — TypeScript entry point for manifest consumption.
- MIT license.

[Unreleased]: https://github.com/curtismercier/tincture-css/compare/v0.2.2...HEAD
[0.2.2]: https://github.com/curtismercier/tincture-css/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/curtismercier/tincture-css/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/curtismercier/tincture-css/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/curtismercier/tincture-css/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/curtismercier/tincture-css/releases/tag/v0.1.0
