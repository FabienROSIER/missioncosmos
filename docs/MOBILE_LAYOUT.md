# Affichage smartphone

## Structure du projet concernée

- Next.js App Router, export statique et PWA. Les profils et la progression sont locaux.
- `AppShell` encadre les menus ; `UniverseMap` contient la carte et les missions.
- `MissionImmersive` orchestre les sept missions, les étapes, les défis, les quiz et le glossaire.
- Les scènes Babylon restent montées pendant les changements d'étape. Leurs API pilotent les caméras et les expériences depuis React.
- Les vues secondaires jour/nuit, phases et éclipses synchronisent leur caméra avec un cadre HTML.

## Problèmes corrigés

Les menus masquaient leurs débordements alors que le document ne défile pas. La navigation comptait cinq liens pour quatre colonnes. En mission, la scène, les commandes, les consignes et les vues secondaires partageaient le même espace absolu. Certains panneaux interdisaient aussi les gestes de défilement. Réduire uniquement les polices ne pouvait pas résoudre ces conflits.

## Disposition retenue

Les nouvelles règles ciblent les largeurs jusqu'à 899 px, ainsi que les écrans à pointeur tactile jusqu'à 1180 × 600 px (téléphones en paysage). La constante `MOBILE_GAME_QUERY` et les media queries CSS doivent rester synchronisées.

- **Portrait :** barre supérieure sur deux lignes, scène indépendante, panneau inférieur défilable plafonné à 42 % de la hauteur visible.
- **Paysage :** barre supérieure sur une ligne, scène à gauche, panneau défilable à droite.
- **Commandes :** `SceneControls` conserve le DOM original sur desktop et utilise un portail vers le panneau sur mobile. Les boutons Consigne / Commandes ne démontent pas la scène et conservent ses réglages.
- **Gestes :** manipulation 3D limitée au canvas ; défilement vertical autorisé dans le panneau. Les boutons principaux et curseurs ont une hauteur tactile de 48 px.
- **Petites planètes :** des boutons supplémentaires dans Commandes exécutent le même traitement que la sélection 3D pour l'ordre des planètes et la course orbitale. Ils restent masqués sur desktop.
- **Cadrage :** un ResizeObserver adapte le moteur à la taille réelle du canvas. Le champ de vision mobile dépend de son ratio et de la scène ; le globe et la vue des saisons ont des marges distinctes. Le champ de vision desktop reste inchangé.
- **Menus :** navigation sur cinq colonnes dans le flux, contenus défilables et prise en compte des zones sûres de l'écran.
- **Desktop :** les règles existantes restent en place. Le conteneur supplémentaire de scène utilise `display: contents` hors mobile ; les nouveaux boutons de panneau sont masqués.

## Vérifications

Émulation Chromium avec tactile : 320 × 568, 390 × 844, 667 × 375, 844 × 390 et 932 × 430. Vérification des cinq menus et sept missions : navigation sur une ligne, canvas dimensionné, absence de recouvrement entre scène et panneau, accès aux commandes.

Cas complémentaires : réponses des activités tailles/distances, quiz, lancement orbital, curseur des saisons conservé après rotation et geste tactile sur le canvas. Comparaison de l'accueil desktop 1440 × 900 avant/après : identique hors animation du compagnon.

Les défis d'ordre des planètes et de course orbitale ont également été terminés avec les boutons tactiles, en vérifiant le refus d'une mauvaise réponse puis l'accès à l'étape suivante. TypeScript, build statique et les 69 tests Vitest passent. Le lint des fichiers techniques modifiés passe ; le lint global reste en échec sur des erreurs préexistantes (notamment des effets React et des fichiers générés dans `.pages-preview`).

À vérifier sur appareils physiques : Safari iOS, barres du navigateur rétractables, encoche, clavier virtuel et performances GPU. L'émulation ne mesure pas la fluidité d'un véritable téléphone.
