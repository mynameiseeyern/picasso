import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import localFont from 'next/font/local';
import type { Metadata } from 'next';

/* Brand fonts (design.md §5): Oswald 700 for headlines, Poppins 300/400/600
 * for everything else. Self-hosted (Google Fonts is not reachable from every
 * build environment); Lato is the web fallback and is declared in CSS. */
const oswald = localFont({
  src: '../fonts/oswald-latin-700-normal.woff2',
  weight: '700',
  variable: '--font-oswald',
  display: 'swap',
});
const poppins = localFont({
  src: [
    { path: '../fonts/poppins-latin-300-normal.woff2', weight: '300' },
    { path: '../fonts/poppins-latin-400-normal.woff2', weight: '400' },
    { path: '../fonts/poppins-latin-600-normal.woff2', weight: '600' },
  ],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'Picasso — IR design system', template: '%s · Picasso' },
  description:
    "Picasso is Integrated Research's design system: tokens, components, foundations and content guidance for every IR product.",
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en-AU" className={`${oswald.variable} ${poppins.variable} font-sans`} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
