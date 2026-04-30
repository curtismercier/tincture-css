# Consumer: arzadon-fitness

**Repo:** `Gravicity/studio` (multi-tenant CMS app)
**Tenant directory:** `src/tenants/arzadon/`
**Live URL:** `https://arzadon.gravicity.io`
**Status:** v0.1.1 substrate live; first real user; live testing ground for tincture evolution
**First adoption:** 2026-04-30 (cycle 1, Phase 0 foundation)

## What's installed in arzadon

```
studio/src/tenants/arzadon/tincture/
├── foundation.css           # source — manual override pattern (v0.1.1)
├── flavors.css              # flavor overlay (cool/warm/ember)
├── registry.json            # local registry (current: 11 semantic tokens)
├── manifest-loader.ts       # reads _generated/manifest.json
├── moods/                   # 6 mood JSONs (color-only, v0.1.x)
│   ├── arzadon-default.json
│   ├── clinical.json
│   ├── editorial-warm.json
│   ├── aggressive-bold.json
│   ├── minimalist-quiet.json
│   └── luxurious-refined.json
└── _generated/              # codegen output (DO NOT EDIT)
    ├── foundation.css       # CSS the app actually imports via globals.css
    ├── flavors.css
    ├── manifest.json
    └── tokens.d.ts

studio/scripts/
├── tincture.mjs                       # top-level CLI (delegates to siblings)
├── tincture-codegen.mjs               # registry → _generated artifacts
├── tincture-validate-registry.mjs
├── tincture-verify.mjs                # static cross-check
├── tincture-contrast.mjs              # WCAG AA audit
├── tincture-preview.mjs               # multi-state preview URL builder
├── tincture-mood.mjs                  # mood apply/preview/diff/list
├── tincture-foundation.mjs            # initial setup (annotate data-surface)
├── tincture-untangle.mjs              # data-theme → data-surface × data-flavor
└── tincture-migrate-components.mjs    # token migration sweep
```

## Why arzadon is the proving ground

1. **Production traffic.** Studio runs Payload CMS + Next.js 15 with Tailwind v4 — the same stack we expect most consumers to have.
2. **Multi-theme already.** Pre-tincture, arzadon had `data-theme="light|grey|dark|ember"`. Provided rich material to model the surface/flavor split against.
3. **Multiple section types.** Hero (always-dark feature), pricing (always-light), CTA bands, FAQ (prose), brand strips. Forced us to confront tone-as-axis early.
4. **Curtis is the tester.** Real visual verification with a designer's eye, not synthetic test pages.

## What lives WHERE

| Artifact | Lives in | Why |
|---|---|---|
| Cycle plans + cycle.md per cycle | `personal/tincture-css/cycles/` | The tool's history, not arzadon's |
| Cycle audits | `personal/tincture-css/cycles/audits/` | Same |
| v0.2 scope spec | `personal/tincture-css/cycles/v02-scope.md` | Same |
| Architecture decisions | `personal/tincture-css/docs/architecture/` | Tool docs |
| Source registry + foundation.css + scripts | `personal/tincture-css/src/` | The publishable package |
| Arzadon's local copy of foundation/registry | `arzadon-fitness/studio/src/tenants/arzadon/tincture/` | Consumer install — the live-running snapshot |
| Per-arzadon migration sweeps | `arzadon-fitness/studio/scripts/tincture-*.mjs` | Consumer scripts (mostly mirrors the tool's CLI) |
| Session logs | `arzadon-fitness/.soma/memory/sessions/` | Soma's work-on-arzadon history (consumer-side observations) |
| Live test screenshots | `/tmp/` (ephemeral) or `arzadon-fitness/.tincture-cache/` | Ephemeral / consumer-side QA |

## Consumer responsibilities (arzadon)

- **Import** the tool's foundation + flavors + manifest into globals.css
- **Annotate** sections with `data-surface`, `data-flavor`, `data-tone` per the substrate's contract
- **Run** codegen + validate + verify before deploys (pnpm prebuild already does this)
- **Report** visual bugs back to the tool repo (open issue / PR upstream)

## Tool responsibilities (tincture-css)

- **Define** the registry schema, codegen format, mood JSON shape
- **Ship** the CLI scripts and migration tooling
- **Document** consumer integration (QUICKSTART)
- **Version** breaking changes (semver — v0.2 will require migration of v0.1 registries)

## Sync flow (when tincture-css evolves)

1. Tool repo: ship a cycle (e.g. cycle 24 — typography axis)
2. Tool repo: bump version + update CHANGELOG
3. Consumer repo: copy/sync new tool artifacts into `tincture/` (manual today, automated by `npx @tincture/core update` after cycle 36)
4. Consumer repo: run any migration script the cycle includes
5. Consumer repo: visual verification on live before claiming the cycle is "in production"

Until cycle 36 (real npm publish), the sync is manual file-copy. After cycle 36, consumers can `pnpm add @tincture/core@0.2.0` and an `update` CLI handles the migration.
