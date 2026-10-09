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

A brand, plus independent axes, plus dark mode — all attributes on `<html>`:

```html
<html data-brand="clarion" data-radius="rounded" data-spacing="relaxed" class="dark">
```

| Attribute | Values |
|---|---|
| `data-brand` | `clarion` (default) · any brand in `tokens/brands/` |
| `data-radius` | `sharp` · `subtle` · `default` · `rounded` |
| `data-neutral` | `cool` · `warm` |
| `data-type` | `default` · `system` · `compact` |
| `data-spacing` | `compact` · `default` · `relaxed` |
| `class="dark"` | dark mode |

Set them on `<html>`, not on a wrapper: semantic colours are resolved at the
root, so a `data-brand` further down changes the raw brand colours there but
not the semantics components use. Creating a brand and switching a product
onto it, step by step: [Create a brand and apply Picasso](new-brand.md).

A brand sets the defaults for the axes; an explicit axis beats it. Storybook's
toolbar drives the axes, so every story is a live preview. How brands and
presets are defined: [Tokens, brands and Figma sync](../foundations/tokens-and-brands.md).

## The rules

`AGENTS.md` has the full set and `npm run lint` enforces them. The short
version: semantic utilities only, never a raw hex, never a hard-coded corner,
sentence case, and Lucide for icons.
