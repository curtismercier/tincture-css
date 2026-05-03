# ThemeSurface Pattern

## The problem

Next.js (and any SSR framework) separates server components from client components.
`data-surface` on a `<section>` inside a server component is a static string — it
cannot read the user's current theme preference at render time.

Result: sections with hardcoded `data-surface="dark"` never adapt when the user
switches to light mode, even if `<html data-surface="light">` is set by the
ThemeProvider.

## Solution: ThemeSurface wrapper

A minimal client component wraps the `<section>` tag only. All children remain
server-rendered. The wrapper reads the current theme via `useTheme()` and applies
the correct `data-surface` at runtime.

```tsx
'use client';

import { useTheme } from './ThemeProvider';

type Surface = 'dark' | 'slate' | 'steel' | 'light';

interface ThemeSurfaceProps {
  children: React.ReactNode;
  className?: string;
  light?: Surface;   // data-surface value when theme is light (default: 'light')
  dark?: Surface;    // data-surface value when theme is dark  (default: 'dark')
  as?: 'section' | 'div' | 'article' | 'aside';
  [key: string]: unknown;
}

export default function ThemeSurface({
  children,
  className,
  light = 'light',
  dark = 'dark',
  as: Tag = 'section',
  ...rest
}: ThemeSurfaceProps) {
  const { theme } = useTheme();
  return (
    <Tag data-surface={theme === 'light' ? light : dark} className={className} {...rest}>
      {children}
    </Tag>
  );
}
```

## Usage in a server component (page.tsx)

```tsx
// page.tsx (server component)
import ThemeSurface from '@/components/ThemeSurface';

export default function BlogPage() {
  return (
    <>
      {/* Hero — adapts dark↔light */}
      <ThemeSurface className="py-32 px-6 bg-[var(--bg)]">
        <h1>The Blog</h1>
      </ThemeSurface>

      {/* Always steel in dark mode, light in light mode */}
      <ThemeSurface dark="steel" className="py-16 px-6 bg-[var(--bg)]">
        <CalculatorComponent />
      </ThemeSurface>
    </>
  );
}
```

## When to use ThemeSurface vs hardcoded data-surface

| Use case | Pattern |
|---|---|
| Section should adapt to user's light/dark preference | `<ThemeSurface>` |
| Section is intentionally always dark (hero with video bg, brand CTA) | `<section data-surface="dark">` |
| Section is always steel (data calculator, InBody scanner UI) | `<section data-surface="steel">` |
| Section is always slate (pricing band, stats break) | `<section data-surface="slate">` |
| Client component (can call `useTheme()` directly) | `data-surface={theme === 'light' ? 'light' : 'dark'}` |

## Tincture-lint compatibility

Static analysers that scan for `<section ... bg-[var(...)]>` without `data-surface`
will not flag `<ThemeSurface>` — it is not a literal `<section>` tag in source.
This keeps the lint score clean while allowing runtime theme-awareness.

The rendered output has `data-surface` set correctly at runtime, so the token
cascade works identically to a hardcoded surface annotation.

## When NOT to use ThemeSurface

- Don't wrap entire page layouts — only the sections that actually need to adapt.
- Don't use for always-intentional surfaces (dark hero, steel calculator) — keeps
  the design intent clear in source.
- Section content that has hardcoded colours (e.g. photo overlay, brand gradient
  panels) doesn't benefit — the bg token changes but the visual doesn't.
