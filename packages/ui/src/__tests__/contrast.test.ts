import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { contrast, hexToRgb } from "../../../tokens/build/ramp.mjs";

/**
 * Contrast as a build gate, not a review activity.
 *
 * Every on-colour in the system is measured against the surface it is named
 * for, in both modes. A brand whose ramp drifts a step lighter fails here
 * rather than in an audit six months later — which is how the amber flip got
 * found the first time, by hand, after it had already shipped.
 */
// @ts-expect-error — plain .mjs build module, no types needed here
import { BRANDS, brandLayer, core, resolver, semantic } from "../../../tokens/build/brands.mjs";

/* Every brand is measured, not just the default: a brand's on-colours are
 * generated, and this is the gate that proves the generator right. */
const MODES = semantic as Record<"light" | "dark", any>;

/** fg/on/<intent>-<prominence> is named for the surface it sits on. */
const pairs = Object.entries(MODES).flatMap(([mode, sem]) =>
  Object.entries((sem as any).fg.on)
    .filter(([name]) => !name.startsWith("$"))
    .map(([name, tok]: [string, any]) => {
      const [intent, prominence] = name.split(/-(?=[a-z]+$)/);
      const bgTok = (sem as any).bg?.[intent]?.[prominence];
      return bgTok ? { mode, name: `fg/on/${name}`, fg: resolve(tok.$value), bg: resolve(bgTok.$value) } : null;
    })
    .filter(Boolean as unknown as (v: unknown) => v is { mode: string; name: string; fg: string; bg: string }),
);

describe("contrast", () => {
  it("finds every on-colour pair", () => {
    // If this drops, a token was renamed and the gate quietly stopped
    // covering it — which is worse than failing.
    expect(pairs.length).toBe(24);
  });

  it.each(pairs)("$mode $name passes AA on its own surface", ({ fg, bg, name, mode }) => {
    const ratio = contrast(hexToRgb(bg), hexToRgb(fg));
    expect(
      ratio,
      `${mode} ${name}: ${fg} on ${bg} is ${ratio.toFixed(2)}:1, needs 4.5:1`,
    ).toBeGreaterThanOrEqual(4.5);
  });

  it.each(Object.entries(MODES))("%s body text passes AA on app and card", (mode, sem) => {
    for (const surface of ["app", "card"] as const) {
      const bg = resolve((sem as any).bg[surface].$value);
      for (const ink of ["emphasis", "muted"] as const) {
        const fg = resolve((sem as any).fg.neutral[ink].$value);
        const ratio = contrast(hexToRgb(bg), hexToRgb(fg));
        expect(ratio, `${mode} fg/neutral/${ink} on bg/${surface}: ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it.each(Object.entries(MODES))("%s focus ring passes 3:1 against the surfaces it rings", (mode, sem) => {
    const ring = resolve((sem as any).border.focused.$value);
    for (const surface of ["app", "card", "input-default"] as const) {
      const [a, b] = surface.includes("-") ? surface.split("-") : [surface, null];
      const tok = b ? (sem as any).bg[a][b] : (sem as any).bg[a];
      const ratio = contrast(hexToRgb(resolve(tok.$value)), hexToRgb(ring));
      // A focus indicator is a UI component: SC 1.4.11 asks for 3:1.
      expect(ratio, `${mode} border/focused on bg/${surface}: ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(3);
    }
  });
});
