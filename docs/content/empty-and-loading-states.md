---
title: Empty and loading states
description: Every data component needs three states written, not one.
---

# Empty and loading states

Writing one state and leaving the other two to the framework is how "No data."
ships.

Two components exist to put this copy in: **`EmptyState`** takes a `title` and
a required `description` — required precisely so the second sentence cannot be
skipped — plus an optional illustration, icon and action. **`Skeleton`** is the
loading case. Reach for them rather than inventing a one-off; a bare string in
a `div` is how the three states drift apart.

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
