# Picasso

Integrated Research's design system.

**The repo is the source of truth.** Figma is a consumer — it receives tokens and
is reconciled to match the code. This reverses the convention that governed the
earlier Picasso Figma work, and it applies to tokens and component APIs alike.

## Packages

| Package | What it is |
|---|---|
| `@ir/tokens` | Primitives, semantics, the Tailwind bridge, and the five theme axes |
| `@ir/ui` | React components — shadcn architecture (Radix + CVA + `cn`), Tailwind v4 |

## Getting started

```bash
npm install
npm run build:tokens     # generates packages/tokens/dist/tokens.css
npm run storybook        # component library at :6006
npm run lint             # @shadcn/lint — design system rules
```

## Import order matters

```css
@import "tailwindcss";
@import "@ir/tokens/tokens.css";   /* primitives + semantics (generated) */
@import "@ir/tokens/themes.css";   /* theme axes — override primitives */
@import "@ir/tokens/theme.css";    /* Tailwind bridge */
```

## Theming

Five independent axes on `<html>`, plus dark mode:

```html
<html data-brand="clarion" data-neutral="cool" data-radius="default"
      data-type="default" data-spacing="default" class="dark">
```

**Theme axes override primitives. Dark mode overrides semantics.** Semantics alias
primitives, so redefining `--palette-brand-*` re-points every downstream token for
free. Five axes × 2 modes compose by cascade, not by authoring ten sets.

## Writing components

Use the semantic utilities, never raw values or `bg-[var(--...)]`:

| Token family | Utility | Example |
|---|---|---|
| `bg/*` | `surface-*` | `hover:bg-surface-primary-emphasis-hovered` |
| `fg/*` | `content-*` | `text-content-neutral-muted` |
| `border/*` | `line-*` | `border-line-neutral-muted` |

`npm run lint` enforces this. See `AGENTS.md` for the full rules.

## Status

Tokens are migrated and verified. Components land one PR at a time — see the
dependency order in `AGENTS.md`.
