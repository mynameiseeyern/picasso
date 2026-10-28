/**
 * The design system as data.
 *
 * `scripts/build-llms.mjs` writes `public/catalogue.json` in the same run that
 * writes the five `llms*.txt` files, from the same component sources and the
 * same compiled `tokens.css`. Importing it rather than reading
 * `packages/ui/src/components` at request time is deliberate: a route handler
 * is traced and bundled, so a directory it only reads at runtime would not be
 * deployed with it.
 *
 * It is a generated file and gitignored. `npm run build:llms` makes it; both
 * `build:site` and `dev:site` run that first, so it exists before Next starts.
 */
import data from "@/public/catalogue.json";

export interface PropMember {
  name: string;
  optional: boolean;
  type: string;
  doc?: string;
}

export interface ComponentEntry {
  name: string;
  slug: string;
  url: string;
  summary: string;
  figma: { fileKey: string; nodeId: string } | null;
  api: {
    exports: string[];
    props: { name: string; members: PropMember[] }[];
    variants: { name: string; options: string[]; default?: string }[];
    warnings: string[];
  };
  pairs: { id?: string; dont: string; do: string; why: string }[];
  a11y: string[];
  text: string;
}

export interface TokenRow {
  family: string;
  token: string;
  utility: string;
  light: string;
  dark: string;
}

export interface PageEntry {
  title: string;
  description: string;
  url: string | null;
  path: string;
  section: string;
  body: string;
}

export interface Catalogue {
  version: string;
  generated: string;
  site: string;
  components: ComponentEntry[];
  tokens: TokenRow[];
  pages: PageEntry[];
}

export const catalogue = data as unknown as Catalogue;

export const TOKEN_FAMILIES = [...new Set(catalogue.tokens.map((t) => t.family))];
export const SECTIONS = [...new Set(catalogue.pages.map((p) => p.section))].sort();
