---
title: For engineers
description: Install, import, theme.
---

# For engineers

## Install

```bash
npm install
npm run build:tokens     # generates packages/tokens/dist/tokens.css
npm run storybook        # component library at :6006
```

## Import order matters

```css
@import "tailwindcss";
@import "@ir/tokens/tokens.css";   /* primitives + semantics (generated) */
@import "@ir/tokens/themes.css";   /* theme axes — override primitives */
@import "@ir/tokens/theme.css";    /* Tailwind bridge */
```

Miss `themes.css` and `--radius` is undefined, so every corner silently falls
back to 0 and all five theme axes go inert. Nothing errors — it just looks
wrong.

`theme.css` carries `@theme` and `@custom-variant` directives, so it must be
imported inside the Tailwind-processed stylesheet, not as a plain JS import.

## Use a component

```tsx
import { Button } from "@ir/ui";

<Button variant="default" size="md">Save changes</Button>
<Button variant="ghost" size="sm"><Download />Export CSV</Button>
<Button size="icon-md" aria-label="Delete probe"><Trash2 /></Button>
```

## Theme

Five independent axes on `<html>`, plus dark mode:

```html
<html data-neutral="warm" data-radius="rounded"
      data-type="compact" data-spacing="comfortable" class="dark">
```

| Axis | Values |
|---|---|
| `data-radius` | `default` · `sharp` · `subtle` · `rounded` |
| `data-neutral` | `default` (cool) · `warm` |
| `data-type` | `default` · `system` · `compact` |
| `data-spacing` | `default` · `comfortable` |
| `class="dark"` | dark mode |

Storybook's toolbar drives all five, so every story is a live preview of every
axis.

## The rules

`AGENTS.md` has the full set and `npm run lint` enforces them. The short
version: semantic utilities only, never a raw hex, never a hard-coded corner,
sentence case, and Lucide for icons.
