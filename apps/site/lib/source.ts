import { llms, loader } from 'fumadocs-core/source';
import { defineDocs } from 'fumadocs-mdx/macro';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { docsRoute } from './shared';

/* The docs are the repo's `docs/` folder — the source of truth for everything
 * written about Picasso. The site renders them; it does not own them. */
const docs = defineDocs({
  dir: '../../docs',
  docs: {
    schema: pageSchema,
    postprocess: { includeProcessedMarkdown: true },
  },
  meta: { schema: metaSchema },
});

/* Each folder's README.md is its index page — that is how the folder reads on
 * GitHub, and Fumadocs wants the same file called index.md. Rename it on the
 * way in rather than in the repo. */
const raw = docs.toFumadocsSource();
const files = raw.files.map((file) => ({
  ...file,
  path: file.path.replace(/(^|\/)README\.md$/i, '$1index.md'),
}));

export const source = loader({
  baseUrl: docsRoute,
  source: { ...raw, files } as typeof raw,
});

export const docsLlms = llms(source, {
  renderPage: async (page) => `# ${page.data.title} (${page.url})

${await page.data.getText('processed')}`,
});
