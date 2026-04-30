---
id: cycle-17
phase: 4
title: Scaffold CLI — npx create-tincture
status: done
shipped: 2026-04-30
file: src/cli/create.mjs
---

## What landed
src/cli/create.mjs scaffolds the substrate into any existing project:
  npx @tincture/core create [--target src/path] [--next] [--force]

Detects framework (Next.js by default), copies foundation + flavors +
registry + moods + _generated to target/. Prints next-steps prompt.

## Decisions
- Default target: src/tincture/
- --force flag for overwriting existing target
- Framework detection minimal — just checks for next.config.mjs
