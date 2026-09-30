# Performance 3D

## Mesures

- Desktop : en `NODE_ENV=development`, `startPerfMonitor` logue toutes les 4 s `{ fps, frameTimeMs, drawCalls, activeMeshes, jsHeapMb }` dans la console.
- Android réel : ouvrir la mission, DevTools distant (chrome://inspect) ou overlay à venir ; noter FPS moyen et jank au pinch-zoom. Checklist manuelle — pas automatisable ici.

Cible indicative Mission 01 (1 planète + fond image) : **≥ 30 FPS** mobile mid-range, **≥ 50 FPS** desktop.

## Qualité graphique

`resolveGraphicsQuality()` + réglages (`/settings`) :

|                          | Low           | High               |
| ------------------------ | ------------- | ------------------ |
| DPR max                  | 1.5           | 2                  |
| MSAA                     | 1             | 4                  |
| Atmosphère               | off           | on                 |
| Matériaux                | Standard lite | PBR soft OK        |
| Fond sphère              | 24 seg        | 48 seg             |
| ScenePerformancePriority | Intermediate  | BackwardCompatible |

## Draw calls / meshes

- Fond image : `freezeWorldMatrix`, non pickable.
- Corps : `alwaysSelectAsActiveMesh`, `material.freeze()` après setup.
- Atmosphère = +1 draw call → désactivée en low.
- Thin instances : helper `thinInstances.ts` pour ceintures / répétitions (pas Mission 01).

## Textures — résolutions max (côté long)

Voir `TEXTURE_MAX_RESOLUTION` dans `src/3d/performance/textureLimits.ts` :

| Catégorie    | High | Low  |
| ------------ | ---- | ---- |
| planet / sun | 2048 | 1024 |
| background   | 2048 | 1024 |
| ui           | 1024 | 512  |
| sprite       | 512  | 256  |

Les GLB WebP doivent respecter ces plafonds à la source (pas de rescale runtime fiable).

## Lazy loading

- Corps : `SceneLoader.ImportMeshAsync` à la demande (`loadCelestialBody`).
- Prefetch optionnel : `prefetchCelestialGlb` avant d’entrer en mission.
- Quitter une mission : `BabylonCanvas` dispose Engine + Scene + cleanup utilisateur.

## Reduced motion

`prefers-reduced-motion: reduce` → pas de spin axial, pas d’anim appear/disappear (`src/lib/motion.ts`).

## Animations de l’interface

Politique commune : `src/lib/uiMotion.ts`, appliquée à la racine par
`UiMotionPreferences`. Les réglages s’appliquent immédiatement à l’interface ; la
qualité du rendu 3D est toujours prise en compte au prochain lancement de mission.

| Effet                                     | Basse / économie de données            | Moyenne                                | Élevée                              |
| ----------------------------------------- | -------------------------------------- | -------------------------------------- | ----------------------------------- |
| Couleurs / retour au clic                 | 80 ms, sans déplacement                | 120 ms, pression légère                | 140 ms, pression légère             |
| Panneaux, menus, quiz                     | Fondu 120 ms                           | Fondu + déplacement de 5 px, 200 ms    | Fondu + déplacement de 8 px, 240 ms |
| Survol souris                             | Couleur                                | Élévation 1 px                         | Élévation 2 px                      |
| Apparition de listes                      | Simultanée                             | Simultanée                             | Décalage plafonné à 105 ms          |
| Guide flottant / signal de zone débloquée | Désactivés                             | Désactivés                             | Activés, discrets                   |
| Flou derrière les surfaces                | Désactivé                              | Désactivé                              | 8 px, sans animation du flou        |
| Halo de validation 3D / flash photo       | Désactivés, texte de réussite conservé | Désactivés, texte de réussite conservé | Halo bref / flash photo atténué     |

- Auto réutilise exactement la résolution de qualité du moteur 3D (mémoire,
  nombre de cœurs, largeur d’écran, densité de pixels).
- La préférence système de réduction des animations prime sur chaque niveau,
  y compris Élevée. Une modification système ou du mode économie de données est
  suivie sans rechargement. Les retours statiques de couleur, focus et réussite
  restent visibles.
- Les animations CSS sont mises en pause quand le document est masqué.
- Aucun suivi du pointeur, effet de parallaxe, particule, bibliothèque d’animation
  ou boucle JavaScript supplémentaire. Les transitions utilisent opacity,
  translate et scale ; la barre de progression utilise scaleX.
- Le spinner reste une indication de chargement fonctionnelle de 900 ms par tour,
  sans rotation en mode réduction des animations.
- Les modales natives assurent le confinement et le retour du focus. Les
  transitions d’ouverture/fermeture utilisent `@starting-style` et les transitions
  discrètes ; elles restent utilisables sans ce support CSS.

Validation : tests `src/lib/uiMotion.test.ts` pour les niveaux, l’accessibilité,
l’économie de données, le stockage indisponible, la synchronisation entre onglets,
le SSR et le nettoyage des abonnements. Le budget de fluidité sur téléphone réel
reste à mesurer selon les appareils ciblés.
