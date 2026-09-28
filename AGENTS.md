# AGENTS.md — working in Picasso

Rules for any agent or human writing code here. Violations are caught by
`npm run lint` (`@shadcn/lint` on ESLint), but knowing them beats being told.

---

## 1. Direction of truth

**This repo is the source of truth for the design system.** Figma is a consumer:
it receives tokens and is reconciled to match the code. Do not "fix" a value here
to match Figma without checking which side is actually right.

---

## 2. Colour — never a raw value

```tsx
// ✗ never
className="bg-[#007FAB] text-[#121926]"
className="bg-blue-600 text-slate-900"          // no Tailwind palette colours
className="bg-[var(--bg-primary-emphasis)]"     // the escape hatch is not needed

// ✓ always
className="bg-surface-primary-emphasis text-content-neutral-emphasis"
```

Each token family has a utility word that reads correctly with its own prefix,
because Tailwind's `--color-*` namespace feeds `bg-`, `text-` and `border-` from
one pool and the three families would otherwise collide:

| Token | Utility | Example |
|---|---|---|
| `bg/*` (67) | **surface** | `bg-surface-danger-subtle-hovered` |
| `fg/*` (31) | **content** | `text-content-on-primary-emphasis` |
| `border/*` (21) | **line** | `border-line-input-invalid` |
| `status/*` (5) | status | `text-status-critical` |
| `chart/1–8` | chart | `fill-chart-3` |

Every semantic has a utility — **if you reach for `bg-[var(...)]`, the bridge is
missing an entry.** Add it to `packages/tokens/theme.css`, don't escape.

**Never use a `palette/*` value in a component.** Palette is for semantics only.

---

## 3. Spacing and radius

**Picasso is a 4pt grid with 2pt half-steps.** Legal: every multiple of 4, plus
2, 6, 10, 14. Anything else (5, 18, `p-[13px]`) is drift.

**Radius is one knob.** `--radius` drives all eight steps proportionally; never
hard-code a corner. `rounded-md` is 8px, `rounded-lg` 10px at the default.

---

## 4. Typography

**Tailwind's own scale is cleared — there is one vocabulary.** `text-md` is
**14px**, not Tailwind's `text-base` 16px. Sizes and their line heights both come
from the ramp, so a utility cannot drift off it.

`2xs 11 · xs 12 · sm 13 · md 14 · lg 16 · xl 18 · 2xl 20 · 3xl 24 · 4xl 30 · 5xl 36`

Roles, not sizes, decide which to use:

| Role | Weight | Use for |
|---|---|---|
| `body/*` | Regular | prose, descriptions |
| `label/*` | Medium | controls, form labels, table headers, tabs |
| `heading/*` | **Semi Bold** | titles only — `xl` page, `lg` section, `md` card/dialog |
| `metric/*` | Medium, mono | numbers people read as data |
| `code/*` | Regular, mono | SIP traces, log payloads, IDs |

⚠️ **A control label is never a `heading/*`.** Tab labels, menu items, table
column headers and buttons take `label/*`.

`label/xs` is uppercase — it is an **eyebrow/overline only**, never a button.

---

## 5. Copy

**Sentence case everywhere, except proper nouns.**

- Proper nouns: Clarion · Iris · Prognosis · Collaborate · Transact · Infrastructure · IR
- First mention takes the prefix — "IR Collaborate", then "Collaborate"
- Fixed forms: "UC & CC" · "HPE NonStop" · "Real-time Payments"
- Vendor/protocol names as the vendor writes them: SIP · RTP · MOS · SBC · Teams · Webex
- ⚠️ **Never the pre-rename product name** (Clarity) in any string, filename or alt text

**Errors: fact first, then action.** Never blame the reader.

```
✗ "You entered an invalid query."
✓ "No results match these filters. Clear the date range to widen the search."
```

**Numbers:** digits always (`3 trunks`); space before units (`1.2 GB`, `45 ms`);
percentages close up (`99.95%`); 24-hour time with an explicit timezone.

**Buttons:** verb first, name the outcome. Never "Submit" or "OK" alone.

**Every data component needs empty, loading and error copy** — not just the
success state.

---

## 6. RTL

Product ships to multiple regions. **Logical properties only.**

```tsx
// ✗            // ✓
pl-4 pr-2       ps-4 pe-2
ml-auto         ms-auto
left-0          start-0
text-left       text-start
```

Icons that encode direction (chevrons, arrows, back/forward) mirror via
`.rtl-mirror`. Clocks, checkmarks, logos and media controls do not.

---

## 7. Component architecture

shadcn conventions throughout: **Radix primitive + `cva` variants + `cn()`**.
Icons are **Lucide** — no other icon library.

