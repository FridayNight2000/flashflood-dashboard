'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import styles from './CrtShell.module.css';

type CrtShellProps = {
  expanded?: boolean;
  children: React.ReactNode;
  className?: string;
  styleVars?: React.CSSProperties & { [key: `--${string}`]: string };
};

export default function CrtShell({ expanded, children, className, styleVars }: CrtShellProps) {
  const pathname = usePathname();

  return (
    <div className={styles.pageBg}>
      <div
        className={[styles.shell, expanded ? styles.expanded : '', className]
          .filter(Boolean)
          .join(' ')}
        style={styleVars}
      >
        <div
          className={`${styles.shellTopBar} ${pathname === '/' ? styles.shellTopBarCenter : ''}`}
        >
          {pathname !== '/' && (
            <nav className={styles.shellNav}>
              <Link
                href="/map"
                className={`${styles.navBtn} ${pathname.startsWith('/map') ? styles.navBtnActive : ''}`}
              >
                <span className={styles.navIndicator} /> DATABASE
              </Link>
              <Link
                href="/document"
                className={`${styles.navBtn} ${pathname.startsWith('/document') ? styles.navBtnActive : ''}`}
              >
                <span className={styles.navIndicator} /> DOC
              </Link>
            </nav>
          )}
          <div className={styles.brandTitle}>KINOUCHI LABORATORY</div>
        </div>

        <div className={styles.bezel}>
          <div className={styles.screen}>
            <div className={styles.content}>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
