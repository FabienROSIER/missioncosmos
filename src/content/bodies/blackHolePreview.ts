/** Prototype copy is kept separate from the rendering and mission progression. */
export const BLACK_HOLE_GUIDE_INTRO = {
  title: 'C’est quoi, un trou noir ?',
  body: 'Un trou noir concentre énormément de matière dans très peu de place. Il attire ce qui l’entoure : c’est la gravité. À l’intérieur d’une limite appelée « horizon », rien ne peut ressortir, même la lumière ! Mais il n’avale pas tout : des étoiles peuvent tourner autour.',
};

export const BLACK_HOLE_VIEWS = [
  {
    id: 'disk',
    label: 'Le gaz lumineux',
    title: 'Aux portes de l’invisible',
    body: 'Ce qui brille, c’est le gaz très chaud autour du trou noir. Tourne la vue pour observer le disque et la lumière déviée.',
    note: 'Dessin imaginé. Lumière déviée de façon simplifiée.',
  },
  {
    id: 'orbits',
    label: 'Les étoiles',
    title: 'Des indices dans les orbites',
    body: 'Suis l’étoile dorée : son orbite est une ellipse. Elle accélère en se rapprochant du trou noir, puis ralentit en s’en éloignant. Le trou noir occupe un foyer de l’ellipse, pas son centre. La sphère noire masque les étoiles du fond.',
    note: 'Maquette simplifiée · sphère noire agrandie · temps accéléré',
  },
  {
    id: 'horizon',
    label: 'L’horizon',
    title: 'Une frontière de non-retour',
    body: 'La limite en pointillés représente l’horizon des événements. Depuis l’intérieur, même la lumière ne peut plus ressortir. Cette limite n’est pas un mur.',
    note: 'Limite invisible : à distinguer de la zone noire visible.',
  },
] as const;
export type BlackHoleView = (typeof BLACK_HOLE_VIEWS)[number]['id'];

export const BLACK_HOLE_ORBITS = [
  { a: 4.2, e: 0, inclination: -0.08, phase: 0 },
  { a: 5.5, e: 0.62, inclination: 0.12, phase: Math.PI },
  { a: 8.4, e: 0, inclination: 0.2, phase: 4.2 },
] as const;
