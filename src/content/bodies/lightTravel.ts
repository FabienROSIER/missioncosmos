/** Pedagogical light-travel experiment: same speed, proportional distances 1:2:4. */

export type LightTravelSourceId = 'near' | 'mid' | 'far';

export type LightTravelSource = {
  id: LightTravelSourceId;
  label: string;
  shortLabel: string;
  /** Distance in millions of light-years (also travel time in millions of years). */
  millionLightYears: number;
  /** Scene units from the observatory; keep the 1:2:4 ratio. */
  sceneDistance: number;
};

export const LIGHT_TRAVEL_SOURCES: readonly LightTravelSource[] = [
  {
    id: 'near',
    label: 'Galaxie proche',
    shortLabel: 'Proche',
    millionLightYears: 1,
    sceneDistance: 8,
  },
  {
    id: 'mid',
    label: 'Galaxie moyenne',
    shortLabel: 'Moyenne',
    millionLightYears: 2,
    sceneDistance: 16,
  },
  {
    id: 'far',
    label: 'Galaxie lointaine',
    shortLabel: 'Lointaine',
    millionLightYears: 4,
    sceneDistance: 32,
  },
];

/** Slight angular offsets so sources are not collinear, while keeping radial distance. */
export const LIGHT_TRAVEL_LAYOUT: readonly {
  id: LightTravelSourceId;
  yaw: number;
  pitch: number;
}[] = [
  { id: 'near', yaw: -0.28, pitch: -0.12 },
  { id: 'mid', yaw: 0.18, pitch: 0.16 },
  { id: 'far', yaw: -0.1, pitch: 0.06 },
];

export function lightTravelWorldPosition(
  sceneDistance: number,
  yaw: number,
  pitch: number,
): { x: number; y: number; z: number } {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  return {
    x: sceneDistance * cy * cp,
    y: sceneDistance * sp,
    z: sceneDistance * sy * cp,
  };
}

export const LIGHT_TRAVEL_MAX_MILLION_YEARS = 4;
/** Real duration of the farthest pulse in the accelerated maquette. */
export const LIGHT_TRAVEL_ANIMATION_SECONDS = 7;

export function pulseDurationSeconds(millionLightYears: number): number {
  return (millionLightYears / LIGHT_TRAVEL_MAX_MILLION_YEARS) * LIGHT_TRAVEL_ANIMATION_SECONDS;
}

/** Progress 0..1 of a pulse along its path at constant visual speed. */
export function pulseProgress(elapsedSeconds: number, millionLightYears: number): number {
  if (elapsedSeconds <= 0) return 0;
  const duration = pulseDurationSeconds(millionLightYears);
  if (duration <= 0) return 1;
  return Math.min(1, elapsedSeconds / duration);
}

export function elapsedMillionYears(elapsedSeconds: number): number {
  return Math.min(
    LIGHT_TRAVEL_MAX_MILLION_YEARS,
    (elapsedSeconds / LIGHT_TRAVEL_ANIMATION_SECONDS) * LIGHT_TRAVEL_MAX_MILLION_YEARS,
  );
}

export function hasArrived(elapsedSeconds: number, millionLightYears: number): boolean {
  return pulseProgress(elapsedSeconds, millionLightYears) >= 1;
}

export function arrivedSourceIds(elapsedSeconds: number): LightTravelSourceId[] {
  return LIGHT_TRAVEL_SOURCES.filter((source) =>
    hasArrived(elapsedSeconds, source.millionLightYears),
  ).map((source) => source.id);
}

export function allSignalsArrived(elapsedSeconds: number): boolean {
  return LIGHT_TRAVEL_SOURCES.every((source) =>
    hasArrived(elapsedSeconds, source.millionLightYears),
  );
}

/** Closest → farthest: the order flashes reach the observatory. */
export function arrivalOrder(): readonly LightTravelSourceId[] {
  return LIGHT_TRAVEL_SOURCES.map((source) => source.id);
}

/** Looking farther means receiving an older image. */
export function isOldestImageSource(id: string): boolean {
  return id === 'far';
}

export function formatMillionYears(value: number): string {
  if (value < 0.05) return '0 million d’années';
  const rounded = Math.round(value * 10) / 10;
  if (rounded >= LIGHT_TRAVEL_MAX_MILLION_YEARS) return '4 millions d’années';
  if (rounded === 1) return '1 million d’années';
  return `${String(rounded).replace('.', ',')} millions d’années`;
}
