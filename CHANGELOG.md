# Changelog

Picasso versions Figma, `@ir/tokens` and `@ir/ui` together. See
[docs/releases](docs/releases/) for what each category means.

## Unreleased

_Nothing yet._

## 0.1.0 — 7 October 2026

The first published version. Everything below shipped before there was anything
to ship against, so the ⚠️ Breaking entries describe changes made against
unreleased `main` rather than against a version anyone is running — they are
kept because they are the history of why the API reads the way it does.

**Figma impact** — the library and the packages share this version. The Figma
library's publish description should carry `0.1.0`, and a sync is outstanding
for the display font, `motion/easing/settle` and the renamed phone canvases.

`@ir/ui` ships TypeScript source rather than a build, so a consumer needs a
bundler that compiles TS and JSX and scans `node_modules/@ir/ui/src` for
Tailwind classes.


### ⚠️ Breaking

- **`screen/mobile/*` is `min` / `small` / `base` / `max`, not `sm` / `md` /
  `lg` / `xl`.** The group's own description sets the rule — `lg:` means the
  same thing in a token file, a Figma page name and a class name — and the
  group broke it, because `screen/mobile/lg` was 390 while `screen/desktop/lg`
  is 1024. Below `md` (768) there is one layout, so a phone has no breakpoints
  to name, only widths to draw at; the new names say where each sits in the
  range: 320 the floor, 375 the small one, 390 the canvas to design at, 428 the
  ceiling. **Code impact** — none; nothing in the repo read these tokens.
  **Figma impact** — the four renames are in the sync plugin's
  `PICASSO_RENAMES`, which runs before matching, so a frame bound to one keeps
  its binding. Without that the sync would have created four variables and
  orphaned four. The group description also referred to a `screen/canvas/*`
  group that has never existed; it now describes the two that do. Documented in
  the breakpoints story, which covered `screen/desktop/*` and had never
  mentioned the canvases.

- **The phone floor is 360, not 320.** Writing the canvases down showed that
  nothing had ever been checked at the floor: every `Narrow` story is 328 — a
  360 phone minus its gutters — and 360 was not on the ladder at all, while 320
  (iPhone SE 1 era) sat there as a floor no story and no overflow sweep ever
  measured. `screen/mobile/min` is 360, which is both the commonest Android
  viewport and what the sweep already measures, so the ladder and the stories
  now describe the same phone. 375 stays as the iOS case to check rather than a
  second floor. **Code impact** — none; nothing reads these tokens, and no
  story width changes. **Figma impact** — a sync updates one FLOAT.

- **`SidebarHeader`'s brand variant is `brand`, not `plate`.** Nobody outside
  this repo knew what a "plate" was — including the design system's own owner,
  which is the test a name has to pass. **Code impact** — replace
  `variant="plate"` with `variant="brand"`; TypeScript refuses the old value.
  Nothing renders differently. The prose follows the same rule: the block is
  "the brand", the thing it sits in is "the header". **Figma impact** — the
  phone nav's `Brand plate · 80` frame is renamed with it.

- **Drawer's `side` is `start` / `end`, not `left` / `right`.** `end` is the
  default and is where `right` was in a left-to-right page; in Arabic, Hebrew
  and Persian it is the left, opposite the sidebar. **Code impact** — replace
  `side="right"` with `side="end"` and `side="left"` with `side="start"`;
  TypeScript refuses the old values. `data-side` and the motion utilities
  (`animate-drawer-in-end`, `-out-end`, `-in-start`, `-out-start`) are renamed
  to match. **Figma impact** — applied the same day: the Drawer's variant
  axis `Type` = Right | Left | Expanded is now `Side` = End | Start |
  Expanded. The five variants were renamed in place, so every component key
  and every instance carried across; a design that overrides the axis shows
  the new names on update. The page's own copy and the set's description say
  the same. Drawer / Header keeps its own `Type` axis (Record | Title).

### Added

