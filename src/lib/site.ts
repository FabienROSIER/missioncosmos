/**
 * Identité publique du site (racine https://missioncosmos.fr).
 * Pas de basePath : le jeu est servi à la racine du domaine.
 */
export const SITE_URL = 'https://missioncosmos.fr';
export const SITE_NAME = 'Mission Cosmos';
export const SITE_TITLE =
  'Mission Cosmos — Jeu éducatif gratuit d’astronomie pour enfants';
export const SITE_DESCRIPTION =
  'Jeu éducatif gratuit d’astronomie pour les enfants de 6 à 12 ans. Sans publicité, sans compte et sans collecte de données personnelles.';

/**
 * Visuel de partage temporaire (icône carrée existante, 512×512).
 * À remplacer par public/assets/branding/og-image.png en 1200×630,
 * puis mettre à jour ce bloc.
 */
export const OG_IMAGE = {
  path: '/assets/icons/icon-512.png',
  width: 512,
  height: 512,
  alt: 'Mission Cosmos',
} as const;

export const PUBLIC_PATHS = [
  '/',
  '/missions',
  '/a-propos',
  '/confidentialite',
  '/contact',
] as const;
