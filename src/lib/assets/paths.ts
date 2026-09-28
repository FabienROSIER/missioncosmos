/** Chemins assets UI — URLs publiques (avec basePath Pages si défini). */

import { ASSETS_PUBLIC_ROOT } from '@/lib/constants';
import { withBasePath } from '@/lib/basePath';

export const COMPANION_BASE = withBasePath(`${ASSETS_PUBLIC_ROOT}/sprites/companion`);

/** Compagnon 3D (scènes Mission 02–04) — dossier orthographe asset telle quelle. */
export const COMPANION_3D_URL = withBasePath(
  `${ASSETS_PUBLIC_ROOT}/models/compagon/compagon.glb`,
);

export const COMPANION_POSES = [
  'neutral',
  'welcome',
  'happy',
  'surprised',
  'thinking',
  'encouraging',
  'hint',
  'point-left',
  'point-right',
] as const;

export type CompanionPose = (typeof COMPANION_POSES)[number];

export function companionSrc(pose: CompanionPose, size: 256 | 512 = 256): string {
  const suffix = size === 256 ? '-256' : '';
  return `${COMPANION_BASE}/ast-003-companion-${pose}${suffix}.webp`;
}

export const LOGO_SRC = withBasePath(
  `${ASSETS_PUBLIC_ROOT}/icons/ast-001-mission-cosmos-logo.png`,
);

/** Icônes PWA (générées depuis le logo AST-001) */
export const PWA_ICON_192 = withBasePath(`${ASSETS_PUBLIC_ROOT}/icons/icon-192.png`);
export const PWA_ICON_512 = withBasePath(`${ASSETS_PUBLIC_ROOT}/icons/icon-512.png`);
export const PWA_APPLE_TOUCH = withBasePath(
  `${ASSETS_PUBLIC_ROOT}/icons/apple-touch-icon.png`,
);

/** Fonds spatiaux — manifest : public/assets/textures/backgrounds/manifest.json */
export const SKY_BASE = withBasePath(`${ASSETS_PUBLIC_ROOT}/textures/backgrounds`);

export const SKY_BACKGROUNDS = ['starfield', 'nebula', 'milky-way'] as const;

export type SkyBackgroundId = (typeof SKY_BACKGROUNDS)[number];

const SKY_FILES: Record<SkyBackgroundId, { id: string; file: string }> = {
  starfield: { id: 'AST-021', file: 'ast-021-space-starfield' },
  nebula: { id: 'AST-022', file: 'ast-022-space-nebula' },
  'milky-way': { id: 'AST-020', file: 'ast-020-space-milky-way' },
};

export function skyBackgroundSrc(
  id: SkyBackgroundId,
  variant: 'native' | 'mobile' = 'native',
): string {
  const file = SKY_FILES[id].file;
  const suffix = variant === 'mobile' ? '-mobile' : '';
  return `${SKY_BASE}/${file}${suffix}.webp`;
}

/**
 * Fond image pour scènes 3D (préférence produit : plus joli que procédural).
 * À réutiliser pour les prochaines missions.
 */
export const MISSION_STARFIELD_SRC = `${SKY_BASE}/ast-021-space-starfield-fine-v2.webp`;
