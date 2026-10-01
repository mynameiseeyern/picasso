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

<svg viewBox="0 0 740 392" role="img" aria-labelledby="layer-stack-title" style={{width:'100%',height:'auto'}} xmlns="http://www.w3.org/2000/svg">
  <title id="layer-stack-title">The six Picasso layers, from the page at 0 up to notification at 3200</title>
  <g fill="none" stroke="currentColor" strokeOpacity="0.35">
    <path d="M14 356 L14 24" strokeWidth="1.25" />
    <path d="M9.5 29 L14 20 L18.5 29" strokeWidth="1.25" />
  </g>
  <text x="28" y="22" fill="currentColor" fillOpacity="0.55" fontSize="11" fontFamily="ui-sans-serif, system-ui, sans-serif" letterSpacing="0.06em">ABOVE</text>

  <g fontFamily="ui-sans-serif, system-ui, sans-serif">
    <g transform="translate(0,36)">
      <text x="118" y="28" textAnchor="end" fill="currentColor" fillOpacity="0.55" fontSize="13" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">3200</text>
      <rect x="132" y="4" width="594" height="40" rx="7" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeOpacity="0.26" />
      <text x="150" y="29" fill="currentColor" fontSize="14" fontWeight="600">notification</text>
      <text x="300" y="29" fill="currentColor" fillOpacity="0.62" fontSize="13">Toast</text>
    </g>
    <g transform="translate(0,92)">
      <text x="118" y="28" textAnchor="end" fill="currentColor" fillOpacity="0.55" fontSize="13" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">2000</text>
      <rect x="132" y="4" width="594" height="40" rx="7" fill="currentColor" fillOpacity="0.09" stroke="currentColor" strokeOpacity="0.24" />
      <text x="150" y="29" fill="currentColor" fontSize="14" fontWeight="600">floating</text>
      <text x="300" y="29" fill="currentColor" fillOpacity="0.62" fontSize="13">Tooltip · Popover · Select · DropdownMenu</text>
    </g>
    <g transform="translate(0,148)">
      <text x="118" y="28" textAnchor="end" fill="currentColor" fillOpacity="0.55" fontSize="13" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">1600</text>
      <rect x="132" y="4" width="594" height="40" rx="7" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeOpacity="0.22" />
      <text x="150" y="29" fill="currentColor" fontSize="14" fontWeight="600">modal</text>
      <text x="300" y="29" fill="currentColor" fillOpacity="0.62" fontSize="13">Dialog · Drawer</text>
    </g>
    <g transform="translate(0,204)">
      <text x="118" y="28" textAnchor="end" fill="currentColor" fillOpacity="0.55" fontSize="13" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">800</text>
      <rect x="132" y="4" width="594" height="40" rx="7" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeOpacity="0.2" />
      <text x="150" y="29" fill="currentColor" fontSize="14" fontWeight="600">overlay</text>
      <text x="300" y="29" fill="currentColor" fillOpacity="0.62" fontSize="13">The scrim</text>
    </g>
    <g transform="translate(0,260)">
      <text x="118" y="28" textAnchor="end" fill="currentColor" fillOpacity="0.55" fontSize="13" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">100</text>
      <rect x="132" y="4" width="594" height="40" rx="7" fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeOpacity="0.18" />
      <text x="150" y="29" fill="currentColor" fontSize="14" fontWeight="600">raised</text>
      <text x="300" y="29" fill="currentColor" fillOpacity="0.62" fontSize="13">The active OTP slot · a ButtonGroup member on hover</text>
    </g>
    <g transform="translate(0,316)">
      <text x="118" y="28" textAnchor="end" fill="currentColor" fillOpacity="0.55" fontSize="13" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">0</text>
      <rect x="132" y="4" width="594" height="40" rx="7" fill="none" stroke="currentColor" strokeOpacity="0.3" strokeDasharray="4 4" />
      <text x="150" y="29" fill="currentColor" fontSize="14" fontWeight="600">base</text>
      <text x="300" y="29" fill="currentColor" fillOpacity="0.62" fontSize="13">The page</text>
    </g>
  </g>
</svg>

| Token | Value | Utility |
|---|---|---|
| `layer/base` | 0 | — the page is already 0 |
| `layer/raised` | 100 | `z-raised` |
| `layer/overlay` | 800 | `z-overlay` |
| `layer/modal` | 1600 | `z-modal` |
| `layer/floating` | 2000 | `z-floating` |
| `layer/notification` | 3200 | `z-notification` |

The gaps are the point. Anything that needs to sit between two rungs has room
to, without renumbering what is already there.

### Floating outranks modal

A tooltip, popover, select menu or dropdown is portalled to the document body.
One opened from inside a dialog is no longer inside it, so it has to carry a
layer that clears the dialog — otherwise the menu you just opened is behind the
thing you opened it from. Floating is therefore above modal, not below it.

### The scrim is below the thing it dims

`overlay` at 800 sits under `modal` at 1600. Stacking does not depend on which
of them the browser happens to paint first.

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
