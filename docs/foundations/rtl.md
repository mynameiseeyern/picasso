---
title: Right-to-left
description: Arabic, Hebrew and Persian. Logical properties, a direction provider, and the few things that must not follow the page.
---

# Right-to-left

Picasso supports Arabic, Hebrew and Persian. A page in one of them reads from
the right, and nearly everything follows: the sidebar is on the right, a
drawer opens from the left, a switch turns on toward the left.

The approach is shadcn's (January 2026), with the parts their CLI does at
install time done here once, in the source.

## Setting it up

Two things, set once at the root. Neither works without the other.

```tsx
<html lang="ar" dir="rtl">
  <body>
    <DirectionProvider direction="rtl">{children}</DirectionProvider>
  </body>
</html>
```

- **`dir` on `<html>`** is what CSS reads: logical properties, `.rtl-mirror`
  and Tailwind's `rtl:` variant. On `<html>`, so content in a portal — a
  menu, a dialog, a toast — gets it too.
- **`DirectionProvider`** is what Radix reads. It does not look at the DOM.
  Without the provider the layout mirrors and the keyboard does not: the
  arrow that points at the next tab moves to the previous one.
- **`lang`** picks the voice a screen reader uses, and switches letter-spacing
  off for Arabic script.

In Storybook the toolbar's **Direction** control sets both for every story.

## The rules

### Logical properties, always

`ps-4`, not `pl-4`. `start-0`, not `left-0`. `border-s`, `rounded-e-md`,
`text-start`. They render the same left-to-right, which is why the physical
ones creep back in. `picasso/no-physical-properties` refuses them; a genuine
physical need is a disabled line with the reason beside it.

A prop that names a place is logical too. Drawer's `side` is `start` or
`end`, not `left` or `right`.

### What a logical class cannot reach

| Thing | Mechanism |
|---|---|
| An icon that points along the reading direction | `rtl-mirror` on the icon |
| A translate (Switch knob, Progress fill) | an `rtl:` twin with the sign turned: `translate-x-4 rtl:-translate-x-4` |
| A keyframe that travels sideways (Drawer, Toast) | multiply by `--direction-sign`, which is 1 or -1 |
| A gradient with a direction | `bg-linear-to-r rtl:bg-linear-to-l` |
| Geometry done in script (pointer position, arrow keys, a swipe) | `useDirection()` |

`useDirection()` is for script. To choose between two classes, use a logical
class or `rtl:` instead — it cannot disagree with the DOM.

### Scales mirror

Low is at the inline start. Slider, Threshold slider, Progress, Meter and
File upload all fill from the right in Arabic, and the arrow key that points
along the scale increases the value.

### Technical text does not

A metric, an IP address, a SIP trace, an ID and a one-time code read left to
right in every locale, in Latin digits. Inside right-to-left text the bidi
algorithm reorders punctuation: `-5%` reads as `5%-` and `10.0.0.1:5060`
comes apart at the colon.

Put `ltr-island` on the element that holds the value:

```tsx
<span className="ltr-island">10.0.4.12:5060</span>
```

KPI tile, Progress, Table's numeric cells, Number input, OTP, Input group
text and Threshold slider's readings already carry it.

A numeric column is right-aligned in every locale, heading included: the
units digit is on the right in Arabic and Hebrew too, as it is in a
spreadsheet.

### Some things never mirror

- Check marks, clocks, logos and media controls.
- **A chart's time axis.** Time runs left to right for everyone who reads
  monitoring data. The legend, tooltip and labels around the chart follow the
  page.
- Illustrations.

### Calendars are Gregorian

Dates are Gregorian in every locale, because the product's timestamps are.
The grid mirrors, and the week starts where the locale says: pass a date-fns
`locale` to Calendar and Saturday or Sunday follows from it.

## Type

Inter and JetBrains Mono have no Arabic or Hebrew glyphs. Every font stack,
sans and mono, carries **Noto Sans Arabic** and **Noto Sans Hebrew** straight
after the family itself, so those scripts look the same on every OS. Noto Sans
Arabic covers Persian. **Noto Sans** is also in the library as a sans a brand
can choose, for one family across all three scripts.

`@ir/ui` ships no fonts. An app that serves these languages loads them:

```css
@import "@fontsource/noto-sans-arabic/arabic-400.css";
@import "@fontsource/noto-sans-arabic/arabic-500.css";
@import "@fontsource/noto-sans-arabic/arabic-600.css";
@import "@fontsource/noto-sans-hebrew/hebrew-400.css";
@import "@fontsource/noto-sans-hebrew/hebrew-500.css";
@import "@fontsource/noto-sans-hebrew/hebrew-600.css";
```

A browser fetches a fallback face only when the text on the page needs it, so
an English page never downloads them.

**Letter-spacing is zero for Arabic script.** The letters join, and any
tracking pulls the joins apart. Under `lang="ar"`, `fa`, `ur`, `ps` or `ckb`
the tracking tokens are zero and every type role follows. Hebrew is not
joined and keeps its tracking. Uppercase does nothing in any of the three.

## Checking a component

1. Turn the Storybook **Direction** control to right-to-left and look.
2. Does anything point the wrong way, slide the wrong way, or sit outside
   its own box?
3. Use the keyboard: do the arrow keys follow what you see?
4. Is there a number, an address or a code in it? It should read exactly as
   it does in English.
5. `src/__tests__/rtl.test.tsx` holds the rules. A new directional icon fails
   there until it is mirrored or listed with the reason it must not be.

## Not done yet

- Built-in strings are English: "Warning threshold", "Collapse sidebar",
  "Show hidden levels". A product can override most through props; there is
  no translation layer.
- Arabic at 11 and 12px has not been checked for legibility or line height.
- No Jalali or Hebrew calendar.
