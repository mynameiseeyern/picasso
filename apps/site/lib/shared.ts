import { createGetUrl } from 'fumadocs-core/source';

export const appName = 'Picasso';
export const docsRoute = '/docs';
export const docsContentRoute = '/llms.mdx/docs';
export const componentsRoute = '/components';

export const gitConfig = {
  user: 'ee-ng-ir',
  repo: 'picasso',
  branch: 'main',
};

const getContentUrl = createGetUrl(docsContentRoute);

export function getPageMarkdownUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'content.md'];
  return { segments, url: getContentUrl(segments, page.locale) };
}
