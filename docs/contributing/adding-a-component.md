---
title: Adding a component
description: The walkthrough, with Button as the worked example.
---

# Adding a component

Every component is five files in one folder:

```
packages/ui/src/components/button/
  button.tsx            the component
  button.stories.tsx    the rendered examples, including Do / Don't
  button.test.tsx       the rules, enforced
  guidance.json         the Do / Don't pairs as data
  index.ts              re-export
```

Guidance lives **beside the code**, not in a docs folder, so a change to the
component and a change to its rules land in the same diff.

## 1. Read the Figma component first

Structure comes from Figma: which variants, sizes and states exist, and which
semantic token each one uses. **Mirror the names exactly** so a design reads
straight into props. Button's `Variant`, `Size` and `State` axes are its props.

Four things do not read straight across — a `Type` axis that is really several
components, a continuous value, a presence boolean, and several sets that are
one component. [How Figma maps to code](./figma-to-code-mapping.md) has the
rule for each.

## 2. Take shadcn's measurements

Heights, padding, gaps and radius come from shadcn — that is what "shadcn base
except colours" means. Where Figma and shadcn disagree on a measurement,
shadcn wins and Figma is reconciled to match. Say so in the component's doc
block, with the numbers:

```
 * ⚠️ These disagree on height. Figma is 24/28/32/36; shadcn is 28/32/36/40.
 * We take shadcn's, so every button is one step taller than the current
 * Figma component. Deliberate, and Figma is reconciled to match.
```

An undocumented deliberate difference reads as a bug to the next person.

## 3. Write the component

```tsx
const buttonVariants = cva(base, {
  variants: { variant: {...}, size: {...} },
  compoundVariants: [...],
  defaultVariants: { variant: "default", size: "md" },
});
```

Radix for behaviour, `cva` for variants, `cn` for merging. `forwardRef`,
`asChild` via Radix `Slot`, and a `data-slot` attribute for styling hooks.

**Order matters inside cva.** Variants are applied before sizes, and compound
variants after both. If a variant needs to win over a size — Link stripping its
box, say — it has to be a compound variant, or the size block overrides it.

## 4. Write `guidance.json`

Do / Don't pairs, each with a `why`. **Draw them from real defects**, not
invented ones — the audit is full of them, and a rule with a real failure
attached is one people remember:

```json
{
  "id": "ghost-resting-fill",
  "dont": "Give Ghost a resting background.",
  "do": "Keep Ghost transparent until hover.",
  "why": "A ghost with a resting fill reads as Outline, so the hierarchy between a primary and a tertiary action collapses.",
  "source": "Found on 168 buttons in the Figma library — audit §17.2"
}
```

Add an `a11y` array in the same file for what the `.tsx` cannot be read for —
a deliberate absence (Alert ships no `role` on purpose), a decision made
elsewhere (Skeleton is `aria-hidden` because the container announces the
wait), or a number with a reason (Button's disabled contrast is 2.24:1, which
SC 1.4.3 exempts). It is published to `/llms-components.txt`, so a component
that says nothing there is one a model will guess about.

## 5. Render the guidance as a story

A Do / Don't pair written only in JSON goes stale silently. Rendered as a
story, it breaks when the component does.

## 6. Test the rules, not the framework

Do not test that React renders. Test the things that went wrong:

```tsx
it("keeps ghost transparent at rest", () => { ... });
it("gives link no box at any size", () => { ... });
it("marks a loading button busy and blocks activation", () => { ... });
```

Button's tests found three real defects the first time they ran. That is what
they are for.

## 7. Verify before claiming

```bash
npm run type-check
npm test
npm run build-storybook
```

Then **look at it** — light and dark, every variant and size. A class name that
Tailwind never emitted fails silently; the build stays green and the button
renders unstyled.

## 8. Reconcile Figma — in the same session

**Every correction made in the repo goes back into Figma.** Not "eventually",
not on a sweep later: in the same session, while you still know what changed
and why.

This is the half of the direction-of-truth rule that is easy to skip, because
the code works without it. But a Figma component that still shows the old
behaviour is not a stale document — it is a second, contradicting answer, and
designers will keep building against it. Every hour it stays wrong, more
instances inherit it.

What counts as a correction to push:

| In the repo | In Figma |
|---|---|
| A state Figma does not have (read-only, say) | add the variant |
| A token swapped for a more correct one | rebind the affected variants |
| A measurement taken from shadcn over Figma's | update the frames, and say so in the doc block |
| A defect fixed (a fill that should not be there) | fix it in every variant, not just the one you noticed |

Then add a **Figma impact** line to the entry under `## Unreleased` in
`CHANGELOG.md`, so the release says what a designer will see when they accept
the library update. There are no changesets — see [Releases](../releases/).

**Prefer a variable rebind to a literal.** A hand-typed value in Figma matches
the repo today and drifts the next time either side moves — that is how the
focus ring ended up hand-typed at a value the palette no longer held.
