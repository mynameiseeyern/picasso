import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Every component owes a `Narrow` story — 328px, a 360 phone minus its
 * gutters. It is the only story cut at the floor, so it is the one that shows
 * what a phone does to a component and the only one the overflow sweep can
 * measure.
 *
 * This was enforced nowhere, which is how it drifted to 41 of 55 missing. The
 * list below was that debt, written down so it could only shrink; it is now
 * empty, and every component has one. Leaving the mechanism in place is the
 * point — the next component to arrive without a Narrow story fails here
 * rather than starting the drift again.
 */
const OWED = new Set<string>([]);

const COMPONENTS = join(__dirname, "..", "components");

const withStories = readdirSync(COMPONENTS, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => {
    const files = readdirSync(join(COMPONENTS, e.name)).filter((f) =>
      f.endsWith(".stories.tsx"),
    );
    return { name: e.name, files };
  })
  .filter((c) => c.files.length > 0);

const hasNarrow = (c: { name: string; files: string[] }) =>
  c.files.some((f) =>
    /export const Narrow\b/.test(
      readFileSync(join(COMPONENTS, c.name, f), "utf8"),
    ),
  );

describe("Narrow stories", () => {
  it("exist for every component not on the owed list", () => {
    const drifted = withStories
      .filter((c) => !OWED.has(c.name) && !hasNarrow(c))
      .map((c) => c.name);
    expect(
      drifted,
      "These lost their Narrow story. A component cut only at desktop width " +
        "has nothing to say about a phone, and the overflow sweep cannot see it.",
    ).toEqual([]);
  });

  it("has no stale entries on the owed list", () => {
    const paid = withStories
      .filter((c) => OWED.has(c.name) && hasNarrow(c))
      .map((c) => c.name);
    expect(
      paid,
      "These now have a Narrow story — strike them off OWED in this file so " +
        "the count is honest and the ratchet keeps tightening.",
    ).toEqual([]);
  });

  it("names only components that exist", () => {
    const known = new Set(withStories.map((c) => c.name));
    expect([...OWED].filter((n) => !known.has(n))).toEqual([]);
  });
});
