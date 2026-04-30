---
id: cycle-11
phase: 3
title: Manifest verifier — static-analysis cross-check
status: done
shipped: 2026-04-30
commit: 62aafca
---

## Spec/Acceptance — all checked
- [x] Walk source for var(--*) refs per component
- [x] Cross-check against registry's tokens-read
- [x] Legacy alias resolution (--color-text-on-gold → --accent-fg)
- [x] --update flag rewrites registry
- [x] Found and corrected drift across all 3 components

## Decisions
- --update adds only; stale entries kept (conditional rendering may use them)
- Verifier joins the CI guardrail set: validate + verify + contrast + codegen
