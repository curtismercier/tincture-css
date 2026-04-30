---
id: cycle-19
phase: 4
title: VSCode extension stub
status: stub
shipped: 2026-04-30
location: tools/vscode-tincture/
---

## What landed
- package.json (extension manifest)
- extension.js stub
- README listing planned features:
  - Hover preview (var(--token) → 2-color swatch)
  - Autocomplete (var(--... → semantic tokens)
  - Command: Apply Mood quick-pick
  - Right-click → Show Tincture impact

## Deferred
Full implementation — v0.2+. Stub exists so v0.1.0 publishes the
extension shell alongside @tincture/core, ready for fill-in.
