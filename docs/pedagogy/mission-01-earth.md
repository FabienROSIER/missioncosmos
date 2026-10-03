# Notre Terre — expédition de navigation

## Diagnostic comparatif (3 octobre 2026)

Revue des contenus, des conditions de réussite et des dispositifs visuels des missions présentes dans le dépôt. Cette revue de code ne remplace pas une recette exhaustive de chaque mission sur appareil physique. Vérification navigateur ciblée sur Notre Terre ; inspection visuelle des introductions Étoiles et Lumière.

| Mission                          | Mécanique et enjeu existants                                                | Support visuel et constat                                                                                                                                                            |
| -------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 01 · Notre Terre, avant révision | Trois clics guidés puis déplacement orbital                                 | Globe initial éloigné, cibles déjà surlignées, aucune collection visible. L’accumulation des mouvements permettait de gagner en faisant des allers-retours sur une portion d’orbite. |
| 02 · Jour et nuit                | Placer le Guide au jour puis dans la nuit                                   | Terre éclairée et point de vue à la surface : conséquence directe de la manipulation, enjeu simple mais incarné.                                                                     |
| 03 · Phases de la Lune           | Produire pleine Lune et croissant                                           | Double point de vue orbital / terrestre, cohérent avec la question de la forme apparente.                                                                                            |
| 04 · Éclipses                    | Réussir deux alignements                                                    | Cônes d’ombre et vue depuis la Terre rendent le résultat spectaculaire et observable.                                                                                                |
| 05 · Système solaire             | Ranger les planètes, comparer les tailles, aider une sonde à se situer      | Plusieurs représentations adaptées aux tailles et aux distances ; mission plus dense, vigilance sur la charge de lecture.                                                            |
| 06 · Orbites                     | Comparer les années, trouver une vitesse de mise en orbite                  | Contrôle du temps puis expérience de lancement ; essais et conséquences constituent un véritable jeu.                                                                                |
| 07 · Saisons                     | Manipuler la position et comparer une Terre inclinée / non inclinée         | Axe et rayons rendent visible le phénomène ; objectif été au nord.                                                                                                                   |
| 08 · Étoiles                     | Cadrer trois étoiles à distance variable pour compléter un album            | Mire, télescope, vue de profil et photos validées : bonne référence pour une progression concrète, sans chronomètre.                                                                 |
| 09 · Lumière                     | Placer un prisme puis produire quatre mélanges pour rallumer l’observatoire | Banc optique, faisceaux et écran : chaque action transforme la scène. Référence pour un objectif final compréhensible.                                                               |
| Constellations                   | Compléter un atlas puis retrouver un point de vue                           | Figures révélées et voyage en profondeur ; collection et découverte perceptive se renforcent.                                                                                        |
| 10 · Voie lactée                 | Situer le Soleil puis retrouver son trajet galactique                       | Voyage de changement d’échelle, disque de face/profil, adresse cosmique.                                                                                                             |
| 11 · Galaxies                    | Réparer des fiches de formes et reconstruire les échelles                   | Maquettes manipulables, album et classement ; objectifs visibles.                                                                                                                    |
| 12 · Distances                   | Voyage entre sept repères, classement des destinations, messagers lumineux  | Recul cosmique et frise du temps ; enjeu narratif lié au robot et à l’observatoire.                                                                                                  |
| 13 · Trous noirs                 | Entrée de catalogue uniquement                                              | Page « Mission en préparation » : aucune mécanique jouable à comparer.                                                                                                               |

Le principal écart de la mission 01 était l’absence de résultat construit par l’enfant. Les meilleures références associent une action, sa conséquence observable et une collection ou un appareil à compléter. La révision reprend ce principe en conservant le niveau d’entrée et les trois idées centrales : sphère, repères, révolution autour du Soleil.

## Nouveau parcours

1. Préparer la carte de navigation de notre planète avant le départ vers les étoiles ; découvrir son volume en tournant autour du globe.
2. Retrouver l’équateur à partir de sa fonction de séparation nord / sud.
3. Retrouver les deux extrémités de l’axe. Trois balises s’enregistrent dans la carte et changent d’aspect sur le globe.
4. Faire une révolution complète autour du Soleil. Le compteur et la trace orbitale montrent la progression vers une année.
5. Voir la carte complétée, distinguer rotation et révolution, puis terminer le quiz et recevoir le badge existant.

Les cibles ne sont plus surlignées à l’avance. Choix possibles par sélection 3D ou grands boutons accessibles au clavier. Une mauvaise réponse donne un indice sans pénalité. Les boutons ne sont utilisables que pendant le jeu ; relire masque les commandes et interrompt les entrées sans effacer le trajet.

## Rendu et limites

- Globe cadré plus près ; texture GLB existante conservée.
- Atmosphère par transparence de Fresnel limitée au bord, sans voile opaque sur les continents.
- Quadrillage cartographique, axe pointillé, balises sphériques visibles sous tous les angles.
- Orbite avec quatre jalons et trace mise à jour dans un seul mesh, sans boucle d’animation supplémentaire.
- Bilan de navigation dans la scène après le défi.
- Tous les nouveaux éléments Babylon sont libérés avec la scène ; pas de nouvel asset ni de dépendance.
- La caméra tourne autour de la Terre pendant l’observation : ce geste n’est pas présenté comme sa rotation physique.
- Le compteur utilise environ 365 jours par tour ; distances, tailles, cercle orbital et vitesse restent schématiques.
- Les repères et le trajet sont imaginaires : suppression de la formulation « la Terre roule sur une piste ».
- Identifiants des étapes, quiz et récompense conservés. La carte reconstitue ses découvertes depuis l’étape sauvegardée ; le trajet partiel reprend à zéro lors d’un rechargement, comme un défi en cours.

## Validation

- Parcours navigateur : introduction, mauvaise réponse, trois balises, demi-tour, relire/reprendre sans perte, tour complet, bilan, quiz, récompense, fin de mission et remise à zéro.
- Affichages contrôlés : ordinateur 1365 × 900 et portrait 390 × 844.
- Tests unitaires : année complète dans les deux sens, allers-retours non validants, restauration et remise à zéro de la carte.
- Suite globale : 170 tests passent ; compilation de production réussie.
- Lint ciblé réussi (y compris le quiz mis à jour). Lint global bloqué par les répertoires générés `.pages-preview` / `coverage` et des erreurs préexistantes dans `InstallPrompt.tsx` et `MusicProvider.tsx`.
