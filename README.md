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
npm run lint             # @shadcn/lint — design system rules, enforced
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

## Documentation

Everything written about Picasso lives in [`docs/`](docs/), which is the source
of truth for it. The site, Storybook and the `llms*.txt` files all render from
there.

| | |
|---|---|
| [Get started](docs/get-started/) | Separate paths for designers and engineers |
| [Foundations](docs/foundations/) | Grid, spacing, radius, typography, colour |
| [Content](docs/content/) | Voice, casing, errors, states, numbers, terminology |
| [Contributing](docs/contributing/) | How to add a component, and what "done" means |
| [Releases](docs/releases/) | How Picasso versions |
| [`AGENTS.md`](AGENTS.md) | The rules, for agents and humans writing code here |

Component documentation lives beside the component — `guidance.json` and the
Do/Don't stories — so guidance and code are reviewed in the same diff.

### For agents

`npm run build:llms` generates five files into `public/`, served alongside
Storybook:

| File | Contains |
|---|---|
| `llms.txt` | index — one line per page |
| `llms-full.txt` | everything, concatenated |
| `llms-foundations.txt` | foundations and content |
| `llms-components.txt` | component guidance only |
| **`llms-tokens.txt`** | **every semantic token resolved to its light and dark hex** |

`llms-tokens.txt` is the important one. An agent without the resolved token
table invents hex codes; an agent with it cannot.

Point an assistant at it:

```
Use Picasso design system documentation from https://design.ir.com/llms.txt
```

⚠️ The docs domain is not settled — `design.ir.com` is a placeholder. Set
`PICASSO_DOCS_URL` to override it. Decide it before it lands in anyone's editor
config.

## Status

Tokens are migrated and verified. Components land one PR at a time — see the
dependency order in `AGENTS.md`.
