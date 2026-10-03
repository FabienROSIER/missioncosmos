/** A year requires a full net revolution: retracing a path is not extra progress. */
export const EARTH_YEAR_ANGLE = Math.PI * 2;

export function earthYearProgress(angle: number): number {
  return Math.min(1, Math.abs(angle) / EARTH_YEAR_ANGLE);
}

export const EARTH_BEACONS = [
  { id: 'north-pole', letter: 'A', name: 'Pôle Nord', stepId: 'm01-challenge-north' },
  { id: 'equator', letter: 'B', name: 'Équateur', stepId: 'm01-challenge-equator' },
  { id: 'south-pole', letter: 'C', name: 'Pôle Sud', stepId: 'm01-challenge-south' },
] as const;

const SURVEY_STEPS = [
  'm01-intro',
  'm01-challenge-equator',
  'm01-challenge-north',
  'm01-challenge-south',
  'm01-challenge-orbit',
  'm01-explain',
  'm01-quiz',
  'm01-reward',
  'm01-complete',
];

export function isEarthRecordComplete(recordStep: string, currentStep: string, solved: boolean) {
  const record = SURVEY_STEPS.indexOf(recordStep);
  const current = SURVEY_STEPS.indexOf(currentStep);
  return record >= 0 && current >= 0 && (current > record || (current === record && solved));
}
