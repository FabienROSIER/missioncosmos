export type LightDiscoveryPhase = 'off' | 'rainbow' | 'lights' | 'done';

export function nextLightDiscoveryPhase(
  phase: LightDiscoveryPhase,
  action: 'select-color' | 'start-mixing' | 'make-yellow',
): LightDiscoveryPhase {
  if (phase === 'rainbow' && action === 'start-mixing') return 'lights';
  if (phase === 'lights' && action === 'make-yellow') return 'done';
  return phase;
}
