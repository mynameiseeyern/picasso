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
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, copyFileSync } from "node:fs";
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

rmSync(DEST, { recursive: true, force: true });
mkdirSync(DEST, { recursive: true });
cpSync(SB, DEST, { recursive: true });

const llms = readdirSync(join(ROOT, "public")).filter((f) => /^llms.*\.txt$/.test(f));
for (const f of llms) copyFileSync(join(ROOT, "public", f), join(PUBLIC, f));

console.log(`nest-storybook: Storybook → /components, ${llms.length} llms file(s) → /`);
