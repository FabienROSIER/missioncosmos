import Image from 'next/image';
import { AppShell } from '@/components/layout/AppShell';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SplashGate } from '@/components/layout/SplashGate';
import { DialogueBubble } from '@/components/ui/DialogueBubble';
import { HomeActions } from '@/app/HomeActions';
import { LOGO_SRC } from '@/lib/assets/paths';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <SplashGate>
      <AppShell sky="nebula">
        <div className={`${styles.hero} ui-stagger`}>
          <Image
            src={LOGO_SRC}
            alt="Mission Cosmos"
            width={160}
            height={168}
            className={styles.logo}
            priority
          />
          <div className={styles.intro}>
            <h1 className={styles.brand}>Mission Cosmos</h1>
            <p className={styles.tagline}>Explore l’Univers en jouant.</p>
            <p className={styles.audience}>Jeu éducatif gratuit pour les 6–12 ans.</p>
            <ul className={styles.promises}>
              <li>Gratuit</li>
              <li>Sans publicité</li>
              <li>Sans compte</li>
              <li>Aucune donnée personnelle collectée</li>
            </ul>
            <p className={styles.pitch}>
              Mission Cosmos est un jeu éducatif gratuit consacré à l’astronomie,
              destiné principalement aux enfants de 6 à 12 ans.
            </p>
          </div>
          <div className={styles.guide}>
            <DialogueBubble speaker="Guide" pose="welcome">
              Prêt à explorer la Terre, la Lune et bien plus loin ?
            </DialogueBubble>
          </div>
          <HomeActions />
          <div className={styles.legal}>
            <SiteFooter />
          </div>
        </div>
      </AppShell>
    </SplashGate>
  );
}
