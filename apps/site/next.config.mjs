import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  /* Storybook is a static build copied into public/components by
   * scripts/nest-storybook.mjs. Next does not serve directory indexes from
   * public/, so the bare section URL is pointed at its index.html. (The nest
   * script gives that file a <base href> so its relative assets resolve from
   * /components without a trailing slash.) */
  async rewrites() {
    return [{ source: '/components', destination: '/components/index.html' }];
  },
};

export default withMDX(config);
