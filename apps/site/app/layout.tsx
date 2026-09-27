import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import { Oswald, Poppins } from 'next/font/google';
import type { Metadata } from 'next';

/* Brand fonts (design.md §5): Oswald 700 for headlines, Poppins 300/400/600
 * for everything else. Lato is the web fallback and is declared in CSS. */
const oswald = Oswald({ subsets: ['latin'], weight: ['700'], variable: '--font-oswald' });
const poppins = Poppins({ subsets: ['latin'], weight: ['300', '400', '600'], variable: '--font-poppins' });

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
