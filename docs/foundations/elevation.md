---
title: Elevation
description: Five shadow steps and six layers. Depth is a token, and so is stacking order.
---

# Elevation

Picasso separates two things most systems bundle together. **Shadow** says how
far a surface sits off the page. **Layer** says what covers what. A component
usually needs one or the other, and a few need both.

## Layers

Six rungs. Every one of them is a token in `core.json` under `layer/*`, and a
utility in `theme.css`.

![The six Picasso layers, from the page at 0 up to notification at 3200](/diagrams/foundations/elevation-layers.svg)

| Token | Value | Utility |
|---|---|---|
| `layer/base` | 0 | — the page is already 0 |
| `layer/raised` | 100 | `z-raised` |
| `layer/overlay` | 800 | `z-overlay` |
| `layer/modal` | 1600 | `z-modal` |
| `layer/floating` | 2000 | `z-floating` |
| `layer/notification` | 3200 | `z-notification` |

The gaps are the point: anything that needs to sit between two rungs has room
to, without renumbering what is already there.

### Floating outranks modal

A tooltip, popover, select menu or dropdown is portalled to the document body.
One opened from inside a dialog is no longer inside it, so it has to carry a
layer that clears the dialog — otherwise the menu you just opened is behind the
thing you opened it from. Floating is therefore above modal, not below it.

### The scrim is below the thing it dims

`overlay` at 800 sits under `modal` at 1600, so a dialog covers its own scrim
by number rather than by which of them the browser paints first.

### Reaching a layer

Use the utility. `z-[1600]` is refused by `no-arbitrary-values`, and a bare
`z-50` is a number outside the system. A rung that does not exist yet is added
to `layer/*` in `core.json` and given an `@utility` in `theme.css`; Tailwind
has no `--z-index-*` namespace, so layer utilities are written out rather than
generated from the theme.

## Shadows

Five steps. Each is two drop layers and an inset, generated from `_shadow/*`
in `light.json` and `dark.json`. Figma's effect styles bind to the same
colours.

| Step | Carries |
|---|---|
| `shadow-xs` | Card, Kbd, Slider — a resting surface lifted off the page |
| `shadow-sm` | Switch, Tabs, ThresholdSlider — a small raised affordance |
| `shadow-md` | DropdownMenu, Select, Toast, Overlay |
| `shadow-lg` | Drawer, Popover, Overlay |
| `shadow-xl` | The deepest step, for a surface above all of those |

Overlay appears twice because its variants carry different depth, and Dialog
takes its shadow from Overlay rather than setting one.

Four more belong to the embeddable widget — `shadow-widget-panel`,
`-notification`, `-screen`, `-smooth`. They carry that product's depth rather
than the system's.

### Light and dark carry depth differently

In light mode a shadow is a drop shadow: near-black at 4–12% over two layers,
with the inset fully transparent. In dark mode the drop layers run at 40–60%
of pure black, and the inset becomes a visible white top highlight — from
`#FFFFFF0A` at `xs` to `#FFFFFF14` at `xl`. Depth in dark mode is carried as
much by the lit top edge as by the shadow beneath.

The token knows both. A hand-written shadow does not.

### Focus rings share the namespace

A focus ring is a composite too, so it lives with the shadows:
`shadow-ring-focus`, `shadow-ring-focus-danger`, `shadow-ring-focus-inset`.

`ring-focus` is two rings. The inner 2px is the page background — neutral-50
in light, neutral-900 in dark — and the outer 2px is brand. The inner ring is
the offset, and it is what makes the indicator read on a card, a toolbar and a
coloured surface alike.

Which control takes a ring and which takes a border is in
[Accessibility](accessibility.md).

## Where the values are

`layer/*` in `packages/tokens/tokens/core.json`; `_shadow/*` and `shadow/*` in
`light.json` and `dark.json`; the utilities in `packages/tokens/theme.css`.
Resolved values for both modes are in `/llms-tokens.txt`.
