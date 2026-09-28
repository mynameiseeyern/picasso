# Changelog

Picasso versions Figma, `@ir/tokens` and `@ir/ui` together. See
[docs/releases](docs/releases/) for what each category means.

## Unreleased

### ⚠️ Changed (visual)

- **`data-spacing="comfortable"` is now `relaxed`**, and scales the whole
  ladder ×1.25 instead of moving the base to 6px.
- **Tokens Studio removed.** `$themes.json` / `$metadata.json` are gone and
  `primitives.json` is now `core.json` + `presets.json` + `brands/*/brand.json`.
- **Kbd radius is `radius/sm` (6px)**, down from `radius/lg` (10px), which read
  as a pill at 20px tall. **Figma impact** — already applied to all five
  `Background` variants and the doc-page overrides.
- **The radius ladder moved from Tailwind's to shadcn's.** `sm` 4→6, `md` 6→8,
  `lg` 8→10, `xl` 12→14. `xs`, `2xl`, `3xl` and `4xl` are unchanged. Radius now
  derives from a single `--radius` knob, which is what makes it themeable.
  **Figma impact** — the workhorse 8px corner kept its value and was renamed
  `radius/md`, so buttons, inputs and tables do not move. Nodes on the old
  `radius/sm` (4px) grow to 6px, and nodes on `radius/xl` (12px) grow to 14px.
- **Headings are Semi Bold at every step.** `heading/xl` through `xs` move from
  Medium 500 to Semi Bold 600. Three weight tiers now separate the roles:
  Regular body, Medium label, Semi Bold heading.
  **Figma impact** — already applied to the Figma text styles; this brings the
  repo into line. Roughly 1,029 heading nodes reflow by a few pixels.
- **`label/md` line height** 100% → 135%, and **`metric/sm`** 135% → 100%. Both
  were already changed in Figma; the repo now matches.
- **Ghost is transparent at rest.** It previously carried a resting fill, which
  read as Outline and collapsed the hierarchy between a primary and a tertiary
  action.
- **Link has no box** — no fill, no border, no radius, and no underline until
  hover.
- **A loading button keeps its variant fill.** It previously rendered as
  disabled, conflating two states Figma keeps separate.

### Added

- **Brands are choices, not values.** `tokens/brands/<brand>/brand.json` picks a
  base colour, `neutral` (cool/warm), `radius` (sharp/subtle/default/rounded),
  `spacing` (compact/default/relaxed) and `type` (sans + mono) from
  `tokens/presets.json`. The build generates that brand's primitives, its
  `[data-brand]` CSS block, any `fg/on/*` that contrast measurement flips, and
  `dist/brands/<brand>/figma.json`. `npm run brand:new` creates one.
- **Spacing presets** — compact ×0.875 and relaxed ×1.25 on the whole ladder,
  each step rounded to the 2px grid. `theme.css` now maps every step to a
  named Tailwind key (`p-4` → `--space-4`) so a non-linear ladder survives.
- **Figma sync without Tokens Studio.** `packages/figma-sync` is a Figma plugin
  that applies `figma.json` (Check / Sync / Sync + remove extras), and
  `fingerprint.cjs` proves parity by hash.
- **Parity checks** (`npm run check`): light/dark define the same tokens; every
  brand has the same structure as Clarion; shared primitives match; Clarion's
  authored on-colours agree with measurement. Contrast tests run per brand.
- **Widget shadows** (`shadow/widget/panel|notification|screen|smooth`) — were
  Figma-only.
- **Kbd and KbdGroup** in `@ir/ui`, built to the Figma component (five
  `background` options).
- **Brand folders.** `tokens/primitives.json` is split into `tokens/core.json`
  (shared) and `tokens/brands/<brand>/primitives.json` (per brand: brand ramp,
  font families, and `radius.base`). The build emits the default brand into
  `:root` and every brand as a `[data-brand="…"]` block. Token Studio sets and
  themes are updated to match; add a brand by copying `brands/clarion/`.

### Fixed

- **Figma now matches the repo.** Clarion brand ramp (all 11 stops, e.g.
  `brand/600` #0079AD → #007FAB), `vis/indigo/500·600`, six missing
  `vis/amber` and `vis/lime` stops, dark `bg/scrim` alpha. Variables are scoped
  (palette hidden from pickers). `type/tracking/*` removed from Figma (it lives
  in the text styles). **Outstanding:** `metric/xl·lg·md` stay Medium in Figma
  until JetBrains Mono SemiBold is installed — then run Sync.
- **Shadows and rings are structured like Figma's**: one colour token per layer
  per mode (`_shadow/*`, `_ring/*`), geometry in the composite. Same CSS
  output; rings now follow the brand at runtime.
- **The radius ladder was defined twice in CSS.** `tokens.css` still emitted
  static `--radius-sm` etc. alongside `theme.css`'s `calc()` ladder. Now only
  `--radius` is emitted; the ladder in `core.json` is written as formulas on
  `radius.base` (Token Studio resolves them for Figma), and the build fails if
  those multipliers ever disagree with `theme.css`.

### Added

- **Button**, the first component: seven variants, four text sizes, four icon
  sizes, `loading` and `asChild`.
- **A `neutral` Button variant**, matching the Figma component.
- **Five theme axes** — radius, brand, neutral ramp, typography and spacing —
  as `data-*` attributes on `<html>`, composing with dark mode by cascade.
- **Storybook theme toolbar** driving all five axes, so every story previews
  every theme.
- **Documentation** — foundations, content, contributing and releases.

### Fixed

- **A loading button's spinner and label now take the variant's own colour in
  Figma.** Every Loading variant had its spinner stroke bound to
  `fg/neutral/emphasis` and its label to `fg/disabled`, so a primary button
  spun dark-on-blue. Both now use the same token as the variant's Default
  label (`fg/on/primary-emphasis`, `fg/on/neutral-emphasis`,
  `fg/on/danger-subtle`, `fg/neutral/emphasis`, `fg/link/default`) — matching
  the code, where the spinner inherits `currentColor`.
  **Figma impact** — 49 Loading variants; instances update on accept, nothing
  moves.
- **Destructive icon-only buttons use the label's token.** The icon sizes were
  bound to `fg/danger/emphasis` while the text sizes' label used
  `fg/on/danger-subtle`; the icon now uses the on-colour, so text and icon
  buttons of the same variant read as one.
  **Figma impact** — 16 Destructive icon variants, a shade darker.
- **Storybook never imported `themes.css`**, so `--radius` was undefined, every
  corner fell back to 0 and all five theme axes were inert.
- **The radius primitives were shadowed.** `primitives.json` carried Tailwind's
  ladder while `theme.css` derived shadcn's under the same `--radius-*` names.
  Nothing referenced the primitives, so nothing caught it.
- **Radius variables in Figma** are now scoped to `CORNER_RADIUS` instead of
  `ALL_SCOPES`, so a designer setting a corner is no longer offered every font
  size and breakpoint.
