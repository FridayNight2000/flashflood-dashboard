import './globals.css';

import { SpeedInsights } from '@vercel/speed-insights/next';
import { GeistMono } from 'geist/font/mono';
import { GeistPixelSquare } from 'geist/font/pixel';
import { GeistSans } from 'geist/font/sans';
import type { Metadata } from 'next';

import type { RootLayoutProps } from '@/types';

export const metadata: Metadata = {
  title: 'Flashflood Demo',
  description: 'Japan flash flood database demo',
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} ${GeistMono.variable} ${GeistPixelSquare.variable}`}>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
