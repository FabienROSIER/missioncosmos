'use client';

import { useEffect, useState } from 'react';
import {
  skyBackgroundSrc,
  type SkyBackgroundId,
} from '@/lib/assets/paths';
import styles from './StarfieldBackground.module.css';

type StarfieldBackgroundProps = {
  variant?: SkyBackgroundId;
  className?: string;
};

function pickVariant(): 'native' | 'mobile' {
  if (typeof window === 'undefined') return 'mobile';
  return window.matchMedia('(max-width: 900px)').matches ? 'mobile' : 'native';
}

/** Fond spatial plein écran (starfield / nebula / milky-way). */
export function StarfieldBackground({
  variant = 'starfield',
  className,
}: StarfieldBackgroundProps) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      const url = skyBackgroundSrc(variant, pickVariant());
      const img = new window.Image();
      img.onload = () => {
        if (!cancelled) setSrc(url);
      };
      img.onerror = () => {
        if (!cancelled) setSrc(null);
      };
      img.src = url;
    };

    load();
    const mq = window.matchMedia('(max-width: 900px)');
    const onChange = () => load();
    mq.addEventListener('change', onChange);

    return () => {
      cancelled = true;
      mq.removeEventListener('change', onChange);
    };
  }, [variant]);

  return (
    <div
      className={`${styles.root} ${className ?? ''}`}
      aria-hidden="true"
      style={src ? { backgroundImage: `url(${src})` } : undefined}
      data-sky={variant}
      data-sky-loaded={src ? '1' : '0'}
    />
  );
}
