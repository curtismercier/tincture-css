---
id: cycle-8
phase: 3
title: Tincture CLI — tokens.* + mood.* + impact (reverse lookup)
status: done
created: 2026-04-30
shipped: 2026-04-30
commit: 810e549
---

# Cycle 8 — Tincture CLI

## Goal
Expose the registry + manifest as structured ops via a CLI. Same tool surface that an MCP server (cycle-8-followup) wraps for Claude.

## Spec / Acceptance — all checked
- [x] tokens list / get / find / set verbs
- [x] mood list verb (apply deferred to cycle 12+)
- [x] **tokens impact** — reverse lookup from token to components + source files (KILLER FEATURE)
- [x] validate + codegen passthrough verbs
- [x] --json output mode for programmatic consumption

## Changelog (commit 810e549)
- studio/scripts/tincture.mjs — NEW (~250 LOC)
- package.json — `pnpm tincture` runs the CLI

## Decisions
- mood.apply deferred — moods are authored cycles 12-15
- contrast verb stub — implementation cycle 10
- Set verb writes registry + auto-regen `_generated/`. No half-state.

## Handoff to cycle 9
The CLI's `tokens.set` regenerates _generated/ but nothing visualizes the change. Cycle 9 (multi-state preview) builds the headless capture grid: when an agent calls `tokens.preview`, return image attachments showing CURRENT + PROPOSED in light + dark surfaces side-by-side. Without this, the agent can edit blindly.
