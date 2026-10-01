---
title: Elevation
description: Five shadow steps, two mechanisms, and a z-index ladder that is still de facto.
---

# Elevation

## Shadows are tokens; there are five of them

`shadow-xs` · `shadow-sm` · `shadow-md` · `shadow-lg` · `shadow-xl`

Each is a composite of two drop layers plus an inset, generated from
`_shadow/*` in `light.json` and `dark.json`. Figma binds its effect styles to
the same `_shadow/*` colours, so a shadow cannot drift between the two.

| Step | Who uses it today |
|---|---|
| `shadow-xs` | Card, Kbd, Slider — a resting surface lifted off the page |
| `shadow-sm` | Switch, Tabs, ThresholdSlider — a small raised affordance |
| `shadow-md` | DropdownMenu, Select, Toast, Overlay | 
| `shadow-lg` | Drawer, Popover, Overlay |
| `shadow-xl` | Nothing. The step exists; no component has needed it |

Overlay appears twice because its variants carry different depth, and Dialog
takes its shadow from Overlay rather than setting one.

Four more exist for the embeddable widget — `shadow-widget-panel`,
`-notification`, `-screen`, `-smooth`. They carry that product's own depth,
not the system's, and nothing outside the widget should reach for them.

## Light and dark carry depth differently

This is the part that surprises people. In light mode a shadow is a drop
shadow: near-black (`#161618`) at 4–12% opacity, and the inset layer is fully
transparent. In dark mode the drop layers go to 40–60% of pure black — a dark
surface needs far more to read at all — **and the inset becomes visible**, a
white top highlight from `#FFFFFF0A` at `xs` to `#FFFFFF14` at `xl`.

So in dark mode, elevation is carried partly by a lit top edge rather than
only by a shadow underneath. Never hand-write a shadow for dark mode; the
token already knows.

## Focus rings live in the shadow namespace

They are composites too, so they share it: `shadow-ring-focus`,
`shadow-ring-focus-danger`, `shadow-ring-focus-inset`.

`ring-focus` is two rings, not one. The inner 2px is the page background —
neutral-50 in light, neutral-900 in dark — and the outer 2px is brand-500
(brand-400 in dark). The inner ring is what AGENTS.md calls the offset: it
separates the brand ring from the control so the ring reads on any surface.

Use `shadow-ring-focus-danger` on a control that is both focused and invalid.
The rule for which control gets which is in
[Accessibility](accessibility.md) — boxes take a border, marks take a ring.

## Layers are tokens too

Six rungs, from `layer/*` in `core.json`:

| Token | Value | Utility | Who uses it |
|---|---|---|---|
| `layer/base` | 0 | — | The page. It is already 0 |
| `layer/raised` | 100 | `z-raised` | The active OTP slot; a ButtonGroup member lifted on hover or focus |
| `layer/overlay` | 800 | `z-overlay` | The scrim |
| `layer/modal` | 1600 | `z-modal` | Dialog and Drawer panels |
| `layer/floating` | 2000 | `z-floating` | Tooltip, Popover, Select and DropdownMenu content |
| `layer/notification` | 3200 | `z-notification` | The Toast viewport |

The scale is GovTech's Singapore Design System — 0 / 100 / 400 / 800 / 1600 —
chosen because it leaves room between rungs instead of counting 1 to 10. Its
400 (global floating) is unused here, for the reason below.

### Why floating sits above modal

GovTech puts floating *below* modal, which is right when a popover is scoped
to the parent that owns it. Radix portals ours to `document.body`, so a select
menu opened inside a dialog has no parent to be scoped by — at 400 it would
render behind the dialog that opened it. 2000 is GovTech's own
`local-layer-floating`, and a menu inside a modal is exactly that case.

Measured in a browser, with a dialog open and its select open inside it:

```
 3200  toast-viewport
 2000  select menu        ← portalled to body, above the dialog that opened it
 1600  dialog-content
  800  dialog-overlay (the scrim)
```

### What this fixed

The scrim used to carry `z-50`, the same value as the dialog it dims. The
stacking was correct only because the scrim comes first in the DOM. It now
sits 800 below the panel and the order is in the number.

### Never write a number

`z-[1600]` is refused by `no-arbitrary-values`, and a bare `z-50` is a number
nobody agreed. The five utilities are the whole vocabulary; if something needs
a rung that is not there, it goes in `core.json` under `layer/*` and gets an
`@utility` in `theme.css` — Tailwind v4 has no `--z-index-*` namespace to bind
to, which is why these are written out rather than generated.

## Where the values are

`packages/tokens/tokens/{light,dark}.json` → `_shadow/*` and `shadow/*`;
exposed to Tailwind in `packages/tokens/theme.css`. The resolved values for
both modes are in `/llms-tokens.txt`.
