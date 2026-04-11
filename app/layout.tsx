import './globals.css';

import { SpeedInsights } from '@vercel/speed-insights/next';
import { GeistPixelGrid } from 'geist/font/pixel';
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

const geistPixelGrid = GeistPixelGrid;

export const metadata: Metadata = {
  title: 'Flashflood Demo',
  description: 'Japan flash flood database demo',
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${geistPixelGrid.variable}`}
    >
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=LINE+Seed+JP:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <CrtLayoutClient>{children}</CrtLayoutClient>
        <SpeedInsights />
      </body>
    </html>
  );
}
