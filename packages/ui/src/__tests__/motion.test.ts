import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Motion as a build gate.
 *
 * The rules in docs/foundations/motion.md are easy to agree with and easy to
 * drift from: one `ease-in`, one animated `width`, one named animation
 * without a reduced-motion branch, and the system is back to being a set of
 * intentions. jsdom cannot run an animation, so this reads the two files the
 * motion is written in and checks the rules against the text.
 */
const tokens = resolve(__dirname, "../../../tokens");
const css = readFileSync(resolve(tokens, "theme.css"), "utf8");
const core = JSON.parse(
  readFileSync(resolve(tokens, "tokens/core.json"), "utf8"),
);

/** Everything from the first motion banner to the next section banner. */
const motionCss = css.slice(css.indexOf("/* ═══ Motion: the scale"));

/** `@utility name { … }` blocks, braces balanced. */
function utilities(source: string) {
  const out: Record<string, string> = {};
  const re = /@utility ([\w-]+) \{/g;
  for (let m = re.exec(source); m; m = re.exec(source)) {
    let depth = 1;
    let i = re.lastIndex;
    while (depth > 0 && i < source.length) {
      if (source[i] === "{") depth++;
      if (source[i] === "}") depth--;
      i++;
    }
    out[m[1]] = source.slice(re.lastIndex, i - 1);
  }
  return out;
}

const all = utilities(css);
const named = Object.entries(all).filter(([name]) =>
  /^animate-(?!loader|illustration)/.test(name),
);

describe("motion tokens", () => {
  const easing = core.motion.easing as Record<string, { $value: string }>;
  const duration = core.motion.duration as Record<string, { $value: string }>;

  it("has no curve that starts slowly", () => {
    // cubic-bezier(x1, y1, x2, y2): a curve eases in when it leaves the
    // origin flatter than the diagonal, i.e. y1 < x1. `in-out` is the one
    // curve allowed to, because it moves things that are already on screen.
    for (const [name, token] of Object.entries(easing)) {
      if (name === "in-out") continue;
      const [x1, y1] = token.$value.match(/-?[\d.]+/g)!.map(Number);
      expect(y1, `motion/easing/${name}`).toBeGreaterThanOrEqual(x1);
    }
  });

  it("keeps every duration at or under 300ms", () => {
    for (const [name, token] of Object.entries(duration))
      expect(
        parseFloat(token.$value),
        `motion/duration/${name}`,
      ).toBeLessThanOrEqual(300);
  });

  it("keeps the deprecated curves equal to the one that replaced them", () => {
    expect(easing.enter.$value).toBe(easing.out.$value);
    expect(easing.exit.$value).toBe(easing.out.$value);
  });
});

describe("named animations", () => {
  it("exist for everything that opens and closes", () => {
    expect(named.map(([name]) => name).sort()).toEqual(
      [
        "animate-accordion-down",
        "animate-accordion-up",
        "animate-dialog-in",
        "animate-dialog-out",
        "animate-drawer-in-end",
        "animate-drawer-in-start",
        "animate-drawer-out-end",
        "animate-drawer-out-start",
        "animate-fade-in",
        "animate-fade-out",
        "animate-popover-in",
        "animate-popover-out",
        "animate-sheet-in",
        "animate-sheet-out",
        "animate-toast-in",
        "animate-toast-out",
      ].sort(),
    );
  });

  it("are built from the tokens, never from a number", () => {
    for (const [name, body] of named) {
      expect(body, name).not.toMatch(/\d+m?s\b/);
      expect(body, name).not.toMatch(/cubic-bezier/);
      expect(body, name).not.toMatch(/\bease-in\b/);
    }
  });

  it("carry their own reduced-motion branch, and it is a fade", () => {
    for (const [name, body] of named) {
      // The scrim is already a fade; there is nothing to substitute.
      if (/^animate-fade-/.test(name)) continue;
      const reduced = body.match(
        /@media \(prefers-reduced-motion: reduce\) \{([^}]*)\}/,
      );
      expect(reduced, name).not.toBeNull();
      expect(reduced![1], name).toMatch(
        name.includes("-in") || name.endsWith("-down")
          ? /animation: fade-in var\(--motion-duration-fast\)/
          : /animation: fade-out var\(--motion-duration-fast\)[^;]*\bboth\b/,
      );
    }
  });

  it("hold the last frame on the way out, so nothing flashes back", () => {
    for (const [name, body] of named) {
      if (!/-(out|up)(-|$)/.test(name)) continue;
      expect(body.split("@media")[0], name).toMatch(/\bboth;/);
    }
  });

  it("never start from nothing", () => {
    expect(motionCss).not.toMatch(/scale\(0\)/);
  });
});

describe("what is allowed to move", () => {
  it("animates transform and opacity — and height only for the Accordion", () => {
    const frames = [...motionCss.matchAll(/@keyframes ([\w-]+) \{/g)].map(
      (m) => {
        const start = m.index! + m[0].length;
        let depth = 1;
        let i = start;
        while (depth > 0) {
          if (motionCss[i] === "{") depth++;
          if (motionCss[i] === "}") depth--;
          i++;
        }
        return [m[1], motionCss.slice(start, i - 1)] as const;
      },
    );
    expect(frames.length).toBeGreaterThan(0);
    for (const [name, body] of frames) {
      const props = [...body.matchAll(/([a-z-]+):/g)].map((m) => m[1]);
      const allowed = name.startsWith("accordion-")
        ? ["height", "opacity"]
        : ["opacity", "transform"];
      expect(
        props.filter((p) => !allowed.includes(p)),
        name,
      ).toEqual([]);
    }
  });

  it("transitions no layout property", () => {
    const layout =
      /\b(width|height|margin|padding|top|left|right|bottom|inset)\b/;
    for (const [name, body] of Object.entries(all)) {
      const props = body.match(/transition-property:([^;]*);/);
      if (props) expect(props[1], name).not.toMatch(layout);
    }
    expect(all["transition-rail"]).toBeUndefined();
  });

  it("names the properties a press animates rather than all of them", () => {
    expect(all["transition-press"]).toMatch(
      /transition-property:\s*color, background-color, border-color, outline-color,\s*text-decoration-color, fill, stroke, scale;/,
    );
  });
});

describe("Tailwind's own names", () => {
  it("point at the tokens", () => {
    const flat = css.replace(/\s+/g, " ");
    expect(flat).toContain("--ease-out: var(--motion-easing-out);");
    expect(flat).toContain("--ease-in-out: var(--motion-easing-in-out);");
    expect(flat).toContain(
      "--default-transition-duration: var(--motion-duration-fast);",
    );
    expect(flat).toContain("--default-transition-timing-function: ease;");
  });
});
