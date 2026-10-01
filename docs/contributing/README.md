---
title: Contributing
description: How to add a component, and what "done" means.
---

# Contributing

| Page | |
|---|---|
| [Adding a component](adding-a-component.md) | The full walkthrough, Button as the worked example |
| [How Figma maps to code](figma-to-code-mapping.md) | The four places the two cannot share a shape, and the rule for each |
| [Component checklist](component-checklist.md) | What "done" means — copy it into the PR |
| [Reporting off-system output](reporting-off-system-output.md) | When an agent writes code that breaks the rules |

## One component per pull request

Components land one at a time, in dependency order, each reviewable on its own.
A PR that adds three components cannot be reviewed — it can only be approved.

## Before you start

Read [`AGENTS.md`](../../AGENTS.md). It is short, and it is what `npm run lint`
enforces.
