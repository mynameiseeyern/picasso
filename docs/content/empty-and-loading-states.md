---
title: Empty and loading states
description: Every data component needs three states written, not one.
---

# Empty and loading states

Most components in this library currently have none. Writing one state and
leaving the other two to the framework is how "No data." ships.

> ✗ **Don't** — "No data."
>
> ✓ **Do** — "No alerts in the last 24 hours. Widen the time range to see older activity."

**Empty.** Say why it is empty and what would fill it.

**First use.** Different from empty. Say what will appear once something is set
up, and link to the setup.

**Loading.** Prefer a skeleton to a spinner with copy. If a wait can exceed ten
seconds, say what is happening.

**Partial.** If some data failed, show what loaded and name what did not. Never
silently drop a source.
