# Per-Page Moods

**Status:** Stable pattern, in production at [Arzadon Fitness](../../consumers/arzadon-fitness.md) since 2026-05-04.

A mood doesn't have to live at the root. The same `--mood-*` indirection
layer that powers site-wide mood swaps will also activate a mood on **any
wrapper element** in the DOM. That unlocks per-page (and even per-section)
character — without forking pages, duplicating CSS, or maintaining parallel
component trees.

This doc covers:

- The pattern: `data-mood="X"` as a runtime attribute, not just a registry state
- Why the existing indirection layer makes it work for free
- Activation patterns (Next.js layout, Vue, framework-agnostic)
- The **partial-token discipline** — the most common authoring mistake
- A live example: `jennifer-editorial` on Arzadon's profile page

## The pattern

```html
<!-- Whole site renders in default mood — brand red, Oswald -->
<div class="layout">
  <Navbar />

  <!-- One wrapper carries data-mood; cascade re-resolves under it -->
  <main data-mood="jennifer-editorial">
    <!-- Inside this subtree: champagne accents, DM Serif headlines.
         Cascades through nested data-surface=dark/light blocks.
         Reaches navbar AND footer if they're inside the wrapper. -->
  </main>

  <Footer />
</div>
```

That's the whole pattern. No CLI invocation. No registry mutation. The mood
file is a **runtime overlay**, not a build-time swap.

## Why this works for free

The mood indirection layer lives in `surface-extensions.css` (see
[surface-extensions-pattern.md](./surface-extensions-pattern.md)).
Every surface token is declared as `var(--mood-TOKEN, fallback)`:

```css
[data-surface="dark"] {
  --accent: var(--mood-accent, #E82E11);
  --ink:    var(--mood-ink,    #FFFFFF);
}
```

Site-wide moods set `--mood-*` on `:root`. Per-page moods set the same vars
on a deeper wrapper — and CSS custom properties inherit. So any surfaced
descendant looks up `--mood-accent` and finds the closest ancestor with
the value set: the per-page wrapper, not the root.

**You already paid for this when you set up the indirection layer.**
Per-page activation is mechanism reuse, not new mechanism.

## Authoring a per-page mood

Drop a JSON file in `src/moods/<name>.json`. Two key differences from a
site-wide mood:

```jsonc
{
  "id": "jennifer-editorial",
  "name": "Jennifer Editorial",
  "doc": "Per-page mood for /about/jennifer-arzadon. Champagne accents + DM Serif.",
  "base": "luxurious-refined",

  // 1. KEEP THIS LIST SMALL. Only override tokens you actually want
  // to differ from the page's surrounding default. See "Partial-token
  // discipline" below.
  "tokens": {
    "accent":      { "lightValue": "#B8860B", "darkValue": "#E8C566" },
    "accent-warm": { "lightValue": "#B8860B", "darkValue": "#E8C566" },
    "accent-fg":   { "lightValue": "#1A1612", "darkValue": "#1A1612" },
    "font-display":{ "lightValue": "var(--font-dm-serif)", "darkValue": "var(--font-dm-serif)" }
  },

  // 2. NEW FIELDS for per-page mode (informational, helps consumers
  // understand intent vs activation):
  "active-tokens":  ["accent", "accent-warm", "accent-fg", "font-display"],
  "shelved-tokens": ["ink", "bg", "bg-card", "bg-elev", "border"]
}
```

Then add the corresponding selector block to your `surface-extensions.css`
(or wherever you import after the generated foundation):

```css
[data-mood="jennifer-editorial"] {
  --mood-accent:      #E8C566;
  --mood-accent-warm: #E8C566;
  --mood-accent-fg:   #1A1612;
  --font-display:     var(--font-dm-serif);
}

/* Light-surface counterpart */
[data-mood="jennifer-editorial"] [data-surface="light"],
[data-mood="jennifer-editorial"][data-surface="light"] {
  --mood-accent:      #B8860B;
  --mood-accent-warm: #B8860B;
}
```

Then activate the mood by adding the attribute somewhere in your DOM tree.
That's it.

## Partial-token discipline

This is the most common per-page mood mistake.

**Wrong:** Pick a base mood (e.g. `luxurious-refined`) and copy *all* its
tokens into your per-page mood. The activation cascades a full palette swap
on one route — page background, ink color, card surfaces, borders, accents,
fonts. The page now looks like a totally different site.

