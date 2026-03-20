import { DM_Sans, JetBrains_Mono } from 'next/font/google';
import React from 'react';

import DocumentSidebar from './components/DocumentSidebar';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-doc-sans',
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-doc-mono',
});

export default function DocLayout({ children }: { children: React.ReactNode }) {
  const topOffset = 24;
  const bottomOffset = 48;

  return (
    // Outer container: ensures it occupies the outer viewport, uses vertical layout, sets background to white and clear font color
    <div
      className={`${dmSans.variable} ${jetBrainsMono.variable} absolute inset-0 flex min-h-0 flex-col overflow-hidden bg-white text-slate-900`}
    >
      {/* Top main content: horizontal layout */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left fixed width navigation bar */}
        <DocumentSidebar
          topOffset={topOffset}
          bottomOffset={bottomOffset}
        />

        {/* Right main content area: adaptive remaining width, allows independent scrolling */}
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div
            className="min-w-0"
            style={{ paddingTop: topOffset, paddingBottom: bottomOffset }}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
