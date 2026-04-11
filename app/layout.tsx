import './globals.css';

import { SpeedInsights } from '@vercel/speed-insights/next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import type { Metadata } from 'next';

import CrtLayoutClient from '@/components/ui/crt/CrtLayoutClient';
import type { RootLayoutProps } from '@/types';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: 'Flashflood Demo',
  description: 'Japan flash flood database demo',
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable}`}>
        <CrtLayoutClient>{children}</CrtLayoutClient>
        <SpeedInsights />
      </body>
    </html>
  );
}
