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

## The neutral ramp runs subtle → muted → emphasis

Prominence is contrast: **subtle** is the quietest fill, **muted** is one palette
step stronger, **emphasis** is the solid. `bg/neutral` has the same shape as
`bg/primary`, `bg/danger` and the other status ramps (50 → 100 → 600 there;
50 → 100 → 800 here), and hover and pressed are one and two steps further on.

| Light | rest | hover | pressed |
|---|---|---|---|
| `bg/neutral/subtle` | 50 | 100 | 200 |
| `bg/neutral/muted` | 100 | 200 | 300 |
| `bg/neutral/emphasis` | 800 | 900 | 950 |
| `bg/sidebar` | 100 | 200 | 300 |

| Dark | rest | hover | pressed |
|---|---|---|---|
| `bg/neutral/subtle` | 800 | 700 | 600 |
| `bg/neutral/muted` | 700 | 600 | 500 |
| `bg/neutral/emphasis` | 100 | 50 | white |
| `bg/sidebar` | 950 | 900 | 800 |

Until 2 Oct 2026 light `muted` was white and dark ran 950 then 900 — muted was
lighter than subtle in light, and in dark the order ran away from contrast.

**What each step is seen on.** The page is neutral-50 in light and 900 in dark;
a card is white and 800.

| | on the page | on a card |
|---|---|---|
| `subtle`, light | matches it (1.00) | faint (1.05) |
| `subtle`, dark | shows (1.21) | matches it (1.00) |
| `muted` | shows in both themes | shows in both themes |
| every hover and pressed | shows | shows |

So `subtle` matches one surface in each theme and shows on the other; `muted`
is the first step that is seen everywhere. Before the change nine hover and
pressed states were invisible on one surface in dark (a ghost button's hover on
a card, a menu item's focus and a table row's hover on the page); none are now.

**A resting fill that has to be seen takes `muted`.** Secondary Button, the
subtle neutral Badge, Avatar's fallback, Kbd, the active Tab, a read-only Input
or Textarea, the Table header, Select's count, File upload's icon tile and the
Stepper's current number all rest on `bg/neutral/muted`, so they show on the
page and on a card in both themes (1.08 / 1.12 in light, 1.71 / 1.42 in dark).
Secondary Button hovers and presses along the muted ladder. Two things follow
and are accepted: an active Tab is the same fill as a hovered one, and a Table
header is the same fill as a hovered row — text weight and position tell them
apart. The Stepper's *incomplete* number stays on `subtle`: its text is
`fg/neutral/subtle`, which on the muted fill falls to 2.2:1 in dark.

`subtle` is left for hover (`subtle-hovered`, `-pressed`) on things that are
transparent or card-coloured at rest.

**A fill that should match the card takes `bg/card`**, not a neutral step. The
outline Button, a selected Chip, the outline Badge, the Avatar add button and
the Stepper's empty indicator all rest on `bg/card` and hover through
`bg/neutral/subtle-hovered` and `-pressed`. Light is pixel-identical to before.

**Anything on the sidebar takes `bg/sidebar-hovered` and `bg/sidebar-pressed`**,
never the neutral pair. The rail is neutral-100 in light, which is what
`bg/neutral/subtle-hovered` and `bg/neutral/muted` resolve to — a hover that
equals its surface cannot render.

## Tracks and skeletons take `bg/layer/*`

`bg/layer/*` is a translucent tint of the ink colour (white in dark), so it runs
in contrast order and reads the same on the page, on a card and on a tinted
panel. It is for neutral fills that are part of a picture rather than a
control: tracks, empty segments, skeletons, wells.

| Contrast with what is behind it | subtle | muted | emphasis |
|---|---|---|---|
| Light | 1.08 | 1.17 | 1.34 |
| Dark | 1.14–1.17 | 1.33–1.38 | 1.75–1.80 |

Thin things take `emphasis` (Progress, Slider and File upload tracks, Meter's
empty segments); large areas take `muted` (Skeleton).

**Never use a state token for a resting fill.** `-hovered` and `-pressed`
describe an action. If a pressed token is the only one that shows, the element
wants `bg/neutral/muted` or `bg/layer/*`.

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
