'use client';

import { createContext, useContext, type HTMLAttributes } from 'react';
import { createPortal } from 'react-dom';
import styles from './SceneControls.module.css';

export const SceneControlsTarget = createContext<HTMLElement | null>(null);

/** Mission controls share a reserved dock on every screen; standalone scenes keep their HUD. */
export function SceneControls(props: HTMLAttributes<HTMLDivElement>) {
  const target = useContext(SceneControlsTarget);

  const controls = (
    <div data-ui-panel data-scene-controls data-docked={Boolean(target)} {...props} />
  );
  return target
    ? createPortal(<div className={styles.dockedControls}>{controls}</div>, target)
    : controls;
}
