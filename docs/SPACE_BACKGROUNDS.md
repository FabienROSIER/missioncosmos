# Fonds d'univers — Mission Cosmos

Trois fonds originaux créés avec ImageGen intégré, assortis à l'ambiance bleu nuit de l'application, sans planètes, texte ou vaisseaux incrustés.

| ID | Fond | Usage conseillé |
|---|---|---|
| AST-021 | `starfield` | Fond par défaut des missions, ciel étoilé discret |
| AST-022 | `nebula` | Exploration, ambiance turquoise et violet doux |
| AST-020 | `milky-way` | Présentation artistique de la Voie lactée |

Installés dans le projet sous `public/assets/textures/backgrounds/`. Chaque fond existe en WebP natif **1774 × 887** et en WebP mobile **1024 × 512**. Les sources PNG sont conservées hors du dossier public dans `docs/asset-sources/backgrounds/`. Le manifest contient les URLs, tailles, poids et empreintes.

## Derrière les modèles 3D

Le mode recommandé est un **Layer Babylon.js d'arrière-plan**, cadré en `cover` sans étirement. Il reste fixé à l'écran pendant les mouvements de la caméra et laisse les objets 3D devant lui. `examples/space-background.ts` fournit ce petit helper, avec adaptation portrait/paysage et nettoyage des ressources.

```ts
const background = createSpaceBackground(
  scene,
  '/assets/textures/backgrounds/ast-021-space-starfield-mobile.webp',
);
// Lors d'un changement de décor ou du démontage :
background.dispose();
```

Créer ce fond côté client, après la scène. Charger un seul fond à la fois ; détruire l'ancien avant de changer d'ambiance. La version mobile suffit aux petits écrans, la native offre plus de détails sur tablette. La classe Layer n'intercepte pas les clics sur les maillages.

## Panorama sphérique facultatif

Les images sont composées en **2:1 pour un placage équirectangulaire**. Elles peuvent être utilisées sur une sphère vue de l'intérieur ou un PhotoDome pour que le décor suive la direction du regard. Elles ne sont pas six faces de cubemap et ne doivent pas être chargées comme telles. Les raccords gauche/droite et les pôles ne sont pas garantis parfaitement périodiques par la génération : vérifier ces zones si la caméra peut tourner librement à 360°. Le mode Layer recommandé ne présente pas ce raccord.

Ces fonds RGB ne sont ni HDR ni des textures d'éclairage PBR. Ajouter séparément les lumières de la scène ; un fond lumineux ne doit pas remplacer le Soleil dans une activité sur le jour et la nuit.

Les étoiles et la Voie lactée sont **des interprétations artistiques**, sans coordonnées astronomiques fiables. Ne pas les utiliser pour enseigner la position réelle d'une étoile ou d'une constellation. L'échelle apparente de la nébuleuse est scénographique.

## Livraison

- `public/assets/textures/backgrounds/` : six WebP et un manifest.
- `sources/` : trois PNG originaux et prompts exacts ImageGen.
- `examples/space-background.ts` : helper d'affichage, non branché automatiquement à l'application.
- `qa/` : aperçu et captures du test derrière Jupiter dans Babylon.js, en portrait et paysage.

Le registre d'assets du projet est mis à jour. Les écrans existants ne sont pas modifiés : le choix du fond par mission reste au code du jeu.


### Fond image fin pour la mission 01 — AST-021 v2

`public/assets/textures/backgrounds/ast-021-space-starfield-fine-v2.webp` : ImageGen, étoiles fines et brume bleutée discrète, WebP sans perte, résolution native 1672 × 941. Branché dans `EarthPreviewScene` via `imageSpaceBackground.ts`, en remplacement des points 3D ; voûte sphérique centrée sur la caméra, image répétée pour conserver des étoiles fines, orientation fixe dans le monde. Le fond défile lors des rotations de caméra. Texture émissive à 0,8, sans couleur additive avec conversion sRGB correcte pour éviter la surexposition. Anciennes images conservées pour les menus.
