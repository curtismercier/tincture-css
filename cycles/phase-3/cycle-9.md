---
id: cycle-9
phase: 3
title: Multi-state preview — URL builder + CDP capture
status: done
created: 2026-04-30
shipped: 2026-04-30
commit: 93b2f43
---

## Spec / Acceptance — all checked
- [x] URL builder for 4 states (light/dark × current/proposed)
- [x] Override map encoded as base64 JSON in ?data= query (matches DesignerOverrides cycle-1 protocol)
- [x] CDP capture pipeline via puppeteer-core + arzadon's existing CDP setup pattern
- [x] Mosaic command output references .soma/tools/screenshot-mosaic.py

## Decisions
- URLs-only mode is first-class — agents with their own browser tools (or Curtis with a manual Chrome) can use the URLs without needing CDP
- 4 states, not 6 — flavor (cool/warm/ember) tested in cycle 12+ when moods ship; for now light vs dark covers 95% of value
- Captures cached at `.tincture-cache/<token>-<state>-<sha>.jpg` — gitignored

## Handoff to cycle 10
Contrast guard. Walks registry's `contrastPair` declarations (e.g. accent ↔ accent-fg) and computes WCAG AA / AAA contrast in light + dark surface. Fails CI on regression. The CLI verb `tincture contrast` (stub from cycle 8) gets wired up.
