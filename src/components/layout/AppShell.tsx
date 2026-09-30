import Link from 'next/link';
import { StarfieldBackground } from '@/components/layout/StarfieldBackground';
import { AppNavigation } from '@/components/layout/AppNavigation';
import styles from './AppShell.module.css';

type AppShellProps = {
  children: React.ReactNode;
  title?: string;
  showNav?: boolean;
  immersive?: boolean;
  /** Fond spatial UI (ignoré en mission immersive 3D) */
  sky?: 'starfield' | 'nebula' | 'milky-way' | false;
};

export function AppShell({
  children,
  title,
  showNav = true,
  immersive = false,
  sky = 'starfield',
}: AppShellProps) {
  const shellClass = [styles.shell, immersive ? styles.immersive : ''].filter(Boolean).join(' ');
  const contentClass = [styles.content, immersive ? styles.contentImmersive : '']
    .filter(Boolean)
    .join(' ');
  const showSky = !immersive && sky !== false;

  return (
    <div className={shellClass}>
      {showSky ? <StarfieldBackground variant={sky} /> : null}
      {!immersive ? (
        <header className={styles.header}>
          <Link href="/" className={styles.brand}>
            Mission Cosmos
          </Link>
          {title ? <p className={styles.pageTitle}>{title}</p> : null}
        </header>
      ) : null}
      <div className={contentClass}>{children}</div>
      {showNav && !immersive ? <AppNavigation /> : null}
    </div>
  );
}

export function ScrollRegion({ children }: { children: React.ReactNode }) {
  return <div className={styles.scrollRegion}>{children}</div>;
}
