# Mission Cosmos — assets mobiles indépendants

Copier **le contenu de `public/`** dans le dossier `public/` de l'application Next.js. Les onze GLB se chargent indépendamment. Chaque GLB embarque ses textures WebP : les fichiers WebP voisins sont des copies de travail facultatives, sans requête supplémentaire au chargement du GLB. Ne pas déployer `sources/` ou `qa/` dans `public/`.

```text
public/assets/celestial-bodies/
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

## Textures et limites des sources

| Corps | Source fournie | Version mobile |
|---|---:|---:|
| Soleil, Jupiter, Saturne | 4096 × 2048 malgré le préfixe « 8k » | WebP 2048 × 1024 |
| Uranus, Neptune | 1024 × 512 | WebP 1024 × 512 |
| Mercure, Vénus, Terre, Lune, Mars | 318 × 159 | WebP 318 × 159 |
| Anneaux de Saturne | Aucune texture dédiée fournie | WebP RGBA procédural 2048 × 16 |
| Astéroïdes | Aucune texture ni matériau fourni | Matériau roche mat |

Les images ne sont pas agrandies artificiellement. Les cinq textures 318 × 159 sont visiblement floues en gros plan. Les JPEG **Mercure et Lune sont strictement identiques** (SHA-256 identique) ; leurs associations fournies ont été conservées, sans prétendre à une représentation scientifique correcte. Les textures et UV peuvent montrer un pincement aux pôles ; aucune nouvelle cartographie scientifique n'a été créée.

Neptune référençait `Neptun.jpg` dans un chemin disparu : le modèle utilise maintenant le `Neptune.jpg` fourni. Le Soleil a reçu sa texture explicite. Les matériaux importés ont été reconstruits pour éviter les anciens chemins et nœuds inutilisables ; aucune fausse normal map n'a été générée.

Saturne avait un anneau épais utilisant le matériau du globe, sans texture d'anneaux. Il a été remplacé par une surface annulaire légère avec bandes et transparence procédurales, **illustratives, non issues d'une carte mesurée**. Le pôle UV du globe source était décalé par rapport au plan des anneaux ; il a été réaligné. L'anneau source reste récupérable dans le FBX archivé.

Les astéroïdes passent de **456 722 à 54 804 triangles** par décimation (environ −88 %). Leur silhouette globale est conservée, mais les petits reliefs et certains fragments peuvent être altérés. Charger cette ceinture à la demande ; pour de très faibles budgets mobiles, préférer ultérieurement des instances ou une représentation simplifiée. Aucun benchmark sur appareil physique n'est inclus.

## Intégration Next.js + Babylon.js

Utiliser `@babylonjs/core` et `@babylonjs/loaders` de même version. Les GLB ont été chargés avec **Babylon.js 9.28.0, WebGL 2**. L'extension **EXT_texture_webp est requise** : les GLB n'embarquent pas une seconde copie JPEG de secours. Le validateur indique seulement une information NPOT pour les textures 318 × 159 ; cibler WebGL 2. Pour d'anciens moteurs sans WebP, reconvertir les images embarquées avec les sources fournies.

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

## Provenance, archives et vérification

Sources lues dans `D:\PROG\Mission Cosmos\src\3d\assets\solorsystem`. La conversation d'origine désigne le pack « Solar System Free Download » de CGTrader : https://www.cgtrader.com/free-3d-models/space/planet/solar-system-free-download . Cette provenance est **déclarée dans la conversation**, sans auteur ni fichier de licence présent dans le dossier fourni ; la licence n'a pas été vérifiée indépendamment.

`sources/models/` conserve les FBX originaux, renommés en anglais lowercase, et `sources/textures/` les JPEG originaux, y compris les trois images 4K. Les empreintes SHA-256 et le nom de fichier original sont dans le manifest. Les anneaux procéduraux et le matériau des astéroïdes ont été créés pour ce pack. Les originaux du dossier de projet n'ont pas été modifiés.

`qa/source-inspection.json` décrit les FBX importés. `qa/mesh-checks.json` décrit les maillages après traitement. `qa/gltf-validation.json` contient le rapport Khronos et `qa/babylon-validation.json` le test de chargement réel et la disponibilité des textures. Les aperçus permettent de comparer le rendu. Le test navigateur utilise Chrome headless / SwiftShader sur ordinateur ; il ne certifie pas les performances d'un téléphone.

`FILELIST.sha256` permet de vérifier tous les fichiers livrés, hors lui-même.
