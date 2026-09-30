'use client';

import { useMemo, useState } from 'react';
import { MissionCard } from '@/components/ui/MissionCard';
import { UNIVERSE_ZONES, getMissionsForZone, type UniverseZoneId } from '@/content/universe';
import {
  getZoneStatus,
  pickInitialZoneId,
  type ZoneMapStatus,
} from '@/features/universe/zoneStatus';
import styles from './UniverseMap.module.css';

const SEEN_UNLOCKS_KEY = 'mc:map-seen-zones';

type UniverseMapProps = {
  isMissionUnlocked: (missionId: string) => boolean;
  isMissionCompleted: (missionId: string) => boolean;
  /** Change quand la progression change (ex. % ou ids). */
  progressKey: string;
  onStartMission: (missionId: string) => void;
};

const STATUS_LABEL: Record<ZoneMapStatus, string> = {
  locked: 'Verrouillée',
  available: 'À explorer',
  completed: 'Explorée',
  'coming-soon': 'Bientôt',
};

function readSeenZones(): Set<string> {
  try {
    const raw = sessionStorage.getItem(SEEN_UNLOCKS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? new Set(parsed.filter((x) => typeof x === 'string')) : new Set();
  } catch {
    return new Set();
  }
}

function writeSeenZones(ids: Set<string>): void {
  try {
    sessionStorage.setItem(SEEN_UNLOCKS_KEY, JSON.stringify([...ids]));
  } catch {
    /* private mode */
  }
}

/** Carte par zones — tout visible sans scroll. */
export function UniverseMap({
  isMissionUnlocked,
  isMissionCompleted,
  progressKey,
  onStartMission,
}: UniverseMapProps) {
  const statusInput = useMemo(
    () => ({ isMissionUnlocked, isMissionCompleted }),
    [isMissionUnlocked, isMissionCompleted],
  );

  const [selectedId, setSelectedId] = useState<UniverseZoneId>(() =>
    pickInitialZoneId(statusInput),
  );
  const [seenZones, setSeenZones] = useState<Set<string>>(() => readSeenZones());

  const selectedZone = UNIVERSE_ZONES.find((z) => z.id === selectedId) ?? UNIVERSE_ZONES[0]!;
  const selectedStatus = getZoneStatus(selectedZone, statusInput);
  const missions = getMissionsForZone(selectedZone);

  const pulseIds = useMemo(() => {
    void progressKey;
    const next = new Set<string>();
    for (const zone of UNIVERSE_ZONES) {
      const status = getZoneStatus(zone, statusInput);
      if ((status === 'available' || status === 'coming-soon') && !seenZones.has(zone.id)) {
        next.add(zone.id);
      }
    }
    return next;
  }, [progressKey, statusInput, seenZones]);

  const selectZone = (id: UniverseZoneId) => {
    setSelectedId(id);
    setSeenZones((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      writeSeenZones(next);
      return next;
    });
  };

  return (
    <div className={styles.root}>
      <p className={styles.help}>Touche une zone pour voir ses missions.</p>

      <div className={styles.grid} role="group" aria-label="Carte de l’Univers">
        {UNIVERSE_ZONES.map((zone) => {
          const status = getZoneStatus(zone, statusInput);
          const locked = status === 'locked';
          const selected = zone.id === selectedId;
          const pulse = pulseIds.has(zone.id);

          return (
            <button
              key={zone.id}
              type="button"
              className={[
                styles.node,
                styles[`status_${status}`],
                selected ? styles.nodeSelected : '',
                pulse ? styles.nodePulse : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-pressed={selected}
              aria-label={`${zone.title}, ${STATUS_LABEL[status]}`}
              disabled={locked}
              onClick={() => selectZone(zone.id)}
            >
              <span className={styles.nodeDot} aria-hidden />
              <span className={styles.nodeTitle}>{zone.title}</span>
            </button>
          );
        })}
      </div>

      <section className={styles.preview} aria-live="polite">
        <header key={selectedId} className={styles.previewHeader}>
          <h2 className={styles.previewTitle}>{selectedZone.title}</h2>
          <p className={styles.previewBlurb}>{selectedZone.blurb}</p>
        </header>

        {selectedStatus === 'locked' ? (
          <p className={styles.previewEmpty}>Termine d&apos;abord la zone précédente.</p>
        ) : selectedStatus === 'coming-soon' ? (
          <p className={styles.previewEmpty}>Zone découverte — missions bientôt disponibles.</p>
        ) : missions.length === 0 ? (
          <p className={styles.previewEmpty}>Pas encore de mission ici.</p>
        ) : (
          <ul className={`${styles.missionList} ui-stagger`}>
            {missions.map((mission) => {
              const unlocked = isMissionUnlocked(mission.id);
              const completed = isMissionCompleted(mission.id);
              const status = !unlocked ? 'locked' : completed ? 'completed' : 'available';
              return (
                <li key={mission.id} className={styles.missionItem}>
                  <MissionCard
                    title={mission.title}
                    objective={mission.objective}
                    status={status}
                    compact
                    onStart={unlocked ? () => onStartMission(mission.id) : undefined}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
