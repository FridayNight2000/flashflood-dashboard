import type { Metadata } from 'next';

import MapPageClient from './MapPageClient';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Map | Flash-Flood Database',
  description: 'Interactive station and basin map for flash-flood events in Japan.',
};

export default function MapPage() {
  return (
    <main className={styles.map}>
      <MapPageClient />
    </main>
  );
}
