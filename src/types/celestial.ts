import type { CelestialBodyId } from '@/lib/constants';

/** Données physiques / pédagogiques — jamais confondues avec le rendu. */
export type CelestialScientificData = {
  nameFr: string;
  realRadiusKm: number;
  massKg?: number;
  /** Période de rotation sidérale en heures (approx. pédagogique OK). */
  rotationPeriodHours?: number;
  /** Inclinaison axiale en degrés. */
  axialTiltDeg?: number;
  shortDescription: string;
};

/** Paramètres de représentation scène (volontairement non à l'échelle si besoin). */
export type CelestialVisualData = {
  bodyId: CelestialBodyId;
  /** Rayon visuel cible en unités scène (le GLB source ≈ 1). */
  visualRadius: number;
  /** Facteur de vitesse de rotation visuelle (1 = temps pédagogique de base). */
  spinSpeedFactor?: number;
};

export type CelestialBodyDefinition = {
  id: string;
  scientific: CelestialScientificData;
  visual: CelestialVisualData;
};
