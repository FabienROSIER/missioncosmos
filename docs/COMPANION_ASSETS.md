# AST-003 — Compagnon visuel Mission Cosmos

Petit robot flottant, calme et curieux, pour guider les enfants de 6 à 12 ans. Coque blanche, visage bleu nuit, mains et expressions turquoise, détails dorés cohérents avec le logo. Nom du personnage à choisir ultérieurement.

Les fichiers runtime sont déjà installés dans `D:\PROG\Mission Cosmos\public\assets\sprites\companion\`. Le registre d'assets est mis à jour. Ces images sont prêtes à intégrer aux dialogues ; aucun composant de jeu ni système de dialogues n'est ajouté par cette livraison.

## Les neuf poses

| Clé | Usage |
|---|---|
| `neutral` | État d'attente, présence discrète |
| `welcome` | Accueil, introduction d'une mission |
| `happy` | Réussite, félicitation sobre |
| `surprised` | Découverte, curiosité scientifique |
| `thinking` | Question et réflexion |
| `encouraging` | Encouragement à poursuivre ou réessayer |
| `hint` | Indice, explication bienveillante après une erreur |
| `point-left` | Désigner une cible située à gauche dans l'image |
| `point-right` | Désigner une cible située à droite dans l'image |

## Fichiers et format

- `public/assets/sprites/companion/ast-003-companion-{pose}.webp` : 512 × 512, RGBA transparent, qualité WebP 88.
- `public/assets/sprites/companion/ast-003-companion-{pose}-256.webp` : 256 × 256, pour petits affichages mobiles.
- `manifest.json` : URLs, dimensions, poids, empreintes SHA-256, descriptions et usages pour chaque pose.
- `sources/` : neuf PNG originaux ImageGen, sans perte et avec transparence, et les prompts exacts. Copie dans le projet sous `docs/asset-sources/companion/`, hors bundle public.
- `qa/` : planches sur fonds clair et sombre, contrôle à 96 px et vérification du canal alpha.

Le cadrage carré complet est conservé sur chaque image : **ne pas recadrer chaque pose selon sa silhouette**, car cela déplacerait le personnage lors des changements d'état. Les fichiers conservent les marges et la place des mains. Le bas flottant est approximativement à `(50 %, 89,3 %)` du cadre. De petites variations d'alignement issues de la génération subsistent : ce sont des états statiques, pas les frames d'une animation squelettique ou d'un cycle interpolé.

## Intégration

Exemple d'URL : `/assets/sprites/companion/ast-003-companion-welcome.webp`.

Pour un affichage CSS de 128 × 128 pixels, la version 256 convient à un écran de densité 2× ; la version 512 permet les plus grands écrans ou les vues de dialogue. Précharger `neutral` et la prochaine pose utile ; éviter de charger toutes les sources PNG.

```html
<img
  src="/assets/sprites/companion/ast-003-companion-welcome-256.webp"
  srcset="/assets/sprites/companion/ast-003-companion-welcome-256.webp 256w,
          /assets/sprites/companion/ast-003-companion-welcome.webp 512w"
  sizes="128px"
  width="128"
  height="128"
  alt="Le compagnon te souhaite la bienvenue"
/>
```

Conserver un conteneur de taille fixe avec `object-fit: contain`. Dans Next.js, ces mêmes URLs peuvent être utilisées avec le composant Image du projet. Ajouter le préfixe de déploiement si l'app utilise un `basePath`.

Les paroles et les bulles doivent rester de vrais éléments de texte de l'interface, hors des images : traduction, lecteurs d'écran et taille des caractères restent ainsi possibles. Si le texte adjacent décrit déjà le message, utiliser `alt=""` pour la mascotte décorative. Une pose ne doit pas être la seule manière d'expliquer une erreur ou une réussite.

Les états ne changent pas la couleur fonctionnelle pour communiquer : le geste et le visage portent l'expression. Pour une éventuelle animation CSS de flottement ou de transition, respecter `prefers-reduced-motion`. Ne pas masquer une cible interactive sous la mascotte et conserver les contrôles tactiles accessibles.

## Direction et provenance

Personnage original créé à la demande du propriétaire avec **ImageGen intégré**, sans CLI ni API externe utilisée directement. La pose neutre sert de référence commune aux huit variantes, pour préserver l'identité et la lumière. Aucune image d'une mascotte tierce n'a été utilisée. Les prompts exacts et les contraintes de dessin sont dans `sources/prompts.json` ; aucune exclusivité juridique n'est revendiquée.

Brief livré : AST-003 ; neuf sprites 2D individuels ; transparence réelle ; cadrage frontal carré partagé ; palette du design system ; versions mobiles 512/256 ; sources originales conservées ; pas de texte dans les images. Les animations, la voix, le nom définitif et le système de dialogues restent des travaux distincts.
