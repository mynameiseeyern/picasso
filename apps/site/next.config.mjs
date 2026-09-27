import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // Storybook is a static build copied into public/components by
  // scripts/nest-storybook.mjs. Next does not serve directory indexes from
  // public/, so the bare section URL needs pointing at its index.html.
  async rewrites() {
    return [{ source: '/components', destination: '/components/index.html' }];
  },
};

export default withMDX(config);