- **A spring — `motion/easing/settle` — and the bottom sheet drags.** The
  handle and the header follow the finger downward. Released past a quarter of
  the panel (floor 64px), or thrown faster than 0.5px/ms having travelled at
  least 48, the sheet goes; short of that it settles back. Dragging up is
  resisted rather than refused: the panel gives 24px and stops. `drag={false}`
  opts out. **Code impact** — none required; every existing sheet gets it.
  **Figma impact** — a sync adds one hidden `motion/easing/settle` STRING
  variable; Figma draws no motion.

  The token is `cubic-bezier(0.3, 1.35, 0.5, 1)` — about 4% past the target at
  58% of the duration, measured at 3.3px on an 80px drag, with six frames past
  the resting line. It is deliberately a curve and **not** stiffness/damping: a
  physics spring is velocity-aware and only JS can run one, while every other
  motion token here is something CSS takes straight. A gentler overshoot was
  tried first and rejected — at 2% it is sub-pixel at the distances a thumb
  actually drags, which would have left the curve indistinguishable from
  `easing/enter` and not worth having. Use it with `duration/base`; there is no
  settle duration.

  Two things worth knowing about the implementation. The offset rides on the
  `translate` property, not `transform`: they compose, so a dragged panel keeps
  its offset while `animate-sheet-out` animates `transform`, and the sheet
  leaves from where the finger left it instead of jumping back to the edge
  first. `transition-settle` therefore transitions `translate` — transitioning
  `transform` animates nothing at all, which is how the first version shipped
  past a passing test suite and was caught only by measuring the rendered
  result. And the panel follows the finger under `prefers-reduced-motion` too,
  because direct manipulation is not animation; only the release is instant.

  The guidance pair that said the handle is decoration named the exact blocker
  this removes — “a drag needs motion that follows the finger, which the motion
  tokens (fixed durations) do not describe” — and is rewritten as
  `drag-is-not-the-exit`: the close button is still always drawn, the handle is
  still `aria-hidden`, and the drag is an addition to Escape, the scrim and the
  close button rather than a replacement for any of them.

- **A display font role, and one step that uses it: `text-wordmark`.** A brand
  can now name a third family in its `brand.json` — `type.display` — alongside
  `sans` and `mono`. Clarion names Oswald; the wordmark in the rail's brand
  header, and the single letter it crops to on the 48 rail, are set in it:
  20px, semibold, uppercase, tracked out, because a condensed display face set
  in caps closes up at UI sizes. The role is optional and a brand that names
  none inherits its sans, so `type/family/display` always resolves and no
  component branches on whether a brand has one — Vantage names none and its
  wordmark is Manrope. **Code impact** — none required; `SidebarBrand` picks
  the new step up on its own. `font-display` is available as a Tailwind
  utility, and `npm run brand:new` takes an optional `--display`. The
  wordmark's `children` stay sentence case in code: the step carries the
  uppercase. **Figma impact** — a sync adds a `type/family/display` variable
  per brand, a `shared/text/wordmark` text style and the
  `_type/style/display-semibold` helper it binds. The wordmark text in the
  `Sidebar / SidebarHeader` set is hand-styled Oswald today and should be
  rebound to the new text style; the drawn result does not change.
  Unlike sans and mono, the display family does **not** swap under
  `data-type="system"` — a product's display face is its mark, not a UI
  preference, so it stays put when the rest goes native.

- **A theme builder at `/theming`.** Paste or drop a `brand.json` or a
  `tokens.css`, or start from a colour, and the five axes — brand, neutral
  ramp, radius, typography, spacing — are editable in place beside a preview
  of real Picasso components, not swatches. The eleven-stop brand ramp is
  editable stop by stop; editing one makes the ramp the brand's own rather
  than a generated one. What comes back out is the same `brand.json` the
  importer reads, so a value typed here and the same value imported from a
  file cannot be understood two different ways. **Figma impact** — none; it
  reads and writes the repo's own format.
- **Four more typefaces in the builder, self-hosted:** Figtree, DM Sans,
  Public Sans and IBM Plex Mono, through `@fontsource`. Self-hosted rather
  than linked, so a preview is the real face on every machine and the page
  does not depend on a font CDN.
