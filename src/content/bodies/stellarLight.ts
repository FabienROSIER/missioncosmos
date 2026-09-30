/** One visual journey for ages 6–12: separate sunlight, then add coloured lights. */
export type StarLightSceneMode =
  'intro' | 'place' | 'rainbow' | 'mix' | 'challenge' | 'review' | 'explore';
export const LIGHT_CHANNELS = ['red', 'green', 'blue'] as const;
export type LightChannel = (typeof LIGHT_CHANNELS)[number];
export type LightSwitches = Record<LightChannel, boolean>;
export type LightColourId = 'dark' | LightChannel | 'yellow' | 'magenta' | 'cyan' | 'white';

export const LIGHT_COLOURS: Record<
  LightColourId,
  { name: string; css: string; rgb: [number, number, number] }
> = {
  dark: { name: 'Éteint', css: '#17243a', rgb: [0, 0, 0] },
  red: { name: 'Rouge', css: '#ff575e', rgb: [1, 0, 0] },
  green: { name: 'Vert', css: '#57eb8d', rgb: [0, 1, 0] },
  blue: { name: 'Bleu', css: '#609cff', rgb: [0, 0, 1] },
  yellow: { name: 'Jaune', css: '#ffe66b', rgb: [1, 1, 0] },
  magenta: { name: 'Rose (magenta)', css: '#ff85eb', rgb: [1, 0, 1] },
  cyan: { name: 'Cyan (bleu-vert)', css: '#6df3f3', rgb: [0, 1, 1] },
  white: { name: 'Blanc', css: '#f5faff', rgb: [1, 1, 1] },
};

export const RAINBOW_BANDS = [
  { name: 'Rouge', css: '#ff575e', rgb: [1, 0.03, 0.03] },
  { name: 'Orange', css: '#ffad55', rgb: [1, 0.38, 0.01] },
  { name: 'Jaune', css: '#ffe66b', rgb: [1, 0.9, 0.02] },
  { name: 'Vert', css: '#57eb8d', rgb: [0.08, 1, 0.18] },
  { name: 'Bleu', css: '#609cff', rgb: [0.06, 0.3, 1] },
  { name: 'Violet', css: '#bf9bff', rgb: [0.55, 0.06, 1] },
] as const;

export const MIX_TARGETS = ['yellow', 'magenta', 'cyan', 'white'] as const;

export function lightsOff(): LightSwitches {
  return { red: false, green: false, blue: false };
}

/** Additive mixing, not paint mixing. Every switch combination has a distinct result. */
export function mixedLight(lights: LightSwitches): LightColourId {
  const mask = (lights.red ? 4 : 0) + (lights.green ? 2 : 0) + (lights.blue ? 1 : 0);
  return (['dark', 'blue', 'green', 'cyan', 'red', 'magenta', 'yellow', 'white'] as const)[mask]!;
}

export function lightRecipe(target: LightColourId): LightSwitches {
  const [r, g, b] = LIGHT_COLOURS[target].rgb;
  return { red: r === 1, green: g === 1, blue: b === 1 };
}

export function lightHint(lights: LightSwitches, target: LightColourId, attempts: number): string {
  if (mixedLight(lights) === target) return 'C’est le bon mélange. Tu peux le valider !';
  if (attempts < 2)
    return 'Essaie d’allumer ou d’éteindre une lumière. Regarde ce qui change sur l’écran.';
  const recipe = lightRecipe(target);
  const extra = LIGHT_CHANNELS.find((channel) => lights[channel] && !recipe[channel]);
  if (extra) return `Éteins la lumière ${LIGHT_COLOURS[extra].name.toLowerCase()}, puis observe.`;
  const missing = LIGHT_CHANNELS.find((channel) => !lights[channel] && recipe[channel]);
  return missing
    ? `Ajoute la lumière ${LIGHT_COLOURS[missing].name.toLowerCase()}, puis observe.`
    : '';
}

export function lightProgress(
  completed: readonly LightColourId[],
  targets: readonly LightColourId[],
) {
  const done = new Set(targets.filter((target) => completed.includes(target))).size;
  const total = new Set(targets).size;
  return { done, total, complete: total > 0 && done === total };
}
