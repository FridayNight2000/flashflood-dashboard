import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import React from 'react';

import { WizardProvider } from '@/lib/hydro/context';

export const metadata: Metadata = {
  title: 'PREP | Hydrological Data Processing Tool',
  description:
    'Web tool for cleaning and detrending hydrological data, and detecting flash flood events.',
};

export default function PrepLayout({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-slate-50 font-sans text-slate-900">
      <main className="min-h-0 flex-1 flex flex-col overflow-y-auto px-6 py-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <WizardProvider>{children}</WizardProvider>
      </main>
    </div>
  );
}
