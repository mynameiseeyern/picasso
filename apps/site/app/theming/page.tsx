import type { Metadata } from 'next';
import { ThemeBuilder } from '@/components/theme-builder';

export const metadata: Metadata = {
  title: 'Theming',
  description: 'Create a brand for Picasso: one colour, a neutral, radius, spacing and type. Preview it on real components and export the tokens.',
};

export default function ThemingPage() {
  return <ThemeBuilder />;
}