- **`KpiRow` and `ChartGrid`** — the two layouts every console page was
  rebuilding by hand. `KpiRow` is the tile row; `ChartGrid` takes `max={2}`
  or `max={3}` and steps down through its own container's width, not the
  viewport's, so a grid inside a narrowed panel folds when the panel does.
- **`docs/foundations/responsive.md`** — the two contracts (the shell answers
  to the viewport, everything else answers to its container) and six baseline
  rules for a phone. Ten components that pinned their demo width from 384 to
  960 now carry a **Narrow** story at 328, a 360 viewport minus its gutters,
  so the overflow sweep has something to measure.

- **Right-to-left: Arabic, Hebrew and Persian.** `docs/foundations/rtl.md` is
  the whole of it.
  - **`DirectionProvider` and `useDirection`** — Radix reads direction from a
    provider, not the DOM; without it the layout mirrors and the arrow keys do
    not. Storybook's toolbar has a **Direction** control that sets both.
  - **Scales mirror.** Progress and File upload fill from the inline start;
    Threshold slider draws, measures the pointer and reads the arrow keys from
    the inline start, as Radix's Slider does.
  - **Switch's knob travels to the inline end.** In RTL it used to slide out
    of its own track.
  - **Toast is swiped away toward the edge it came from** — `ToastProvider`
    sets Radix's `swipeDirection` from the direction.
  - **Calendar** hands the direction to its grid.
  - **Icons mirror**: Breadcrumb's separator, Dropdown menu's submenu chevron
    and the Sidebar trigger now carry `rtl-mirror`. The Sidebar brand scrim
    fades from the inline start.
  - **`ltr-island`** — a utility for technical text, which reads left to right
    in every locale. On KPI tile's figure, Progress's value, Table's numeric
    cells, Number input, OTP, Input group text and Threshold slider's
    readings. A numeric column is right-aligned in every locale.
  - **`--direction-sign`** (1 or -1) for keyframes that travel sideways.
  - **Letter-spacing is zero under an Arabic-script `lang`.**
  - A test that fails when a directional icon is added without `rtl-mirror`.
- **Noto Sans, Noto Sans Arabic and Noto Sans Hebrew.** Every font stack, sans
  and mono, carries the Arabic and Hebrew faces after the family itself, so
  those scripts look the same on every OS. Noto Sans is a selectable sans in
  the theme builder. Code only — nothing changes in Figma.

