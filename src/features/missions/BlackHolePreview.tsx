'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { SafeBackButton } from '@/components/layout/SafeBackButton';
import { Companion } from '@/components/game/Companion';
import {
  BLACK_HOLE_GUIDE_INTRO,
  BLACK_HOLE_VIEWS,
  type BlackHoleView,
} from '@/content/bodies/blackHolePreview';
import styles from './BlackHolePreview.module.css';

const BlackHoleScene = dynamic(
  () => import('@/3d/scenes/BlackHoleScene').then((module) => module.BlackHoleScene),
  { ssr: false },
);

/** Visual work-in-progress: deliberately does not record mission completion. */
export function BlackHolePreview() {
  const [view, setView] = useState<BlackHoleView>('disk');
  const detail = BLACK_HOLE_VIEWS.find((entry) => entry.id === view)!;
  return (
    <section className={styles.preview}>
      <header className={styles.bar}>
        <SafeBackButton compact fallbackHref="/missions" preferFallback label="Quitter" />
        <h1>Les trous noirs</h1>
        <span>Aperçu visuel</span>
      </header>
      <div className={styles.stage}>
        <BlackHoleScene view={view} />
      </div>
      <aside className={styles.guide} aria-label="Guide de l’observatoire">
        <div className={styles.intro}>
          <Companion pose="thinking" size="sm" />
          <div>
            <small>MISSION 13</small>
            <h2>Explorer l’invisible</h2>
          </div>
        </div>
        <details className={styles.basics} open>
          <summary>{BLACK_HOLE_GUIDE_INTRO.title}</summary>
          <p>{BLACK_HOLE_GUIDE_INTRO.body}</p>
        </details>
        <div className={styles.views} aria-label="Choisir une observation">
          {BLACK_HOLE_VIEWS.map((entry, index) => (
            <button
              key={entry.id}
              aria-pressed={view === entry.id}
              onClick={() => setView(entry.id)}
            >
              <span>0{index + 1}</span>
              {entry.label}
            </button>
          ))}
        </div>
        <p className={styles.explanation} aria-live="polite">
          {detail.body}
        </p>
        <p className={styles.hint}>
          {view === 'horizon'
            ? 'Une coupe simplifiée pour comprendre la limite.'
            : 'Fais glisser pour tourner. Pince ou utilise la molette pour zoomer.'}
        </p>
        <p className={styles.status}>
          Prototype visuel · les défis et le quiz arrivent dans la prochaine étape.
        </p>
      </aside>
    </section>
  );
}
