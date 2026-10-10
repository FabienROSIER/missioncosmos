import type { ReactNode } from 'react';
import { AppShell, ScrollRegion } from '@/components/layout/AppShell';
import { SiteFooter } from '@/components/layout/SiteFooter';
import styles from './PublicInfoPage.module.css';

type PublicInfoPageProps = {
  title: string;
  children: ReactNode;
};

/** Page texte secondaire (à propos, confidentialité, contact). */
export function PublicInfoPage({ title, children }: PublicInfoPageProps) {
  return (
    <AppShell title={title} sky="starfield">
      <article className={styles.page}>
        <ScrollRegion>
          <div className={styles.inner}>
            {children}
            <SiteFooter />
          </div>
        </ScrollRegion>
      </article>
    </AppShell>
  );
}
