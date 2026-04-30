---
id: cycle-20
phase: 4
title: npm publish prep — @tincture/core v0.1.0
status: ready-to-publish
shipped: 2026-04-30
---

## What landed (locally)
- package.json with name "@tincture/core", version 0.1.0, bin entry
- LICENSE (MIT)
- .gitignore
- Initial git commit d60d1b3 (first commit in the standalone repo)

## What's NEXT (post-cycle-20, when ready to publish)
1. Push gravicity/personal/tincture-css/ to a public github repo (curtismercier/tincture)
2. npm publish (requires npm auth + scope @tincture)
3. Verify install via `npm install @tincture/core` in a fresh project
4. Tag v0.1.0 in git
5. Announce — README + tweet

## Deferred (Tweakcn-style web playground)
A live web playground that lets a user pick tokens, preview multi-state, export the JSON delta. v0.2 work.

## Tincture v0.1.0 ships these capabilities
- 11 CLI verbs (tokens.* / mood.* / validate / verify / contrast / codegen / preview)
- 6 mood presets
- Surface-aware ink via light-dark() native CSS
- Component contracts via registry.json
- Static-analysis verifier
- WCAG AA contrast guard
- Multi-state preview URLs (CDP capture optional)
- Idempotent migration scripts (init / untangle / migrate-components / create)
- TypeScript types (auto-generated)

Origin trace: s01-91da41 — "less red" → 20 cycles → substrate.
