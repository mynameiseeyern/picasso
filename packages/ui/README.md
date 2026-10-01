# @ir/ui

Picasso's React components — 46 of them, on shadcn's architecture: a Radix
primitive, `cva` variants and `cn()`. Tailwind v4, Lucide icons, and semantic
tokens from [`@ir/tokens`](../tokens/README.md) only.

## Use it

Not published to a registry yet — it is a workspace of this repo
(`packages/tokens`, `packages/ui`, `apps/site`), so `npm install` at the root
links it and `import … from "@ir/ui"` resolves.

Peer dependencies: `react` ^19, `react-dom` ^19, `@ir/tokens`. The package ships
**source, not a build** (`"files": ["src"]`, `"main": "./src/index.ts"`), so the
consuming app's bundler compiles it — and its class names have to fall inside
that app's Tailwind `@source` scan or they are never generated.

```tsx
import { Button, Dialog, Field } from "@ir/ui";

<Button variant="default" size="md">Save changes</Button>
```

## What a component folder holds

```
src/components/button/
  button.tsx            the component
  button.stories.tsx    every variant and state, plus its Do/Don't figures
  button.test.tsx       the rules, not the framework
  guidance.json         summary, Figma node, Do/Don't pairs, accessibility notes
```

`guidance.json` is the agent-facing half: `scripts/build-llms.mjs` turns all 46
of them into `/llms-components.txt`, so a rule written there reaches both a
designer reading Storybook and a model writing code.

## The one rule that surprises people

**A component owns its look; the page owns where it sits.** `shadcn/no-restyle`
refuses classes from outside, and the fix for "I need this 420 wide" is a
wrapper element, not a class on the component. Two components have a narrow
contract allowing layout classes — `TableCol`, whose entire purpose is to carry
a column width, and `Skeleton`, whose size *is* the component — and both still
refuse colour, typography and shape.

Everything else — never a raw hex, never an arbitrary value, never a hard-coded
corner — is in `AGENTS.md` and enforced by `npm run lint`.

## Commands

```bash
npm run storybook      # :6006
npm run test           # vitest
npm run type-check
```

Run `npm run build:tokens` from the repo root first; Storybook reads
`@ir/tokens/dist/tokens.css`, which is generated.

## Where the rules are

- Writing code here — `AGENTS.md`
- Adding a component — `docs/contributing/adding-a-component.md`, with
  `component-checklist.md` copied into the PR
- Foundations and copy rules — `docs/foundations/`, `docs/content/`
