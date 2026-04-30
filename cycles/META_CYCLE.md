# Tincture: Meta-Cycle Architecture

The Meta-Cycle defines how Tincture evolves across 20 cycles. Each cycle is a **shippable increment** of substrate, tooling, or polish — never a vague waypoint. Cycles **reflect-and-expand**: closing cycle N updates its own doc with what shipped + the decisions made, AND expands cycle N+1's spec with the awareness gained.

## Foundational Phases

- **Phase 1: Substrate Foundation** (Cycles 1-3)
  Core `light-dark()` token block, surface declarations, idempotent migration scripts. Visual no-op; eliminates orphan-text-on-saturated-bg bugs by construction.

- **Phase 2: Registry + Codegen** (Cycles 4-7)
  Single source of truth at `tokens/registry.json`. Codegen produces CSS + TS types + designer-studio manifest. Studio reads manifest, not strings.

- **Phase 3: AI-Native Layer** (Cycles 8-11)
  MCP server exposing `tokens.*` and `mood.*` tools. Multi-state preview via headless capture. Contrast guard in CI.

- **Phase 4: Library + Distribution** (Cycles 12-20)
  Component contracts, mood presets, extraction to standalone package, scaffold CLI, docs site, npm publish, Tweakcn-style playground.

## Recurring Patterns

- **Reflect-and-Expand** — every cycle close updates next cycle's spec with newly-known specifics
- **Codegen-First** — registry is source of truth; CSS/TS/manifest are derivative
- **Idempotent Sweeps** — every migration script supports `--dry / --check / apply`; check passes on clean tree
- **Surface First, Theme Second** — luminance is the durable concept; theme-flavor is decorative

## Closing the Loop (every cycle)

1. **Run acceptance** — every checkbox in cycle.md must pass
2. **Update cycle doc** — `[ ]` → `[x]`, append `## Changelog` (file:line of every change), append `## Decisions` (deviations from spec, why)
3. **Expand next cycle** — open cycle-(N+1).md and refine the spec with this cycle's learnings (new tasks, removed tasks, clarified gaps)
4. **Update cycle-index.json** — `status: "done"`, `next` pointer
5. **Commit** — single atomic commit per cycle, message format `feat(tincture): cycle-N — <title>`

## Scope guardrails

- **Don't enlarge unprompted.** Cycle scope = the spec at start of cycle. Expansions land in subsequent cycles.
- **Show your work.** A cycle without a Changelog or Decisions section is not closed.
- **A future agent must reconstruct what shipped from the cycle doc alone.**

## Current State

20 cycles seeded. Cycle 1 (Phase 0 foundation) shipped 2026-04-30 in arzadon-fitness/studio commit `25dd915`. The substrate currently lives in the proving ground (arzadon studio); cycle 16 extracts it to a standalone package.
