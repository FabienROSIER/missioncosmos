import { comparisonVisualRadius, STARS, type StarId } from '@/content/bodies/stars';

export const STAR_FILM_DURATION = 18;
export const STAR_FILM_CHAPTERS = [
  {
    at: 0,
    tableau: 0,
    title: 'Trois lumières, trois tailles',
    text: 'À la même distance, leurs différences de taille se voient.',
  },
  {
    at: 2,
    tableau: 6.5,
    title: 'Un ballet de distances',
    text: 'La géante s’éloigne… Les trois disques finissent par sembler aussi grands.',
  },
  {
    at: 7.3,
    tableau: 11.1,
    title: 'Et si nous avancions ?',
    text: 'Nous approchons de Proxima : la plus petite peut maintenant paraître la plus grande.',
  },
  {
    at: 11.9,
    tableau: 16.5,
    title: 'Le ciel change avec notre regard',
    text: 'De côté, les distances se voient. Les étoiles gardent leur taille.',
  },
] as const;

export const FILM_STARS: StarId[] = ['proxima', 'sun', 'betelgeuse'];
const smooth = (value: number) => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * t * (t * (t * 6 - 15) + 10);
};
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** Fixed physical radii throughout: perspective alone changes their apparent size. */
export function sampleStarCinematic(seconds: number) {
  const drift = smooth((seconds - STAR_FILM_CHAPTERS[1].at) / 4.5);
  const approach = smooth((seconds - STAR_FILM_CHAPTERS[2].at) / 3.8);
  const reveal = smooth((seconds - STAR_FILM_CHAPTERS[3].at) / 4.6);
  const stars = FILM_STARS.map((id, index) => {
    const radius = comparisonVisualRadius(STARS[id].radiusSolar);
    const depth = radius / 0.055;
    const slope = (index - 1) * 0.25;
    return {
      id,
      radius,
      position: [mix(slope * 10, slope * depth, drift), 0, mix(2, depth - 8, drift)] as const,
    };
  });
  return {
    stars,
    camera: [mix(0, 27, reveal), mix(0, 9, reveal), mix(-8 + approach * 3.2, -18, reveal)] as const,
    target: [mix(0, 2, reveal), 0, mix(0, 10, reveal)] as const,
    chapter:
      seconds < STAR_FILM_CHAPTERS[1].at
        ? 0
        : seconds < STAR_FILM_CHAPTERS[2].at
          ? 1
          : seconds < STAR_FILM_CHAPTERS[3].at
            ? 2
            : 3,
  };
}
