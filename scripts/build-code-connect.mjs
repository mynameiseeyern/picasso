#!/usr/bin/env node
/**
 * Generates a Code Connect mapping beside each component.
 *
 *   packages/ui/src/components/<slug>/<slug>.figma.tsx
 *
 * Two sources, joined. The code side comes from the component's own source,
 * through the same `scripts/lib/component-api.mjs` the docs and the agent files
 * read, so a mapping cannot name a variant the component does not have. The
 * Figma side comes from `scripts/figma-component-props.json`, read out of the
 * library with the Plugin API rather than guessed — because the two sides do
 * not use one spelling: `Variant`/`variant` agree, `Style`/`variant` do not,
 * and Button's `Size` options are already lowercase where its `Variant`
 * options are title case.
 *
 * The output is a Code Connect v2 template: `// url=` and `// component=`
 * directives, then a default export whose `example` is a `figma.code` tagged
 * template. v2 is the format Figma publishes directly, with no parsing step —
 * the v1 `figma.connect()` parsers stopped being maintained in August 2026, so
 * nothing here depends on them.
 *
 * What it will not do is invent the half it cannot see. A Figma axis with no
 * code counterpart, a boolean that toggles a child, a text property that is
 * really `children` — each becomes a TODO in the file naming exactly what is
 * unmapped. `docs/contributing/figma-to-code-mapping.md` has the four rules
 * for resolving them. A generated file is a correct starting point, not a
 * finished mapping, and it says so at the top until a person removes the line.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { variants, exportsOf } from "./lib/component-api.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const COMPONENTS = join(ROOT, "packages/ui/src/components");
const figmaProps = JSON.parse(readFileSync(join(ROOT, "scripts/figma-component-props.json"), "utf8"));
const FILE_KEY = figmaProps._fileKey;

/* Figma writes an axis in Title Case and the code writes its value in kebab.
 * Compare on the flattened form so "Icon Left" and "icon-left" are one key. */
const flat = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "");

/* The axis names that do not simply lowercase into the code prop. Everything
 * else matches by name, which is most of them. */
const AXIS_ALIASES = {
  style: "variant", // Badge and Toast draw the fill treatment as `Style`
  type: "variant",
};

const pascal = (slug) => slug.replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase());

const mapAxis = (axis, options, codeVariants) => {
  const want = AXIS_ALIASES[flat(axis)] ?? flat(axis);
  const hit = codeVariants.find((v) => flat(v.name) === flat(axis)) ??
    codeVariants.find((v) => flat(v.name) === want);
  if (!hit) return null;

  const pairs = [];
  for (const option of options) {
    const match = hit.options.find((o) => flat(o) === flat(option));
    if (match) pairs.push([option, match]);
  }
  // A partial match is worse than none: it silently drops the options it could
  // not place, and the mapping then looks complete.
  if (pairs.length !== options.length) return { prop: hit.name, pairs, partial: true };
  return { prop: hit.name, pairs, partial: false };
};

let written = 0;
const report = [];

for (const slug of readdirSync(COMPONENTS, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)) {
  const guidancePath = join(COMPONENTS, slug, "guidance.json");
  const sourcePath = join(COMPONENTS, slug, `${slug}.tsx`);
  if (!existsSync(guidancePath) || !existsSync(sourcePath)) continue;

  const guidance = JSON.parse(readFileSync(guidancePath, "utf8"));
  const nodeId = guidance.figma?.nodeId;
  const fig = figmaProps[slug];
  if (!nodeId || !fig) {
    report.push(`  ${slug}: skipped (${!nodeId ? "no Figma node id" : "not in figma-component-props.json"})`);
    continue;
  }

  const src = readFileSync(sourcePath, "utf8");
  const codeVariants = variants(src);
  const exports = exportsOf(src);
  const component = exports[0] ?? pascal(slug);

  const consts = [];
  const renders = [];
  const todo = [];

  for (const [axis, def] of Object.entries(fig.props ?? {})) {
    if (def.t === "V") {
      const m = mapAxis(axis, def.o ?? [], codeVariants);
      if (m && !m.partial) {
        const body = m.pairs.map(([from, to]) => `  ${JSON.stringify(from)}: ${JSON.stringify(to)},`).join("\n");
        consts.push(`const ${m.prop} = figma.selectedInstance.getEnum(${JSON.stringify(axis)}, {\n${body}\n});`);
        renders.push(m.prop);
      } else if (m) {
        const placed = m.pairs.map(([f]) => f);
        const missing = (def.o ?? []).filter((o) => !placed.includes(o));
        todo.push(`${axis} → ${m.prop}: no code value for ${missing.map((x) => JSON.stringify(x)).join(", ")}`);
      } else {
        todo.push(`${axis} (${(def.o ?? []).join(" | ")}): no matching prop — a state, or a Figma-only axis`);
      }
    } else if (def.t === "B") {
      todo.push(`${axis}: Figma boolean — rule 3, decide which child it renders`);
    } else if (def.t === "T") {
      todo.push(`${axis}: Figma text — usually children, or figma.string(${JSON.stringify(axis)})`);
    } else if (def.t === "S") {
      todo.push(`${axis}: Figma slot — figma.children("*")`);
    } else if (def.t === "I") {
      todo.push(`${axis}: instance swap — figma.instance(${JSON.stringify(axis)})`);
    }
  }

  const url = `https://www.figma.com/design/${FILE_KEY}/?node-id=${nodeId.replace(":", "-")}`;

  const banner = [
    `/* ${fig.set} → ${component}`,
    ` *`,
    ` * GENERATED by scripts/build-code-connect.mjs as a starting point, from`,
    ` * the component's own cva variants and the Figma set's property`,
    ` * definitions. Finish it, then delete this banner — the banner is how an`,
    ` * unfinished mapping is told from a reviewed one.`,
    todo.length
      ? ` *\n * Unmapped, and why each needs a person:\n${todo.map((t) => ` *   - ${t}`).join("\n")}`
      : ` *\n * Every Figma property mapped.`,
    ` *`,
    ` * The four rules: docs/contributing/figma-to-code-mapping.md`,
    ` */`,
  ].join("\n");

  const render = renders
    .map((name) => `\${figma.helpers.react.renderProp(${JSON.stringify(name)}, ${name})}`)
    .join("");

  const lines = [
    `// url=${url}`,
    `// component=${component}`,
    ``,
    banner,
    `import figma from "figma";`,
    ``,
    ...(consts.length ? consts : [`// Nothing mapped automatically — see the TODOs above.`]),
    `const children = figma.properties.children(["*"]);`,
    ``,
    `export default {`,
    `  id: ${JSON.stringify(component)},`,
    `  imports: ["import { ${component} } from '@ir/ui';"],`,
    `  example: figma.code\`<${component}${render}\${figma.helpers.react.renderProp("children", children)} />\`,`,
    `  metadata: { nestable: true },`,
    `};`,
    ``,
  ];

  writeFileSync(join(COMPONENTS, slug, `${slug}.figma.ts`), lines.join("\n"));
  written += 1;
  report.push(`  ${slug}: ${renders.length} mapped, ${todo.length} to finish`);
}

console.log(`${written} Code Connect files → packages/ui/src/components/*/\n${report.join("\n")}`);
