# @ir/tokens

Picasso's design tokens: primitives, semantics, the Tailwind bridge and the five
theme axes. **This package is the source of truth** — Figma receives these
values through Picasso Sync and is reconciled to match, never the other way
round.

## Wire it up

Three imports, in this order, inside a Tailwind-processed stylesheet:

```css
@import "tailwindcss";
@import "@ir/tokens/tokens.css";   /* primitives + semantics, light and dark */
@import "@ir/tokens/themes.css";   /* the theme axes — overrides primitives */
@import "@ir/tokens/theme.css";    /* the Tailwind bridge */
```

`theme.css` carries `@theme` and `@custom-variant` directives, so it has to be
imported here rather than as a JavaScript import — Tailwind never sees it
otherwise.

Then set the axes on the root element:

```html
<html data-brand="clarion" data-neutral="cool"
      data-radius="default" data-type="default" data-spacing="default">
```

## The layer model, in one line

**Theme axes override primitives. Dark mode overrides semantics.**

That asymmetry is the whole design. Semantics alias primitives
(`--bg-primary-emphasis: var(--palette-brand-600)`), so redefining a primitive
on an ancestor re-points every semantic below it and no semantic is ever
authored twice. Dark mode has to work the other way, because there the
*mapping* changes rather than the value: `--bg-card` is white in light and
neutral-800 in dark.

## What a consumer gets

| Family | Count | Tailwind utility |
|---|---|---|
| `bg/*` | 67 | `surface-*` |
| `fg/*` | 31 | `content-*` |
| `border/*` | 21 | `line-*` |
| `status/*` | 5 | `status-*` |
| `chart/1–8` | 8 | `chart-*` |

Three families share Tailwind's single `--color-*` pool, which is why each gets
its own utility word. The resolved table for every one of them, light and dark,
is published at `/llms-tokens.txt`.

## Entry points

| Specifier | What it is |
|---|---|
| `@ir/tokens/tokens.css` | Generated. Primitives, semantics, brand and axis blocks |
| `@ir/tokens/themes.css` | Hand-authored. The axis blocks that are not generated |
| `@ir/tokens/theme.css` | Hand-authored. The Tailwind bridge — every semantic's utility |
| `@ir/tokens/presets.json` | The option sets each axis chooses from |
| `@ir/tokens/ramp` | `buildRamp`, `inkFor`, `contrast`, `hexToRgb`, `STEPS` |
| `@ir/tokens/space` | The spacing scale |

## Commands

```bash
npm run build          # → dist/tokens.css, dist/figma.json, dist/generated.d.ts
npm run check          # build, then the parity checks
npm run brand:new -- <id> --base "#RRGGBB"
npm run figma:import -- ~/Downloads/<brand>.figma-export.json [--dry-run]
```

**`dist/` is generated — never hand-edit it.** After changing any token, rebuild
before anything reads the CSS.

## Where the rules are

- Token architecture, brands and the axes — `docs/foundations/tokens-and-brands.md`
- Colour, the grid and radius, typography — the rest of `docs/foundations/`
- Writing code against these tokens — `AGENTS.md`
