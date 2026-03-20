import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Developer Guide',
};

export default function DeveloperGuidePage() {
  return (
    <div className="bg-white">
      <div className="max-w-[1100px] p-6">
        <div className="space-y-6">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            WORK IN PROCESSING
          </h1>
        </div>
      </div>
    </div>
  );
}
