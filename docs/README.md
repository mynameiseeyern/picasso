---
title: Picasso documentation
description: What is here, who it is for, and which copy of a rule is the real one.
---

# Picasso documentation

Picasso is Integrated Research's design system. This folder is the **source of
truth** for everything written about it — the site, Storybook, the `llms*.txt`
files and the Figma foundations pages are all renderings of what is here.

## Sections

| Section | For | Contents |
|---|---|---|
| [Get started](get-started/) | everyone | Install, first component, how designers and engineers each enter the system |
| [Foundations](foundations/) | designers, engineers | Grid, spacing, radius, typography, colour |
| [Content](content/) | writers, designers, PMs, engineers | Voice, casing, errors, states, numbers, terminology |
| Components | engineers, designers | Lives beside the code: `packages/ui/src/<component>/` |
| [Contributing](contributing/) | contributors | How to add a component, and what "done" means |
| [Releases](releases/) | everyone | How Picasso versions and what each category means |

Component documentation deliberately does **not** live here. It sits next to the
component — `button.tsx`, `button.stories.tsx`, `guidance.json` — so a change to
the code and a change to its guidance land in the same diff. A doc in a separate
folder drifts; a doc in the same folder gets reviewed.

## Where a rule lives

The same rule used to exist in five places. Five copies of a rule is zero copies
of a rule, so each one now has exactly one home:

| Home | Role |
|---|---|
| **This folder + `guidance.json`** | ✅ **Source of truth** |
| `AGENTS.md` | ✅ Source of truth for *how to write code here* |
| Docs site | renders this folder |
| Storybook | renders the stories this folder links to |
| `llms.txt`, per-page `.md`, MCP | generated at build |
| Figma foundations pages | designer-facing mirror — each says so on the page |
| `ir-brand`, `ir-tone-of-voice` | ✅ Source of truth for **company** voice and brand, which outrank this system |

If you find a rule stated in two places, one of them is wrong. Fix the source
and delete the copy.

## Direction of truth

**The repo is the source of truth for the design system.** Figma is a consumer:
it receives tokens and is reconciled to match the code. Component *behaviour* —
which variants and states exist — still flows Figma → code.