- One folder per component: `component.tsx`, `component.stories.tsx`, `guidance.json`
- Export from `src/index.ts` as it lands
- Prefer a `slot` or `children` over a boolean that toggles a hardcoded child
- A boolean can change **presence**; only a variant can change **paint**

---

## 8. Don'ts — real defects found in the Figma library, do not reproduce

- A ghost button with a resting fill — it reads as an outline button and the
  hierarchy between primary and tertiary collapses
- A toast or alert with **both** an action and a close
- An `fg/*` token used as a stroke or fill (use `border/*` or `bg/*`)
- A `-hovered` or `-pressed` token on a resting state
- A `Status` enum **and** a `Show status badge` boolean — two controls for one thing
- One variant at a different radius from its siblings
- An axis whose options are additive rather than exclusive — that is booleans

---

## 9. Component order

Build in dependency order. Button is nested in Alert, Toast, Dialog, Drawer,
Table toolbar and Sidebar — doing it late means rebuilding everything twice.

```
tokens/theme → Button · Input · Label · Separator · Badge · Skeleton
  → Checkbox · Radio · Switch · Select · Textarea · Field · Tooltip · Popover
  → DropdownMenu · Dialog · Drawer · Toast · Tabs · Accordion · Card
  → Table · Sidebar · Calendar · Command
  → product-specific (KPI Tile · Log viewer · Metrics)
```

---

## 10. Commands

```bash
npm run build:tokens   # regenerate dist/tokens.css — run after ANY token change
npm run storybook      # :6006
npm run lint           # design system rules
npm run type-check
npm test
```

**After changing a token, rebuild.** `dist/tokens.css` is generated; never edit it.

---

## Adding a brand

Picasso is multi-brand. A brand brings its own ramps; everything else is
inherited, and that is deliberate.

**A brand is a preset, not a sixth axis.** It sets defaults for radius, type
and spacing; an explicit `data-radius` still overrides it. That works by CSS
source order, so in `themes.css` **brand blocks sit above the axis blocks** —
load-bearing, not cosmetic.

**Constrain the surface; do not flip the ink.** Generate the ramp so the
emphasis step carries white text, rather than generating freely and flipping
`fg/on/*` to dark when it fails. A system where a primary button has white
text in one brand and dark text in another has two different-looking primary
buttons, and every screenshot, doc and habit diverges with it. Constrain the
ramp and only the hue changes.

`build/ramp.mjs` does this: for the steps that carry text it solves lightness
down until relative luminance clears 0.1833. **OKLCH lightness is not WCAG
luminance** — luminance weights green at 0.7152 and blue at 0.0722, so a fixed
L lands one hue at 4.61 and another at 4.48. Solve, do not tabulate.

**Keep the flip for what cannot be constrained.** Two cases, and only two:
a colour that must stay recognisable (amber cannot be darkened enough to carry
white and still read as a warning), and dark mode, which deliberately paints
with a lighter step. Everywhere else a flip means the ramp is wrong.

**Only `fg/on/*` may differ per brand.** Every other semantic aliases a
primitive, so re-pointing the primitive carries the whole system. If a brand
needs some other semantic overridden, fix the ramp — that is a bug report
against the ramp, not a new override. Without this, brand three arrives with
nine overrides and brand four with fifteen.

**Colour and radius move freely; typography and spacing need a reason.**
Colour is nearly free because semantics alias primitives. Type and spacing
change *layout*, so every screen has to be re-checked per brand. That cost is
real and it multiplies.

**Never per brand:** `danger`, `success`, `warning`, `info`. A brand whose
colour is red does not make errors green. These are meaning, not identity.

**Generated, committed, never hand-edited.** `node build/brand.mjs <name>
--brand "#RRGGBB"` emits the block and prints the contrast evidence. A
hand-edited ramp cannot be regenerated, and the first nudged stop silently
desynchronises the on-colours.

**WCAG 2.1 AA is the gate; the eye overrides upward only.** 2.1 mis-ranks
saturated colours and APCA models it better, but APCA is not a standard and
not what an accessibility obligation names. So: comply with 2.1, and where 2.1
says pass and the screen says otherwise, darken. Never the reverse.
`npm test` enforces the floor — every on-colour pair, both modes.

---

## Documentation

Prose about the system lives in `docs/`, not in this file. This file is *how to
write code here*; `docs/` is *what the system is*.

- Copy rules — casing, errors, empty states, numbers, button labels — are in
  `docs/content/`. Follow them when you write any user-facing string.
- Foundations — the grid, the radius ladder, the type ramp — are in
  `docs/foundations/`.
- Adding a component: `docs/contributing/adding-a-component.md`, and copy
  `docs/contributing/component-checklist.md` into the PR.

**If you produced off-system code, the docs failed, not you.** Say which rule
you broke and where it was written down — or that it was not. See
`docs/contributing/reporting-off-system-output.md`.
