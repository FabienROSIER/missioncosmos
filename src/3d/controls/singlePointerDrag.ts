/**
 * Filtre les gestes de drag « un doigt / clic gauche » pour laisser
 * le pan caméra (2 doigts / molette) à Babylon.
 */
export function isSingleFingerOrLeftDrag(evt: PointerEvent, activePointerCount: number): boolean {
  if (activePointerCount > 1) return false;
  // Souris / stylet : uniquement le bouton gauche
  if (evt.pointerType === 'mouse' || evt.pointerType === 'pen') {
    return evt.button === 0;
  }
  // Touch : un seul contact
  return true;
}
