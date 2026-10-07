---
title: Responsive
description: Two contracts — desktop from 768, phone from 360 — and what a component owes each.
---

Picasso makes two promises about width, and they are not the same promise.

**Desktop, 768 and up.** Every component fits any container in this range. A
page can put anything in any column at any width the ladder reaches, and
nothing runs past its box. This is the contract the library is built to.

**Phone, 360 to 767.** A narrower contract that named components honour and
declare. It is not assumed: a component is phone-ready when it says so, and
`BottomSheet` and the sidebar's phone nav exist because specific products
needed it. Anything that has not claimed the phone contract may still work —
it is simply not promised.

360 is the floor because it is the narrowest viewport in common use. Below it,
nothing is guaranteed.

## The shell answers to the viewport; everything else answers to its container

This is the rule that makes the rest work. The rail, the page padding and the
phone nav are the shell's, and they read the viewport. A component inside
the content column reads the column — `@3xl` and `@7xl`, never `xl` or `2xl` —
because the column already has the rail, the padding, a width cap and any open
drawer taken off it. A component that reads the viewport is wrong at the width
it is actually given.

## The baseline

**Nothing scrolls the page sideways.** Content that cannot fit gets its own
scroller, wraps, or stacks. A table is the common case: the scroller belongs on
the table's own container, so the page stays still and the header row stays
where the reader left it.

**Nothing is pinned wider than its container.** A fixed width — `w-96`,
`shrink-0` on a row of slots — is a promise that the box will always be at
least that wide, and on a phone it will not be. Fixed widths belong inside a
scroller or below 360.

**An anchored panel becomes a sheet.** Popover, Select and DropdownMenu
position against an edge, and on a phone the edge is the viewport, so they
clip. Below `md` the phone form is `BottomSheet`: it rises from the bottom
edge, so its choices sit where a thumb already is.

**Targets are 24 at minimum, 44 where a thumb is the pointer.** 24×24 is the
floor (WCAG 2.2 AA, 2.5.8); 44 is what a thumb actually wants. Where the
control is smaller than the row it sits in — a 16px checkbox in a 32px row —
the row is the target, so the label wraps the control rather than sitting
beside it. A 16px box with nothing around it is a miss, not a tap.

**Spacing and type do not shrink.** The page gutter is 16 below `xl`, which
includes every phone width, and the type ramp is the same ramp. A narrow
screen gets fewer columns, not smaller text.

**A row with fixed geometry takes a smaller size step, it does not scroll.**
Six OTP boxes at `md` are 48 each: 288, plus a 16 separator and six 8 gaps is
352, against the 328 a 360 phone leaves after its gutters. `sm` is 304 and
fits. Where a component offers size steps, the phone takes the step that fits
— adding a scroller to a field people type into hides the digits they are
checking.

**Inputs stay 14, and iOS zooms on focus.** Safari on iOS zooms the page when
a field under 16px takes focus, and Picasso's inputs are 14 (`sm` is 13).
This is accepted. A larger text step for coarse pointers would change every
form's height on a phone, and that was judged the worse trade. Do not raise
the size in a product to stop it, and never disable zoom to hide it.

**The rail is not on a phone.** Below `md` the sidebar is not a 48px strip —
a strip of icons spends the one dimension there is least of. The trigger opens
the same tree as a drawer over the page, from the inline start, with a strip
of scrim left at the end edge to leave by.

## Claiming the phone contract

A component is phone-ready when all of the following hold, measured rather
than assumed:

- it fits a 360 container with nothing past the right edge
- every interactive target meets 24, and 44 where it is the primary action
- anything anchored has a sheet form below `md`
- its stories include a narrow case, so the next change is measured too
