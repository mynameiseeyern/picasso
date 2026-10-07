---
name: ir-mobile-web
description: Make an IR web app behave on a phone — the platform layer under the components: viewport height, safe areas, the keyboard, taps, scroll and the browser's own chrome. Use when something built on Picasso is being put on a phone or reviewed there, when it "works on my laptop and feels wrong on my phone", or when building a sheet, a phone nav or any full-height layout. For what a component owes a phone, read docs/foundations/responsive.md; for motion use ir-motion.
---

# The phone, the IR way

Picasso makes a narrow promise about phones, and it is written down in
`docs/foundations/responsive.md`: from 360 wide, the components that say they
are phone-ready fit, have targets a thumb can hit, and turn anchored panels
into a `BottomSheet`. Read that first. This skill is about the layer
underneath — the things no component can fix because they belong to the page
and the browser.

Almost all of it is one line each. The work is knowing which line, and not
trusting a desktop browser to tell you whether it worked.

## Three things to hold on to

**A laptop pretending to be a phone is not a phone.** Device emulation gets
the width right and almost nothing else: not the address bar changing the
height, not the keyboard, not a tap leaving a hover behind, not the notch. If
you could not put it on a real phone, say which fixes you checked from the
code and which someone still has to try.

**Ask the platform what it can do; do not guess from the width.** A wide
screen can be a tablet under a thumb, and a laptop can have a touchscreen.
Use `pointer-coarse:`, `hover:`, `dvh`, `env()`. Never read the user agent.

**Never take zoom away.** `user-scalable=no` and `maximum-scale=1` fail
people who need to enlarge the page. Whatever they were added to hide has a
real fix below, or is a cost IR has accepted.

## Symptom to fix

| On the phone | Do this | Because |
|---|---|---|
| The bottom of the page sits under the browser's toolbar | `h-dvh` on an app shell; `min-h-svh` on a first screen that should never be cut off. Not `h-screen` | `100vh` is the height with the toolbar hidden, which is not how the page loads |
| The shell is the wrong height inside a panel or a story | `h-full`, and let the page give it a height | Picasso's `AppShell` and `SidebarProvider` fill what they are given on purpose |
| Focusing a field zooms the page, and it stays zoomed | On a Picasso input, nothing — it is accepted, see below. On a hand-built field, 16px text where the pointer is coarse | iOS zooms any field under 16px, and Picasso's inputs are 14 |
| A grey or blue flash on every tap | `-webkit-tap-highlight-color: transparent` once, on `html` | It is the browser's own feedback, and it fights the control's pressed state |
| A control looks stuck in its hover colour after a tap | Nothing, if it uses Tailwind's `hover:` — v4 already limits it to pointers that hover. Check hand-written `:hover` rules | Touch has no hover, so browsers fake one and leave it on |
| A tap feels late | A pressed state on `:active` (Button and Chip have one), and `touch-manipulation` on custom tappable things | The response should land when the finger does, not when it lifts |
| Pulling down refreshes the page, or the page behind a sheet scrolls | `overscroll-none` on the app's root; `overscroll-contain` on the scroller inside a sheet or drawer | Scroll that reaches the end of a container carries on into the page |
| Content stops short of the notch or hides under the home indicator | `viewport-fit=cover` in the viewport meta, then pad the fixed edges with `env(safe-area-inset-*)` | Without the meta tag every inset is zero |
| The keyboard covers the field or the sheet's buttons | `interactive-widget=resizes-content` in the viewport meta, and `dvh` rather than `vh` | It makes the keyboard shrink the layout, so pinned things move up with it |
| Holding a finger on a button selects its label | `select-none` on the control. Never on text people might copy | A label is a control; an IP address in a table is content |
| A sideways swipe drags the page up and down | `touch-pan-y` on the thing being swiped; `touch-none` only on a surface that handles every direction itself | It tells the browser which direction is still its own |
| The status bar is the wrong colour in dark mode | A `theme-color` for each colour scheme, matching the top of the page | One value is wrong for half the people using it |
| The wrong keyboard comes up | `inputMode`, `type`, `autoComplete`, `enterKeyHint` on the field. `NumberInput`, `PasswordInput` and `Otp` already set theirs | The keyboard is part of the form |

## Targets

24 by 24 is the floor; 44 is what a thumb wants. Where a control is smaller
than its row, the row is the target. Picasso grows the hit area where the
pointer is coarse without changing what is drawn:

```tsx
"relative after:absolute after:-inset-2 pointer-coarse:after:-inset-3.5"
```

Use that rather than making the control bigger.

## What Picasso already does

Do not rebuild these.

- **`BottomSheet`** — the phone form of Popover, Select and DropdownMenu. It
  follows a drag, settles or dismisses, and always draws a close button,
  because a gesture is never the only way out.
- **The Sidebar's phone nav** — below `md` the rail is replaced by the same
  tree opened as a drawer from the inline start.
- **`pointer-coarse:` hit areas** on close buttons, chip removers and field rows.
- **`Narrow` stories at 328** — a 360 phone minus its gutters. A component
  that claims the phone contract has one.
- **RTL** — a phone in Arabic mirrors like everything else. `docs/foundations/rtl.md`.

## Accepted: iOS zooms on a Picasso input

Picasso's inputs are 14px (`sm` is 13), so on iOS the page zooms when one
takes focus. This is known and accepted (7 Oct 2026): a larger text step for
coarse pointers would change every form's height on a phone, and that was
judged the worse trade.

So leave it. Do not raise the input size in a product to stop it — the form
then stops matching Picasso — and never hide it by disabling zoom. If
someone reports it, the answer is that it is a decision, written down in
`docs/foundations/responsive.md`.

## The floor for a new phone-facing app

```html
<meta
  name="viewport"
  content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content"
/>
<meta name="theme-color" media="(prefers-color-scheme: light)" content="…" />
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="…" />
```

Take the two colours from the tokens — whatever surface is at the very top
of the page, not the brand colour.

```css
html {
  -webkit-tap-highlight-color: transparent;
  -webkit-text-size-adjust: 100%;
}
```

Add `overscroll-behavior: none` to the root only for an app with its own
scroll areas. A page that is one long document should keep pull-to-refresh.

## Checking it

1. Run the dev server on the network and open it on the phone by address.
2. Safari's Develop menu for an iPhone, `chrome://inspect` for Android.
3. Use a phone a few years old. Open the keyboard. Turn it sideways once.
4. If it is installed to the home screen, check that too — the viewport, the
   insets and the status bar all behave differently there.

## What to say when you finish

- **What was wrong** — the symptom, and the reason in a line.
- **What changed** — file and declaration.
- **What still needs a phone** — be exact about what you could not check.
