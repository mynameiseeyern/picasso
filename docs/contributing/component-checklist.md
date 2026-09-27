---
title: Component checklist
description: Copy this into the pull request.
---

# Component checklist

```markdown
## Structure
- [ ] Variants, sizes and states mirror the Figma component's names
- [ ] Measurements are shadcn's; any deliberate difference is noted in the doc block
- [ ] `forwardRef`, `asChild`, and a `data-slot` attribute
- [ ] Exported from `packages/ui/src/index.ts`

## Tokens
- [ ] No raw hex, no Tailwind palette colours, no `bg-[var(...)]`
- [ ] No hard-coded corner — radius comes from `rounded-*`
- [ ] Spacing lands on the 4pt grid (or a 2pt half-step)
- [ ] Every utility used actually emits CSS — check the built stylesheet

## Content
- [ ] Every string is sentence case
- [ ] Button labels are verb-first and name the outcome
- [ ] Empty, loading and error copy exist where the component can be in those states

## Accessibility
- [ ] Focus ring is `border/focused`, 2px with a 2px offset, and is never removed
- [ ] Icon-only variants require an accessible name
- [ ] Keyboard behaviour matches the Radix primitive's
- [ ] Storybook's a11y addon passes

## Proof
- [ ] `guidance.json` with Do / Don't pairs drawn from real defects
- [ ] A rendered Do / Don't story
- [ ] Tests covering the defects the rules exist to prevent
- [ ] `type-check`, `test` and `build-storybook` all pass
- [ ] Looked at in light and dark, at every size

## Reconcile Figma
- [ ] Every correction made here has been pushed back into Figma, in this session
- [ ] New states exist as variants, not just in code
- [ ] Pushed as variable bindings, not hand-typed values

## Release
- [ ] Changeset added, with a `figma-impact` line
```
