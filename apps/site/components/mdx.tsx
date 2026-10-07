import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { Story } from './story';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    /* Every doc opens with an H1 so it reads properly on GitHub; the page
     * already renders the title from frontmatter, so the body's H1 is dropped
     * rather than shown twice. */
    h1: () => null,
    /* A live Storybook story in the middle of a page — see ./story.tsx. */
    Story,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
