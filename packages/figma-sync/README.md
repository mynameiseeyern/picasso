# Picasso Sync (Figma plugin)

Applies a brand's tokens from the repo to a Figma file. **The repo is the
source of truth**; Figma follows it. There is no Tokens Studio in the loop.

## Install (once)

Figma desktop → **Plugins → Development → Import plugin from manifest…** →
choose `packages/figma-sync/manifest.json`.

## Use

1. `cd packages/tokens && npm run check` — builds CSS, writes
   `dist/figma.json` (every brand), runs the parity checks.
2. Open Picasso in the Figma desktop app → **Plugins → Development → Picasso Sync**.
3. Choose `dist/figma.json`.
4. **Check** lists every difference and changes nothing. **Sync** makes the
   file match and never deletes. **Sync + remove extras** also deletes
   variables/styles the repo no longer has.

What it writes:

| Figma | From |
|---|---|
| `Primitives` collection, one mode per brand (Clarion · Vantage · …) | `core.json` + the brand's choices (`brands/<brand>/brand.json` → `presets.json`) |
| `Semantic` collection, `Light` / `Dark` | `light.json` / `dark.json` (aliases stay aliases) |
| Text styles `shared/text/*` | typography composites in `core.json`, bound to the type variables |
| Effect styles `ring/*`, `shadow/*` | composites in `light.json`, each layer's colour bound to `_ring/*` / `_shadow/*` |

Variable scopes are set by the repo too (palette hidden from pickers, `bg/*`
fills, `fg/*` text + icons, `border/*` strokes + divider fills, …).

## Export a brand back to the repo

Pick a brand under **Export a brand** → **Export** → `<brand>.figma-export.json`
lands in Downloads. Then in `packages/tokens`:

    npm run figma:import -- ~/Downloads/<brand>.figma-export.json [--dry-run]

It writes each Figma change to the repo file that owns it and refuses (writing
nothing) when a change breaks the model — a single radius step, a ramp or ladder
that matches no preset, an edited on-colour, a brand-new variable. Review
`git diff`, then `npm run check`. Full rules:
`docs/foundations/tokens-and-brands.md`.

## What Figma cannot hold

Line height (%) and tracking (em) exist only inside the text styles, because
Figma variables cannot express either. Everything else is a variable.

## Verify parity without the plugin

`node fingerprint.cjs ../tokens/dist/brands/<brand>/figma.json` prints one hash
per section; the `FIGMA` half of the same file computes the hashes from a live
file. Equal hashes = identical.

## Brands are modes

Primitives has one mode per brand; Semantic has Light and Dark. Set a frame's
Primitives mode to pick the brand and its Semantic mode to pick light/dark —
the two are independent. The one per-brand semantic, `fg/on/*-emphasis`, goes
through internal `_on/*/light|dark` primitives so each brand keeps its own
measured ink. `dist/brands/<brand>/figma.json` still exists for a single brand.

## Adding a brand

`npm run brand:new -- <id> --base "#RRGGBB" …` (see `packages/tokens`),
`npm run check`, then Sync `dist/figma.json` in Picasso — the brand appears as
a new Primitives mode.
