import Image from 'next/image';
import { AppShell } from '@/components/layout/AppShell';
import { SplashGate } from '@/components/layout/SplashGate';
import { DialogueBubble } from '@/components/ui/DialogueBubble';
import { HomeActions } from '@/app/HomeActions';
import { LOGO_SRC } from '@/lib/assets/paths';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <SplashGate>
      <AppShell sky="nebula">
        <div className={styles.hero}>
          <Image
            src={LOGO_SRC}
            alt="Mission Cosmos"
            width={160}
            height={168}
            className={styles.logo}
            priority
          />
          <h1 className={styles.brand}>Mission Cosmos</h1>
          <div className={styles.guide}>
            <DialogueBubble speaker="Guide" pose="welcome">
              Prêt à explorer la Terre, la Lune et bien plus loin ?
            </DialogueBubble>
          </div>
          <HomeActions />
        </div>
      </AppShell>
    </SplashGate>
  );
}
