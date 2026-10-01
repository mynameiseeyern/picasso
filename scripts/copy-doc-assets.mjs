#!/usr/bin/env node
/**
 * Copies the diagrams that live beside the docs into the site's public folder.
 *
 *   docs/**\/*.svg  →  apps/site/public/diagrams/**\/*.svg
 *
 * `docs/` is the source of truth, so a diagram is versioned with the page it
 * belongs to rather than with the app that happens to render it. Next only
 * serves files from `public/`, so they are copied in before dev and before
 * build — both, or the image is missing in exactly one of them.
 */
import { readdirSync, mkdirSync, copyFileSync, rmSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "docs");
const DEST = join(ROOT, "apps/site/public/diagrams");

const walk = (dir, acc = []) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (e.name.endsWith(".svg")) acc.push(p);
  }
  return acc;
};

rmSync(DEST, { recursive: true, force: true });
const files = walk(SRC);
for (const f of files) {
  const out = join(DEST, relative(SRC, f));
  mkdirSync(dirname(out), { recursive: true });
  copyFileSync(f, out);
}
console.log(`${files.length} diagram${files.length === 1 ? "" : "s"} → apps/site/public/diagrams/`);
