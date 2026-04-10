import type { Metadata } from 'next';

import MapPageClient from './MapPageClient';


export const metadata: Metadata = {
  title: 'Database | Flash-Flood Database',
  description: 'Interactive station and basin database for flash-flood events in Japan.',
};

export default function DatabasePage() {
  return (
    <main className="w-full h-full">
      <MapPageClient />
    </main>
  );
}