- **`SegmentedControl`** — a choice that stays selected, as one control: a
  muted track with the current option on a raised thumb. `SegmentedControl`
  and `SegmentedControlItem`, `size="sm" | "md"` (32 / 36, Button's and
  Input's heights) and `fullWidth`. It is a radio group — one option always
  selected, arrow keys move it — so it is not a ButtonGroup (actions, nothing
  stays pressed) and not Tabs (panels). The Bottom sheet's Sort story now
  uses it for Ascending / Descending, where it had borrowed a ButtonGroup
  with a Secondary button standing in for "selected". **Figma impact** — new
  `Segmented control` set (`Size` × `Full width`) and its `_Segment` part, on a
  new page under Forms; the mobile Sort sheet uses it.

- **Motion tokens, and the first three things that use them.**
  `motion/duration/fast` 150ms, `base` 200ms, `slow` 300ms, and
  `motion/easing/enter` and `exit`. **Dialog** fades and scales in, **Drawer**
  slides in from its edge (the expanded one scales like a Dialog), their scrim
  fades, and **Accordion** rows open to their measured height. Arriving takes
  the longer step and decelerates; leaving takes the shorter and accelerates.
  All of it sits under `motion-safe:`, so reduced motion gets no animation.
  Components ask for a named animation (`animate-dialog-in`, …) and never
  state a duration or curve. **Figma impact** — five `motion/*`
  variables in Primitives, hidden from pickers; nothing moves on canvas.

- **Motion for everything else that opens, closes or changes size.**
  **Popover**, **Dropdown menu** (and its submenus), **Select**'s menu and
  **Tooltip** fade and scale from the corner nearest their trigger
  (`animate-popover-in` · `-out`, fast both ways — they are small and open
  under the pointer, so the base step reads as lag). A Tooltip only animates
  its delayed open; the instant open Radix gives the next trigger along a row
  stays instant. **Toast** slides in from the edge its viewport sits on (the
  right; the left under `dir="rtl"`) and leaves the same way
  (`animate-toast-in` · `-out`), and now follows a swipe: it tracks the
  finger, carries on from where it is let go, and settles back if the swipe
  is abandoned. Radix's `swipeDirection` is physical, so an RTL app passes
  `swipeDirection="left"` to `ToastProvider`. **Bottom sheet** rises from the bottom edge and drops back
  (`animate-sheet-in` · `-out`); Toast and Bottom sheet take the Drawer's
  timing, slow in and base out. The **Sidebar**'s rail changes width over
  `motion/duration/base` (`transition-rail`). All of it sits under
  `motion-safe:`; under reduced motion everything is instant, and a Toast
  still follows the finger because that is not animation. No new tokens.
  **Figma impact** — none; nothing moves on canvas.

- **`npm run format` and `npm run format:check`**, scoped to `packages/ui/src`,
  with Prettier declared as a dev dependency. All of `packages/ui/src` is now
  formatted, so a format-on-save no longer drags unrelated lines into a diff.
  **Figma impact** — none.
- **An `Invalid` story for Select and Password input, and a test each for
  Select, Number input and Password input.** The treatment was already there
  (`aria-invalid` turns the border to `border/input/invalid`); nothing showed
  it or guarded it. **Figma impact** — none; Figma already draws all three.

- **`Illustration` — product spot illustrations that answer the pointer.**
  Three drawings, redrawn from the Spotkit spots on Picasso semantics with
  Lucide glyphs: `issue-alerts`, `fleet-health`, `call-readiness`. Each
  carries one mechanic — **lift** (the gap follows the pointer), **magnify**
  (each shape swells by its distance from the pointer, on a spring) and
  **sequence** (steps light one at a time while hovered). `interactive={false}`
  keeps a picture still for use inside the product. **Not in Figma yet** —
  built in code first.
- **Illustration motion in `@ir/tokens/theme.css`:** `transition-illustration`,
  `animate-illustration-check`, `animate-illustration-flow` and
  `illustration-float`. Motion is now three things — colour, the Loader and
  illustrations — and `docs/foundations/motion.md` says where the third stops:
  outside the console, and never as a duration scale for controls.

### Fixed

- **Every `text-*` step now follows the brand, the density and the type
  theme. None of them did.** `[data-brand]`, `[data-type="compact"]` and
  `[data-type="system"]` each redeclare the `--type-*` primitives, and not one
  of those redeclarations reached a single typography step: `font-sans`
  tracked the brand while `text-body-md` — which nearly every component uses
  — stayed Inter at the default ramp, so switching brand changed the colours
  and left the type alone, the compact density changed nothing, and the system
  type theme was inert. Two causes, both in the token build. A typography
  token's `$value` is an object, so `value/ir/css-var-references` (which
  filters for strings) skipped it and the format emitted the default brand's
  resolved literals. Emitting the reference instead is not enough either: a
  `var()` inside a custom property is substituted where the property is
  *declared*, so `--text-body-md-font-family: var(--type-family-sans)` on
  `:root` computes to Inter there and inherits as Inter. The indirection now
  sits in the utility — `font-family: var(--text-body-md-font-family,
  var(--type-family-sans))` — which resolves at the element. The step's own
  variable is left undeclared and is the override slot: unset it falls back to
  the primitive; set on any scope it wins. **Code impact** — none, and nothing
  changes at the default brand and density, where the values were already
  correct. The `--text-*-font-family` / `-font-size` / `-font-weight` /
  `-line-height` / `-letter-spacing` declarations no longer appear in
  `:root`; nothing in the repo read them. The Arabic and Hebrew tracking
  kill-switch still collapses as it did. **Figma impact** — none; Figma binds
  each text style to the variables directly and was never affected.

