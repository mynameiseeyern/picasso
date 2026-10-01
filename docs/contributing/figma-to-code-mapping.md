---
title: How Figma maps to code
description: The four places a Figma component and its code cannot share a shape, and the rule for each.
---

# How Figma maps to code

Most of a component reads straight across: a Figma `Variant`, `Size` or `State`
axis is a prop of the same name. Four things cannot, because Figma and the
browser model them differently. Each has one rule, decided on 1 October 2026.
Follow them when you build a component and when you write its Code Connect
mapping, so the two say the same thing.

## 1. One Figma set is one code component

If code has separate components, Figma has separate sets. A `Type` axis that
switches between things code exports under different names is not allowed.

Input is the worked example. It was one set with seven Types; it is now six
sets, one per export:

| Figma set | Code |
|---|---|
| `Input` | `Input` |
| `Password input` | `PasswordInput` |
| `Number input` | `NumberInput` |
| `Input button` | `InputButton` |
| `Tags input` | `TagsInput` |
| `File upload` | `FileUpload` |

When a set has to be split, **move the variants, do not rebuild them**. Lift
each variant out of the set and combine the lifted ones into a new set. The
component nodes and their keys survive, so every instance keeps pointing at the
same thing and keeps its overrides.

An axis is still right when it changes paint inside one component. `Input
button` keeps `Type` = Button | Select trigger because both are `InputButton`.

## 2. A continuous value is a number in code

Progress, Meter and Slider take a number. Figma cannot draw a continuum, so it
draws steps — Progress has `Percent` = 0% | 25% | 50% | 75% | 100%. The steps
are examples of the number, not an enum.

In a mapping, each drawn step becomes that value: `Percent=50%` maps to
`value={50}`. Never add a prop whose only job is to mirror Figma's steps.

## 3. A Figma boolean is a child in code

Figma toggles presence with a boolean: Input's `Leading`, Card's `Card Footer`,
Card / Header's `Show actions`.
Code composes with children and slots, because a boolean that toggles a
hardcoded child cannot hold anything but that child.

In a mapping, the boolean decides whether the child is rendered. `Card
Footer=true` renders `<CardFooter>`; `false` renders nothing. Do not add a
`showFooter` prop to match the file, and do not convert Figma's booleans to
slots to match the code — each side keeps its own idiom and the mapping is
where they meet.

A boolean can change presence. Only a variant can change paint.

## 4. Several Figma sets can map to one component, through a prop

Tabs is three sets in Figma — `_Tab button base`, `Horizontal tabs` and
`Vertical tabs` — and one `Tabs` in code. Both wrappers map to `Tabs`, with
`orientation="horizontal"` or `"vertical"`; the base maps to `TabsTrigger`.

The sets stay separate in Figma because the matrix is sparse: Horizontal has no
Line type and Vertical has no Underline. Merging them would add an axis with
holes in it. This is the one case where rule 1 bends, and it bends only when
the difference is a single prop on one component.
