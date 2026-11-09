---
title: Definition of done
description: The bar a screen built with Picasso ships against — the part that is checked for you, and the part you check.
---

# Definition of done

A screen is done when it meets the bar below. Engineers and agents ship
against the same list; neither gets a shorter one.

Meeting it makes a screen ready for **design review**, not a replacement for
it. The list catches what can be stated as a rule. Review is for what cannot —
whether this is the right screen, and whether it reads well.

## Checked for you

These fail the build. Nobody has to remember them.

| Check | Where it runs | What it refuses |
|---|---|---|
| `shadcn/no-raw-colors` | lint | a hex, an `rgb()`, a palette colour that is not a token |
| `shadcn/no-arbitrary-values` | lint | `bg-[var(--…)]` and every other `[…]` value |
| `shadcn/no-inline-styles` | lint | `style={{ … }}` |
| `shadcn/no-restyle` | lint | a class put on a Picasso component from outside |
| `shadcn/no-unknown-classes` | lint | a class no stylesheet declares |
| `picasso/no-physical-properties` | lint | `pl-4` where `ps-4` is meant |
| `picasso/no-raw-page-title` | lint | a hand-written `<h1>` instead of `PageHeader` |
| `picasso/require-content-width` | lint | an `AppShellContent` that has not said which width it is |
| Token contrast | `npm test` | any on-colour pair under 4.5:1, in either mode, for any brand |

The lint rules come from `@ir/eslint-config` — `product()` in an app. Its README, in
`packages/eslint-config/`, covers setup and for the two ways to break a rule on purpose. ⚠️ The package is
not published yet, so today these run in the Picasso repo and not in a
product's own CI.

A rule broken with a line disable carries its reason in the comment. A
disable with no reason is not done.

## Checked by you

Nothing automates these yet. They are not optional for that.

**Built from the system**

- [ ] Every control is a Picasso component. Anything that is not is either
      raised in the Design System forum or recorded with a reason.
- [ ] The page uses a [pattern](README.md) where one exists, and follows it.
- [ ] The width mode was chosen, not defaulted — `fluid` for dashboards and
      tables, `standard` for detail and settings, `reading` for forms and
      prose.

**States**

- [ ] Empty, loading and error exist wherever the screen can be in them —
      see [Empty and loading states](../content/empty-and-loading-states.md)
      and [Errors](../content/errors.md).
- [ ] A missing value and a zero are shown differently.

**Copy**

- [ ] Sentence case everywhere, column headers included. See
      [Casing](../content/casing.md).
- [ ] Buttons start with a verb and name the outcome. See
      [Buttons and labels](../content/buttons-and-labels.md).
- [ ] Product terms match [Terminology](../content/terminology.md).

**Accessibility**

- [ ] The whole flow works from the keyboard, in order, with the focus ring
      visible at every stop.
- [ ] Every input sits in a `Field`, so its label, hint and error are wired by
      the component rather than by hand.
- [ ] Every icon-only button has an accessible name.
- [ ] Storybook's a11y panel, or axe in the browser, reports nothing on the
      screen's states.

**Looked at, not just tested**

The test suite runs in jsdom, which has no layout engine — it cannot see
size, position, overflow or wrapping. A green suite says nothing about what
rendered.

- [ ] Opened at **360**, **768** and **1280**, and at **2560** for a `fluid`
      page.
- [ ] In light **and** dark.
- [ ] In RTL, if the product ships a right-to-left locale.

## Moving the line

Every item under *Checked by you* is a candidate for automation. When one
becomes a check that fails the build, it moves to the table above, and this
page gets shorter.
