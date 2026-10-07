# Mission 14 — Les trous noirs

Statut : parcours intégré jusqu’à la récompense ; validation finale de l’achèvement et du mobile encore à faire. Mis à jour le 5 octobre 2026.

## Intention et contraintes retenues

Validation utilisateur : phase visuelle acceptée. Ajout demandé d'une explication très courte du fonctionnement des trous noirs, en mots accessibles aux enfants. Le guide ouvre désormais un encart « C’est quoi, un trou noir ? », repliable, avant les observations : matière concentrée, gravité, horizon de non-retour et possibilité d'orbiter sans tomber.

Mission pour les 6–12 ans, après M13, durée cible de 8 à 12 minutes hors exploration libre. Question directrice : « Comment découvrir quelque chose dont la lumière ne peut pas sortir ? »

Faire observer et manipuler avant d'expliquer. Trois acquis : l'horizon est une frontière de non-retour ; un trou noir n'aspire pas tout ; ses effets sur son environnement permettent de le détecter. Le disque lumineux est un environnement possible, pas une caractéristique obligatoire.

Exigence utilisateur : s'inspirer des précédentes missions, réutiliser leurs éléments pertinents et atteindre un niveau de finition équivalent aux dernières missions. Cette exigence concerne aussi les expériences pédagogiques et le mode graphique réduit.

## Parcours détaillé

| Étape / identifiant proposé | Action de l'enfant et mise en scène | Progression et retour |
| --- | --- | --- |
| Introduction / `m14-intro` | Observer quelques étoiles en orbite autour d'une région invisible. Robot : « Ces étoiles tournent autour de quelque chose. Peux-tu trouver où ? » | Continuer manuellement ; aucune révélation automatique. |
| Observation / `m14-observe` | Tourner la scène, afficher les trajectoires, toucher une étoile pour suivre son mouvement. Aucun disque à cette étape. | Découverte terminée après observation d'une trajectoire ; pas de célébration de défi. |
| Alentours / `m14-surroundings` | Passer à un autre exemple entouré de gaz chaud. Explorer le disque de biais et de dessus, afficher les légendes. Robot : « Ce qui brille ici, c'est le gaz autour. » | Identifier le gaz puis la région centrale ; préciser que le changement montre deux exemples, pas une disparition physique du gaz. |
| Expérience / `m14-signals` | Dans une vue en coupe explicitement schématique, sélectionner deux émetteurs prédéfinis : dehors puis dedans. Déclencher un signal dirigé vers l'extérieur pour chacun. | Montrer une issue possible depuis l'extérieur et l'impossibilité de ressortir depuis l'intérieur. Après les deux observations, expliquer l'horizon. |
| Défi 1 / `m14-orbit` | Observer une planète éloignée de son étoile. Prédire ce qui arriverait si l'étoile était remplacée par un trou noir de même masse : orbite conservée, chute immédiate ou fuite. Lancer la comparaison. | Réussite après observation et réponse correcte. Une erreur donne un indice et permet une nouvelle prédiction. |
| Défi 2 / `m14-detect` | Examiner trois régions candidates dans un champ d'étoiles, sans disque lumineux. Rechercher le centre commun des orbites. Sélectionner une région puis afficher les trajectoires comme indice si nécessaire. | Réussite sur la région cohérente avec les trajectoires. Ne pas accepter simplement le clic sur une forme noire visible. |
| Explication / `m14-explain` | Revoir trois repères visuels : horizon, orbite distante et étoiles révélant un objet invisible. | Texte court, puis accès facultatif à « En savoir plus ». |
| Quiz / `m14-quiz` | Répondre à quatre questions courtes avec le robot. | Indice explicatif et nouvel essai en cas d'erreur, fonctionnement commun aux missions. |
| Récompense / `m14-reward` | Recevoir le badge « Détective de l'invisible ». | Enregistrer la réussite ; ne pas inventer une mission suivante. |
| Exploration / `m14-complete` | Revenir aux exemples avec ou sans disque, aux signaux et à la comparaison des orbites. | Rejouer les expériences sans modifier les récompenses acquises. |