- **The theme builder previewed a new brand's wordmark in Clarion's Oswald.**
  It writes the preview's custom properties by hand rather than through
  `brandLayer()`, and had no `--type-family-display`, so the wordmark kept
  the default brand's display face while every other step followed the chosen
  family. It now sets the display family to the chosen sans, which is what the
  build generates for a `brand.json` that names no display face — the preview
  and the export agree again. Combined with the fix above, changing the font
  in the builder is visible for the first time.

- **Every touch target meets the floor: 202 were under it, now none are.**
  WCAG 2.2 AA (2.5.8) sets 24×24, with a spacing exception — a 24px circle on
  the target must not reach another target's. Where a control is smaller than
  the row it sits in, the row is the target; where it stands alone, an
  expanded hit area reaches out from it. Those areas are pseudo-elements, so
  they are invisible to `getBoundingClientRect`; they were verified by walking
  `elementFromPoint` outward from each centre. Slider and Threshold slider
  needed their own insets — a negative inset resolves against the padding box,
  so a 3px border on a 16px thumb leaves only 10px to grow from, and the first
  attempt produced an 18×38 target.
- **`FieldOption` is one target.** The control and its text now sit inside one
  `<label>`, on a subgrid so a description aligns under the text rather than
  under the box, with the description outside the label and wired through
  `aria-describedby` — reading it aloud on focus was repeating the option.
  `min-h-6`, and `min-h-11` where the pointer is coarse.
- **The 360px overflows.** Five candidates; four were artifacts of how they
  were measured — `getBoundingClientRect` reports a rotated box as wide, and a
  scrolling table is not a page overflow. The fifth was real.
- **`apps/site` is linted under the design system's own rules.** The theme
  builder and the landing page are the shop window for Picasso and were held
  to nothing. 141 problems: 98 were the linter reading tokens from Storybook's
  stylesheet instead of the site's, and the remaining 43 were real — raw
  palette colours, off-scale values, inline styles and 13 physical properties.
- **A lint rule for physical properties.** `@shadcn/lint` has no equivalent,
  and the thing it guards — a component that reads correctly in both
  directions — is invisible in every left-to-right screenshot. It caught the
  drift that had accumulated since the RTL pass.

### ⚠️ Changed (Figma structure)

- **Figma's Button is the height code has always been: 28 / 32 / 36 / 40**
  (xs to lg, and the four icon sizes), up from 24 / 28 / 32 / 36. A `md`
  button is now 36, the height of an Input. Heights are bound to `space/7`
  to `space/10`. Every Button instance in the file follows; the table's
  action column widened from 60 to 64 to hold the 32px icon button, and
  nothing else overflowed. **Code impact** — none. In a consuming file, every
  Button grows 4px on update; a layout drawn tight around one may need a nudge.
  Padding (10 / 12 / 16 / 24), gap (6 / 6 / 8 / 8) and icon size (14 at xs)
  were aligned to code the same day, so a Button is also wider: `md` goes from
  62 to 74 with the same label. Code trims padding when a button has an icon;
  Figma cannot do that from a toggle, so those are 4–8px wider in Figma.

