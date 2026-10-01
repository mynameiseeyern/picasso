---
title: Icons
description: Lucide, sized by the parent, hidden from screen readers unless they are the only label.
---

# Icons

## One library

**Lucide, and nothing else.** 40 of the 46 component files import from
`lucide-react`. A second icon library means two stroke weights, two grid
sizes and two ideas of what a chevron looks like, and the seam shows in every
toolbar.

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

`[&_svg]:size-4` appears on 15 component roots, `size-3.5` on 4, `size-3` on
one. That is the whole scale:

| Size | px | Where |
|---|---|---|
| `size-4` | 16 | The default — buttons, menu items, inputs, almost everything |
| `size-3.5` | 14 | Dense controls where 16 crowds the text |
| `size-3` | 12 | Inline marks inside a small control |

A size outside this set means the icon is doing something the system has not
agreed to yet.

## Stroke weight is Lucide's, with one exception

Never set `strokeWidth` — except on a check mark. It is overridden exactly
four times in the library, all of them a `Check` at `strokeWidth={3}`
(Checkbox, InputGroup, Select). At 12–16px a tick drawn at Lucide's default 2
reads as a smudge rather than a confirmation, and this is the one glyph where
that matters.

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

⚠️ **No component uses it yet.** The class exists and the rule is written down
in AGENTS.md section 6, but not one directional icon in the library carries
it. Add it as you touch each component; a chevron in an Accordion, a
Breadcrumb separator and a Drawer's back arrow all need it.