### Textes clés

- Horizon : « Cette limite s'appelle l'horizon des événements. Une fois à l'intérieur, même la lumière ne peut plus ressortir. Ce n'est pas un mur. »
- Orbite : « De loin, un trou noir attire comme un autre objet de même masse. Notre planète peut continuer à tourner autour. »
- Indice du défi orbital : « La masse au centre est restée la même. Observe aussi la distance de la planète. »
- Détection : « Nous ne recevons pas de lumière venant de l'intérieur. Mais les mouvements des étoiles nous donnent des indices. »
- Limite de la détection : « Ici, nous cherchons un trou noir déjà identifié. Dans la réalité, les scientifiques doivent mesurer les mouvements et vérifier leurs explications. »
- Comparaison imaginaire : « Nous échangeons les objets dans une maquette. Le Soleil ne deviendra pas un trou noir. »

### Quiz proposé

1. Vue en coupe : « Depuis quelle position un signal dirigé vers l'extérieur peut-il encore nous parvenir ? » Réponse : la position extérieure proposée. Retour : depuis l'intérieur, aucune direction ne permet de ressortir.
2. Deux orbites distantes et masses centrales égales : « La planète doit-elle tomber immédiatement quand nous changeons l'objet central ? » Réponse : non. Retour : la masse et les conditions de son orbite sont conservées.
3. Deux exemples, avec et sans disque : « Peut-on chercher un trou noir même sans anneau lumineux ? » Réponse : oui, notamment grâce aux mouvements d'étoiles proches. Retour : tous les trous noirs n'ont pas un disque lumineux.

Glossaire proposé : trou noir, horizon des événements, disque d'accrétion ; réutiliser gravité et orbite si les entrées existent déjà. Formation, lumière déviée et différences d'écoulement du temps restent des compléments facultatifs, sourcés avant rédaction finale.

## Continuité visuelle et réutilisation

Références identifiées dans le code ; leur rendu effectif devra être comparé à M14 dans le navigateur pendant la réalisation.

| Élément | Référence existante | Décision pour M14 |
| --- | --- | --- |
| Fond spatial | `src/3d/utils/imageSpaceBackground.ts`, employé dans M12 et M13 | Réutiliser le fond image et ajuster sobrement son intensité. Garder les étoiles de fond lisibles autour du disque. |
| Étoiles détaillées | `src/3d/entities/createStarMesh.ts` et les textures de M08 | Réutiliser les surfaces et couronnes pour les étoiles proches ; limiter le nombre d'objets détaillés. |
| Planète et étoile du défi | `CelestialBodyEntity`, matériaux planétaires et solaires utilisés par `CosmicScaleView.tsx` | Réutiliser les modèles texturés et leur éclairage. Conserver cadrage, position et vitesse de la planète entre les deux cas. |
| Profondeur et transitions | `GalaxiesScene.tsx`, `CosmicScaleView.tsx` | Reprendre les fondus, cadrages et hiérarchies de contraste ; ne pas employer un spécimen de galaxie comme disque d'accrétion. |
| Signaux et commandes | `LightTravelChallenge.tsx`, `SceneControls` | Reprendre le vocabulaire visuel des signaux, boutons et états ; créer une logique propre à l'horizon, indépendante du calcul de trajet de M13. |
| Guide, quiz, récompense | `MissionImmersive`, compagnon, `MissionQuiz`, composants de récompense | Conserver le parcours et l'interface communs, les espacements, polices, couleurs et comportements tactiles. |
| Qualité et mouvement | `graphicsQuality.ts`, `prefersReducedMotion`, `docs/PERFORMANCE.md` | Utiliser les profils existants low/medium/high, réduire les effets décoratifs et libérer les ressources au départ de la scène. |

### Nouvel élément principal : trou noir et environnement

