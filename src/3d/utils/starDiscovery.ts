export type StarDiscoveryPhase = 'sizes' | 'colors';

export function isFreeStarComparison(stepId: string): boolean {
  return stepId === 'm08-observe' || stepId === 'm08-colors';
}

export function starDiscoveryPhase(stepId: string): StarDiscoveryPhase | undefined {
  if (stepId === 'm08-observe') return 'sizes';
  if (stepId === 'm08-colors') return 'colors';
}
