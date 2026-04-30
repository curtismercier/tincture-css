---
id: cycle-16
phase: 4
title: Extraction — split substrate into @tincture/core package
status: done
shipped: 2026-04-30
location: gravicity/personal/tincture-css/ (initial git commit d60d1b3)
---

## What landed
Substrate extracted from arzadon-fitness/studio proving ground to a
standalone package at gravicity/personal/tincture-css/.

Structure:
  src/foundation/{foundation,flavors}.css
  src/_generated/{foundation,flavors}.css + manifest.json + tokens.d.ts
  src/registry.example.json
  src/moods/*.json (6 presets)
  src/manifest-loader.ts
  src/cli/*.mjs (11 CLI scripts)

package.json @tincture/core v0.1.0 with bin entry for CLI.
