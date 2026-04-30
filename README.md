# Tincture

> A drop changes the whole pour.

A surface-aware design substrate for AI-mediated theming. Built for AI agents and humans who want to compose entire visual identities from coordinated multi-axis token deltas, not hand-curated palette swaps.

**Status:** v0.1.1 (manual override pattern, color-only). v0.2 in scope (multi-axis registry — see `cycles/v02-scope.md`).

## Project layout

| Path | What |
|---|---|
| `src/` | The publishable substrate (foundation + registry + scripts + moods) |
| `cycles/` | Cycle docs, audits, v0.2 scope. Each cycle = one verifiable shipped outcome |
| `consumers/` | How real projects integrate Tincture (e.g. `arzadon-fitness.md`) |
| `docs/` | Quickstart, architecture, mood authoring |
| `tools/vscode-tincture/` | VSCode extension stub |
| `package.json` | `@tincture/core` (target v0.2.0; v0.1.x in flight) |

## Where the tool ends and the consumer begins

- **Tincture lives here** (`~/Gravicity/personal/tincture-css/`). Source code, project plans, cycle docs, npm package definition.
- **Arzadon is consumer #1** (`~/Gravicity/clients/arzadon-fitness/studio/`). Live testing ground; runs Tincture in production. Has a local copy of the substrate but does NOT own the tool's plans or history.
- **Other consumers welcome.** The substrate is publishable; v0.2 lands as `npm install @tincture/core` (cycle 36).

See `consumers/arzadon-fitness.md` for the consumer-integration pattern.

---

## Original notes


> **A drop changes the whole pour.** Surface-aware design substrate for AI-mediated theming.

A 4-layer CSS architecture that combines `light-dark()` for surface-aware ink + a typed token registry for AI-mediated changes + mood presets for one-command vibes. Orphan-text-on-saturated-bg bugs are structurally impossible. One command (`tincture mood <name>`) coordinates a full visual shift. Designer studio tree IS the registry tree.

## Why

Existing systems (shadcn, Tweakcn, Onlook, Panda CSS, Style Dictionary, Open Props, Radix Colors, vanilla-extract) each solve one piece. None solve all of:

1. **AI-native** — agents edit via structured ops, not regex on className
2. **Surface-aware ink** — buttons can't have black text on red bg by construction
3. **Multi-state preview** — change once, preview light × dark × any custom surface
4. **One-command vibe shifts** — moods are coordinated deltas across colors + spacing + radius + typography
5. **Typed component contracts** — components declare their tokens; studio knows exactly what each component owns
6. **Bidirectional reverse-lookup** — "where does this token render?" answered from data

Tincture is the substrate that does.

## Architecture

```
   Mood preset       (delta across many tokens — one command shift)
       │
       ▼
   Registry          (typed tokens, semantic metadata, alternatives, contrast pairs)
       │
       ▼
   Semantic tokens   (light-dark() pairs at :root, theme-aware)
       │
       ▼
   Primitives        (raw values; never edited at runtime)
```

Plus three orthogonal axes:
- **Surface** (light / dark) — luminance, drives ink + bg + border via `color-scheme` + `light-dark()`
- **Flavor** (cool / warm / ember) — tonal palette tints
- **Mood** (clinical / editorial / aggressive / minimalist / luxurious) — coordinated delta across all three

## Status

**Phase 0 shipped** — foundation lives in `arzadon-fitness/studio/` as the proving ground (commit `25dd915`). 12 `light-dark()` core tokens + 7 `data-surface="dark"` annotations + idempotent migration script.

The substrate becomes a standalone package once Phases 1-7 are done in the proving ground. Cycle 16 of this project handles the extraction.

See:
- [PLAN.md](./PLAN.md) — the living plan
- [cycles/META_CYCLE.md](./cycles/META_CYCLE.md) — cycle architecture
- [cycles/cycle-index.json](./cycles/cycle-index.json) — machine-readable index

## Origin

Conceived 2026-04-30 (s01-91da41) during the arzadon-fitness palette iteration. After ~30 commits of theme work in one session, Curtis: "what about that color-accent-secondary"… and from there, the whole thing crystallized — the cause of the iteration loop wasn't bad colors, it was a substrate that didn't model what we cared about (surfaces, ink-pairing, moods). Tincture is the substrate.
