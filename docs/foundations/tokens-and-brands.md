---
title: Tokens, brands and Figma sync
description: One source in the repo, brands as choices, and a plugin that keeps Figma matching.
---

# Tokens, brands and Figma sync

## The one rule

**The repo is the source of truth for every token.** Figma follows it. A change
can *start* in Figma, but it only counts once it is exported back into the repo
and reviewed as a git diff — otherwise the next sync overwrites it.

```
packages/tokens/tokens/*.json  ──npm run check──▶  dist/tokens.css   → code
        ▲                                        └▶ dist/figma.json  → Picasso Sync ▶ Figma
        │                                                                              │
        └──── npm run figma:import ◀── <brand>.figma-export.json ◀── Picasso Export ◀───┘
```

## Two layers, the same in code and Figma

| Layer | Figma collection | Modes | Holds |
|---|---|---|---|
| **Primitives** | `Primitives` | one per brand — `Clarion` · `Vantage` · … | colour ramps, type sizes, weights and families, spacing, radius, breakpoints |
| **Semantic** | `Semantic` | `Light` · `Dark` | `bg` · `fg` · `border` · `status` · `chart`, plus the colours behind rings and shadows |

Semantics point at primitives (`bg/primary/emphasis` → `palette/brand/600`), so
the two switches are independent: **any frame can be any brand in either mode.**

Text styles (`shared/text/*`) and effect styles (`ring/*`, `shadow/*`) sit on
top, bound to those variables.

> Line height (%) and letter spacing (em) live only inside the text styles —
> Figma variables cannot hold either. Everything else is a variable.

## A brand is a set of choices

Each brand is one small file, `packages/tokens/tokens/brands/<brand>/brand.json`.
It picks one option per axis from `presets.json`; the build turns the choices
into that brand's primitives.

| Choice | Options | Becomes |
|---|---|---|
| `colour.base` | any hex (optionally a pinned 11-stop `colour.ramp`) | `palette/brand/*` — generated in OKLCH, 600–950 solved for white text |
| `neutral` | `cool` · `warm` | `palette/neutral/*` |
| `radius` | `sharp` · `subtle` · `default` · `rounded` | `radius/base`; every radius step is a multiple of it |
| `spacing` | `compact` ×0.875 · `default` · `relaxed` ×1.25 | the whole `space/*` ladder, each step rounded to the 2px grid |
| `type` | a sans and a mono family | `type/family/*` |

```json
{
  "name": "Vantage",
  "colour": { "base": "#7C3AED" },
  "neutral": "warm",
  "radius": "rounded",
  "spacing": "default",
  "type": { "sans": "Manrope", "mono": "JetBrains Mono" }
}
```

**Everything else is shared** — status ramps, vis colours, the type scale and
every semantic. A brand whose colour is red does not make errors green.

The one semantic a brand may change is **the ink on its emphasis surfaces**
(`fg/on/*-emphasis`): white where it passes 4.5:1, the darkest neutral where it
does not. It is measured, never chosen. In Figma it goes through internal
`_on/*/light|dark` primitives, because Semantic's modes are Light/Dark only.

## Adding a brand

```bash
cd packages/tokens
npm run brand:new -- vantage --name Vantage --base "#7C3AED" \
  --neutral warm --radius rounded --spacing default --sans Manrope --mono "JetBrains Mono"
npm run check
```

Then run **Picasso Sync** in Picasso with `dist/figma.json`. The brand appears as
a new mode of the Primitives collection. No components are copied or changed.

A font not listed in `presets.json` gets a generic fallback stack and Inter's
style names — add it to `presets.json` if its Figma style names differ
(Manrope says `SemiBold`, Inter says `Semi Bold`).

## Previewing a brand

**In Figma:** select a frame → **Layer** in the right panel → the variable-mode
button → set **Primitives** to the brand and **Semantic** to Light or Dark.
Nested frames inherit it. The *Brand modes (demo)* page shows all four
combinations side by side.

**In code:** `data-brand` on any element, with `class="dark"` independent of it.

```html
<html data-brand="vantage" class="dark">
```

## The Picasso Sync plugin

A Figma plugin in `packages/figma-sync`. It reads the `figma.json` you choose
— it has no network access and never talks to the repo — and makes the open
file match it.

**Install once** — Figma **desktop app** (the browser cannot load local
plugins): Figma menu → **Plugins → Development → Import plugin from manifest…**
→ `packages/figma-sync/manifest.json`.

**Run** — Plugins → Development → **Picasso Sync** → choose
`packages/tokens/dist/figma.json`.

