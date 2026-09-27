# Performance 3D

## Mesures

- Desktop : en `NODE_ENV=development`, `startPerfMonitor` logue toutes les 4 s `{ fps, frameTimeMs, drawCalls, activeMeshes, jsHeapMb }` dans la console.
- Android réel : ouvrir la mission, DevTools distant (chrome://inspect) ou overlay à venir ; noter FPS moyen et jank au pinch-zoom. Checklist manuelle — pas automatisable ici.

Cible indicative Mission 01 (1 planète + fond image) : **≥ 30 FPS** mobile mid-range, **≥ 50 FPS** desktop.

## Qualité graphique

`resolveGraphicsQuality()` + réglages (`/settings`) :

| | Low | High |
|---|---|---|
| DPR max | 1.5 | 2 |
| MSAA | 1 | 4 |
| Atmosphère | off | on |
| Matériaux | Standard lite | PBR soft OK |
| Fond sphère | 24 seg | 48 seg |
| ScenePerformancePriority | Intermediate | BackwardCompatible |

## Draw calls / meshes

- Fond image : `freezeWorldMatrix`, non pickable.
- Corps : `alwaysSelectAsActiveMesh`, `material.freeze()` après setup.
- Atmosphère = +1 draw call → désactivée en low.
- Thin instances : helper `thinInstances.ts` pour ceintures / répétitions (pas Mission 01).

## Textures — résolutions max (côté long)

Voir `TEXTURE_MAX_RESOLUTION` dans `src/3d/performance/textureLimits.ts` :

| Catégorie | High | Low |
|---|---|---|
| planet / sun | 2048 | 1024 |
| background | 2048 | 1024 |
| ui | 1024 | 512 |
| sprite | 512 | 256 |

Les GLB WebP doivent respecter ces plafonds à la source (pas de rescale runtime fiable).

## Lazy loading

- Corps : `SceneLoader.ImportMeshAsync` à la demande (`loadCelestialBody`).
- Prefetch optionnel : `prefetchCelestialGlb` avant d’entrer en mission.
- Quitter une mission : `BabylonCanvas` dispose Engine + Scene + cleanup utilisateur.

## Reduced motion

`prefers-reduced-motion: reduce` → pas de spin axial, pas d’anim appear/disappear (`src/lib/motion.ts`).