- **Figma's Input button has no `Type` axis.** 24 variants become 12
  (`State` × `Size`). Button and Select trigger differed only by an icon and
  a count badge, which is presence, not paint: the icon is now a swappable
  `Icon` and the badge is the `Show Badge number` toggle, default off. The
  text is bound to `Value` in every variant (the Select trigger's was not).
  `Leading`, `Trailing` and the two addon properties are gone; nothing used
  them. All 21 instances were migrated and show what they showed before.
  **Code impact** — none; `InputButton` already took `icon` and `adornment`.
  In a consuming file, an instance that was `Type=Button` will need its icon
  and badge set by hand after the library update.

- **Figma's Button group keeps its first and last buttons, and toggles the
  four between them.** `Button 1` and `Button 6` are no longer properties;
  `Button 2`–`Button 5` remain. The ends carry `radius/md` themselves (they
  were bound to `radius/lg` under a frame clipped at `radius/md`), every
  button carries its own border, and the frame has no border and does not
  clip — so a group of any size has rounded ends and a focus ring is no
  longer cut off. Secondary groups gain the dividers they were missing. All
  25 instances in the file were migrated and show the same buttons as before.
  **Code impact** — none; this is the shape the code already had. In a
  consuming file, an instance that hid `Button 6` will show a default last
  button after the library update: turn off the highest middle button instead
  and put its content on the last one.

- **Figma's Input is six sets, not one set with a `Type` axis.** `Input` (14
  variants, `State` × `Size`), `Password input` (14, with a `Shown` axis),
  `Number input` (12), `Input button` (24, `Type` = Button | Select trigger),
  `Tags input` (12) and `File upload` (12) — one per code component. The
  variants were moved, not rebuilt, so every component key and every existing
  instance carried across; an instance that was `Type=Password` is now an
  instance of `Password input`. **Code impact** — none to behaviour.
  `guidance.json` for the five siblings points at the new sets. To change an
  Input into a Password input in a design, swap the instance rather than
  switching `Type`.

### ⚠️ Changed (visual)

- **The phone sidebar is a drawer, not a full screen.** Below `md` the trigger
  opens the same tree over the page from the inline start, with a strip of
  scrim left at the end edge — tapping it leaves, which a full-screen nav gave
  no way to do but hunt for the close. Picking an item closes it. The close
  sits on the brand and takes its ink from it, so it stays legible on brand
  artwork and on a plain header. **Code impact** — none;
  `mobile="fullscreen"` still works and is documented as the old name for the
  same thing. **Figma impact** — `Sidebar / Phone nav (full screen)` is
  `Sidebar / Phone nav (drawer)` and the frame draws a 334 panel beside a 56
  scrim strip on a 390 phone; the header's button is `Close navigation`.

- **Dark `bg/disabled` is neutral-700 and dark `fg/disabled` is neutral-500.**
  The fill was neutral-800, the card colour, so a disabled Button or Chip on
  a dark card was a label with no box. It now shows on the page (1.71) and on
  a card (1.42), and the label on it reads at 2.2:1, the softness light
  already had. Disabled text on a dark surface is more legible than before,
  and is now the same grey as `fg/neutral/subtle` in dark. Light is unchanged.
  **Figma impact** — the two Semantic variables' Dark values, already applied.

- **Disabled and on is grey, on Switch and Radio.** A disabled Switch that is
  on, and a disabled Radio that is selected, were still full primary and read
  as live. They now take the pairing a disabled checked Checkbox has:
  `bg/input/disabled`, `border/input/disabled`, and the mark — the Switch's
  knob, the Radio's dot — in `fg/disabled`. A disabled unselected Radio's ring
  also moves to `border/input/disabled`, so all three controls agree.
  **Checkbox's own disabled-checked fill moves from `bg/disabled` to
  `bg/input/disabled`**: identical in light, but in dark `bg/disabled` is the
  card colour, so on a card the box vanished and only the tick showed.
  **Figma impact** — the Switch, Radio and Checkbox `State=Disabled` variants
  are redrawn to match.

- **Avatar's offline dot is `fg/neutral/subtle`.** It was resting on
  `bg/neutral/subtle-pressed` — a state token at rest, and neutral-200 in
  light, so the dot nearly vanished against its white ring. Now neutral-500
  in both themes. **Figma impact** — none; this is what Figma's Status icon
  already draws.

