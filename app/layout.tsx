import './globals.css';

import { SpeedInsights } from '@vercel/speed-insights/next';
import { GeistSans } from 'geist/font/sans';
import type { Metadata } from 'next';

import CrtLayoutClient from '@/components/ui/crt/CrtLayoutClient';
import type { RootLayoutProps } from '@/types';

export const metadata: Metadata = {
  title: 'Flashflood Demo',
  description: 'Japan flash flood database demo',
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={GeistSans.variable}>
        <CrtLayoutClient>{children}</CrtLayoutClient>
        <SpeedInsights />
      </body>
    </html>
  );
}
