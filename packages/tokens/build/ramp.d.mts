/* Types for ramp.mjs — kept beside it so consumers (the contrast tests, the
 * site's theme builder) get a typed import. */
export type Step = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;
export type Ramp = Record<Step, string>;
export type Rgb = [number, number, number];

export const STEPS: readonly Step[];
export const WHITE_TEXT_CEILING: number;

export function buildRamp(
  baseHex: string,
  options?: { anchor?: Step; hueDrift?: number; carriesText?: Step[] },
): Ramp;

export function inkFor(
  hex: string,
  options?: { dark?: string; large?: boolean },
): { ink: "light" | "dark"; onWhite: number; onDark: number; passes: boolean };

export function contrast(a: Rgb, b: Rgb): number;
export function luminance(rgb: Rgb): number;
export function hexToRgb(hex: string): Rgb;
export function rgbToHex(rgb: Rgb): string;
