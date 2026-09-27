---
title: Reporting off-system output
description: When an agent writes code that breaks the rules, the docs are what failed.
---

# Reporting off-system output

When an agent produces off-system code — a raw hex, a Title Case button, a
toast carrying both an action and a close — **that is not the agent failing.
It is a gap in `llms.txt`, `AGENTS.md` or a component's `guidance.json`.**

So the fix belongs in the source, not in a one-off correction to that session.

## How to report it

Open an issue with:

1. **The prompt**, verbatim
2. **What it produced**
3. **Which rule it broke**, and where that rule is written down — or that it
   is not written down anywhere

The third line is the useful one. "The agent used `#007FAB`" is a bug report
about a model. "`llms-tokens.txt` does not exist, so there was nothing to
resolve the brand colour against" is a bug report about this system, and it is
fixable.

## What gets fixed

| Symptom | Fix belongs in |
|---|---|
| Wrong token, or a raw value | `llms-tokens.txt` — publish the resolved table |
| Wrong component for the job | `llms-components.txt`, or the component's description |
| Right component, wrong usage | that component's `guidance.json` |
| Broke a repo convention | `AGENTS.md` |
| Off-voice copy | [Content](../content/) |
