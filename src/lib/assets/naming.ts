import { ASSETS_PUBLIC_ROOT } from '@/lib/constants';
import type { AssetKind } from '@/types/assets';

const KIND_FOLDER: Record<AssetKind, string> = {
  texture: 'textures',
  model: 'models',
  sprite: 'sprites',
  illustration: 'illustrations',
  icon: 'icons',
  audio: 'audio',
};

/**
 * Convention : {id}-{sujet}-{variante}.{ext}
 * Placeholder : le nom doit contenir "placeholder".
 * Ex. ast-010-earth-diffuse.webp
 */
export function buildAssetFileName(params: {
  id: string;
  subject: string;
  variant?: string;
  extension: string;
  placeholder?: boolean;
}): string {
  const id = slug(params.id);
  const subject = slug(params.subject);
  const variant = params.variant ? slug(params.variant) : undefined;
  const ext = params.extension.replace(/^\./, '');
  const base = [id, subject, variant].filter(Boolean).join('-');
  const name = params.placeholder ? `${base}-placeholder` : base;
  return `${name}.${ext}`;
}

export function buildAssetPublicPath(
  kind: AssetKind,
  fileName: string,
  audioSubfolder?: 'music' | 'sfx' | 'voices',
): string {
  const folder = KIND_FOLDER[kind];
  if (kind === 'audio') {
    const sub = audioSubfolder ?? 'sfx';
    return `${ASSETS_PUBLIC_ROOT}/${folder}/${sub}/${fileName}`;
  }
  return `${ASSETS_PUBLIC_ROOT}/${folder}/${fileName}`;
}

export function isPlaceholderAssetName(fileName: string): boolean {
  return fileName.toLowerCase().includes('placeholder');
}

function slug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
