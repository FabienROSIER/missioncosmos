/** Identifiants et métadonnées d'assets (pas les fichiers binaires). */
export type AssetKind =
  | 'texture'
  | 'model'
  | 'sprite'
  | 'illustration'
  | 'icon'
  | 'audio';

export interface AssetReference {
  /** Ex. AST-010 */
  id: string;
  /** Chemin public, ex. /assets/textures/ast-010-earth-diffuse.webp */
  path: string;
  kind: AssetKind;
  /** true si fichier temporaire clairement identifié */
  isPlaceholder?: boolean;
  /** Crédit court affiché si besoin */
  credit?: string;
}
