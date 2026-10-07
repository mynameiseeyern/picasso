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
| [Components](components/) | engineers, designers | One page per component, **generated** from the component folder |
| [Contributing](contributing/) | contributors | How to add a component, and what "done" means |
| [Releases](releases/) | everyone | How Picasso versions and what each category means |

Component documentation is still **authored** next to the component —
`button.tsx`, `button.stories.tsx`, `guidance.json` — so a change to the code and
a change to its guidance land in the same diff. A doc in a separate folder
drifts; a doc in the same folder gets reviewed.

`docs/components/` is **generated** from those folders by
`scripts/build-component-docs.mjs` and is not committed. It exists because the
rule above had a cost: the site had no Components section at all, so searching
it for a component name found passing mentions and never the component. Nothing
in those pages is written — every line is lifted from `guidance.json`, the
component's doc block, its props and its cva variants. Editing one is pointless;
the next build overwrites it.

## Where a rule lives

Five copies of a rule are zero copies of a rule. Each one has exactly one
home:

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

## How these pages are written

**A page describes the system as it is.** Present tense, no history. What the
rule is, where it applies, what to reach for — not what it replaced, not who
decided it, not what it was before.

- **No change history.** "The radius ladder moved from Tailwind's to shadcn's"
  belongs in `CHANGELOG.md`. The page says `rounded-md` is 8px.
- **No decision record.** Which alternatives were weighed, and why this one
  won, is not what a reader needs at the moment they are reaching for a token.
- **No status.** "Not settled yet", "nothing uses this one", "coming later" —
  a page that tracks its own progress goes stale the week after it is written.
  Open work is tracked where open work lives, not on the page.
- **Keep the *why* that is an instruction.** "Floating outranks modal because a
  portalled menu has to clear the dialog that opened it" tells you where to put
  the next floating thing. That earns its place. "We chose GovTech's scale
  after comparing three" does not.

A reader arrives mid-task with a question. Answer that question.

**Link by file, the way GitHub does.** `[Colour](colour.md)` from a page in the
same folder, `[Content](../content/)` for a section, `[AGENTS.md](../../AGENTS.md)`
for a file outside `docs/`. The site rewrites each one to its page — or to the
file on GitHub — when it builds, and a link to a page that does not exist fails
the build.

## Direction of truth

**The repo is the source of truth for the design system.** Figma is a consumer:
it receives tokens and is reconciled to match the code. Component *behaviour* —
which variants and states exist — still flows Figma → code.