- **Resting neutral fills take `bg/neutral/muted`, so they show on any
  surface.** Secondary **Button** (with `muted-hovered` / `-pressed`), the
  subtle neutral **Badge**, **Avatar**'s fallback, **Kbd**, the active **Tab**,
  read-only **Input** and **Textarea**, the **Table** header, **Select**'s
  count, **File upload**'s icon tile and **Stepper**'s current number. They
  were on `subtle`, which matches the page in light and the card in dark, so
  each vanished on one surface per theme. Now 1.08 on the page and 1.12 on a
  card in light (was 1.00 / 1.05), 1.71 and 1.42 in dark (was 1.21 / 1.00).
  An active Tab now equals a hovered Tab, and a Table header equals a hovered
  row. Stepper's incomplete number stays on `subtle` — its `fg/neutral/subtle`
  text would fall to 2.2:1 on muted in dark. Secondary's pressed text is
  4.47:1 in dark. **Figma impact** — not applied yet; Figma still binds these
  to `bg/neutral/subtle`.

- **The neutral ramp runs subtle → muted → emphasis.** `bg/neutral` now has the
  shape of every status ramp, each step one palette step past the last.
  Light: `muted` is neutral-100 (was white), hover 200, pressed 300; `subtle`
  is unchanged at 50 / 100 / 200. Dark: `subtle` is 800 / 700 / 600 (was
  950 / 900 / 800) and `muted` is 700 / 600 / 500 (was 900 / 800 / 700).
  `emphasis` is unchanged.
  **Light does not move**: the fills that rested on the old white `muted` —
  outline **Button**, selected **Chip**, outline **Badge**, the **Avatar** add
  button, **Stepper**'s empty indicator — now rest on `bg/card`, and their hover
  and pressed (with ghost Button's and **Calendar**'s) take
  `bg/neutral/subtle-hovered` / `-pressed`, the same values as before.
  **Dark does move**, on purpose: every hover and pressed now shows on both the
  page and a card (nine did not — ghost and outline hover on a card, menu focus
  and row hover on the page), and resting `subtle` fills are the card colour
  rather than recessed below the page, so on a dark card they show by their
  border only, as they already do on the page in light.
  **File upload**'s progress track takes `bg/layer/emphasis` like Progress; it
  was resting on `subtle-pressed`.
  Supersedes the 1 Oct light `muted-hovered` / `muted-pressed` entry below.
  **Figma impact** — the six Semantic variables move in Light and Dark, and
  fills bound to the old `muted` trio are rebound so light keeps its pixels.

- **The 1440 breakpoint is `wide-laptop`, not `laptop`.** 1024 and 1280 are
  laptop widths too, so the plain name did not say which it meant. Token
  `screen/desktop/wide-laptop`, `--breakpoint-wide-laptop`, class
  `wide-laptop:`. Same value, same place in the cascade (between `xl` and
  `2xl`, measured). Nothing in `@ir/ui` used `laptop:`, so no component
  changes. **Figma impact** — the variable and the App shell `Screen` label
  are renamed to match.

- **`bg/layer/*` is the neutral ramp for fills that must be seen**; resting
  `bg/neutral/subtle` and `muted` are fills that match the page and the card.
  Four components move onto it: **Progress** and **Slider** tracks and
  **Meter**'s empty segments take `bg/layer/emphasis`; **Skeleton** takes
  `bg/layer/muted`. Progress no longer uses a `-pressed` token at rest, Slider's
  track no longer vanishes on a card in dark, and Meter stops using a border
  token as a fill. The rule is in `docs/foundations/colour.md`.
  **Figma impact** — the same four are rebound to match.

- **Light `bg/neutral/muted-hovered` is neutral-100 and `muted-pressed` is
  neutral-200**, each one step darker. Hover was neutral-50 — the value of
  `bg/app` — so a Chip, a ghost or outline Button and an Avatar showed no hover
  on the page. Light `muted` and `subtle` now share a ladder from hover onward;
  dark is unchanged and keeps them a step apart. Skeleton, which rests on
  `muted-pressed`, is a step darker in light and now reads on the sidebar too.
  **Figma impact** — the two Semantic variables' Light values, already applied.
