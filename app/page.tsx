import type { Metadata } from 'next';
import Link from 'next/link';

import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Flash-Flood Database in Japan',
  description: 'Explore flash-flood stations and event insights across Japan.',
};

export default function Home() {
  return (
    <main className={styles.hero}>
      <h1>
        <span>Flash-Flood Database</span> in JAPAN
      </h1>
      <Link
        href="/map"
        className={styles.cta}
      >
        Explore
      </Link>
    </main>
  );
}
