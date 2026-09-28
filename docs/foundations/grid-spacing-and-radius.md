---
title: Grid, spacing and radius
description: A 4pt grid with 2pt half-steps, and one knob for every corner.
---

# Grid, spacing and radius

## The grid

**Picasso is a 4pt grid with 2pt half-steps.** Legal values are every multiple
of 4, plus 2, 6, 10 and 14. Anything else — 5, 13, 18 — is drift.

## Spacing

The primitive scale is **Tailwind's, unmodified**: `--space-1` is `0.25rem` and
the ladder runs 0 → 96. Engineering inherits it for free, and Tailwind's own
`--spacing` is fed from that single number, so every `px-`, `gap-`, `h-` and
`w-` utility derives from one value.

```css
--spacing: var(--space-1);   /* 0.25rem */
```

Every ladder step is also a **named** Tailwind key (`p-4` reads `--space-4`),
so a brand or preset can move the whole ladder at once. The spacing presets —
`compact` ×0.875 and `relaxed` ×1.25 — scale every step and round it to the 2px
grid (`space/4` is 14 · 16 · 20px). See
[Tokens, brands and Figma sync](tokens-and-brands.md).

**Do not pick from all 35 steps.** Eight do the real work:

| Step | px | Used for |
|---|---|---|
| `0.5` | 2 | hairline offsets |
| `1` | 4 | tightly related lines — label to hint |
| `1.5` | 6 | icon to label inside a small control |
| `2` | 8 | icon to label, inside a control |
| `3` | 12 | control padding |
| `4` | 16 | between labelled groups, container padding |
| `6` | 24 | page gutters |
| `8` | 32 | between page sections |

`space/36`–`space/96` (144–384px) are layout measurements, not component
spacing. They stay in the repo and are scoped out of Figma's pickers.

## Radius

**Radius is one knob.** `--radius` drives all eight steps proportionally, so a
theme changes one number rather than eight.

```css
:root                   { --radius: 0.625rem; }  /* 10px */
[data-radius="sharp"]   { --radius: 0; }
[data-radius="subtle"]  { --radius: 0.375rem; }  /*  6px */
[data-radius="rounded"] { --radius: 1rem; }      /* 16px */
```

At the default theme that resolves to:

| Utility | Derivation | px | Used by |
|---|---|---|---|
| `rounded-xs` | `--radius × 0.2` | 2 | nested elements inside a control |
| `rounded-sm` | `× 0.6` | 6 | checkbox, small indicators |
| **`rounded-md`** | `× 0.8` | **8** | **Button, Input, Select, Tabs, Chip** |
| `rounded-lg` | `× 1` | 10 | — |
| `rounded-xl` | `× 1.4` | 14 | Card, Dialog, Popover, Drawer |
| `rounded-2xl` | `× 1.6` | 16 | marketing blocks |
| `rounded-3xl` | `× 2.4` | 24 | — |
| `rounded-4xl` | `× 3.2` | 32 | — |
| `rounded-full` | — | — | Badge, Avatar, Switch track, status dot |

**Never hard-code a corner.** A literal `rounded-[8px]` survives the default
theme and breaks every other one.

> ⚠️ This ladder is **shadcn's**, not Tailwind's. Tailwind's is 2/4/6/8/12/16;
> ours derives from the single `--radius` knob, which is what makes radius
> themeable. The Figma `radius/*` variables carry the same eight numbers.
