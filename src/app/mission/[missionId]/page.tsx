import { AppShell } from '@/components/layout/AppShell';
import { MissionImmersive } from '@/components/layout/MissionImmersive';
import { SafeBackButton } from '@/components/layout/SafeBackButton';
import { DialogueBubble } from '@/components/ui/DialogueBubble';
import { MISSION_CATALOG } from '@/content/missions/catalog';
import { getMissionById } from '@/content/missions';
import { missionsMapHref } from '@/features/universe/zoneStatus';
import styles from './mission.module.css';

type MissionPageProps = {
  params: Promise<{ missionId: string }>;
};

const PLAYABLE_SCENES = new Set([
  'earth-preview',
  'day-night',
  'moon-phases',
  'eclipses',
  'solar-system',
  'orbits',
  'seasons',
  'stars',
  'stellar-light',
  'constellations',
  'milky-way',
  'galaxies',
  'cosmic-distances',
  'black-holes',
]);

/** Export statique : une page HTML par mission du catalogue. */
export function generateStaticParams() {
  return MISSION_CATALOG.map((entry) => ({ missionId: entry.id }));
}

export default async function MissionPage({ params }: MissionPageProps) {
  const { missionId } = await params;
  const mission = getMissionById(missionId);

  if (mission && PLAYABLE_SCENES.has(mission.sceneId)) {
    return (
      <AppShell immersive showNav={false}>
        <MissionImmersive mission={mission} />
      </AppShell>
    );
  }

  return (
    <AppShell title="Mission" showNav={false}>
      <div className={styles.root}>
        <SafeBackButton
          fallbackHref={missionsMapHref(missionId)}
          label="Quitter la mission"
          preferFallback
        />
        <h1 className={styles.title}>Mission en préparation</h1>
        <p className={styles.id}>Identifiant : {missionId}</p>
        <DialogueBubble>
          Cette mission n&apos;est pas encore jouable. Reviens à la carte.
        </DialogueBubble>
      </div>
    </AppShell>
  );
}
