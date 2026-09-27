export {
  estimateMeshDrawCost,
  startPerfMonitor,
  type PerfMonitorHandle,
  type PerfSnapshot,
} from '@/3d/performance/perfMonitor';
export {
  applyScenePerformancePriority,
  disablePicking,
  freezeStaticMeshes,
  optimizeCelestialMeshes,
} from '@/3d/performance/optimizeMeshes';
export {
  getTextureMaxSide,
  TEXTURE_MAX_RESOLUTION,
  type TextureAssetCategory,
} from '@/3d/performance/textureLimits';
export { prefetchCelestialGlb, preloadOnce, clearPreloadCache } from '@/3d/performance/lazyLoad';
export {
  buildRingInstanceMatrices,
  setThinInstancesFromMatrices,
} from '@/3d/performance/thinInstances';
