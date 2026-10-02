---
title: Colour
description: Three semantic families, one utility word each. Never a raw value.
---

# Colour

## Never a raw value

```tsx
// ✗ never
className="bg-[#007FAB] text-[#121926]"
className="bg-blue-600"                      // no Tailwind palette colours
className="bg-[var(--bg-primary-emphasis)]"  // the escape hatch is not needed

// ✓ always
className="bg-surface-primary-emphasis text-content-neutral-emphasis"
```

**Never use a `palette/*` value in a component.** Palette exists to feed
semantics; semantics are what components consume.

## Three families, three words

Tailwind v4's `--color-*` namespace feeds `bg-`, `text-` and `border-` from one
pool, so the three token families would collide on a shared name. Each gets a
word that reads correctly with its own prefix:

| Token family | Utility word | Example |
|---|---|---|
| `bg/*` (69) | **surface** | `hover:bg-surface-danger-subtle-hovered` |
| `fg/*` (31) | **content** | `text-content-on-primary-emphasis` |
| `border/*` (21) | **line** | `border-line-input-invalid` |
| `status/*` (5) | status | `text-status-critical` |
| `chart/1–8` | chart | `fill-chart-3` |

Every semantic has a utility. **If you reach for `bg-[var(...)]`, the bridge is
missing an entry** — add it to `packages/tokens/theme.css` rather than escaping.

## How a token is named

```
bg / danger / subtle / hovered
│    │        │        └── state: hovered · pressed · (none = resting)
│    │        └── prominence: emphasis · subtle · muted
│    └── intent: primary · neutral · danger · success · warning · info
└── family
```

`fg/on/<surface>` is the foreground guaranteed to pass contrast on that surface —
`text-content-on-primary-emphasis` sits on `bg-surface-primary-emphasis`.

## Hover and pressed step away from the surface

A hover is one palette step past the surface it sits on, and pressed is one
step past that. The neutral ladders in light:

| | rest | hover | pressed |
|---|---|---|---|
| `bg/neutral/subtle` | 50 | 100 | 200 |
| `bg/neutral/muted` | white | 100 | 200 |
| `bg/sidebar` | 100 | 200 | 300 |

`muted` skips 50 on purpose: `bg/app` is neutral-50, so a hover that landed
there was invisible on the page. The cost is that light `muted` and `subtle`
share a ladder from hover onward while dark keeps them one step apart
(900 → 800 → 700 against 950 → 900 → 800).

**Anything on the sidebar takes `bg/sidebar-hovered` and `bg/sidebar-pressed`**,
never the neutral pair. The rail is neutral-100 in light, which is the value
both neutral hovers resolve to — a hover that equals its surface cannot render.

## Dark mode is free

Semantics alias primitives, and **dark mode overrides semantics** while the
theme axes override *primitives*. That asymmetry is what lets five axes and two
modes compose by cascade instead of being authored as ten sets. A component that
uses semantic utilities gets dark mode without a single `dark:` class.

## Brands

Picasso is multi-brand: a brand supplies its own brand and accent ramps and
inherits everything else.

## A surface does not have to carry white

`fg/on/*` is measured, never chosen. For every `bg/<intent>/emphasis`, the
build asks which ink reaches 4.5:1 on it and writes that one: white where
white carries, `palette/neutral/950` where it does not.

| Surface | `fg/on/*-emphasis` becomes | At |
|---|---|---|
| `#007FAB` | white | 4.54:1 |
| `#F59E0B` | neutral-950 | 9:1 |
| `#A3E635` | neutral-950 | 12.82:1 |
| `#FFD60A` | neutral-950 | 13.69:1 |

So a brand colour is never rejected for being light. It gets dark ink, and the
button is still a button. This is the one semantic that may differ per brand —
everything else aliases a primitive, so re-pointing `--palette-brand-600`
carries the whole system with it. **If a brand seems to need some other
semantic overridden, the ramp is wrong.**

A generated ramp rarely needs the flip at the steps a button is painted with:
lightness comes from a fixed ladder, so 600–950 land dark enough to hold white
whatever the hue, and the base colour contributes hue and chroma. The flip is
what carries a **pinned** ramp — eleven stops supplied by Marketing, where any
value is possible — the lighter steps, and status colours like amber.

The one real failure is a surface that neither ink reaches: white below 4.5:1
*and* neutral-950 below 4.5:1. That colour has to move, and `npm test` says so.

`npm test` measures every on-colour pair against its own surface, in both
modes, for every brand — so a ramp that drifts a step lighter fails the build
rather than an audit.

See `AGENTS.md` → Adding a brand.

## ⚠️ Unresolved: the brand ramp

**All eleven brand stops disagree between Figma and the repo**, and the repo is
probably right — IR's own note records `brand.600` as `#007FAB`, the repo's
value. Until Marketing settles it, treat published brand hexes as provisional.
Everything else in this page is stable.
