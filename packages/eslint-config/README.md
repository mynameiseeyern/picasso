# @ir/eslint-config

Picasso's rules, packaged so they travel with the components.

Installing `@ir/ui` without this gets you the components and none of the
guarantees. The rules are the part of the design system that actually holds —
they are the reason a Button is the same Button on every screen — and until
now they lived in one config file in the picasso repo.

## In a product

```js
// eslint.config.mjs
import { product } from "@ir/eslint-config";

export default product();
```

That is the whole setup. `@shadcn/lint`, `@typescript-eslint/parser` and
`eslint` are peer dependencies, so they come from the product's own versions.

Options, all optional:

| Option | Default | What it does |
|---|---|---|
| `files` | `["**/*.{ts,tsx}"]` | What to lint |
| `ui` | `node_modules/@ir/ui/src/components` | Where the component source is |
| `componentImports` | `["^@ir/ui(/|$)"]` | Which imports count as Picasso components |
| `contracts` | `[]` | `no-restyle` exceptions — see below |
| `note` | Picasso's docs link | The sentence appended to every message |

## What it refuses

| Rule | What it catches |
|---|---|
| `shadcn/no-arbitrary-values` | `bg-[var(--bg-primary-emphasis)]`, `grid-cols-[minmax(0,1fr)_9rem]` |
| `shadcn/no-raw-colors` | a hex, an `rgb()`, a palette colour that is not a token |
| `shadcn/no-restyle` | a class put on a Picasso component from outside |
| `shadcn/no-inline-styles` | `style={{ … }}` |
| `shadcn/no-unknown-classes` | a class no stylesheet declares — usually a typo |
| `shadcn/require-static-classes` | a class name built at runtime, which Tailwind cannot see |
| `picasso/no-physical-properties` | `pl-4` where `ps-4` is meant — invisible until the first RTL locale |
| `picasso/no-raw-page-title` | a hand-written `<h1>` instead of `PageHeader` |
| `picasso/require-content-width` | an `AppShellContent` that never said which of the three widths it is |

## Two presets

`product()` is for an app consuming `@ir/ui`. It composes components rather
than building them, so a class on one is almost always a restyle — `no-restyle`
is an error — and the page-level rules apply.

`library()` is for the design system's own repo, which builds the components
and therefore writes the classes. `no-raw-page-title` is off there, because an
`<h1>` in a story is a specimen rather than a page title.

## When a rule is wrong

Two escape hatches, in order of preference.

A **contract** is for a class that is not restyling but the component's entire
purpose — `TableCol` exists to carry a column width and there is no parent to
move it to. Keep it to the category it needs; `allow: ["layout"]` still refuses
colour, typography and shape.

```js
product({ contracts: [{ pattern: "^TableCol$", allow: ["layout"] }] })
```

A **line disable** is for a one-off, and it takes a reason:

```tsx
{/* eslint-disable-next-line picasso/no-physical-properties --
    the drop shadow falls the same way in both directions */}
<div className="pl-2" />
```

That comment is the record of a decision, which is the point. A disable with
no reason is a rule nobody decided to break.