Vue immersive : région centrale sombre, disque incliné avec variations radiales de teinte et de luminosité, matière structurée en filaments et animation lente. Palette ambre, or et blanc chaud, compatible avec l'accent solaire de l'interface. Éviter un anneau uniformément orange, des contours crénelés, des transparences qui se superposent mal ou un halo qui efface la matière.

Le disque doit conserver une épaisseur visuelle et une présence cohérentes lors des changements de point de vue. Les étoiles et objets derrière la région opaque ne doivent pas transparaître. La caméra garde une distance minimale et ne traverse pas le modèle.

L'effet de lumière déviée autour de la région sombre fera l'objet d'un prototype dédié. Un arc décoratif figé dans l'espace ou un anneau plaqué face caméra ne suffit pas à un rendu final cohérent sous rotation. Si une approximation stylisée est retenue, l'indiquer comme telle et vérifier sa stabilité sous tous les angles autorisés. Aucune simulation relativiste complète n'est promise.

Ne pas confondre l'ombre apparente du trou noir avec son horizon. Le repère de l'horizon est réservé à la vue schématique ou à une superposition explicitement pédagogique ; ne pas tracer ce repère directement sur le bord de l'ombre comme s'ils coïncidaient.

Mode réduit : conserver les structures principales du disque, les textures des astres et les contrastes. Réduire en priorité les particules secondaires et les effets coûteux. L'identité visuelle doit rester celle de la même mission.

### Trois cadrages de référence à produire

1. Immersion : trou noir avec disque vu de trois quarts, sans repères, détails lumineux visibles et guide ouvert.
2. Observation : étoiles en orbite autour d'une région invisible, trajectoires activées et indice de sélection lisible.
3. Expérience : coupe de l'horizon avec émetteurs, état du signal et commandes, sans ambiguïté entre schéma et vue immersive.

Comparer ces cadrages aux dernières missions avec les mêmes dimensions d'écran et le même profil graphique. Contrôler aussi les vues de dessus et de côté, le guide replié, le quiz et le passage entre expériences.

## Garde-fous scientifiques et pédagogiques

- Aucun aspirateur cosmique, entonnoir matériel, portail ou intérieur prétendument observable.
- L'horizon n'est ni une surface solide ni une frontière garantissant la sécurité juste à l'extérieur.
- L'expérience des signaux illustre une propriété, sans suggérer une lumière qui ralentit progressivement jusqu'à s'arrêter. Elle ne représente pas l'observation distante du franchissement d'un horizon.
- À l'extérieur, ne pas affirmer que tous les signaux s'échappent : utiliser un exemple extérieur et une direction appropriés.
- La comparaison des orbites conserve masse centrale, distance et vitesse initiale ; elle se déroule loin de l'horizon dans le régime où le modèle orbital simplifié est adapté. Ne pas extrapoler cette simulation près du trou noir.
- Le gaz lumineux appartient aux alentours ; ne pas représenter une lumière émise par l'intérieur. Le bouton de changement d'exemple ne signifie pas que le disque cesse instantanément d'exister.
- Une orbite autour d'une région invisible constitue un indice, pas à elle seule une preuve générale qu'il s'agit d'un trou noir.
- Mention courte : « Maquette pédagogique : tailles, distances et durées adaptées. Effets lumineux stylisés. » Les limites propres à chaque expérience restent accessibles au moment utile.

## Lots de réalisation et critères de sortie

### 1. Conception — ce document

- [x] Définir le parcours, les deux défis, les quatre questions et les retours.
- [x] Identifier les éléments existants à réutiliser et les exigences visuelles.
- [x] Définir les limites des modèles et les vérifications attendues.

### 2. Prototype visuel intégré

- [x] Lire les guides locaux Next.js pertinents avant toute modification de code.
- [x] Créer une entité dédiée au trou noir et au disque, avec mise à jour et nettoyage des ressources.
- [x] Construire la scène sur `BabylonCanvas` avec le fond, les astres et les contrôles existants.
- [x] Produire les trois cadrages de référence et vérifier le disque sous rotation.
- [ ] Comparer visuellement M14 à M08/M11/M12/M13 ; corriger les écarts de finition avant extension des activités.

