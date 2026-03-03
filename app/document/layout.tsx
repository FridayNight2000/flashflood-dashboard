import React from 'react';

import DocSidebar from './components/DocSidebar';

export default function DocumentLayout({ children }: { children: React.ReactNode }) {
  return (
    // Outer container: ensures it occupies the outer viewport, uses vertical layout, sets background to white and clear font color
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-white text-slate-900">
      {/* Top main content: horizontal layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left fixed width navigation bar */}
        <DocSidebar />

        {/* Right main content area: adaptive remaining width, allows independent scrolling */}
        <main className="flex-1 overflow-y-auto py-12">{children}</main>
      </div>
    </div>
  );
}
