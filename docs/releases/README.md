---
title: Releases
description: How Picasso versions, and what each category means.
---

# Releases

## One version, three surfaces

Picasso ships through three surfaces that can drift apart:

- the **Figma library** — designers consume it by accepting a library update
- **`@ir/tokens`**
- **`@ir/ui`**

**They publish together under one version number**, and the Figma library's
publish description carries the same version string. A changelog that only
versions the npm packages leaves designers with no idea what changed in their
file — and designers are the majority of the audience today.

## Categories

| Category | Meaning |
|---|---|
| ⚠️ **Breaking** | API change — a variant renamed, a component or token removed |
| **Added** | a new component, token, variant or slot |
| ⚠️ **Changed (visual)** | renders differently, **breaks no build** |
| **Fixed** | a defect, with no intended visual change |
| **Deprecated** | still works, removal version named |

**"Changed (visual)" is the category that matters most.** A design system's most
disruptive changes usually break nothing at build time — they just make every
screen look different, and someone has to be told before they pull.

## Every release carries a Figma impact line

Engineers ask "will this break my build". Designers ask "what happens to my file
when I accept the update". Only one of those is answered by a normal changelog.

> **Figma impact** — 460 Button instances change their label size. Accept the
> library update on a branch and review before merging.

## Versioning

| | |
|---|---|
| **Major** | an API break — a component, variant, prop or token removed or renamed |
| **Minor** | something added, **or any visual change** |
| **Patch** | a fix with no visual change |

**A visual change is minor, never patch.** Patch implies "safe to take without
looking", and a visual change never is.

## Changesets

Every PR that touches the system adds a changeset naming its category and
impact, and the changelog is assembled at publish. A changelog written from
memory on release day omits exactly the visual changes nobody flagged at the
time.

The template carries one non-standard field, **`figma-impact`**, which feeds the
line above.
