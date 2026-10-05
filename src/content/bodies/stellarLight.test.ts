import { describe, expect, it } from 'vitest';
import {
  LIGHT_CHANNELS,
  MIX_TARGETS,
  lightHint,
  lightProgress,
  lightRecipe,
  lightsOff,
  mixedLight,
  type LightColourId,
} from './stellarLight';
import { MISSION_09 } from '@/content/missions/mission-09';

describe('colour-light experiments', () => {
  it.each([
    [false, false, false, 'dark'],
    [true, false, false, 'red'],
    [false, true, false, 'green'],
    [false, false, true, 'blue'],
    [true, true, false, 'yellow'],
    [true, false, true, 'magenta'],
    [false, true, true, 'cyan'],
    [true, true, true, 'white'],
  ] as const)('mixes lights %s %s %s into %s', (red, green, blue, colour) => {
    expect(mixedLight({ red, green, blue })).toBe(colour);
  });

  it('all challenge and experiment targets can be reached with the three switches', () => {
    const targets: LightColourId[] = [...MIX_TARGETS];
    targets.forEach((target) => expect(mixedLight(lightRecipe(target))).toBe(target));
  });

  it('does not reveal recipes on the first miss, then gives an actionable hint', () => {
    expect(lightHint(lightsOff(), 'yellow', 1)).toContain('Essaie');
    expect(lightHint(lightsOff(), 'yellow', 2)).toContain('Ajoute');
    expect(lightHint({ red: true, green: true, blue: true }, 'yellow', 2)).toContain('Éteins');
    expect(lightHint(lightRecipe('yellow'), 'yellow', 0)).toContain('valider');
  });

  it('each later hint brings every wrong combination closer to its target', () => {
    for (const target of [...MIX_TARGETS, 'cyan'] as const) {
      const recipe = lightRecipe(target);
      for (let mask = 0; mask < 8; mask++) {
        const lights = {
          red: Boolean(mask & 4),
          green: Boolean(mask & 2),
          blue: Boolean(mask & 1),
        };
        if (mixedLight(lights) === target) continue;
        const hint = lightHint(lights, target, 2);
        const channel = LIGHT_CHANNELS.find((id) =>
          hint.includes({ red: 'rouge', green: 'vert', blue: 'bleu' }[id]),
        )!;
        expect(channel).toBeDefined();
        expect(lights[channel]).not.toBe(recipe[channel]);
        expect(hint.startsWith(recipe[channel] ? 'Ajoute' : 'Éteins')).toBe(true);
      }
    }
  });

  it('counts only requested colours and never counts a duplicated success twice', () => {
    expect(lightProgress(['yellow', 'yellow', 'red'], MIX_TARGETS)).toEqual({
      done: 1,
      total: 4,
      complete: false,
    });
    expect(lightProgress(MIX_TARGETS, MIX_TARGETS).complete).toBe(true);
    expect(lightProgress([], []).complete).toBe(false);
  });

  it('uses independent switch states when resetting an experiment', () => {
    const a = lightsOff();
    a.red = true;
    expect(lightsOff().red).toBe(false);
  });

  it('has one mixing challenge, with each colour once, while retaining save IDs', () => {
    expect(MISSION_09.id).toBe('mission-09');
    expect(MISSION_09.rewardIds).toContain('reward-stellar-light');
    const gated = MISSION_09.steps.filter((step) => step.requiresSuccess);
    expect(gated.map((step) => step.id)).toEqual(['m09-color', 'm09-spectrum', 'm09-challenge']);
    expect(gated.filter((step) => step.challengePrism).map((step) => step.id)).toEqual([
      'm09-color',
      'm09-challenge',
    ]);
    expect(MISSION_09.steps.some((step) => step.id === 'm09-quiz')).toBe(false);
    expect(MIX_TARGETS).toEqual(['yellow', 'magenta', 'cyan', 'white']);
    expect(new Set(MIX_TARGETS).size).toBe(MIX_TARGETS.length);
    expect(MISSION_09.steps.filter((step) => step.kind === 'quiz')).toHaveLength(0);
  });
});
