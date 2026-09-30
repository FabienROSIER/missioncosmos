'use client';

import { useEffect, useState, type HTMLAttributes } from 'react';
import { createPortal } from 'react-dom';
import { MOBILE_GAME_QUERY } from '@/lib/mobileLayout';
import styles from './SceneControls.module.css';

/** On phones, put scene controls in the scrollable mission panel, outside the canvas. */
export function SceneControls(props: HTMLAttributes<HTMLDivElement>) {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_GAME_QUERY);
    const update = () =>
      setTarget(media.matches ? document.getElementById('mission-controls-root') : null);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const controls = <div data-ui-panel {...props} />;
  return target
    ? createPortal(<div className={styles.mobileControls}>{controls}</div>, target)
    : controls;
}
