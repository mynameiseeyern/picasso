import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appName, componentsRoute, docsRoute, gitConfig } from './shared';

/* Shared nav for the landing page and the docs. The IR icon is the supplied
 * file, unaltered (brand §4); Picasso is the product name beside it. */
export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="flex items-center gap-2.5">
          <img src="/brand/ir-icon-light.svg" alt="Integrated Research" className="h-6 w-6 dark:hidden" />
          <img src="/brand/ir-icon-dark.svg" alt="Integrated Research" className="h-6 w-6 hidden dark:block" />
          <span className="font-semibold tracking-tight">{appName}</span>
        </span>
      ),
      url: '/',
    },
    /* Three links, not six. Get started, Foundations, Content and Releases all
     * live under /docs and the sidebar already lists them — repeating them up
     * here made the top nav a second table of contents competing with the
     * real one, and six items is past the point where anyone reads them. */
    links: [
      { text: 'Docs', url: docsRoute, active: 'nested-url' },
      { text: 'Theming', url: '/theming', active: 'nested-url' },
      { text: 'Components', url: componentsRoute, active: 'nested-url' },
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
