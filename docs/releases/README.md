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

## How a release actually happens

As of 0.1.0:

1. Land the work, with its `CHANGELOG.md` entry under `## Unreleased` — including
   its **Figma impact** line.
2. Move `## Unreleased` to `## <version> — <date>` and set the same version in
   `packages/tokens` and `packages/ui`.
3. Tag `v<version>` and push the tag.

`.github/workflows/release.yml` then refuses the tag if it disagrees with either
package, runs the full check, cuts the GitHub release notes from that
changelog section, and publishes — but only once an `NPM_TOKEN` secret exists,
so adding the secret is the decision to publish rather than something that
happens by surprise on the first tag.

`.github/workflows/ci.yml` runs the same checks on every push and pull request,
including the Storybook and docs-site builds, because the guidance ratchet and
the generated component pages only fail at build time.

### Changesets — not installed

Earlier drafts of this page described a changeset per PR with a non-standard
`figma-impact` field. That was never built, and the changelog has been written
by hand since. It is worth reconsidering when more than one person is landing
changes: the reason for changesets is that a changelog written from memory on
release day omits exactly the visual changes nobody flagged at the time, and
that failure mode arrives with the second contributor, not the first.
