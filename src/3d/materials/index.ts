export {
  getStoredGraphicsQuality,
  resolveGraphicsQuality,
  setStoredGraphicsQuality,
  type GraphicsQualityLevel,
  type ResolvedGraphicsQuality,
} from '@/3d/materials/graphicsQuality';
export { createSimpleAtmosphere } from '@/3d/materials/atmosphere';
export { applyDayNightEarthMaterials, applyPlanetaryMaterials } from '@/3d/materials/planetaryMaterial';
export { applyHardTerminatorMaterials } from '@/3d/materials/hardTerminatorMaterial';
export { applyEmissiveSunMaterial } from '@/3d/materials/sunMaterial';
export { MISSION_SUN_DIRECTION, setupSceneLighting } from '@/3d/materials/sceneLighting';
