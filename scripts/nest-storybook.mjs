#!/usr/bin/env node
/**
 * Nests the Storybook build under the site as its Components section, and
 * copies the generated llms*.txt files to the site root.
 *
 *   packages/ui/storybook-static  →  apps/site/public/components
 *   public/llms*.txt              →  apps/site/public/
 *
 * Storybook is one rendering of the system; the site is the front door.
 */
import { existsSync, mkdirSync, readdirSync, rmSync, copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SB = join(ROOT, "packages/ui/storybook-static");
const PUBLIC = join(ROOT, "apps/site/public");
const DEST = join(PUBLIC, "components");

if (!existsSync(SB)) {
  console.error("nest-storybook: no Storybook build at packages/ui/storybook-static — run build-storybook first");
  process.exit(1);
}

/* Plain recursive copy — fs.cpSync also tries to replicate directory modes,
 * which some mounted filesystems refuse. */
const copyDir = (from, to) => {
  mkdirSync(to, { recursive: true });
  for (const e of readdirSync(from, { withFileTypes: true })) {
    const src = join(from, e.name);
    const dst = join(to, e.name);
    if (e.isDirectory()) copyDir(src, dst);
    else copyFileSync(src, dst);
  }
};

rmSync(DEST, { recursive: true, force: true });
copyDir(SB, DEST);

/* Storybook's index.html loads everything by relative path (./sb-manager/…).
 * The site serves it at /components — no trailing slash — where a relative
 * path would resolve from the site root. A <base href> pins it. */
const index = join(DEST, "index.html");
writeFileSync(index, readFileSync(index, "utf8").replace(/<head>/i, '<head><base href="/components/">'));

const llms = readdirSync(join(ROOT, "public")).filter((f) => /^llms.*\.txt$/.test(f));
for (const f of llms) copyFileSync(join(ROOT, "public", f), join(PUBLIC, f));

console.log(`nest-storybook: Storybook → /components, ${llms.length} llms file(s) → /`);