- **The sidebar has its own hover and pressed.** `bg/sidebar-hovered` (200
  light, 900 dark) and `bg/sidebar-pressed` (300 light, 800 dark), reached
  through `bg-surface-sidebar-hovered` / `-pressed`. The rail is neutral-100 in
  light, which is what `bg/neutral/subtle-hovered` resolves to, so hover on a
  menu button, sub-item, group action or the trigger painted the rail's own
  colour. Sidebar items also gain a pressed state they did not have. Dark hover
  is the same value as before. **Figma impact** — two new Semantic variables,
  and the Sidebar menu page's Hover variants rebound to them.

- **Z-index is a token.** Six rungs on GovTech's scale — `layer/base` 0,
  `raised` 100, `overlay` 800, `modal` 1600, `floating` 2000, `notification`
  3200 — reached through `z-raised` … `z-notification`. Floating sits above
  modal because Radix portals menus to `document.body`, where one opened
  inside a dialog has no parent to be scoped by. The scrim moves from `z-50`
  to 800, so it no longer shares a value with the dialog it dims and the
  stacking stops depending on DOM order. **Figma impact** — `layer/*` is six
  number variables in Primitives, hidden from every picker because Figma has
  no z-index to bind them to; they are there to be read. Nothing moves on
  canvas.
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

- **The sidebar brand** — `<SidebarHeader variant="brand">` with
  `SidebarBrand`, the full-bleed block Clarion and Console both carry above the
  menu. `image` is the brand artwork (decorative — empty alt, aria-hidden),
  `children` the wordmark, `subtitle` a second line, `mark` what replaces the
  wordmark on the 48px rail. Without an `image` the block paints
  `bg/surface/sidebar`, so a brand with no asset yet reads as a quiet header
  rather than an empty coloured box. A scrim between the artwork and the text
  is what makes the wordmark's contrast the component's guarantee instead of
  the brand file's: measured on both products' artwork, the worst pixel under a
  glyph is 5.3:1 for the second line and 5.8:1 for the wordmark. `ink="on-light"`
  takes a pale asset and turns the scrim pale with it.

- **`Loader`** — `variant="spinner" | "fuse" | "pulse"`, matching Figma's
  `Loader` set. Spinner for in-console waits (Size 3–8, xl); Fuse for brand
  moments only (56 / 96 / 160, goo filter built in — no defs to mount); Pulse
  for Iris thinking, with a 400ms show delay and `onTint` for the assistant
  bubble. Labels name the work (`label={null}` when visible text says it),
  and reduced motion swaps travel for a cross-fade. Colours are `chart-4/2/3`.
  Keyframes were already in `theme.css`; `loader-reach` now takes a
  per-drop `--loader-delay`. Stories under _Components/Loader_.

- **The Field family, built to Figma** (Field · ↳ Input · ↳ Select):
  - **InputGroup** — Input's Leading / Trailing slots: icon, text prefix/suffix,
    Kbd, spinner, check, tooltip and button addons. The group draws the box, so
    the focus ring surrounds the addons.
  - **Select** — the searchable, grouped, multi-select filter. The trigger keeps
    its label and shows a count; ticks are a draft committed once on Apply.
  - **PasswordInput** (show/hide), **NumberInput** (steppers, spinbutton
    keyboard), **TagsInput** + **InputChip**, **FileUpload** +
    **FileUploadItem**, and **InputButton** (Input `Type=Button` / `Select
trigger`).
  - **Tooltip**, and **FieldLabel `help`** — Figma's Help icon beside the label.
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

- **Progress track was invisible in light mode**, so the bar had no visible
  end. The track moves from `bg/neutral/subtle` (neutral-50 — the app
  background itself) to `bg/neutral/muted-pressed` (neutral-200 / neutral-700),
  the same "empty" value Skeleton and Meter use. **Figma impact** — the
  `Progress` track is rebound to match.

- **Calendar range: mid-range day numbers were unreadable** — white on
  `bg/primary/subtle` in light, near-black on it in dark (about 1.1:1). The
  tokens were right; `selected` and `range_middle` both styled the day button
  at the same specificity and stylesheet order picked the white text. The solid
  selected treatment now skips the middle of a range, so those days read
  `fg/neutral/muted` on `bg/primary/subtle` as in Figma. No Figma change.

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
