import Link from 'next/link';
import styles from './SiteFooter.module.css';

const LINKS = [
  { href: '/a-propos', label: 'À propos' },
  { href: '/confidentialite', label: 'Confidentialité' },
  { href: '/contact', label: 'Contact' },
] as const;

/** Liens secondaires pour les adultes. Hors du parcours de jeu. */
export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <nav aria-label="Informations">
        <ul className={styles.list}>
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={styles.link}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </footer>
  );
}
