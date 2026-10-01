---
title: Icons
description: Lucide, sized by the parent, hidden from screen readers unless they are the only label.
---

# Icons

## One library

**Lucide, and nothing else.** A second icon library means two stroke weights,
two grid sizes and two ideas of what a chevron looks like, and the seam shows
in every toolbar.

In Figma the library is the `Lucide Icon/*` component set, and the name maps
straight through: `Lucide Icon/AArrowDown` is `<AArrowDown />`. There is
nothing to translate.

## The parent sets the size

Icons are sized by the component that holds them, not by the icon:

```tsx
// ✓ the control owns the size
"inline-flex items-center gap-2 [&_svg]:size-4"

// ✗ not on each icon
<ChevronDown className="size-4" />
```

Three sizes, and that is the whole scale:

| Size | px | Where |
|---|---|---|
| `size-4` | 16 | The default — buttons, menu items, inputs, almost everything |
| `size-3.5` | 14 | Dense controls where 16 crowds the text |
| `size-3` | 12 | Inline marks inside a small control |

A size outside this set is outside the system.

## Stroke weight is Lucide's, with one exception

Never set `strokeWidth` — except on a check mark, which takes
`strokeWidth={3}`. At 12–16px a tick drawn at Lucide's default 2 reads as a
smudge rather than a confirmation, and it is the one glyph where that
matters.

## Every icon is hidden unless it is the label

```tsx
// decorative — the text beside it already says this
<ChevronDown aria-hidden />

// the only thing there — the button needs a name
<Button size="icon-md" aria-label="Close"><X aria-hidden /></Button>
```

A screen reader announcing "image" between every menu item and its text is
noise. An icon-only button with no `aria-label` announces nothing at all. Both
are in [Accessibility](accessibility.md).

## Direction

Icons that encode direction — chevrons, arrows, back and forward — mirror in
RTL. Clocks, check marks, logos and media controls do not: a clock running
backwards is wrong in every locale, and a play triangle points at the
timeline, not at the reading order.

The mechanism is `.rtl-mirror`, defined in `packages/tokens/theme.css`:

```css
[dir="rtl"] .rtl-mirror { transform: scaleX(-1); }
```

Put it on the icon itself, not on a wrapper — the transform mirrors the glyph,
not the space around it. An Accordion chevron, a Breadcrumb separator and a
Drawer's back arrow all take it.
