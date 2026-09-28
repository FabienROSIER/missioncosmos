# Mission Cosmos — assets mobiles indépendants

Copier **le contenu de `public/`** dans le dossier `public/` de l'application Next.js. Les onze GLB se chargent indépendamment. Chaque GLB embarque ses textures WebP : les fichiers WebP voisins sont des copies de travail facultatives, sans requête supplémentaire au chargement du GLB. Ne pas déployer `sources/` ou `qa/` dans `public/`.

```text
public/assets/models/solarsystem/celestial-bodies/
  manifest.json
  sun/sun.glb + sun.webp
  mercury/mercury.glb + mercury.webp
  venus/venus.glb + venus.webp
  earth/earth.glb + earth.webp
  moon/moon.glb + moon.webp
  mars/mars.glb + mars.webp
  jupiter/jupiter.glb + jupiter.webp
  saturn/saturn.glb + saturn.webp + saturn-rings.webp
  uranus/uranus.glb + uranus.webp
  neptune/neptune.glb + neptune.webp
  asteroids/asteroids.glb
```

Saturne contient son globe et ses anneaux dans **un seul GLB**. Les astéroïdes conservent leurs deux couches de ceinture dans **un seul GLB distinct**. Aucune scène regroupant les planètes n'est fournie.

## Conventions de scène

- glTF 2.0, axe vertical **Y**, coordonnées droitières. Origines centrées, transformations normalisées. Les axes polaires sont orientés suivant Y.
- Rayon maximal de chaque globe : **1 unité**. Les formes légèrement non sphériques des modèles sources sont conservées. Définir tailles relatives, rotations axiales, inclinaisons, distances et orbites dans l'application ; les tailles sources ne sont pas des données astronomiques fiables.
- Anneaux générés : rayon intérieur 1,24 et extérieur 2,27 fois le rayon du globe. Globe et anneaux tournent ensemble via le pivot de Saturne.
- Ceinture d'astéroïdes : rayon maximal environ 1 unité, à régler séparément avec son pivot. Ce modèle représente une ceinture entière ; il ne fournit pas des astéroïdes individuels pour instanciation.
- Les normales ont été recalculées ; UV des globes conservés. Aucun triangle de surface nul ni UV de triangle dégénéré dans les maillages texturés finaux. Les UV dégénérés et inutilisés des astéroïdes ont été supprimés.
- Surfaces mates non métalliques ; Soleil émissif. Ajouter une lumière dans Babylon.js : le matériau émissif du Soleil n'éclaire pas automatiquement les autres astres. Faces arrière masquées, sauf anneaux à double face avec transparence.

## Textures mises à jour

Les neuf globes planétaires (Lune incluse) utilisent désormais de véritables images sources **2048 × 1024**, converties en **WebP qualité 88** et réembarquées dans chaque GLB. Les copies `.webp` voisines sont identiques aux images embarquées. Géométrie, normales, UV, matériaux et anneaux sont conservés.

| Corps | Ancienne résolution réellement embarquée | Nouvelle résolution |
|---|---:|---:|
| Terre, Mars, Vénus, Lune | 318 × 159 | 2048 × 1024 |
| Mercure (ancienne création artistique) | 1774 × 887 | 2048 × 1024 |
| Uranus, Neptune | 1024 × 512 | 2048 × 1024 |
| Jupiter, Saturne | 2048 × 1024 | 2048 × 1024, source documentée |
| Soleil | 2048 × 1024 | 1774 × 887, nouvelle photosphère ImageGen |
| Anneaux de Saturne | 2048 × 16 RGBA procédural | Inchangés |

