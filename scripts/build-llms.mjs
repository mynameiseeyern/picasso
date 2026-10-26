#!/usr/bin/env node
/**
 * Generates the llms*.txt file set from docs/ and the component folders.
 *
 * Hand-maintained agent files drift within a fortnight, and drift silently,
 * because nothing renders them for a human to notice. So nothing here is
 * authored — every line comes from a file that someone reads for another
 * reason.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { warnings, props, variants, exportsOf } from "./lib/component-api.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public");
// The deployed docs. A custom domain is wanted eventually; when it lands, set
// PICASSO_DOCS_URL in Vercel's environment and every generated link follows.
// Nothing else references the host, which is the point of it living here.
const SITE = (process.env.PICASSO_DOCS_URL ?? "https://ir-picasso.vercel.app").replace(/\/$/, "");

const walk = (dir, acc = []) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (e.name.endsWith(".md")) acc.push(p);
  }
  return acc;
};

const frontmatter = (src) => {
  const m = /^---\n([\s\S]*?)\n---\n/.exec(src);
  if (!m) return [{}, src];
  const meta = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return [meta, src.slice(m[0].length)];
};

/* ---- docs pages ------------------------------------------------------- */

const pages = walk(join(ROOT, "docs")).sort().map((path) => {
  const [meta, body] = frontmatter(readFileSync(path, "utf8"));
  const rel = relative(ROOT, path).replace(/\\/g, "/");
  return {
    rel,
    isIndex: rel.endsWith("README.md"),
    // Pages render under /docs on the site; a `.md` suffix returns the page's markdown.
    url: `${SITE}/docs/${rel.replace(/^docs\//, "").replace(/\/?README\.md$/, "").replace(/\.md$/, "")}`.replace(/\/$/, ""),
    section: rel.split("/")[1] === rel.split("/").pop() ? "root" : rel.split("/")[1],
    title: meta.title ?? rel,
    description: meta.description ?? "",
    body: body.trim(),
  };
});

/* ---- repo-root pages ---------------------------------------------------
 * AGENTS.md and CHANGELOG.md are read in the repo, not served by the site, so
 * the walk above never saw them — which is how section 6's RTL rules came to
 * be absent from every generated file while still being the law of the repo.
 * They are listed by path, because nothing serves them a URL.
 */

