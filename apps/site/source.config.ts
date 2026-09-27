import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';

/* The docs are the repo's `docs/` folder — the source of truth for everything
 * written about Picasso. The site renders them; it does not own them.
 *
 * This is the config API rather than `fumadocs-mdx/macro`. The macro inlines
 * the collection at compile time, which works under webpack but not under
 * Turbopack — the transform never runs, `.source/macro` comes out empty, and
 * the build fails claiming lib/source.ts has no `source` export. Next 16
 * defaults to Turbopack, and its webpack path then dies elsewhere, so the
 * config API is the one that works: `fumadocs-mdx` generates `.source` as real
 * files before the build, and nothing depends on a bundler transform.
 */
export const docs = defineDocs({
  dir: '../../docs',
  docs: {
    schema: pageSchema,
    postprocess: { includeProcessedMarkdown: true },
  },
  meta: { schema: metaSchema },
});

export default defineConfig();