**Attribution des planètes et de la Lune : Solar System Scope / INOVE**, [Solar Textures](https://www.solarsystemscope.com/textures/), sous [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/). Adaptation : conversion JPEG vers WebP, sans agrandissement ni détails générés. Les URL et empreintes des sources figurent dans `celestial-bodies/manifest.json` ; l'attribution est également embarquée dans les GLB.

Ces cartes équirectangulaires s'appuient sur les données et images de la NASA ; l'éditeur précise que certaines lacunes sont reconstituées et les couleurs légèrement accentuées. Elles ne constituent pas une cartographie scientifique parfaitement calibrée. La Terre utilise la carte diurne ; Vénus sa couverture nuageuse visible depuis l'espace, et non sa surface radar. Mercure et la Lune ont des cartes distinctes. Les couleurs de Neptune restent illustratives. Le Soleil est une nouvelle reconstitution ImageGen : granulation, petits groupes de taches et teinte dorée illustrative. Ce n’est pas une carte mesurée. Sa résolution native 1774 × 887 est conservée sans agrandissement ; son matériau émissif évite une seconde coloration orange et limite la surexposition. Voir `celestial-bodies/sun/README.md`.

Les anneaux de Saturne restent procéduraux et illustratifs. Leur transparence n'a pas été modifiée. Les anciennes images PNG, prompts et captures conservés dans le dossier de Mercure sont des archives de la version artistique, pas les assets chargés aujourd'hui.

### Budget et vérification de cette mise à jour

- Dix GLB : **2 169 928 → 3 587 388 octets** (environ +1,42 Mo). Aucun polygone ni téléchargement supplémentaire par modèle.
- Une surface 2K : environ **10,7 Mio GPU avec mipmaps** ; les dix surfaces représentent environ 104 Mio si toutes sont résidentes, hors anneaux et autres ressources. Le WebP réduit le transfert, pas la mémoire décodée. Les anciennes petites textures utilisaient moins de mémoire.
- Le plafond reste 2K. La configuration `low` actuelle ne redimensionne pas réellement les textures : ce lot utilise donc aussi les mêmes cartes en mode bas. Aucun benchmark sur téléphone physique n'est revendiqué.
- Le script contrôle octet par octet que les buffers de géométrie, les UV et les anneaux sont inchangés, et conserve les matériaux et accessors.
- Vérification visuelle dans Babylon.js 9.28.0 : les dix GLB se chargent, toutes les textures sont prêtes et les cartes s'appliquent correctement aux globes.

Reproduction depuis la racine : `node --use-system-ca scripts/refresh-planet-textures.mjs` (Node 24, `sharp` fourni par Next.js). Le script télécharge les sources officielles des planètes, réutilise le WebP solaire local, reconstruit les GLB et met à jour les tailles, chemins et empreintes du manifest. Il ne lance pas le test navigateur.

Les astéroïdes passent de **456 722 à 54 804 triangles** par décimation (environ −88 %). Leur silhouette globale est conservée, mais les petits reliefs et certains fragments peuvent être altérés. Charger cette ceinture à la demande ; pour de très faibles budgets mobiles, préférer ultérieurement des instances ou une représentation simplifiée. Aucun benchmark sur appareil physique n'est inclus.

## Intégration Next.js + Babylon.js

Utiliser `@babylonjs/core` et `@babylonjs/loaders` de même version. Les GLB ont été chargés avec **Babylon.js 9.28.0, WebGL 2**. L'extension **EXT_texture_webp est requise** : les GLB n'embarquent pas une seconde copie JPEG de secours. Les nouvelles surfaces sont de dimensions puissance de deux ; cibler WebGL 2. Pour d'anciens moteurs sans WebP, reconvertir les images embarquées avec les sources fournies.

```bash
npm install @babylonjs/core @babylonjs/loaders
```

Un helper TypeScript est fourni dans `examples/load-celestial-body.ts`. L'appeler depuis un composant `'use client'`, après création de la scène dans `useEffect` :

```ts
const earth = await loadCelestialBody(scene, 'earth', 1);
earth.pivot.position.set(0, 0, 0);
earth.pivot.rotation.z = 23.44 * Math.PI / 180;
// Lors du démontage ou du changement de mission :
earth.dispose();
```

Créer la scène avec `scene.useRightHandedSystem = true` **avant** les imports, ou garder le système Babylon par défaut et conserver la racine de conversion créée par son chargeur glTF. Le helper préserve cette racine. Si l'application utilise un `basePath` Next.js, passer le préfixe adapté via `assetBase`.

Gérer aussi le démontage pendant une requête asynchrone :

```ts
useEffect(() => {
  let cancelled = false;
  let asset: Awaited<ReturnType<typeof loadCelestialBody>> | undefined;
  loadCelestialBody(scene, 'earth').then(result => {
    if (cancelled) result.dispose();
    else asset = result;
  }).catch(error => { if (!cancelled) console.error(error); });
  return () => { cancelled = true; asset?.dispose(); };
}, [scene]);
```

Charger uniquement les corps nécessaires à chaque mission. Les WebP réduisent le téléchargement, mais une texture 2048 × 1024 occupe environ 8 Mio en RGBA, environ 10,7 Mio avec mipmaps. Libérer les assets inutilisés et limiter la résolution de rendu selon l'appareil. Ne pas charger les textures WebP externes en plus des textures déjà embarquées.

Documentation du chargeur : https://doc.babylonjs.com/features/featuresDeepDive/importers/glTF/

## Provenance historique des maillages et archives

Sources lues dans `D:\PROG\Mission Cosmos\src\3d\assets\solorsystem`. La conversation d'origine désigne le pack « Solar System Free Download » de CGTrader : https://www.cgtrader.com/free-3d-models/space/planet/solar-system-free-download . Cette provenance est **déclarée dans la conversation**, sans auteur ni fichier de licence présent dans le dossier fourni ; la licence n'a pas été vérifiée indépendamment.

`sources/models/` conserve les FBX originaux, renommés en anglais lowercase, et `sources/textures/` les JPEG originaux, y compris les trois images 4K. Les empreintes SHA-256 et le nom de fichier original sont dans le manifest. Les anneaux procéduraux et le matériau des astéroïdes ont été créés pour ce pack. Les originaux du dossier de projet n'ont pas été modifiés.

Les rapports du pack initial (non renouvelés par cette mise à jour de textures) sont historiques : `qa/source-inspection.json` décrit les FBX importés. `qa/mesh-checks.json` décrit les maillages après traitement. `qa/gltf-validation.json` contient le rapport Khronos et `qa/babylon-validation.json` le test de chargement réel et la disponibilité des textures. Les aperçus permettent de comparer le rendu. Le test navigateur utilise Chrome headless / SwiftShader sur ordinateur ; il ne certifie pas les performances d'un téléphone.

`FILELIST.sha256` permet de vérifier tous les fichiers livrés, hors lui-même.
