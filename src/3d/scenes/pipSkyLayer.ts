import { Color4, Layer, type Scene } from '@babylonjs/core';

export type PipSkyLayerHandle = {
  setColor: (color: { r: number; g: number; b: number }) => void;
  dispose: () => void;
};

/**
 * Fond plein écran réservé à la caméra PiP.
 *
 * Un Layer Babylon est rendu directement dans le viewport de la caméra :
 * il ne dépend ni d'une grande sphère transparente, ni du depth buffer.
 * C'est plus fiable sur les pilotes WebGL mobiles.
 */
export function createPipSkyLayer(
  scene: Scene,
  name: string,
  cameraLayerMask: number,
  initialColor: { r: number; g: number; b: number },
): PipSkyLayerHandle {
  const layer = new Layer(
    name,
    null,
    scene,
    true,
    new Color4(initialColor.r, initialColor.g, initialColor.b, 1),
  );
  layer.layerMask = cameraLayerMask;
  layer.alphaTest = false;

  return {
    setColor: (color) => {
      layer.color.set(color.r, color.g, color.b, 1);
    },
    dispose: () => layer.dispose(),
  };
}
