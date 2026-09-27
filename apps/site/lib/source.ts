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

export const source = loader({
  baseUrl: docsRoute,
  source: docs.toFumadocsSource(),
  // README.md is each folder's index page, matching how the folder reads on GitHub.
  slugs: (info) => {
    const slugs = info.path.replace(/\.mdx?$/, '').split('/');
    if (slugs.at(-1)?.toLowerCase() === 'readme') slugs.pop();
    return slugs;
  },
});

export const docsLlms = llms(source, {
  renderPage: async (page) => `# ${page.data.title} (${page.url})

${await page.data.getText('processed')}`,
});
