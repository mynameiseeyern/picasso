# Changelog

Picasso versions Figma, `@ir/tokens` and `@ir/ui` together. See
[docs/releases](docs/releases/) for what each category means.

## Unreleased

### ⚠️ Changed (visual)

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
- **Storybook never imported `themes.css`**, so `--radius` was undefined, every
  corner fell back to 0 and all five theme axes were inert.
- **The radius primitives were shadowed.** `primitives.json` carried Tailwind's
  ladder while `theme.css` derived shadcn's under the same `--radius-*` names.
  Nothing referenced the primitives, so nothing caught it.
- **Radius variables in Figma** are now scoped to `CORNER_RADIUS` instead of
  `ALL_SCOPES`, so a designer setting a corner is no longer offered every font
  size and breakpoint.
