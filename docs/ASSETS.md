# Assets — inventaire, licences, crédits

Tout asset utilisé en production doit figurer ici **et** dans le registre de `TODO_MISSION_COSMOS.md`.

## Convention de chemins

```text
public/assets/
  textures/        # planètes, ciels, …
  models/          # GLB/GLTF
  sprites/         # compagnon, UI animée
  illustrations/   # images 2D narratives
  icons/           # icônes app / UI
  audio/
    music/
    sfx/
    voices/
```

## Nommage

```text
{id}-{sujet}-{variante}.{ext}
```

Helpers TypeScript : `src/lib/assets/naming.ts` (`buildAssetFileName`, `buildAssetPublicPath`).

Un placeholder **doit** contenir `placeholder` dans le nom de fichier.

Les assets runtime se placent sous `public/assets/…` (pas dans `src/`), sauf outillage de build documenté.

## États

`À définir` · `Demandé` · `Reçu` · `Temporaire` · `Validé` · `À remplacer`

## Pack système solaire (corps célestes)

**Emplacement runtime :** `public/assets/models/solarsystem/celestial-bodies/`

**Doc pack :** `public/assets/models/solarsystem/README.md` + `manifest.json`

| ID | Corps | GLB | Texture externe | État |
|---|---|---|---|---|
| AST-030 | Soleil | `sun/sun.glb` | `sun.webp` | Reçu |
| AST-031 | Mercure | `mercury/mercury.glb` | `mercury.webp` | Reçu |
| AST-032 | Vénus | `venus/venus.glb` | `venus.webp` | Reçu |
| AST-010 | Terre | `earth/earth.glb` | `earth.webp` | Reçu |
| AST-011 | Lune | `moon/moon.glb` | `moon.webp` | Reçu |
| AST-033 | Mars | `mars/mars.glb` | `mars.webp` | Reçu |
| AST-034 | Jupiter | `jupiter/jupiter.glb` | `jupiter.webp` | Reçu |
| AST-035 | Saturne (+ anneaux) | `saturn/saturn.glb` | `saturn.webp`, `saturn-rings.webp` | Reçu |
| AST-036 | Uranus | `uranus/uranus.glb` | `uranus.webp` | Reçu |
| AST-037 | Neptune | `neptune/neptune.glb` | `neptune.webp` | Reçu |
| AST-038 | Ceinture d’astéroïdes | `asteroids/asteroids.glb` | (matériau mat) | Reçu |

URL publique type : `/assets/models/solarsystem/celestial-bodies/{body}/{body}.glb`

> Le `manifest.json` référence encore `/assets/celestial-bodies/…` : **corriger les chemins au chargement** pour pointer vers `models/solarsystem/celestial-bodies`.

### Provenance / licence

- Source déclarée : pack CGTrader « Solar System Free Download »
- **Usage actuel : personnel / privé** — validation licence commerciale non bloquante pour l’instant.
- Avant distribution publique/commerciale : vérifier et documenter la licence.
- **Publication GitHub Pages :** l’URL Pages diffuse les GLB/WebP. Confirmer la licence CGTrader (usage perso / redistribution web) avant activation Pages, ou retirer/remplacer le pack.
- Anneaux Saturne procéduraux + matériau astéroïdes : générés pour Mission Cosmos.
- Archives FBX/JPEG sources : **supprimées** de `src/3d/assets/` (2026-09-26).

### Contraintes techniques (rappel README pack)

- glTF 2.0, Y-up, rayon globe max = 1 (échelles/orbites dans le code app).
- Extension **EXT_texture_webp** requise → `@babylonjs/loaders` + WebGL 2.
- Textures WebP déjà embarquées dans les GLB : ne pas recharger les `.webp` externes en plus.
- Mercure/Lune : textures sources potentiellement identiques (limite scientifique connue).
- Astéroïdes décimés (~55k triangles) : charger à la demande.

### Résolutions texture max (runtime)

| Catégorie | High | Low |
|---|---|---|
| planet / sun | 2048 | 1024 |
| background mission | 2048 | 1024 |
| ui | 1024 | 512 |
| sprite | 512 | 256 |

Détail : `docs/PERFORMANCE.md` · `src/3d/performance/textureLimits.ts`.

## Inventaire général