### 3. Expériences et contenu

- [x] Ajouter `src/content/missions/mission-14.ts`, le quiz et les entrées de glossaire nécessaires.
- [x] Implémenter les signaux, la comparaison à masse égale et la détection par les orbites.
- [ ] Séparer calculs/états pédagogiques, contenu français et rendu Babylon.
- [ ] Conserver les découvertes sans célébration ; réserver le retour de victoire aux défis réussis.

_Premier lot intégré le 5 octobre 2026 : `mission-14.ts`, récompense et trois entrées de glossaire ajoutés ; scène pilotée par `m14-intro`, `m14-observe`, `m14-surroundings` et `m14-signals`. L’enfant suit réellement l’étoile dorée avec la caméra, clique directement sur le gaz puis sur la région centrale, et teste successivement un signal extérieur et un signal intérieur. Ces trois réussites utilisent `completionMode: discovery` et n’affichent pas de célébration._

_Défi orbital intégré le 5 octobre 2026 : maquette dédiée avec étoile centrale, planète texturée et orbite conservée ; trois prédictions, remplacement visuel par un trou noir de même masse, nouvel essai après erreur et réussite uniquement après observation de la bonne prédiction. La distance, la vitesse de la planète et la trajectoire restent inchangées pendant le remplacement._

_Défi de détection intégré le 5 octobre 2026 : trois régions sans objet noir visible, trois mouvements stellaires par région, sélection directe A/B/C et trajectoires facultatives comme indice. La région correcte montre trois orbites partageant un même centre ; les deux autres montrent des trajectoires autour de centres différents. Une erreur explique quoi comparer et autorise un nouvel essai. Vérifié avec et sans indice sur ordinateur, puis en portrait 390×844 avec cibles tactiles de 48 px._

_Quiz intégré le 5 octobre 2026 : quatre questions sur l’horizon, l’attraction à masse égale, le gaz lumineux et la détection par les orbites. Chaque erreur fournit un indice lié à une manipulation déjà réalisée. Parcours avec erreur, nouvel essai, quatre bonnes réponses et transition vers la récompense vérifié._

### 4. Intégration au parcours

- [x] Enregistrer mission, scène, quiz et récompense dans les registres existants.
- [ ] Vérifier le déblocage depuis M13 et l'accès depuis la zone déjà associée à M14.
- [ ] Vérifier sauvegarde, reprise, retour à la carte, récompense unique et exploration finale.

### 5. Vérification finale

- [ ] Vérifier par des tests ciblés que les défis ne réussissent pas avant l'action attendue et qu'un nouvel essai réinitialise correctement les états.
- [ ] Vérifier l'invariance du modèle orbital distant lorsque seule la représentation de la masse centrale change.
- [ ] Exécuter les contrôles de typage, lint et build prévus par le projet.
- [ ] Comparer des captures aux missions de référence sur ordinateur et mobile, portrait et paysage, profils low et high.
- [ ] Vérifier les cibles tactiles de 48 px, le focus clavier, les petits écrans et l'absence de commandes masquées par le guide.
- [ ] En mouvement réduit, proposer des états successifs lisibles pour les expériences nécessaires et supprimer les mouvements décoratifs.
- [ ] Mesurer la fluidité et les ressources après plusieurs entrées/sorties ; viser les objectifs indicatifs existants de 30 FPS mobile et 50 FPS ordinateur, en documentant l'appareil utilisé et toute mesure non effectuée.
- [ ] Relire les explications et sourcer les compléments ; actualiser le suivi M14 seulement à mesure de sa réalisation.

## Références scientifiques

### Vérification du prototype — 5 octobre 2026

