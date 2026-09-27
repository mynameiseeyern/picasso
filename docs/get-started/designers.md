---
title: For designers
description: What the Figma library decides, and what it follows.
---

# For designers

The Figma library is `Picasso` (`v61McMI1fYNAN8DonhNjHQ`).

## What Figma decides

**Component behaviour.** Which variants, sizes, states, slots and properties
exist — and what each one is for. A component is designed in Figma first, and
the code mirrors its names so a design reads straight into props.

## What Figma follows

**Every token value.** Colour, typography, spacing and radius are authored in
the repo and flow into Figma. If a value disagrees, the repo is right.

This reverses how the library worked until September 2026, and it exists to stop
the same number being maintained twice.

## What this means day to day

- **Do not fix a token value in Figma.** It will be overwritten by the next
  export. Raise it instead — the fix belongs in `packages/tokens/`.
- **Do change a component's variants in Figma.** That is the design decision,
  and code follows.
- **The foundations pages in Figma are a mirror** of [Foundations](../foundations/).
  Each says so on the page.

## Where the numbers come from

| Foundation | Authored in | Figma variable |
|---|---|---|
| Colour | repo | `palette/*`, `bg/*`, `fg/*`, `border/*` |
| Typography | repo | `type/*` + 21 text styles |
| Spacing | repo | `space/*` |
| Radius | repo | `radius/*` |

⚠️ Binding a Figma variable to `lineHeight` or `letterSpacing` **forces the unit
to pixels** — a 150% ratio becomes 150px. Those two stay as unbound percentages
on purpose. Do not "tidy" them into variables.
