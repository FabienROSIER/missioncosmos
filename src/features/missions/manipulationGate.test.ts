import { describe, expect, it } from 'vitest';
import { listMissions } from '@/content/missions';
import type { MissionStep } from '@/types/mission';
import { canInteractWithScene, isPlayGatedStep } from './manipulationGate';

const steps = listMissions().flatMap((mission) => mission.steps);
const stepById = (id: string) => steps.find((step) => step.id === id)!;

function canInteract(step: MissionStep, playStarted: boolean, guideExpanded: boolean): boolean {
  return canInteractWithScene({
    step,
    playStarted,
    guideExpanded,
    challengeSolved: false,
  });
}

describe('verrouillage des manipulations de mission', () => {
  it('verrouille toutes les observations, manipulations et défis avant À toi de jouer', () => {
    for (const step of steps.filter(isPlayGatedStep)) {
      expect(canInteract(step, false, true), step.id).toBe(false);
      expect(canInteract(step, false, false), step.id).toBe(false);
    }
  });

  it('active la scène après À toi de jouer et la reverrouille pendant Relire', () => {
    for (const id of [
      'm02-manipulate',
      'm05-challenge-order',
      'm06-fall',
      'm08-challenge',
      'm09-color',
      'mc-orion',
      'm10-journey',
      'm11-album',
      'm12-journey',
    ]) {
      const step = stepById(id);
      expect(step, id).toBeDefined();
      expect(canInteract(step, true, false), id).toBe(true);
      expect(canInteract(step, true, true), id).toBe(false);
    }
  });

  it('laisse l’introduction interactive de la Terre disponible immédiatement', () => {
    expect(canInteract(stepById('m01-intro'), false, true)).toBe(true);
  });

  it('garde les activités intégrées au panneau du Guide hors de la scène', () => {
    for (const id of ['m05-scale', 'm05-distances']) {
      const step = stepById(id);
      expect(isPlayGatedStep(step), id).toBe(false);
      expect(canInteract(step, true, false), id).toBe(false);
    }
  });

  it('désactive la scène dès que le défi est réussi', () => {
    expect(
      canInteractWithScene({
        step: stepById('m03-challenge-full'),
        playStarted: true,
        guideExpanded: false,
        challengeSolved: true,
      }),
    ).toBe(false);
  });
});