| Button | Does |
|---|---|
| **Check** | Lists every difference — new, changed, extra, problems. Changes nothing. |
| **Sync** | Makes the file match. Never deletes. |
| **Sync + remove extras** | Also deletes variables and styles the repo no longer has (asks for a second click). |
| **Export** (pick a brand) | Downloads that brand as `<brand>.figma-export.json` for `npm run figma:import`. Changes nothing. |

What **Sync** does, in order:

1. Applies known renames (e.g. `_type/style/inter-*` → `sans-*`) so existing bindings survive.
2. Makes sure Primitives has one mode per brand and Semantic has Light and Dark.
3. Creates missing variables, then sets every value in every mode. **Aliases stay aliases.** Sets each variable's scope and description.
4. Sets each text style's font, size, line height, tracking and case, and binds it to the family, size and style variables.
5. Rebuilds each effect style's layers and binds every layer's colour to its `_shadow/*` or `_ring/*` variable.

What it does **not** do:

- **Edit components or layers.** They already point at the variables.
- **Bring Figma edits back on its own.** Sync is one way; the way back is Export + `npm run figma:import`.
- **Publish.** Publish Picasso as usual afterwards.

Two things to know:

- **Matching is by name.** Renaming a token creates a new variable and leaves
  the old one as an *extra*, with layers still bound to it. Planned renames go
  in the plugin's rename list.
- **Fonts come from your computer.** Run the plugin in the desktop app so it can
  use locally installed fonts.

## Bringing a Figma change back to the repo

When a change is easier to make in Figma — a semantic re-pointed, a type size
nudged, a brand's ramp tuned by eye — export it instead of re-typing it.

1. In Picasso: **Picasso Sync → Export a brand**, pick the brand, **Export**.
   You get `<brand>.figma-export.json` in Downloads.
2. In `packages/tokens`: `npm run figma:import -- ~/Downloads/<brand>.figma-export.json`
   (add `--dry-run` to only list what would change).
3. Review `git diff`, then `npm run check`.

The import compares the export with what the repo would generate for that
brand and writes each difference to the file that owns it:

| Changed in Figma | Lands in |
|---|---|
| `palette/brand/*` | the brand's `colour.ramp` (pinned; dropped if it equals the generated ramp) |
| `palette/neutral/*`, `radius/base`, `space/*` | the brand's `neutral` / `radius` / `spacing` — **must match a preset** |
| `type/family/*` | the brand's `type` |
| any other primitive | `core.json` — **shared, so every brand changes**, and it says so |
| a Semantic value | `light.json` / `dark.json` |
| a text style | `core.json` `shared.text` — line height and tracking must be existing tokens |
| an effect style's geometry | the shadow/ring composite in `light.json` and `dark.json` |
| a brand that is not in the repo yet | a new `brands/<brand>/brand.json` |

**It refuses — and writes nothing — when a change breaks the model:**

- a single radius step edited (steps are `radius/base` × multiplier — change the base)
- a neutral ramp, radius base or spacing ladder that matches no preset (add a preset first)
- `fg/on/*-emphasis` edited (it is measured by contrast — change the ramp)
- a new variable or style (decide by hand whether it is shared or per brand)

Exporting a brand nobody has touched reports *Figma matches the repo — nothing
to import*, which is also a quick way to confirm the two are in step.

## Proving parity

`npm run check` fails when:

- light and dark do not define the same tokens
- a brand's structure differs from Clarion's (a library swap or mode switch would drop bindings)
- a shared primitive differs between brands
- Clarion's hand-authored on-colours disagree with contrast measurement
- the radius multipliers in `theme.css` drift from `core.json`

Contrast tests (`packages/ui`) run for every brand.

To prove Figma and the repo are identical, `packages/figma-sync/fingerprint.cjs`
hashes every variable, text style and effect style — from `figma.json`, and
(its `FIGMA` half) from the live file. Equal hashes, equal systems.

## Where things live

| File | What |
|---|---|
| `tokens/core.json` | Primitives every brand shares; the radius ladder as multiples of `radius.base` |
| `tokens/presets.json` | The menu: radius bases, spacing multipliers and ladder, neutral ramps, fonts |
| `tokens/brands/<brand>/brand.json` | One brand's choices |
| `tokens/light.json` · `dark.json` | Semantics, shared by every brand |
| `build/brands.mjs` | Choices → primitives, on-colour measurement, Figma export |
| `dist/tokens.css` | Default brand in `:root`, every brand as `[data-brand]`, then the preset axes |
| `dist/figma.json` | Every brand, for the plugin |
| `build/figma-import.mjs` | Figma export → repo files, with the refusal rules |
| `packages/figma-sync/` | The plugin and the fingerprint |