| ID | Fichier | Type | Licence / source | Auteur | État | Notes |
|---|---|---|---|---|---|---|
| AST-001 | `public/assets/icons/ast-001-mission-cosmos-logo.png` | Logo PNG transparent | ImageGen | ImageGen | Reçu | Intégré accueil |
| AST-002 | — | Icône app / favicon | — | — | À définir | Brief dans `docs/DESIGN.md` |
| AST-003 | `public/assets/sprites/companion/` | Sprites 2D WebP (9 poses × 512/256) | ImageGen | ImageGen | Reçu | Voir `manifest.json` ; UI Companion |
| AST-003b | `public/assets/models/compagon/compagon.glb` | GLB skinned + anims (~6,5 Mo) | À confirmer | — | Reçu | Scènes M02–M04 ; Idle/Cheer/Confused… ; compression Draco à prévoir |
| AST-010 | `…/earth/earth.glb` | modèle + texture | CGTrader (à vérifier) | — | Reçu | Missions 1+ |
| AST-011 | `…/moon/moon.glb` | modèle + texture | CGTrader (à vérifier) | — | Reçu | Missions 3+ |
| AST-012 | pack planètes AST-030→038 | modèles | CGTrader (à vérifier) | — | Reçu | Mission 5+ |
| AST-020 | `public/assets/textures/backgrounds/ast-020-space-milky-way.webp` | Panorama 2:1 | Génération ImageGen artistique | ImageGen | Reçu | Voie lactée non cartographique ; native + mobile ; `SPACE_BACKGROUNDS.md` |
| AST-021 | `public/assets/textures/backgrounds/ast-021-space-starfield.webp` | Panorama 2:1 | Génération ImageGen artistique | ImageGen | Reçu | Ciel étoilé discret, fond par défaut |
| AST-022 | `public/assets/textures/backgrounds/ast-022-space-nebula.webp` | Panorama 2:1 | Génération ImageGen artistique | ImageGen | Reçu | Nébuleuse turquoise |
| AST-100 | — | UI SFX | — | — | À définir | Interface |

## Compagnon (AST-003)

Poses 2D : `neutral`, `welcome`, `happy`, `surprised`, `thinking`, `encouraging`, `hint`, `point-left`, `point-right`.

Composant UI : `src/components/game/Companion.tsx` · chemins : `src/lib/assets/paths.ts`.

### Compagnon 3D (AST-003b)

- Fichier : `public/assets/models/compagon/compagon.glb` (~6,5 Mo).
- Anims : `Idle_11`, `Agree_Gesture`, `Cheer_with_Both_Hands_Up`, `Confused_Scratch`, `Walking`, `Running`, `restpose`.
- Chargeur : `src/3d/entities/loadCompanion.ts` · marqueur surface : `src/3d/scenes/companionSurfaceMarker.ts`.
- Usages : Mission 02 (remplace la maison + origine PiP) ; Missions 03/04 (point de vue PiP sur Terre, masqué dans le PiP).
- Perf : poids élevé pour mobile — brief compression Draco/meshopt ultérieur.

## Fonds spatiaux UI (AST-020 → 022)

Dossier : `public/assets/textures/backgrounds/` (+ `manifest.json`)

| Clé code | Asset | Écran type |
|---|---|---|
| `starfield` | AST-021 | Missions, paramètres |
| `nebula` | AST-022 | Accueil |
| `milky-way` | AST-020 | Collection |

Variantes `native` + `mobile` ; `StarfieldBackground` (CSS) pour les **menus**.

En **mission 3D**, préférence produit : **fond image** via `createSpaceBackground` + `MISSION_STARFIELD_SRC` (`ast-021-space-starfield-fine-v2.webp`) — ADR-002. Le procédural reste en secours technique uniquement.


## Musique (AST-040 / AST-041)

**Emplacement :** `public/assets/audio/music/`

| Rôle | Fichiers | Licence |
| --- | --- | --- |
| Menu | `Floating Cities.mp3` | Kevin MacLeod — CC BY 4.0 |
| Jeu (shuffle) | `Arcadia.mp3`, `Dreamy Flashback.mp3`, `Bathed in the Light.mp3`, `Frozen Star.mp3`, `Impact Lento.mp3` | Kevin MacLeod — CC BY 4.0 |

