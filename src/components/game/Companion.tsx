import Image from 'next/image';
import {
  companionSrc,
  type CompanionPose,
} from '@/lib/assets/paths';
import styles from './Companion.module.css';

type CompanionSize = 'sm' | 'md' | 'lg';

/** Variantes CSS légères (assets dédiés Phase 6). */
export type CompanionVariant = 'default' | 'explorer';

type CompanionProps = {
  pose?: CompanionPose;
  size?: CompanionSize;
  className?: string;
  /** Texte accessible ; défaut selon la pose */
  alt?: string;
  priority?: boolean;
  /** Look débloqué après Mission 01 (teinte douce). */
  variant?: CompanionVariant;
};

const SIZE_PX: Record<CompanionSize, number> = {
  sm: 72,
  md: 112,
  lg: 160,
};

const POSE_ALT: Record<CompanionPose, string> = {
  neutral: 'Compagnon : neutre',
  welcome: 'Compagnon : accueil',
  happy: 'Compagnon : réussite',
  surprised: 'Compagnon : surprise',
  thinking: 'Compagnon : réflexion',
  encouraging: 'Compagnon : encouragement',
  hint: 'Compagnon : indice',
  'point-left': 'Compagnon : vers la gauche',
  'point-right': 'Compagnon : vers la droite',
};

/** Sprite 2D du compagnon Mission Cosmos (non intrusif). */
export function Companion({
  pose = 'neutral',
  size = 'md',
  className,
  alt,
  priority = false,
  variant = 'default',
}: CompanionProps) {
  const px = SIZE_PX[size];
  const classes = [
    styles.root,
    styles[size],
    variant === 'explorer' ? styles.explorer : null,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} aria-hidden={alt ? undefined : true}>
      <Image
        src={companionSrc(pose, px <= 112 ? 256 : 512)}
        alt={alt ?? POSE_ALT[pose]}
        width={px}
        height={px}
        className={styles.img}
        priority={priority || pose === 'welcome'}
      />
    </span>
  );
}
