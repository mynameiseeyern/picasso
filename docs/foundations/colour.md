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
| `bg/*` (67) | **surface** | `hover:bg-surface-danger-subtle-hovered` |
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

## Dark mode is free

Semantics alias primitives, and **dark mode overrides semantics** while the
theme axes override *primitives*. That asymmetry is what lets five axes and two
modes compose by cascade instead of being authored as ten sets. A component that
uses semantic utilities gets dark mode without a single `dark:` class.

## ⚠️ Unresolved: the brand ramp

**All eleven brand stops disagree between Figma and the repo**, and the repo is
probably right — IR's own note records `brand.600` as `#007FAB`, the repo's
value. Until Marketing settles it, treat published brand hexes as provisional.
Everything else in this page is stable.