const firstSentence = (body) => {
  for (const line of body.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#") || t.startsWith("---")) continue;
    return t.replace(/[*`]/g, "").split(/(?<=\.)\s/)[0];
  }
  return "";
};

const repoPages = ["AGENTS.md", "CHANGELOG.md"]
  .filter((rel) => existsSync(join(ROOT, rel)))
  .map((rel) => {
    const [meta, body] = frontmatter(readFileSync(join(ROOT, rel), "utf8"));
    const trimmed = body.trim();
    return {
      rel,
      title: meta.title ?? rel,
      description: meta.description ?? firstSentence(trimmed),
      body: trimmed,
    };
  });

/* ---- components ------------------------------------------------------- */

const compDir = join(ROOT, "packages/ui/src/components");
const components = existsSync(compDir)
  ? readdirSync(compDir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => {
      const g = join(compDir, e.name, "guidance.json");
      if (!existsSync(g)) return null;
      // The component file is the one named after the folder — the same rule
      // build-component-docs.mjs uses, so the two outputs read one source.
      const file = join(compDir, e.name, `${e.name}.tsx`);
      const src = existsSync(file) ? readFileSync(file, "utf8") : "";
      return {
        ...JSON.parse(readFileSync(g, "utf8")),
        api: { exports: exportsOf(src), props: props(src), variants: variants(src), warnings: warnings(src) },
      };
    }).filter(Boolean)
  : [];

/* The API first, then the guidance. An agent picks the component, then needs
 * to know what to pass it; it used to have to open the .tsx to find out. Every
 * line below is lifted from the source by scripts/lib/component-api.mjs, so it
 * cannot drift from the component it describes. */
const componentText = (c) => {
  const lines = [`## ${c.component}`, "", c.summary, ""];
  if (c.structureFrom) lines.push(`Structure from ${c.structureFrom}; measurements from ${c.measurementsFrom}.`, "");

  const api = c.api ?? {};
  if (api.exports?.length) {
    lines.push(`Import: import { ${api.exports.join(", ")} } from "@ir/ui";`);
  }
  for (const g of api.props ?? []) {
    lines.push("", `Props (${g.name}):`);
    for (const m of g.members) {
      lines.push(`- ${m.name}${m.optional ? "?" : ""}: ${m.type}${m.doc ? ` — ${m.doc}` : ""}`);
    }
  }
  if (api.variants?.length) {
    lines.push("", "Variants:");
    for (const v of api.variants) {
      lines.push(`- ${v.name}: ${v.options.join(" | ")}${v.default ? ` (default ${v.default})` : ""}`);
    }
  }
  if (api.warnings?.length) {
    lines.push("", "Watch out:", ...api.warnings.map((w) => `- ${w}`));
  }

  if (c.pairs?.length) lines.push("");
  for (const p of c.pairs ?? []) {
    lines.push(`- DON'T ${p.dont}`, `  DO ${p.do}`, `  WHY ${p.why}`);
  }
  if (c.a11y?.length) lines.push("", "Accessibility:", ...c.a11y.map((a) => `- ${a}`));
  return lines.join("\n");
};

/* ---- resolved token table --------------------------------------------- */
/* The highest-value file we can publish: an agent without the resolved token
 * table invents hex codes; an agent with it cannot. */

const tokensCss = readFileSync(join(ROOT, "packages/tokens/dist/tokens.css"), "utf8");
const scopeOf = (css, selector) => {
  const i = css.indexOf(selector);
  if (i < 0) return "";
  const open = css.indexOf("{", i);
  let depth = 0;
  for (let j = open; j < css.length; j++) {
    if (css[j] === "{") depth++;
    else if (css[j] === "}" && --depth === 0) return css.slice(open + 1, j);
  }
  return "";
};
const varsIn = (block, prefix) =>
  [...block.matchAll(new RegExp(`--(${prefix}-[a-z0-9-]+):\\s*([^;]+);`, "g"))]
    .map((m) => [m[1], m[2].trim()]);

const light = scopeOf(tokensCss, ":root");
const dark = scopeOf(tokensCss, ".dark");
const resolve = (block, value) => {
  let v = value, guard = 0;
  while (/^var\(--/.test(v) && guard++ < 10) {
    const name = v.slice(6, v.indexOf(")"));
    const m = new RegExp(`--${name}:\\s*([^;]+);`).exec(block) || new RegExp(`--${name}:\\s*([^;]+);`).exec(light);
    if (!m) break;
    v = m[1].trim();
  }
  return v;
};

const tokenLines = [];
for (const family of ["bg", "fg", "border", "status", "chart"]) {
  const rows = varsIn(light, family);
  if (!rows.length) continue;
  tokenLines.push(`## ${family}/*  (${rows.length})`, "");
  tokenLines.push("| token | utility | light | dark |", "|---|---|---|---|");
  const word = { bg: "surface", fg: "content", border: "line", status: "status", chart: "chart" }[family];
  for (const [name, value] of rows) {
    const short = name.replace(new RegExp(`^${family}-`), "");
    const darkRaw = new RegExp(`--${name}:\\s*([^;]+);`).exec(dark);
    tokenLines.push(
      `| ${family}/${short.replace(/-/g, "/")} | \`${word}-${short}\` | ${resolve(light, value)} | ${darkRaw ? resolve(dark, darkRaw[1].trim()) : "(same)"} |`,
    );
  }
  tokenLines.push("");
}

/* ---- emit ------------------------------------------------------------- */

mkdirSync(OUT, { recursive: true });
const header = (what) =>
  `# Picasso — ${what}\n\nIntegrated Research's design system. Generated from the repo, which is the source of truth.\nGenerated ${new Date().toISOString().slice(0, 10)}.\n`;

const index = [
  header("documentation index"),
  "Each line links to the page's own markdown.\n",
  ...["get-started", "foundations", "content", "contributing", "releases"].flatMap((s) => {
    const inSection = pages.filter((p) => p.rel.startsWith(`docs/${s}/`));
    return inSection.length
      ? [`## ${s}`, "", ...inSection.map((p) => `- [${p.title}](${p.url}${p.isIndex ? "" : ".md"}): ${p.description}`), ""]
      : [];
  }),
  components.length ? `## components\n\n${components.map((c) => `- ${c.component}: ${c.summary}`).join("\n")}\n` : "",
  repoPages.length
    ? `## in the repo\n\nNot served by the site. Read them where they live.\n\n${repoPages
        .map((p) => `- \`${p.rel}\` — ${p.description}`)
        .join("\n")}\n`
    : "",
  `## other files\n`,
  `- ${SITE}/llms-full.txt — everything, concatenated`,
  `- ${SITE}/llms-foundations.txt — grid, spacing, radius, typography, colour, content`,
  `- ${SITE}/llms-components.txt — component guidance only`,
  `- ${SITE}/llms-tokens.txt — the resolved semantic token table`,
].join("\n");

const section = (names) =>
  pages.filter((p) => names.some((n) => p.rel.startsWith(`docs/${n}/`))).map((p) => p.body).join("\n\n---\n\n");

const files = {
  "llms.txt": index,
  "llms-full.txt": header("full documentation") + "\n" +
    [...pages, ...repoPages].map((p) => p.body).join("\n\n---\n\n") +
    (components.length ? "\n\n---\n\n# Components\n\n" + components.map(componentText).join("\n\n") : "") +
    "\n\n---\n\n# Tokens\n\n" + tokenLines.join("\n"),
  "llms-foundations.txt": header("foundations and content") + "\n" + section(["foundations", "content"]),
  "llms-components.txt": header("component guidance") + "\n" + components.map(componentText).join("\n\n"),
  "llms-tokens.txt": header("resolved semantic tokens") +
    "\nNever use a raw hex. Every colour in Picasso is one of these.\n\n" + tokenLines.join("\n"),
};

for (const [name, body] of Object.entries(files)) {
  writeFileSync(join(OUT, name), body.trimEnd() + "\n");
}

console.log(
  `${Object.keys(files).length} files → public/\n` +
  `  ${pages.length} doc pages, ${repoPages.length} repo pages, ${components.length} components, ` +
  `${tokenLines.filter((l) => l.startsWith("| ")).length - 5} tokens`,
);
