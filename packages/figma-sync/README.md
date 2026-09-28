# Picasso Sync (Figma plugin)

Applies a brand's tokens from the repo to a Figma file. **The repo is the
source of truth**; Figma follows it. There is no Tokens Studio in the loop.

## Install (once)

Figma desktop → **Plugins → Development → Import plugin from manifest…** →
choose `packages/figma-sync/manifest.json`.

## Use

1. `cd packages/tokens && npm run check` — builds CSS, writes
   `dist/brands/<brand>/figma.json`, runs the parity checks.
2. Open the brand's token file in Figma → **Plugins → Development → Picasso Sync**.
3. Choose `dist/brands/<brand>/figma.json`.
4. **Check** lists every difference and changes nothing. **Sync** makes the
   file match and never deletes. **Sync + remove extras** also deletes
   variables/styles the repo no longer has.

What it writes:

| Figma | From |
|---|---|
| `Primitives` collection, one mode named after the brand | `core.json` + the brand's choices (`brands/<brand>/brand.json` → `presets.json`) |
| `Semantic` collection, `Light` / `Dark` | `light.json` / `dark.json` (aliases stay aliases) |
| Text styles `shared/text/*` | typography composites in `core.json`, bound to the type variables |
| Effect styles `ring/*`, `shadow/*` | composites in `light.json`, each layer's colour bound to `_ring/*` / `_shadow/*` |

Variable scopes are set by the repo too (palette hidden from pickers, `bg/*`
fills, `fg/*` text + icons, `border/*` strokes + divider fills, …).

## What Figma cannot hold

Line height (%) and tracking (em) exist only inside the text styles, because
Figma variables cannot express either. Everything else is a variable.

## Verify parity without the plugin

`node fingerprint.cjs ../tokens/dist/brands/<brand>/figma.json` prints one hash
per section; the `FIGMA` half of the same file computes the hashes from a live
file. Equal hashes = identical.

## Adding a brand

`npm run brand:new -- <id> --base "#RRGGBB" …` (see `packages/tokens`), then
duplicate the Clarion token file in Figma, run Sync with the new
`figma.json`, publish, and swap libraries where the brand should apply.
