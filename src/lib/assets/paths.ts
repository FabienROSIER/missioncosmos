/** Chemins assets UI — alignés sur public/assets */

export const COMPANION_BASE = '/assets/sprites/companion' as const;

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

export const LOGO_SRC = '/assets/icons/ast-001-mission-cosmos-logo.png' as const;

/** Fonds spatiaux — manifest : public/assets/textures/backgrounds/manifest.json */
export const SKY_BASE = '/assets/textures/backgrounds' as const;

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
export const MISSION_STARFIELD_SRC =
  `${SKY_BASE}/ast-021-space-starfield-fine-v2.webp` as const;
