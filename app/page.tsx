import type { Metadata } from 'next';

import styles from './page.module.css';
import PasswordForm from './PasswordForm';

export const metadata: Metadata = {
  title: 'Flash-Flood Database in Japan',
  description: 'Explore flash-flood stations and event insights across Japan.',
};

export default function Home() {
  return (
    <div className={styles.homePage}>
      <div className={styles.homeInner}>
        {/* 3. LOGO */}
        <div className={styles.homeHeader}>
          <div className={styles.homeLogo}>FLASH-FLOOD</div>
          <div className={styles.homeTagline}>JAPAN DATABASE · 2002 - 2023</div>
        </div>
        {/* 4. Password Input */}
        <PasswordForm />
      </div>
    </div>
  );
}
