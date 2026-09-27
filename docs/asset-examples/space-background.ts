import { Color4, Layer, Scene, Texture } from '@babylonjs/core';

/** Un fond fixé à l'écran, derrière les maillages, sans éclairer les planètes. */
export function createSpaceBackground(scene: Scene, url: string) {
  const engine = scene.getEngine();
  const layer = new Layer('space-background', null, scene, true, new Color4(1, 1, 1, 1));
  const texture = new Texture(url, scene);
  layer.texture = texture;
  texture.wrapU = Texture.CLAMP_ADDRESSMODE;
  texture.wrapV = Texture.CLAMP_ADDRESSMODE;

  const cover = () => {
    const image = texture.getSize();
    if (!image.width || !image.height || !engine.getRenderHeight()) return;
    const imageRatio = image.width / image.height;
    const screenRatio = engine.getRenderWidth() / engine.getRenderHeight();
    texture.uScale = Math.min(1, screenRatio / imageRatio);
    texture.vScale = Math.min(1, imageRatio / screenRatio);
    texture.uOffset = (1 - texture.uScale) / 2;
    texture.vOffset = (1 - texture.vScale) / 2;
  };

  texture.onLoadObservable.addOnce(cover);
  const observer = engine.onResizeObservable.add(cover);
  cover();
  let disposed = false;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    engine.onResizeObservable.remove(observer);
    scene.onDisposeObservable.remove(sceneObserver);
    layer.dispose();
  };
  const sceneObserver = scene.onDisposeObservable.add(dispose);
  return { layer, dispose };
}