Fichiers téléchargés directement sur Incompetech le 10 octobre 2026, sans modification.
La licence autorise un usage public et commercial avec attribution. Les crédits complets
(titres, auteur, sources et lien vers la licence) sont accessibles dans les réglages Musique
et livrés dans `public/assets/audio/music/README.md`.

« Space Ambience 1 », issu de KSP sans preuve de licence réutilisable, a été retiré du dossier
public et remplacé par « Floating Cities ». Les cinq musiques des missions sont conservées
à partir des originaux de l’auteur. La qualification précédente de toute la bande-son comme
propriétaire était incorrecte pour ces cinq titres.

**État :** licence documentée pour les musiques actuellement publiées, attribution en place.
Voir [audit et preuves](licenses/music/README.md) et `tracks.json` pour les sources, ISRC et SHA-256.
Les anciens fichiers peuvent rester dans l’historique Git ; aucun historique n’a été réécrit.

Catalogue code : `src/content/audio/musicCatalog.ts`. Lecteur : `src/features/audio/musicPlayer.ts`.

## Icônes PWA et partage

| ID | Fichier | État |
|---|---|---|
| AST-002 | `public/assets/icons/icon-192.png`, `icon-512.png`, `apple-touch-icon.png` | Reçu — icônes PWA dérivées du logo |
| AST-004 | `public/assets/branding/og-image.png` | À remplacer — PNG 1200×630 pour Open Graph. En attendant, les métadonnées pointent vers `icon-512.png` (`src/lib/site.ts`, constante `OG_IMAGE`). |

## Règles

- Licence inconnue = interdit en distribution.
- Pas d’asset définitif improvisé ; brief au propriétaire (voir rôle Asset Manager).
- Préférer WebP/AVIF pour les images web ; GLB compressé pour la 3D.
- Résolution adaptée mobile (éviter 8K si 1K–2K suffit).


## Sources des visuels générés

### Mission 13 — schémas vectoriels des distances

Schémas SVG originaux du projet, aucun nouvel asset tiers. Fond image AST-021 existant réutilisé. Symboles de galaxies et gradients générés dans le composant ; représentations artistiques explicitement sans proportions physiques. Décision : `docs/decisions/006-cosmic-distance-diagrams.md`.

### Mission 12 — maquettes de galaxies générées par le code

Les nuages d’étoiles et halos 3D des familles spirale, elliptique et irrégulière sont des géométries et shaders du projet, sans nouveau média tiers. La spirale réutilise la maquette de M11 ; les autres volumes sont créés dans `createGalaxySpecimen.ts`. Fond image AST-021 v2 réutilisé avec sa provenance existante. Aucune photographie de galaxie n’est importée. Représentations artistiques, sans données cartographiques ; choix et limites documentés dans `docs/decisions/005-galaxy-families-learning-models.md`.

Compagnon AST-003 : originaux PNG et prompts dans `docs/asset-sources/companion/`. Fonds AST-020 à AST-022 : originaux PNG et prompts dans `docs/asset-sources/backgrounds/`. Génération par outil ImageGen intégré à la demande du propriétaire ; aucun asset tiers utilisé comme référence de mascotte. Manifest séparé dans chaque dossier runtime. Voir `COMPANION_ASSETS.md` et `SPACE_BACKGROUNDS.md` pour usages et limites. Les images sont livrées ; leur branchement aux écrans reste à effectuer.


### Fond image fin pour la mission 01 — AST-021 v2

`public/assets/textures/backgrounds/ast-021-space-starfield-fine-v2.webp` : ImageGen, étoiles fines et brume bleutée discrète, WebP sans perte, résolution native 1672 × 941. Branché dans `EarthPreviewScene` via `imageSpaceBackground.ts`, en remplacement des points 3D ; voûte sphérique centrée sur la caméra, image répétée pour conserver des étoiles fines, orientation fixe dans le monde. Le fond défile lors des rotations de caméra. Texture émissive à 0,8, sans couleur additive avec conversion sRGB correcte pour éviter la surexposition. Anciennes images conservées pour les menus.

### Mission 13 — Modèles réutilisés

Les schémas SVG initiaux ont été remplacés par les modèles célestes texturés existants, le nuage galactique et les halos 3D M11/M12. Les petits spécimens du champ observable réutilisent ces géométries et shaders. Fond AST-021 existant. Aucun nouvel asset tiers. Voir ADR-006 pour les facteurs de rendu et les limites pédagogiques.