Le chemin `/mission/mission-14/` utilise désormais `MissionImmersive`. Les trois premières découvertes et l’expérience des signaux sont jouables et leur reprise est sauvegardée. Aucun badge ni achèvement de mission ne peut encore être enregistré : l’étape suivante, `m14-orbit`, reste volontairement bloquée jusqu’à l’implémentation du premier défi.

Le nouveau matériau intègre des rayons déviés de manière artistique dans un disque défini dans l'espace : les images du disque évoluent avec la caméra. Le fond reste le fond image commun, sans déviation des étoiles de fond. Le rendu ne simule pas les équations de la relativité générale. Le nombre d'étapes d'intégration est adapté aux profils graphiques.

Contrôles réalisés : TypeScript et build de production réussis ; ESLint ciblé sur les fichiers modifiés réussi. Le lint global est en échec, notamment sur les fichiers générés de `.pages-preview` et les effets React préexistants de `InstallPrompt` et `MusicProvider` ; aucune correction hors périmètre n'a été appliquée.

Vérification dans le navigateur : comparaison avec M12 et M13 ; vue inclinée, vue de dessus et rotation libre ; passage entre les trois vues ; pause et masquage des trajectoires ; écran 1280×800, portrait 390×844 et paysage 844×390 ; profil bas sans erreur ni avertissement de console dans l'onglet de contrôle. Le réglage graphique a été remis sur Auto après vérification. Le défaut initial des pointillés de l'horizon a été corrigé et contrôlé après rechargement de la scène.

À poursuivre : revue visuelle finale avec les expériences réelles et le guide de mission commun, comparaison M08/M11, contrôle sur appareil mobile physique, mesures FPS/mémoire et mode mouvement réduit. Les observations de mise en page ne constituent pas une mesure des performances sur mobile.

Correction après retour utilisateur : remplacement du contour et du disque 3D de l'horizon par une coupe SVG contrastée. La frontière en pointillés, l'intérieur et les légendes partagent désormais le même repère ; leur affichage ne dépend plus de la caméra ni des lignes WebGL. Contrôlé après rechargement, sur ordinateur et en 390×844. Le shader immersif du trou noir reste identique.

Vue des étoiles enrichie à la demande de l'utilisateur : sphère noire opaque de rayon visuel 1,2 pour masquer l'arrière-plan ; étoile dorée sur une ellipse de demi-grand axe 5,5 et d'excentricité 0,62, foyer à l'origine. L'anomalie moyenne progresse uniformément et l'équation de Kepler détermine la position : la vitesse au passage le plus proche vaut environ 4,3 fois celle au plus loin. Les deux autres orbites sont circulaires, inclinées en 3D ; toutes partagent la même relation période/demi-grand axe. Ces nombres sont des paramètres de maquette, pas une échelle physique du trou noir. Le modèle newtonien ne décrit pas les effets relativistes près de l'horizon. Un indicateur donne la vitesse relative de l'étoile dorée ; pause et reprise de l'orbite permettent de comparer les passages. Quatre tests vérifient distances extrêmes, périodicité, loi des aires et rapport des vitesses. Pour le futur défi de détection, prévoir de masquer ce repère central afin de préserver la recherche par les indices.

### Sources

- [NASA — Orbits and Kepler’s Laws](https://science.nasa.gov/solar-system/orbits-and-keplers-laws/) : foyer de l'ellipse, loi des aires et variation de la vitesse dans le modèle orbital simplifié.

- [NASA — Black Holes](https://science.nasa.gov/universe/black-holes/) : horizon, propriétés générales et idées fausses.
- [NASA — Anatomy](https://science.nasa.gov/universe/black-holes/anatomy/) : disque, environnement et distinction des structures.
- [NASA — What Are Black Holes?](https://www.nasa.gov/universe/what-are-black-holes/) : définition et détection.
- [NASA — 10 Questions You Might Have About Black Holes](https://science.nasa.gov/universe/10-questions-you-might-have-about-black-holes/) : explications complémentaires et limites de l'observation.

Ces références accompagnent le plan ; vérifier les textes définitifs et toute valeur chiffrée ajoutée avant publication.
