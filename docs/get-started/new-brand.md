---
title: Create a brand and apply Picasso
description: Add a brand to Picasso, check it, and switch a product onto it — without copying a component or forking the repo.
---

# Create a brand and apply Picasso

A brand in Picasso is **one small file of choices**, not a copy of the system.
Every product that uses Picasso picks a brand with one attribute, and every
component — buttons, charts, illustrations — follows it.

This page has two halves. **[Create a brand](#create-a-brand)** happens once,
in this repo. **[Apply Picasso to a product](#apply-picasso-to-a-product)**
happens in each product that uses it.

## Before you start: do not fork

It is tempting to copy the repo and edit the theme for a new brand. It works on
day one and costs you every day after: each fix, each new component and each
new illustration then has to be made twice, and within a few months the two
copies disagree. A design system exists to stop exactly that.

A brand lives **inside** Picasso, beside the others:

```
packages/tokens/tokens/brands/
  clarion/brand.json     ← the default
  vantage/brand.json
  <your-brand>/brand.json
```

## What a brand can change

| Changes per brand | Stays the same in every brand |
|---|---|
| The brand colour, and the 11-step ramp generated from it | Danger, warning, success and info — they are meaning, not identity |
| Cool or warm greys | The type scale, and what each text style is for |
| Corner style: sharp · subtle · default · rounded | Every semantic token and what it is for |
| Spacing: compact · default · relaxed | Component shapes, layouts and behaviour |
| Fonts: a sans, a mono and an optional display face | Illustration drawings, icons and motion |
| The ink on emphasis surfaces — measured, never chosen | Chart series colours |

The last row on the left is the only semantic a brand may change, and it is
not a choice: the build puts white text on the brand's emphasis colour where
it passes 4.5:1 and the darkest neutral where it does not.

## Create a brand

### 1. Generate the brand file

```bash
cd packages/tokens
npm run brand:new -- northwind --name Northwind --base "#0F766E" \
  --neutral warm --radius subtle --spacing default \
  --sans Inter --mono "JetBrains Mono"
```

| Option | Values | Default |
|---|---|---|
| `<id>` | lowercase, letters, digits and hyphens — it becomes `data-brand="<id>"` | required |
| `--base` | the brand colour as `#RRGGBB` | required |
| `--name` | how the brand is written in Figma and docs | the id, capitalised |
| `--neutral` | `cool` · `warm` | `cool` |
| `--radius` | `sharp` · `subtle` · `default` · `rounded` | `default` |
| `--spacing` | `compact` · `default` · `relaxed` | `default` |
| `--sans` · `--mono` · `--display` | a font family | Inter · JetBrains Mono · none |

This writes `tokens/brands/<id>/brand.json` and nothing else. **Never write or
edit a `[data-brand]` block in CSS by hand** — it is generated, and a nudged
value cannot be regenerated.

If Marketing supplies exact colour stops, add them to `brand.json` as
`colour.ramp` to pin the ramp instead of generating it.

A font that is not listed in `presets.json` gets a generic fallback stack and a
warning. Add it to `presets.json` if its Figma style names differ from Inter's
(Manrope says `SemiBold`, Inter says `Semi Bold`).

### 2. Build and check it

```bash
npm run check        # in packages/tokens: builds tokens.css and figma.json, runs parity checks
cd ../.. && npm test # contrast: every on-colour pair, both modes, every brand
```

`npm test` is the accessibility gate. If a pair fails, **fix the ramp, not the
semantic** — usually by choosing a slightly deeper base colour or pinning a
`colour.ramp`. A brand that needs a semantic overridden is a bug report
against the ramp.

### 3. Look at it

```bash
npm run storybook
```

Set **Brand** in the toolbar to your brand, then go through:

- **Foundations / Colour** — the generated ramp, light and dark.
- **Components / Illustration / Follows the brand** and **All drawings** — the
  tint inside the drawings. The contrast test checks text, not tints, so a
  very pale or very dark base colour is the one thing to judge by eye.
- **Button, Badge, Alert, Switch** — the emphasis surfaces and their ink.
- Each again with **Theme: dark**.

### 4. Bring Figma in step

Run **Picasso Sync** in the Picasso Figma file with `packages/tokens/dist/figma.json`.
The brand appears as a new mode of the **Primitives** collection. Set a frame's
Primitives mode to it to preview. No Figma component is copied or changed.

### 5. Record it

Add the brand under **Added** in `CHANGELOG.md`, with its **Figma impact** line
("new Primitives mode, synced"). A new brand is additive, so it is a minor
version — but it still needs a version before a product can install it.

## Apply Picasso to a product

### 1. Install both packages

Add `@ir/tokens` and `@ir/ui` to the product — from the registry once Picasso
is published, or from the repo's git URL until then.

`@ir/ui` ships its **source**, not a build, so the product's bundler compiles
it and Tailwind must scan it.

### 2. Import the CSS, in this order

In the product's main stylesheet — the one Tailwind processes:

```css
@import "tailwindcss";
@import "@ir/tokens/tokens.css";   /* primitives, semantics, every brand */
@import "@ir/tokens/themes.css";   /* theme axes */
@import "@ir/tokens/theme.css";    /* the Tailwind bridge: bg-surface-*, text-content-* … */

@source "../node_modules/@ir/ui/src";   /* so Tailwind generates the components' classes */
```

The order is load-bearing. Without `themes.css`, every corner silently falls
back to 0. Without the `@source` line, components render unstyled. Neither
throws an error.

`theme.css` carries Tailwind directives, so it must be imported here, inside
the processed stylesheet — not as a plain JavaScript import.

### 3. Choose the brand on `<html>`

```html
<html data-brand="northwind">
```

Leave `data-brand` off for Clarion, the default. Add `class="dark"` for dark
mode — it is independent of the brand.

⚠️ **On `<html>`, not on a wrapper.** Semantic colours are worked out once, at
the root. A `data-brand` on an inner element changes the raw brand colours
inside it, but the semantics that components actually use — `bg-surface-primary-*`,
`text-content-primary-*` — have already been resolved above it, so they stay
on the root's brand. One product, one brand, set once at the top.

The other axes can be set the same way, and an explicit axis beats the brand's
own choice:

| Attribute | Values |
|---|---|
| `data-brand` | `clarion` (default) · any id in `tokens/brands/` |
| `data-neutral` | `cool` · `warm` |
| `data-radius` | `sharp` · `subtle` · `default` · `rounded` |
| `data-spacing` | `compact` · `default` · `relaxed` |
| `data-type` | `default` · `system` · `compact` |
| `class="dark"` | dark mode |

### 4. Load the brand's fonts

Picasso names the font families; it does not ship the font files to products.
Load the brand's sans and mono in the product — self-hosted with
`@fontsource/<family>` rather than from an outside font host, so a product used
inside IR's network does not silently fall back to the system font.

### 5. Use components as normal

```tsx
import { Button, EmptyState, Illustration } from "@ir/ui";

<Button>Save changes</Button>
<EmptyState
  title="No results"
  description="Nothing matches these filters. Clear the date range to widen the search."
  illustration={<Illustration name="search-results" interactive={false} />}
/>
```

Nothing above mentions the brand. That is the point: components ask for roles
— primary, tint, hairline — and the brand on `<html>` decides what those are.

### If the product keeps its own copy of `tokens.css`

Some products vendor a copy of `tokens.css` instead of importing it from the
package. They do not see a new brand, or any token change, until that copy is
replaced. Re-copy it from `packages/tokens/dist/tokens.css` after every
`build:tokens`, in every product that keeps one.

## Checklist

**Creating a brand**

- [ ] `npm run brand:new` — not a hand-written CSS block
- [ ] `npm run check` passes
- [ ] `npm test` passes — the contrast gate
- [ ] Looked at Colour, Illustration and the emphasis components in Storybook, light and dark
- [ ] Picasso Sync run; the brand is a Primitives mode in Figma
- [ ] `CHANGELOG.md` entry with its Figma impact, and a version

**Applying it to a product**

- [ ] `@ir/tokens` and `@ir/ui` installed at the version that has the brand
- [ ] The four imports, in order, plus `@source` for `@ir/ui`
- [ ] `data-brand` on `<html>`
- [ ] The brand's fonts loaded
- [ ] Any vendored `tokens.css` re-copied

## When it looks wrong

| You see | Usually because |
|---|---|
| Square corners everywhere | `themes.css` is not imported, so `--radius` is undefined |
| Components with no styling at all | Tailwind is not scanning `@ir/ui/src` — the `@source` line is missing or points at the wrong folder |
| The old brand's colour, or no change at all | `data-brand` is on a wrapper instead of `<html>`, or the product's `tokens.css` is a stale copy |
| Part of a page in the new brand and part in the old | `data-brand` on an inner element — see step 3 |
| The system font instead of the brand's | The font files are not loaded in the product |
| Errors turned the brand colour | Something used `primary` where it meant `danger`. Status colours never change per brand |

Related: [Tokens, brands and Figma sync](../foundations/tokens-and-brands.md) ·
[Colour](../foundations/colour.md) · [For engineers](engineers.md)
