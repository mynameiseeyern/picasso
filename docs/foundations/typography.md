---
title: Typography
description: Five roles, 21 steps, and three unambiguous weight tiers.
---

# Typography

**Inter** for everything, **JetBrains Mono** for `code` and `metric`, and
**Oswald** for the wordmark. All three carry full fallback stacks — including
Noto Sans Arabic and Hebrew — so never ship `font-family: Inter` alone.

Three families, three tokens: `type/family/sans`, `/mono` and `/display`. The
display family is the wordmark's alone. It is **not** `heading/display`, which
is the 36px step of the Inter ramp and has nothing to do with Oswald — the two
share a word and nothing else.

**Tailwind's own size scale is cleared.** There is one vocabulary, and `text-md`
is **14px**, not Tailwind's 16px `text-base`. Size and line height both come
from the composite token, so `text-body-md` sets family, size, weight, leading
and tracking together.

## The wordmark

The one place the display family appears. `text-wordmark` is a composite step
like any other — display family, `2xl`, Semi Bold, `snug` leading, `wide`
tracking, uppercase — and the App shell's sidebar is its only consumer.

```tsx
<span className="text-wordmark">Clarion</span>
```

It is deliberately not a size on the Inter ramp: a wordmark is a piece of
identity, not a heading, and giving it its own step stops it drifting when the
heading scale changes.

## Three weight tiers

Size alone does not separate the roles — `heading/xs` and `body/lg` are both
16px. Weight is what distinguishes them:

| Tier | Weight | |
|---|---|---|
| Body | Regular 400 | prose |
| Label | Medium 500 | UI chrome |
| **Heading** | **Semi Bold 600** | structure |

Headings are Semi Bold at every step. Dark mode thins type, and Picasso ships a
product people run dark during incidents — Medium goes soft where Semi Bold
holds.

## The ramp

### Headings — six steps, each with a role

| Style | Size | Leading | Role |
|---|---|---|---|
| `heading/display` | 36 | 120% | Marketing surface, empty-state hero. Once per screen at most. |
| `heading/xl` | 30 | 120% | **Page title** |
| `heading/lg` | 24 | 120% | **Section title** |
| `heading/md` | 20 | 135% | **Card, panel and dialog title** |
| `heading/sm` | 18 | 135% | **Subsection** |
| `heading/xs` | 16 | 135% | **Dense panel heading, table group header** |

The ramp was never the problem — nothing told anyone which step was a page
title, so `xs` and `sm` did page-title work while the middle three starved.
The roles are the fix.

`display`, `xl` and `lg` carry **−2% tracking**; below 20px tracking is 0.

### Body — Regular, 150% leading

`lg` 16 · `md` 14 · `sm` 13 · `xs` 12

### Label — Medium

| Style | Size | Leading |
|---|---|---|
| `label/lg` | 14 | 135% |
| `label/md` | 13 | 135% |
| `label/sm` | 12 | 135% |
| `label/xs` | 11 | 135%, **uppercase**, +4% tracking |

`label/xs` is the **eyebrow / overline** — the single sanctioned uppercase
style, for chrome that must not read as data. Never on a button. See
[Casing](../content/casing.md).

### Metric — JetBrains Mono, 100% leading

| Style | Size | Weight |
|---|---|---|
| `metric/xl` | 30 | Semi Bold |
| `metric/lg` | 24 | Semi Bold |
| `metric/md` | 18 | Semi Bold |
| `metric/sm` | 14 | **Medium** |

A hero KPI number should read as a number. `sm` stays Medium because Semi Bold
mono at 14px goes muddy — the asymmetry is deliberate.

### Code — Regular, 150% leading

`md` 14 · `sm` 13 · `xs` 12

## Line height is a ratio, never a pixel value

| Leading | | Applied to |
|---|---|---|
| `none` | 100% | all `metric/*` |
| `tight` | 120% | `heading/display`, `xl`, `lg` |
| `snug` | 135% | `heading/md`, `sm`, `xs`, all `label/*` |
| `default` | 150% | all `body/*`, all `code/*` |
| `relaxed` | 165% | reserved for long-form |

> ⚠️ **Figma cannot hold these as variables.** Binding a variable to
> `lineHeight` or `letterSpacing` forces the unit to pixels — a `150%` ratio
> becomes `150px`. So Figma keeps them as unbound percentage literals, and the
> export must never write `lineHeight`, `letterSpacing` or `fontFamily` back.
