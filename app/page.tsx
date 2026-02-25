import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.hero}>
      <h1>
        <span>Flashflood Database</span> in JAPAN
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
