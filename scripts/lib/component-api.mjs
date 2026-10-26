/**
 * What a component's source says about itself — its exports, its props, its
 * cva variants and the ⚠️ warnings in its doc block.
 *
 * This used to live inside scripts/build-component-docs.mjs, where only the
 * docs site could reach it. The agent files (public/llms*.txt) carried a
 * component's guidance and its accessibility notes but not its API, so an
 * agent reading them knew how to use PageHeader correctly and had to guess
 * what to pass it. One copy, two consumers; the repo's own rule.
 *
 * Nothing here is written. Every string is lifted from the source, so a
 * component that renames a prop renames it in both outputs on the next build.
 */

/** Every ⚠️ paragraph in the doc block: the things that bite. */
export function warnings(src) {
  const block = src.match(/\/\*\*\n([\s\S]*?)\n \*\//);
  if (!block) return [];
  const text = block[1]
    .split("\n")
    .map((l) => l.replace(/^ \* ?/, "").replace(/^ \*$/, ""))
    .join("\n");
  return [...text.matchAll(/⚠️\s*([\s\S]*?)(?=\n\s*\n|\n⚠️|$)/g)]
    .map((m) => m[1].replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);
}

/**
 * Props, from the exported `<Name>Props` interface. Each member in this
 * library carries its own doc comment, which is the description — so nothing
 * here is written, only lifted.
 */
export function props(src) {
  // Every exported Props interface, not just the first: a compound component
  // keeps its API in the sub-components (DialogContentProps, ToastProps …),
  // and reading only the first left a dozen components looking propless.
  const groups = [];
  for (const iface of src.matchAll(/export interface (\w*Props)[\s\S]*?\{\n([\s\S]*?)\n\}/g)) {
    const out = [];
    const re = /\/\*\*([\s\S]*?)\*\/\s*\n\s*(\w+)(\??):\s*([\s\S]*?);\n/g;
    let m;
    while ((m = re.exec(iface[2] + "\n")) !== null) {
      const doc = m[1]
        .split("\n")
        .map((l) => l.replace(/^\s*\*?\s?/, ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      // A union written across several lines reads fine on one.
      out.push({ name: m[2], optional: m[3] === "?", type: m[4].replace(/\s+/g, " ").trim(), doc });
    }
    if (out.length) groups.push({ name: iface[1], members: out });
  }
  return groups;
}

/**
 * The cva variants. For a component whose own props interface is empty — it
 * takes the element's props and nothing else — the variant axes ARE the API,
 * and they were going undocumented.
 */
export function variants(src) {
  const out = [];
  for (const block of src.matchAll(/cva\(([\s\S]*?)\n\);/g)) {
    const body = block[1];
    const v = body.match(/variants:\s*\{([\s\S]*?)\n\s{4}\}/);
    if (!v) continue;
    const defaults = {};
    const d = body.match(/defaultVariants:\s*\{([^}]*)\}/);
    if (d) for (const m of d[1].matchAll(/(\w+):\s*"([^"]+)"/g)) defaults[m[1]] = m[2];
    // Each axis is `name: { option: "classes", ... }` at one indent level.
    for (const axis of v[1].matchAll(/^\s{6}(\w+):\s*\{([\s\S]*?)^\s{6}\}/gm)) {
      const options = [...axis[2].matchAll(/^\s{8}"?([\w-]+)"?:/gm)].map((m) => m[1]);
      if (options.length) out.push({ name: axis[1], options, default: defaults[axis[1]] });
    }
  }
  return out;
}

/** The names a consumer imports — what the file actually exports. */
export function exportsOf(src) {
  return [
    ...[...src.matchAll(/^export function (\w+)/gm)].map((m) => m[1]),
    ...[...src.matchAll(/^export const (\w+) = React\.forwardRef/gm)].map((m) => m[1]),
  ];
}
