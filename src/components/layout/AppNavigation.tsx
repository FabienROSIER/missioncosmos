'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './AppShell.module.css';

const NAV = [
  { href: '/', label: 'Accueil' },
  { href: '/missions', label: 'Carte' },
  { href: '/collection', label: 'Collection' },
  { href: '/profil', label: 'Profil' },
  { href: '/settings', label: 'Réglages' },
] as const;

export function AppNavigation() {
  const pathname = usePathname().replace(/\/$/, '') || '/';

  return (
    <nav className={styles.nav} aria-label="Navigation principale">
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={styles.navLink}
          aria-current={pathname === item.href ? 'page' : undefined}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
