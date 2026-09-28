export declare const toPx: (v: string | number) => number;
export declare const pxToRem: (px: number) => string;
export declare function scaleSpace(px: number, mult: number, key: string): number;
export declare function spaceLadder(presetSpace: Record<string, string>, mult: number): Record<string, string>;