**Right:** Override only the tokens you actually want different from the
surrounding default. If the brief is *"shift the reds to gold and use a
serif headline"* — that's a 3-token mood (accent, accent-warm, font-display).
Not a 12-token mood.

The visual difference between the two approaches is huge. A 3-token mood
reads as **a deliberate signal layer** (gold ctas, serif headline, gold
logo) on a page that otherwise belongs to the surrounding visual identity.
A 12-token mood reads as **"why is this page on a different website?"**

**Rule of thumb:** if the per-page mood overrides `--bg` or `--ink`, ask
twice. Those are the page's foundation. Override accent + font; let the
foundation hold.

(Arzadon learned this the iterative way — see
[`consumers/arzadon-fitness.md`](../../consumers/arzadon-fitness.md) for
the iteration log on `jennifer-editorial` arriving at the 4-token shape.)

## Activation strategies

The `data-mood` attribute can be set however your framework prefers.
Three common patterns:

### 1. Per-page in a route layout (Next.js, Remix, similar)

The cleanest pattern. Detect the path server-side, set the attribute on
the layout wrapper. The cascade reaches every descendant — page, navbar,
footer — without per-component opt-in.

```tsx
// app/layout.tsx
export default async function RootLayout({ children }) {
  const pathname = await getPathname();
  const mood = pathname === '/about/jennifer'
    ? 'jennifer-editorial'
    : undefined;

  return (
    <div data-mood={mood}>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
```

### 2. In the page component itself

Useful when the mood is page-specific and doesn't need to reach the navbar
or footer.

```tsx
// app/about/jennifer/page.tsx
export default function JenniferPage() {
  return (
    <div data-mood="jennifer-editorial" data-surface="dark">
      ...
    </div>
  );
}
```

### 3. Per-section overlay

Most surgical. Use when you want a single feature card or callout to
demonstrate a mood while the rest of the page stays in the default.

```tsx
<section
  data-mood="jennifer-editorial"
  data-surface="dark"
  className="rounded-lg p-12 ..."
>
  <h2>This card renders in DM Serif + champagne gold.</h2>
  <p>The rest of the page stays brand red + Oswald.</p>
</section>
```

This is how a "showcase the mood" card on a tour/demo page can demonstrate
itself live — see [`consumers/arzadon-fitness.md`](../../consumers/arzadon-fitness.md)
for the example.

## When to use which mode

| Mode | When | Reach |
|---|---|---|
| Site-wide (CLI / registry) | Whole-site rebrand, A/B testing, dark-mode-equivalent identity flips | Every surface, every page |
| Per-page (route layout) | One person/product/page deserves its own character; navbar + footer should pick up the shift on that route only | Layout subtree (incl. nav + footer if inside the wrapper) |
| Per-page (page component) | Page-only character; chrome stays branded | Page component subtree |
| Per-section | Demonstration moment, single deliberate card, accent moment | One element subtree |

## What to watch for

- **Brand-locked tokens still cannot be overridden.** A per-page mood gets
  the same validator treatment as a site-wide mood — `brand-mark-primary`
  / `brand-mark-secondary` are immutable. Per-page logo color shifts (e.g.
  Jen's gold version of the wordmark) ship as an **asset swap**, not a
  token override — render a different SVG when the path matches.

- **`usePathname()` returns the user-facing path, not the rewritten one.**
  When detecting the route in framework-conditional logic, use the path
  the user sees in the URL bar, not the post-rewrite internal path.

- **Cache busting on deploy.** If multiple agents/scripts deploy in
  parallel, the mood CSS is part of the bundle. A stale build can serve
  the old mood block. The standard tincture-lint + deploy cadence catches
  this — there's nothing per-page-mood-specific to worry about.

- **`data-mood` and `data-surface` compose.** A descendant `data-surface`
  block under a `data-mood` wrapper resolves correctly because the mood
  vars cascade through inheritance. You don't need to nest mood declarations
  on every surface.

## See also

- [`docs/MOODS.md`](../MOODS.md) — site-wide moods, mood diff/preview/apply CLI
- [`docs/architecture/surface-extensions-pattern.md`](./surface-extensions-pattern.md) — the indirection layer that makes both modes work
- [`src/moods/per-page-example.json`](../../src/moods/per-page-example.json) — minimal per-page mood template (4 tokens, partial override)
- [`consumers/arzadon-fitness.md`](../../consumers/arzadon-fitness.md) — first production consumer of per-page mood (`jennifer-editorial`)
