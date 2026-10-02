import { describe, expect, it } from "vitest";
import { contrast, hexToRgb } from "../../../tokens/build/ramp.mjs";
// The import must stay on one line: @ts-expect-error covers only the line below it.
// prettier-ignore
// @ts-expect-error — plain .mjs build module
import { BRANDS, brandLayer, core, resolver, semantic, onColourOverrides } from "../../../tokens/build/brands.mjs";

/**
 * Contrast as a build gate, not a review activity.
 *
 * Every on-colour in the system is measured against the surface it is named
 * for, in both modes, for EVERY brand — a brand's ramp and on-colours are
 * generated, and this is the gate that proves the generator right. A brand
 * whose ramp drifts a step lighter fails here rather than in an audit six
 * months later — which is how the amber flip got found the first time, by
 * hand, after it had already shipped.
 */
type Mode = "light" | "dark";
const MODES: Mode[] = ["light", "dark"];

const perBrand = (BRANDS as string[]).map((brand) => {
  const { res } = resolver(core, brandLayer(brand).tokens);
  const over = onColourOverrides(brand);
  const hex = (ref: string) => String(res(ref)).toUpperCase();
  const sem = (mode: Mode) => semantic[mode] as any;
  const on = (mode: Mode, name: string) =>
    over[mode][name] ?? sem(mode).fg.on[name].$value;

  /** fg/on/<intent>-<prominence> is named for the surface it sits on. */
  const pairs = MODES.flatMap(
    (mode) =>
      Object.keys(sem(mode).fg.on)
        .filter((name) => !name.startsWith("$"))
        .map((name) => {
          const [intent, prominence] = name.split(/-(?=[a-z]+$)/);
          const bgTok = sem(mode).bg?.[intent]?.[prominence];
          return bgTok
            ? {
                brand,
                mode,
                name: `fg/on/${name}`,
                fg: hex(on(mode, name)),
                bg: hex(bgTok.$value),
              }
            : null;
        })
        .filter(Boolean) as {
        brand: string;
        mode: Mode;
        name: string;
        fg: string;
        bg: string;
      }[],
  );
  return { brand, hex, sem, pairs };
});

describe.each(perBrand)("contrast — $brand", ({ hex, sem, pairs }) => {
  it("finds every on-colour pair", () => {
    // If this drops, a token was renamed and the gate quietly stopped
    // covering it — which is worse than failing.
    expect(pairs.length).toBe(24);
  });

  it.each(pairs)(
    "$mode $name passes AA on its own surface",
    ({ fg, bg, name, mode }) => {
      const ratio = contrast(hexToRgb(bg), hexToRgb(fg));
      expect(
        ratio,
        `${mode} ${name}: ${fg} on ${bg} is ${ratio.toFixed(2)}:1, needs 4.5:1`,
      ).toBeGreaterThanOrEqual(4.5);
    },
  );

  it.each(MODES)("%s body text passes AA on app and card", (mode) => {
    for (const surface of ["app", "card"] as const) {
      const bg = hex(sem(mode).bg[surface].$value);
      for (const ink of ["emphasis", "muted"] as const) {
        const fg = hex(sem(mode).fg.neutral[ink].$value);
        const ratio = contrast(hexToRgb(bg), hexToRgb(fg));
        expect(
          ratio,
          `${mode} fg/neutral/${ink} on bg/${surface}: ${ratio.toFixed(2)}:1`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it.each(MODES)(
    "%s focus ring passes 3:1 against the surfaces it rings",
    (mode) => {
      const ring = hex(sem(mode).border.focused.$value);
      for (const tok of [
        sem(mode).bg.app,
        sem(mode).bg.card,
        sem(mode).bg.input.default,
      ]) {
        const ratio = contrast(hexToRgb(hex(tok.$value)), hexToRgb(ring));
        // A focus indicator is a UI component: SC 1.4.11 asks for 3:1.
        expect(
          ratio,
          `${mode} border/focused: ${ratio.toFixed(2)}:1`,
        ).toBeGreaterThanOrEqual(3);
      }
    },
  );
});
