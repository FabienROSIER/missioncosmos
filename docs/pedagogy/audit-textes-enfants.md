# Audit des textes affichés — Mission Cosmos

Audit du 6 octobre 2026. Public : enfants de 6 à 12 ans, **avec les futurs dialogues oraux pour accompagner les plus jeunes**.

La majorité des textes sont déjà accessibles. Les propositions ci-dessous concernent les passages dont le sens ou l’action risquent de rester difficiles à comprendre, même lus à voix haute. Les mots scientifiques utiles à l’apprentissage sont conservés lorsqu’ils sont expliqués. Les noms d’étoiles, les grands nombres et les notions abstraites ne constituent pas, à eux seuls, des motifs de correction.

Chaque ligne est une proposition, pas une modification du jeu. Les extraits entre guillemets sont les passages actuels concernés ; une ligne peut regrouper plusieurs occurrences. **Révision : les remplacements privilégient désormais des textes courts à l’écran.** Les indications **Oral** sont destinées aux futurs dialogues et ne doivent pas être ajoutées au texte affiché. Certaines corrections deviennent facultatives si le dialogue explique déjà le terme au bon moment.

**Méthode et limites.** Audit des sources et des conditions d’affichage : carte, profils, collection, réglages, 14 missions jouables, scènes, commandes, consignes, indices, retours après réponse et quiz, récompenses, glossaire et bonus débloqués. Il ne s’agit pas d’un test de compréhension auprès d’enfants ni d’une vérification visuelle de chaque écran en fonctionnement. Les futurs dialogues ne sont pas encore disponibles : leur aide est prise en compte, mais leur contenu ne peut pas être vérifié.

Les champs internes sans affichage actuel (`learningObjectives`, `activities`, `finalExplanation`, ancien `challenge`) ne sont pas recensés comme des textes à corriger à l’écran. Même traitement pour `SolarDistanceMap`, le composant isolé `BlackHolePreview`, les paragraphes `BLACK_HOLE_VIEWS.body` et les répliques `companionCue.line` : ils ne sont pas utilisés pour afficher ces textes dans le parcours actuel. Les textes `funFacts` transmis à ces répliques sont donc également exclus. Les définitions bonus, elles, sont bien affichées dans le glossaire et la collection.

## Contrainte de longueur et affichage responsive

La première version de cet audit développait trop certaines explications. Les propositions ont été raccourcies pour limiter l’occupation de l’écran et l’effort de lecture.

- Boutons et petits libellés : quelques mots, sans définition ajoutée systématiquement.
- Consignes : l’action essentielle d’abord, généralement une phrase courte ; une seconde seulement si elle aide à agir.
- Retours après réponse : une idée principale, sans répéter toute la leçon.
- Explications : garder le lien de cause à effet à l’écran ; réserver les exemples et les précisions au dialogue ou au glossaire.
- Notices et bonus : conserver les limites importantes du modèle, avec moins de jargon et moins de phrases.

Ces repères ne sont pas des limites rigides en caractères. La longueur doit être vérifiée dans le composant réel, notamment en portrait sur téléphone. Un mot plus simple ne justifie pas à lui seul un paragraphe plus long.

**L’action à effectuer, les choix du quiz et les indications de sécurité doivent rester compréhensibles à l’écran, même sans son.** Les termes de la leçon peuvent être expliqués oralement avant d’être réutilisés. Les variantes qui dépendent du dialogue supposent que ce dialogue soit disponible, puisse être réécouté et introduise le mot avant son utilisation ; elles ne doivent pas être appliquées prématurément.

## Écrans communs, carte, profil et collection

Sources : [catalogue des missions](<D:/Programmation/Mission Cosmos/src/content/missions/catalog.ts>), [zones de la carte](<D:/Programmation/Mission Cosmos/src/content/universe/zones.ts>), [collection](<D:/Programmation/Mission Cosmos/src/app/collection/page.tsx>), [profil](<D:/Programmation/Mission Cosmos/src/app/profil/page.tsx>), [formulaire de profil](<D:/Programmation/Mission Cosmos/src/features/progression/ProfileSetupForm.tsx>), [interface des missions](<D:/Programmation/Mission Cosmos/src/components/layout/MissionImmersive.tsx>).

| N° | Contexte d’affichage | Texte actuel | Proposition de remplacement |
| --- | --- | --- | --- |
| 1 | Carte — présentation de la zone Lune, avant les missions 03–04 | « Notre satellite, tout près. » | « La Lune tourne autour de la Terre. » **Oral :** introduire le mot satellite. |
| 2 | Carte — objectif de la mission 06, Les orbites | « Voir comment les planètes tournent et comparer leurs périodes. » | « Compare le temps d’un tour du Soleil pour chaque planète. » |
| 3 | Carte — objectif de la mission 07, Les saisons | « Comprendre l’inclinaison de la Terre et l’été / l’hiver. » | « Pourquoi la Terre penchée nous donne-t-elle des saisons ? » |
| 4 | Carte — objectif de la mission Les dessins du ciel | « Retrouver les constellations et découvrir leur profondeur en voyageant en 3D. » | « Retrouve les constellations et compare la distance de leurs étoiles. » **Oral :** expliquer comment le voyage révèle ces distances. |
| 5 | Carte — objectif de la mission 13 | « Comparer les ordres de grandeur, de la Terre à l’Univers observable. » | « Compare les distances, de la Terre aux galaxies les plus lointaines. » **Oral :** préciser la limite de l’Univers observable. |
| 6 | Carte — objectif de la mission 14 | « Aborder gravité extrême et horizon des événements sans fausse analogie. » | « Découvre les trous noirs et leur limite de non-retour. » **Oral :** expliquer la gravité et le rôle de cette limite. |
| 7 | Collection — avant le premier badge | « Tes badges apparaîtront ici après tes premières missions. Aucun loot payant. » | « Gagne tes badges en réussissant des missions. Rien à acheter. » |
| 8 | Création ou modification du profil — champ du nom | « Pseudo (facultatif) » | « Nom d’explorateur (au choix) » |
| 9 | Création ou modification du profil — choix d’image | « Avatar » | « Choisis ton image » |
| 10 | Profil — sous le nom du joueur sélectionné | « Profil actif sur cet appareil » | « Tu joues avec ce profil. » |
| 11 | Toutes les missions — bouton de caméra dans les actions | « Recentrer » | « Vue de départ » |

## Réglages

Sources : [qualité graphique](<D:/Programmation/Mission Cosmos/src/features/settings/GraphicsQualitySetting.tsx>), [musique](<D:/Programmation/Mission Cosmos/src/features/settings/MusicSetting.tsx>).

| N° | Contexte d’affichage | Texte actuel | Proposition de remplacement |
| --- | --- | --- | --- |
| 12 | Réglages — aides sous les choix de qualité graphique | « Choisit selon l’appareil » ; « Plus fluide sur mobile » ; « Équilibrée pour mobile » ; « Meilleur rendu » | Respectivement : « Le jeu choisit » ; « Moins de détails, moins de ralentissements » ; « Détails et vitesse équilibrés » ; « Plus de détails ». **Oral :** expliquer le choix automatique selon l’appareil. |
| 13 | Réglages — effet du changement de qualité | « Interface : effet immédiat. Rendu 3D : au prochain lancement d’une mission. » | « Menus : tout de suite. Images 3D : à la prochaine mission. » |
| 14 | Réglages — explication des animations, selon le mode actif | « Animations désactivées selon ta préférence système. » ; « Retours au clic et fondus courts. Effets décoratifs et flous désactivés. » ; « Transitions douces et retours au clic. Effets décoratifs et flous désactivés. » ; « Transitions douces, apparitions progressives et légère animation du guide. » | Respectivement : « Animations arrêtées selon les réglages de ton appareil. » ; « Les boutons réagissent. Peu d’animations, sans décor animé ni flou. » ; « Les images changent doucement, sans décor animé ni flou. » ; « Les images apparaissent doucement. Le Guide bouge un peu. » **Oral :** détailler seulement si l’enfant demande de l’aide. |
| 15 | Réglages — présentation de la musique | « Une ambiance pour les menus, d’autres pistes mélangées pendant les missions. » | « Une musique dans les menus, plusieurs pendant les missions. » |

## Mission 01 — Notre Terre

Sources : [textes de mission](<D:/Programmation/Mission Cosmos/src/content/missions/mission-01.ts>), [quiz](<D:/Programmation/Mission Cosmos/src/content/quizzes/mission-01.ts>).

| N° | Défi ou contexte | Texte actuel | Proposition de remplacement |
| --- | --- | --- | --- |
| 16 | Repère 1 · Les deux moitiés — consigne et réussite | « La première balise doit séparer la moitié nord et la moitié sud de la Terre. » ; « L’équateur partage la Terre en deux hémisphères : nord et sud. » | Consigne : « Choisis le repère qui sépare les moitiés nord et sud. » Réussite : « L’équateur sépare deux moitiés, appelées hémisphères : nord et sud. » |
| 17 | Repère 2 · Cap au nord — réussite ; quiz, question sur les pôles, choix correct et explications | « Le pôle Nord est une extrémité de l’axe de rotation. » ; « Les bouts de l’axe de rotation » ; « les extrémités de l’axe » | Réussite : « Le pôle Nord est un bout de l’axe autour duquel la Terre tourne. » Choix du quiz : conserver « Les bouts de l’axe de rotation ». Explications : « Les pôles sont les deux bouts de l’axe de rotation. » **Oral :** définir l’axe comme une ligne imaginaire avant le défi et le quiz. Une fois ce mot expliqué, sa répétition ne nécessite pas d’allonger chaque texte. |
| 18 | Deux mouvements — explication | « c’est l’alternance du jour et de la nuit » ; « Ici, le temps est accéléré et les tailles et distances sont celles d’une maquette. » | « c’est pour cela qu’il fait jour, puis nuit » ; « Le temps passe plus vite. Tailles et distances sont changées pour tout montrer. » |

## Mission 02 — Jour et nuit

Sources : [scène](<D:/Programmation/Mission Cosmos/src/3d/scenes/DayNightScene.tsx>), [quiz](<D:/Programmation/Mission Cosmos/src/content/quizzes/mission-02.ts>).

| N° | Défi ou contexte | Texte actuel | Proposition de remplacement |
| --- | --- | --- | --- |
| 19 | Petite vue avec le Guide — état entre jour et nuit | « Crépuscule » | « Entre jour et nuit » Si crépuscule est expliqué par le dialogue à cet endroit, le libellé actuel peut rester. |
| 20 | Quiz — « Il fait jour quand… », après une bonne réponse | « Exact : le jour, ton endroit regarde le Soleil. » | « Exact : le Soleil éclaire le côté de la Terre où tu es. » |

## Mission 03 — Phases de la Lune

Sources : [textes de mission](<D:/Programmation/Mission Cosmos/src/content/missions/mission-03.ts>), [quiz](<D:/Programmation/Mission Cosmos/src/content/quizzes/mission-03.ts>), [libellés des phases](<D:/Programmation/Mission Cosmos/src/3d/utils/moonPhase.ts>).

| N° | Défi ou contexte | Texte actuel | Proposition de remplacement |
| --- | --- | --- | --- |
| 21 | Défi pleine Lune — consigne | « Place la Lune pour voir une pleine Lune depuis la Terre (disque presque entier éclairé). » | « Déplace la Lune pour la voir toute ronde et éclairée dans la petite vue. » **Oral :** rappeler que cette vue représente ce que l’on voit depuis la Terre. |
| 22 | Défi croissant — consigne | « Maintenant place un croissant : une fine portion éclairée visible depuis la Terre. » | « Déplace la Lune pour voir un fin croissant dans la petite vue. » |
| 23 | Défi croissant — rappel et indice | « Rapproche la Lune du Soleil, sans la coller dessus, puis laisse-la. » ; « Rapproche la Lune du côté du Soleil, sans la coller tout à fait dessus. » | « Déplace la Lune sur son orbite, côté Soleil. Cherche un croissant dans la petite vue. » **Oral :** rappeler que la Lune reste sur son chemin autour de la Terre. |
| 24 | Quiz — pleine Lune, explication correcte | « Exact : face à la face éclairée, on voit presque tout le disque lumineux. » | « Exact : depuis la Terre, nous voyons presque toute la face éclairée. » |
| 25 | Petite vue — phase intermédiaire rencontrée pendant le déplacement | « Gibbeuse » | « Presque pleine » ou conserver « Gibbeuse » si le dialogue explique ce mot au moment où ce libellé apparaît. |

## Mission 04 — Les éclipses

Sources : [textes de mission](<D:/Programmation/Mission Cosmos/src/content/missions/mission-04.ts>), [scène](<D:/Programmation/Mission Cosmos/src/3d/scenes/EclipsesScene.tsx>).

| N° | Défi ou contexte | Texte actuel | Proposition de remplacement |
| --- | --- | --- | --- |
| 26 | Deux ombres — découverte | « Devant le Soleil : éclipse solaire. Dans l’ombre de la Terre : éclipse lunaire. » | « La Lune cache le Soleil : éclipse solaire. Elle traverse l’ombre de la Terre : éclipse lunaire. » **Oral :** préciser que le Soleil est caché vu depuis la Terre. |
| 27 | Défis solaire et lunaire — fin de la consigne et rappel ; également rappel du défi pleine Lune de la mission 03 | « puis laisse-la » | « puis relâche » **Oral :** expliquer une fois : lever le doigt ou relâcher le bouton de la souris. |
| 28 | Deux ombres, Pas chaque mois, notice La maquette et petite vue — messages de protection | « Ne regarde jamais le vrai Soleil sans filtre. » ; « ne regarde jamais le Soleil sans protection ! » ; « sans protection adaptée » ; « Soleil : filtre obligatoire » | Texte de protection : « Ne regarde le vrai Soleil qu’avec une protection spéciale vérifiée par un adulte. Des lunettes de soleil ne suffisent pas. » Petit libellé : « Soleil : protection spéciale ». Garder l’interdiction de regarder sans protection dans le dialogue et les indications de sécurité déjà présentes. La précision sur les lunettes est conforme aux [consignes de la NASA](https://science.nasa.gov/eclipses/safety/). |

## Mission 05 — Le Système solaire

Sources : [textes de mission](<D:/Programmation/Mission Cosmos/src/content/missions/mission-05.ts>), [scène](<D:/Programmation/Mission Cosmos/src/3d/scenes/SolarSystemScene.tsx>), [fiches des planètes](<D:/Programmation/Mission Cosmos/src/content/bodies/solarSystem.ts>), [mini-jeu des tailles](<D:/Programmation/Mission Cosmos/src/content/bodies/solarLearningGames.ts>), [quiz](<D:/Programmation/Mission Cosmos/src/content/quizzes/mission-05.ts>).

| N° | Défi ou contexte | Texte actuel | Proposition de remplacement |
| --- | --- | --- | --- |
| 29 | Huit planètes — consigne ; boutons de navigation entre les fiches | « Préc. / Suiv. » ; « Préc. » ; « Suiv. » | Dans la consigne : « Précédente / Suivante ». Boutons : « Précédente » et « Suivante ». Si la place manque, conserver « Préc. / Suiv. » avec une explication orale ; ne pas rallonger les boutons systématiquement. |
| 30 | Huit planètes et pied de la scène — limites de la maquette | « Ici, tailles et distances ne sont pas à l’échelle. » ; « Maquette : tailles et distances adaptées. Positions illustratives. » | Découverte : « Planètes rapprochées, tailles changées pour bien les voir. » Pied de scène : « Tailles, distances et positions choisies pour apprendre. » **Oral :** préciser que ce ne sont pas leurs positions actuelles. |
| 31 | Fiche de la Terre | « Notre maison. De l’eau liquide et une atmosphère respirable. » | « Notre maison : de l’eau liquide et de l’air à respirer. » |
| 32 | Fiche de Jupiter ; fiche de Saturne | « Une géante gazeuse » | « Une géante faite surtout de gaz. » **Oral :** donner le nom géante gazeuse. |
| 33 | Fiche d’Uranus | « Géante de glace penchée à ~98° : elle roule presque sur son orbite. » | « Géante de glace penchée à 98° : elle tourne presque couchée. » **Oral :** expliquer géante de glace, l’angle et la comparaison avec une planète qui roule. |
| 34 | Comparer les tailles — question sur Vénus et la Terre, réponse correcte | « Oui ! Vénus et la Terre ont presque le même diamètre. » | « Oui ! Vénus et la Terre ont presque la même largeur. » **Oral ou glossaire :** définir diamètre. |
| 35 | Comparer les tailles — question sur les catégories de planètes, avant de répondre | « Parmi les 8 planètes, combien sont rocheuses et combien sont gazeuses ? » | Conserver la question actuelle si rocheuse et gazeuse sont expliqués à l’oral avant le défi. Sinon : « Combien de rocheuses comme la Terre, et de gazeuses comme Jupiter ? » |
| 36 | Et Pluton ? — explication ; quiz sur le nombre de planètes, après erreur | « Pluton n’est pas une 9e planète : c’est une planète naine, plus petite, avec d’autres objets lointains. » ; « Pluton n’est plus classée comme planète. » | Explication : « Pluton est une planète naine. Elle n’est pas comptée parmi les huit planètes. » Après erreur : « Huit planètes : Pluton est classée parmi les planètes naines. » |
| 37 | Actions de mission — notice La maquette | « Chaque vue précise son échelle : maquette, diamètres ou distances. » | « Trois vues : reconnaître les planètes, comparer leurs tailles, comparer leurs distances. » **Oral :** expliquer pourquoi tailles et distances sont comparées séparément. |

Note d’affichage : les paragraphes `body` des étapes « Comparer les tailles » et « Mesurer le vide » sont masqués au profit des mini-jeux. Ils ne sont donc pas ajoutés comme corrections à l’écran. La règle `SolarDistanceMap` contenant « UA ≈ … M km » n’est pas appelée par le parcours actuel ; ces abréviations ne sont pas retenues comme une difficulté actuelle de cette mission.

## Mission 06 — Les orbites

Sources : [textes de mission](<D:/Programmation/Mission Cosmos/src/content/missions/mission-06.ts>), [quiz](<D:/Programmation/Mission Cosmos/src/content/quizzes/mission-06.ts>), [scène du lancement](<D:/Programmation/Mission Cosmos/src/3d/scenes/OrbitFallScene.tsx>), [interface et indice](<D:/Programmation/Mission Cosmos/src/components/layout/MissionImmersive.tsx>).

| N° | Défi ou contexte | Texte actuel | Proposition de remplacement |
| --- | --- | --- | --- |
| 38 | Chute qui tourne — réussite et message de la scène après succès | « Orbite = elle tombe vers la Terre, mais avance assez vite sur le côté pour ne jamais y arriver. » ; « chute qui n’arrive jamais » | « Le Guide tombe vers la Terre, mais avance assez vite de côté pour la manquer. Il reste en orbite. » |
| 39 | Chute qui tourne — indice commun de l’interface | « Règle le curseur, lance, observe, puis ajuste — sans zones colorées toutes faites. » | « Règle la vitesse, lance le Guide, puis ajuste si besoin. » |
| 40 | Pourquoi ça tourne ? — explication | « Le Soleil (ou la Terre pour le Guide) attire. Comme il avance déjà sur le côté, il rate le centre : il reste en orbite — une chute perpétuelle. Plus près → tour plus court. (Cercles ici pour bien voir ; en vrai un peu ovales.) » | « Le Soleil attire les planètes. Leur mouvement de côté les garde en orbite. Plus près du Soleil, un tour dure moins longtemps. » **Oral :** expliquer la chute continue, comparer avec le Guide autour de la Terre et rappeler la forme un peu ovale des vraies orbites. |
| 41 | Quiz — chute, choix correct et explications ; question sur un lancement trop lent, explications ; question sur la durée d’une année, après erreur | « Une chute vers le centre, mais qui n’arrive jamais » ; « chute perpétuelle » ; « C’est une chute + un mouvement de côté. » ; « trop lent → pas assez de mouvement de côté » ; « Trop lent = chute. Trop vite = il s’éloigne. L’arrêt total n’existe pas ici. » ; « Plus près → année plus courte. » | Choix : « Une chute, avec un mouvement de côté qui évite le centre ». Explication : « Attirée vers le Soleil, la planète avance aussi de côté : elle continue à tourner autour. » Lancement : « Trop lent : le Guide tombe. Trop rapide : il s’éloigne. Essaie entre les deux. » Année : « Plus près du Soleil, un tour dure moins longtemps. » |
| 42 | Actions de mission — notice La maquette | « Orbites en cercles pour comparer. Vitesses relatives fidèles aux périodes ; tailles et distances = maquette. » | « Cercles pour comparer. Temps accéléré, durées des tours respectées. Tailles et distances simplifiées. » **Oral :** préciser que les différences entre les durées sont conservées. |
| 43 | Récompense et collection — description du badge Gardien des orbites | « qu’orbiter c’est “tomber” sans jamais arriver » | « qu’orbiter, c’est tomber tout en avançant de côté pour éviter le centre » |

## Mission 07 — Les saisons

Sources : [textes de mission](<D:/Programmation/Mission Cosmos/src/content/missions/mission-07.ts>), [scène](<D:/Programmation/Mission Cosmos/src/3d/scenes/SeasonsScene.tsx>), [quiz](<D:/Programmation/Mission Cosmos/src/content/quizzes/mission-07.ts>), [indice commun](<D:/Programmation/Mission Cosmos/src/components/layout/MissionImmersive.tsx>).

| N° | Défi ou contexte | Texte actuel | Proposition de remplacement |
| --- | --- | --- | --- |
| 44 | Découverte — consigne et rappel sur le curseur | « mets le curseur d’inclinaison à 0° » ; « mets l’inclinaison à 0° » | « Avec le curseur, redresse la Terre à 0°. » |
| 45 | Défi été au nord — consigne ; boutons de position ; indice commun | « l’hémisphère nord » ; « Été N » ; « Hiver N » ; « utilise Été N » | Consigne : « la moitié nord de la Terre ». Boutons et indice : « Été au nord » ; « Hiver au nord ». **Oral :** introduire hémisphère nord. |
| 46 | Pas la distance ! — explication ; quiz sur la cause des saisons, réponse correcte | « un hémisphère reçoit des rayons plus directs » ; « l’inclinaison fait qu’un hémisphère reçoit des rayons plus directs selon le moment de l’année » | « Penchée vers le Soleil, une moitié reçoit sa lumière moins de travers. Elle chauffe davantage : c’est l’été. » |
| 47 | Quiz — saisons opposées, réponse correcte | « les hémisphères sont à l’envers pour les saisons » | « Été au nord, hiver au sud : les saisons sont opposées. » |
| 48 | Actions de mission — notice La maquette | « Orbite presque circulaire pour comparer. Inclinaison réelle ≈ 23,5°. Maquette simplifiée. » | « Chemin presque rond. Axe penché à environ 23,5°. Tailles et distances simplifiées. » |

## Mission 08 — Les étoiles

Sources : [textes de mission](<D:/Programmation/Mission Cosmos/src/content/missions/mission-08.ts>), [scène](<D:/Programmation/Mission Cosmos/src/3d/scenes/StarsScene.tsx>), [données et messages des étoiles](<D:/Programmation/Mission Cosmos/src/content/bodies/stars.ts>), [quiz](<D:/Programmation/Mission Cosmos/src/content/quizzes/mission-08.ts>), [film](<D:/Programmation/Mission Cosmos/src/3d/utils/starCinematic.ts>).

| N° | Défi ou contexte | Texte actuel | Proposition de remplacement |
| --- | --- | --- | --- |
| 49 | Découverte — consigne ; message de la scène en comparaison des tailles | « elles sont compressées pour tout voir » ; « Tailles compressées pour tout voir : Proxima ≪ Soleil ≪ Bételgeuse. » | Consigne : « les différences de taille sont réduites pour tout voir ». Message : « Proxima est plus petite que le Soleil, Bételgeuse bien plus grande. Tailles simplifiées ici. » Les symboles ≪ peuvent rester s’ils sont expliqués à l’oral. |
| 50 | Message initial de la scène, présentation du Soleil | « Notre étoile : une étoile banale… et indispensable. » | « Le Soleil : une étoile comme d’autres, essentielle à notre vie. » |
| 51 | Comparaison des tailles et défi photo — valeur renvoyée par `radiusLabelFr` | « 0,15 × le Soleil » ; « 1 × le Soleil » ; « 1,7 × le Soleil » ; « ≈ 700 × le Soleil » | Garder les valeurs et symboles, en précisant la grandeur : « Largeur : 0,15 × le Soleil » ; « Largeur : 1 × le Soleil » ; « Largeur : 1,7 × le Soleil » ; « Largeur : ≈ 700 × le Soleil ». **Oral :** lire ces rapports et expliquer ce qui est comparé. Éviter d’ajouter un pourcentage ou une longue phrase à chaque valeur. |
| 52 | Bételgeuse — note reprise dans les messages de taille/distance ; pied de scène ; quiz, après réponse correcte | « Rayon estimé (variable) — ordre de grandeur. » ; « Bételgeuse : rayon estimé » ; « rayon estimé, ordre de grandeur » | Message : « Taille estimée, qui peut varier. » Pied : « Bételgeuse : taille estimée ». **Oral :** expliquer que sa taille change et que le nombre est approximatif. |
| 53 | Comparaison des couleurs — message après sélection d’une étoile | « (~… K) » | Conserver « ≈ … K ». Expliquer une fois, dans une aide : « K : kelvins, pour mesurer la température. » **Oral :** prononcer kelvins et expliquer l’unité. Ne pas ajouter cette définition à chaque étoile. |
| 54 | Distance et défi photo — titre et message de distance | « Distance pédagogique » ; « distance pédagogique … » | « Distance dans la maquette » ; « distance dans la maquette : … ». **Oral :** préciser que le nombre sert à l’expérience et ne donne pas la vraie distance de l’étoile. |
| 55 | Explication — titre | « Apparence ≠ réalité » | « Taille vue, taille réelle » Le titre actuel peut rester si ≠ est expliqué par le dialogue. |
| 56 | Film après les photos — dernière scène et pied du film | « De côté, la profondeur se révèle. Aucune étoile n’a changé de diamètre. » ; « Diamètres constants · tailles et distances simplifiées » | Film : « De côté, les distances se voient. Les étoiles gardent leur taille. » Pied : « Tailles fixes pendant le film. Maquette simplifiée. » |
| 57 | Actions de mission — notice La maquette | « Tailles compressées pour comparer. Distances pédagogiques. Bételgeuse : rayon estimé. » | « Tailles simplifiées, distances choisies pour comparer. Bételgeuse : taille estimée. » |

## Mission 09 — Le secret des couleurs

Source : [textes de mission](<D:/Programmation/Mission Cosmos/src/content/missions/mission-09.ts>).

| N° | Défi ou contexte | Texte actuel | Proposition de remplacement |
| --- | --- | --- | --- |
| 58 | Place le prisme — consigne et rappel ; actions, notice La maquette | « dans le faisceau blanc » ; « faisceaux rendus visibles, tailles et angles adaptés pour observer » | Consigne et rappel : « sur le trajet de la lumière blanche ». Notice : « Trajets lumineux dessinés. Tailles et angles simplifiés pour observer. » Le mot prisme est déjà expliqué et peut rester. |

## Mission 10 — Les dessins du ciel

Sources : [textes de mission](<D:/Programmation/Mission Cosmos/src/content/missions/mission-10.ts>), [scène](<D:/Programmation/Mission Cosmos/src/3d/scenes/ConstellationsScene.tsx>), [voyage](<D:/Programmation/Mission Cosmos/src/3d/scenes/ConstellationVoyage.tsx>).

| N° | Défi ou contexte | Texte actuel | Proposition de remplacement |
| --- | --- | --- | --- |
| 59 | Défis Cassiopée, Grande Ourse, Cygne et Orion — consigne commune générée | « Compare les positions et les espacements avec ta petite carte. » | « Compare la place des étoiles et leurs écarts avec ta carte. » |
| 60 | Film — mode sans mouvement automatique ; film des étoiles de la mission 08, même commande | « Tableau suivant » | « Étape suivante » La présence du film donne le contexte ; inutile de le répéter sur le bouton. |
| 61 | Réussite du défi d’explication dans la scène ; description du badge dans la récompense et la collection | « Les étoiles sont à des profondeurs différentes. » ; « découvert leur profondeur » | Réussite : « Les étoiles ne sont pas toutes à la même distance. » Description : « découvert les différentes distances de leurs étoiles ». |
| 62 | Actions, notice La maquette ; note du voyage | « profondeurs de démonstration, pas distances réelles » | « Distances choisies pour l’expérience, différentes des vraies distances. » **Oral :** expliquer comment le point de vue transforme le dessin. |
| 63 | Bas de la scène de recherche — note précédant les crédits | « Éclat relatif adapté à l’écran. Étoiles voisines et magnitudes : » ; « Tracé simplifié. » | « Luminosité adaptée à l’écran. Données sur les étoiles : » ; « Dessin simplifié. » Conserver les noms et la licence qui suivent. |

## Mission 11 — Notre galaxie

Sources : [textes de mission](<D:/Programmation/Mission Cosmos/src/content/missions/mission-11.ts>), [scène](<D:/Programmation/Mission Cosmos/src/3d/scenes/MilkyWayScene.tsx>), [quiz](<D:/Programmation/Mission Cosmos/src/content/quizzes/mission-11.ts>).

| N° | Défi ou contexte | Texte actuel | Proposition de remplacement |
| --- | --- | --- | --- |
| 64 | Le grand voyage du Soleil — rappel et réussite ; légende de la scène | « centre galactique » | « centre de la galaxie » |
| 65 | Quiz — forme de la Voie lactée, choix correct | « Un disque avec un renflement au centre » | « Un disque plus épais au centre » |
| 66 | Défi du voyage — note sous la scène | « Le point doré est un repère agrandi. Voyage très accéléré, trajectoire simplifiée. » | « Soleil agrandi pour le repérer. Voyage accéléré, chemin simplifié. » |
| 67 | Actions de mission — notice La maquette | « bras artistiques, quartier du Soleil approximatif » ; « Tailles, distances et voyage ne sont pas à l’échelle. » | « Bras dessinés, Soleil placé approximativement. Tailles et distances simplifiées, voyage accéléré. » **Oral :** expliquer que la maquette n’est pas une carte précise. |

## Mission 12 — Les galaxies

Sources : [textes de mission](<D:/Programmation/Mission Cosmos/src/content/missions/mission-12.ts>), [scène](<D:/Programmation/Mission Cosmos/src/3d/scenes/GalaxiesScene.tsx>), [libellés des formes](<D:/Programmation/Mission Cosmos/src/content/bodies/galaxies.ts>).

| N° | Défi ou contexte | Texte actuel | Proposition de remplacement |
| --- | --- | --- | --- |
| 68 | Les fiches mélangées — explication et indice | « une variante des spirales » ; « les extrémités de la barre » ; « le volume arrondi » | « une sorte de galaxie spirale » ; « les deux bouts de la barre » ; « la forme arrondie ». |
| 69 | Familles — libellé du bouton sans barre | « Spirale non barrée » | « Spirale sans barre » |
| 70 | Du petit au gigantesque — consigne, rappel, titre des cartes et retours de la scène | « Les cartes du zoom du robot » ; « Construis le zoom » ; « Les niveaux du zoom » ; « cherche le plus petit ensemble restant » | Respectivement : « Les cartes du voyage » ; « Range du plus petit au plus grand » ; « Du Soleil à la galaxie » ; « Choisis le plus petit objet restant ». Le classement porte sur ce que les cartes représentent. |
| 71 | Actions de mission — notice La maquette | « Maquettes artistiques générées par le jeu. […] Le zoom compare des niveaux, sans respecter leurs proportions réelles. » | « Formes, couleurs et tailles simplifiées. Ce n’est pas une carte du ciel. Les vraies proportions ne sont pas respectées. » **Oral :** détailler les trois niveaux montrés pendant le voyage. |

## Mission 13 — Les distances dans l’Univers

Sources : [textes de mission](<D:/Programmation/Mission Cosmos/src/content/missions/mission-13.ts>), [fiches des repères](<D:/Programmation/Mission Cosmos/src/content/bodies/cosmicDistances.ts>), [scène du voyage](<D:/Programmation/Mission Cosmos/src/3d/scenes/CosmicDistancesScene.tsx>), [expérience des flashs](<D:/Programmation/Mission Cosmos/src/3d/scenes/LightTravelChallenge.tsx>).

| N° | Défi ou contexte | Texte actuel | Proposition de remplacement |
| --- | --- | --- | --- |
| 72 | Voyage — titre et consigne, avant la définition finale de l’Univers observable | « De la Lune à l’Univers observable » ; « jusqu’à l’Univers observable » | Conserver le titre scientifique « De la Lune à l’Univers observable ». Dans la consigne, ajouter seulement « la partie de l’Univers que nous pouvons observer » à sa première mention. **Oral :** expliquer la lumière qui peut nous arriver avant le voyage. |
| 73 | Voyage — consigne, rappel et note de la scène | « Les immenses distances sont comprimées dans notre maquette. » ; « le voisinage apparaît pendant le recul » ; « Le voisinage apparaît pendant le changement d’échelle. » | Consigne : « Distances raccourcies pour tout montrer. » Rappel : « Avec “Plus loin”, observe ce qui apparaît autour de toi. » Note : « En reculant, tu vois plus d’objets autour de toi. » |
| 74 | Fiche du Soleil — définition de l’UA et distance affichée ; quiz, question sur l’UA et ses choix | « distance moyenne Terre–Soleil » ; « 1 UA » | Définition : « 1 UA = la distance moyenne entre la Terre et le Soleil. » Valeur : conserver « 1 UA ». Quiz : « 1 UA, une unité astronomique, correspond à… ». Choix : « La distance moyenne Terre–Lune » / « La distance moyenne Terre–Soleil ». **Oral :** expliquer moyenne et lire les noms sans abréviation ; conserver la valeur en kilomètres déjà affichée. |
| 75 | Fiches de la Voie lactée et de l’Univers observable — sous-titres | « Diamètre approximatif du disque étoilé » ; « Diamètre actuel estimé de la région observable » | « Largeur du disque d’étoiles, estimée » ; « Largeur de l’Univers observable, estimée aujourd’hui ». **Oral :** préciser la mesure passant par le centre et distinguer largeur d’un objet et distance jusqu’à lui. |
| 76 | Les messagers de lumière — consigne et rappel | « choisis laquelle nous voyons dans le passé le plus lointain » ; « Les distances de la maquette sont proportionnelles, pas à l’échelle réelle. » ; « Émets les flashs, suis la frise du temps » | Consigne : « choisis la galaxie dont l’image est la plus ancienne » ; « Distances réduites, écarts respectés ». Rappel : « Envoie les flashs et suis la ligne du temps. » **Oral :** expliquer les rapports 1, 2 et 4. |
| 77 | Expérience des flashs — titre, distances au-dessus des galaxies, note, bouton et ligne du temps | « Quelle galaxie voyons-nous dans le passé le plus lointain ? » ; « M a.l. » ; « distances proportionnelles 1 : 2 : 4 » ; « Émettre les flashs » ; « Temps écoulé depuis l’émission » | Titre : « Quelle galaxie montre l’image la plus ancienne ? » Unités : garder « M a.l. », avec une légende unique « 1 M a.l. = 1 million d’années-lumière ». Note : « Distances : une fois, deux fois, quatre fois plus loin. » Bouton : « Envoyer les flashs ». Ligne du temps : « Temps depuis le départ ». **Oral :** lire les unités et expliquer les distances comparées. |
| 78 | Expérience des flashs — retour après un choix incorrect | « Plus loin = lumière partie plus tôt. » ; « C’est son image que nous voyons la plus ancienne. » | « Partis ensemble, les flashs voyagent plus ou moins longtemps. Le plus lointain apporte l’image la plus ancienne. » La correction de la contradiction sur le départ simultané reste nécessaire. |
| 79 | La lumière apporte le passé — explication ; glossaire et quiz, définition de l’Univers observable | « une unité de distance » ; « la région dont la lumière peut nous parvenir » | « L’année-lumière mesure le chemin parcouru par la lumière en un an. » ; « La partie de l’Univers dont la lumière peut nous arriver. » |
| 80 | Actions de mission — notice La maquette | « Maquette 3D pédagogique : astres agrandis, espaces et temps comprimés. Le voyage de la lumière est accéléré pour rester lisible. Les diamètres sont indiqués explicitement. Neptune ne marque pas la fin du Système solaire. » | « Objets agrandis, distances raccourcies, temps accéléré. Les fiches précisent ce qu’on mesure. Le Système solaire continue au-delà de Neptune. » **Oral :** détailler largeur et distance. |
| 81 | Récompense et collection — description du badge Navigateur cosmique | « utiliser les repères UA et année-lumière » | « mesurer les distances avec l’unité astronomique (UA) et l’année-lumière » |

## Mission 14 — Les trous noirs

Sources : [textes de mission](<D:/Programmation/Mission Cosmos/src/content/missions/mission-14.ts>), [scène](<D:/Programmation/Mission Cosmos/src/3d/scenes/BlackHoleScene.tsx>), [notes des vues](<D:/Programmation/Mission Cosmos/src/content/bodies/blackHolePreview.ts>), [quiz](<D:/Programmation/Mission Cosmos/src/content/quizzes/mission-14.ts>).

| N° | Défi ou contexte | Texte actuel | Proposition de remplacement |
| --- | --- | --- | --- |
| 82 | Des indices dans les orbites — consigne et réussite ; quiz de détection, explications | « Son orbite nous révèle une masse dans la région sombre. » ; « une masse invisible » ; « la masse cachée » | Consigne : « Son orbite révèle un objet invisible qui l’attire. » Retours : « un objet invisible » ; « l’objet caché ». **Oral :** expliquer le lien entre matière, masse et attraction. |
| 83 | La frontière de non-retour — consigne et rappel | « Cette coupe est un schéma. Déclenche un signal dirigé vers l’extérieur depuis chaque émetteur. » ; « Teste les deux émetteurs » | Consigne : « Ce dessin montre l’intérieur. Envoie la lumière vers l’extérieur, depuis le point dehors puis celui dedans. » Rappel : « Teste le point dehors, puis le point dedans. » **Oral :** expliquer que le schéma est une coupe, pas une vue réelle de l’intérieur. |
| 84 | Même masse, même orbite ? — consigne et rappel ; titre de la scène ; quiz sur le remplacement de l’étoile | « un trou noir de même masse » ; « Prédis ce qui arrivera » ; « Choisis une prédiction » ; « Même masse, autre objet » | Première mention : « un trou noir de même masse, avec autant de matière ». Consigne : « Choisis ce qui va se passer, puis vérifie avec l’expérience. » Rappel : « Choisis avant de lancer l’expérience. » Conserver le titre « Même masse, autre objet » et les questions courtes utilisant même masse une fois le terme expliqué. |
| 85 | Même masse, même orbite ? — résultat de la scène et quiz, explication après erreur | « la masse centrale, sa distance et sa vitesse sont restées les mêmes » ; « Trou noir de même masse · orbite distante conservée » ; « Étoile et planète · distance et vitesse initiales conservées » | Résultat : « Même masse au centre, même distance et même vitesse au départ : la planète garde son orbite. » Notes : « Même masse : la planète garde son orbite. » ; « Distance et vitesse de départ identiques. » **Oral :** nommer explicitement la planète et l’objet central pour expliquer la comparaison. |
| 86 | Détective de l’invisible — consigne et réussite | « Trois régions sont candidates. » ; « un mouvement orbital reste un indice à vérifier » ; « Les mouvements concordants montrent où chercher l’objet invisible. » | Consigne : « L’objet invisible pourrait être dans l’une de ces trois régions. » ; « Les étoiles qui tournent donnent un indice à vérifier. » Réussite : « Ces étoiles tournent autour du même endroit. Cherchons l’objet invisible ici. » |
| 87 | Notes de la scène — vue avec gaz lumineux et schéma de l’horizon | « Vue d’artiste · lumière déviée de façon stylisée » ; « Schéma explicatif · l’horizon n’est pas l’ombre apparente » | « Dessin imaginé. Lumière déviée de façon simplifiée. » ; « Limite invisible : à distinguer de la zone noire visible. » **Oral :** expliquer cette distinction sans ajouter de long paragraphe sous la scène. |
| 88 | Actions de mission — notice La maquette | « Maquette pédagogique : tailles, distances et durées adaptées. Effets lumineux stylisés ; aucune simulation complète de la relativité. » | « Tailles, distances et durées simplifiées. Certains effets d’un vrai trou noir ne sont pas représentés. » **Oral :** les explications sur la relativité peuvent rester facultatives. |

## Glossaire et mots bonus dans la collection

Source : [définitions et bonus](<D:/Programmation/Mission Cosmos/src/content/glossary/entries.ts>). Les bonus deviennent visibles après la récompense associée. Certaines entrées ne sont pas dans le glossaire d’une mission, mais leur bonus apparaît tout de même dans la collection.

| N° | Mission, entrée et contexte | Texte actuel | Proposition de remplacement |
| --- | --- | --- | --- |
| 89 | Mission 05 — Planète et Planète naine, définitions | « Un gros corps […] qui a “nettoyé” son voisinage. » ; « Un corps rond […] mais trop petit pour être une planète. » | Planète : « Un grand objet presque rond qui tourne autour d’une étoile et domine sa zone. » Planète naine : « Un objet presque rond qui tourne autour du Soleil, sans dominer sa zone. Exemple : Pluton. » **Oral ou aide détaillée :** expliquer dominer sa zone, plutôt que laisser croire à un nettoyage ou à une simple limite de taille. La distinction reste conforme à la [définition présentée par la NASA](https://science.nasa.gov/solar-system/planets/what-is-a-planet/). |
| 90 | Mission 01 — Pôle et Axe de rotation, définitions | « Une extrémité de l’axe autour duquel la Terre tourne. » ; « La ligne imaginaire qui traverse la Terre des pôles. » | Pôle : « Un des deux bouts de l’axe autour duquel la Terre tourne. » Axe : « La ligne imaginaire entre les pôles Nord et Sud. La Terre tourne autour. » |
| 91 | Mission 03 — Lune, définition | « Le satellite naturel de la Terre. Elle n’émet pas de lumière : elle réfléchit celle du Soleil. » | « La Lune tourne autour de la Terre : c’est son satellite naturel. Elle nous renvoie la lumière du Soleil. » **Oral :** rappeler qu’elle ne produit pas sa propre lumière. |
| 92 | Mission 03 — Phase de la Lune, définition | « nouvelle, croissant, quartier, gibbeuse, pleine » | « Les formes vues depuis la Terre : invisible, croissant, moitié, presque pleine, pleine. » **Oral :** associer ces formes à nouvelle Lune, quartier et gibbeuse ; garder les noms scientifiques dans les libellés s’ils sont expliqués au moment de leur affichage. |
| 93 | Mission 04 — Ombre, bonus | « des cônes d’ombre simplifiés […] ce n’est pas une simulation exacte » | « Les ombres sont simplifiées pour comprendre les éclipses. » **Oral :** expliquer les cônes et les limites de la maquette. |
| 94 | Mission 05 — Système solaire, bonus | « les maquettes de l’app ne sont pas à l’échelle » | « Tailles et distances changées pour bien voir les objets. » |
| 95 | Mission 06 — Gravité, bonus | « Avec ce mouvement + l’attraction, elle reste en orbite. » | « Le Soleil attire la planète. Son mouvement de côté lui permet de rester en orbite. » **Oral :** reprendre l’expérience de lancement. |
| 96 | Mission 07 — Inclinaison, définition et bonus | « son axe est penché d’environ 23° » ; « Sans inclinaison, il n’y aurait presque plus d’été ni d’hiver liés à la position sur l’orbite. » | Définition : « L’axe de la Terre est penché d’environ 23°. Cela donne les saisons. » Bonus : « Sans cette inclinaison, presque plus d’été ni d’hiver. » **Oral :** définir l’axe et relier l’expérience au voyage autour du Soleil. |
| 97 | Mission 08 — Géante rouge, bonus ; Température d’une étoile, définition | « Son rayon exact change un peu : on donne un ordre de grandeur. » ; « plus chaude → plus bleutée ; plus froide → plus rouge » | « Sa taille change : les nombres sont approximatifs. » ; « Surface plus chaude : plutôt bleue. Moins chaude : plutôt rouge. » **Oral :** lire les rapports sans symboles si nécessaire. |
| 98 | Mission 09 — Prisme, bonus ; Mélange de lumières, bonus | « Les différentes couleurs sont déviées différemment par le verre. » ; « vert + bleu font du cyan » | Prisme : « Le verre change le trajet des couleurs. Elles sortent séparées. » Mélange : « vert et bleu donnent du bleu-vert, appelé cyan ». **Oral :** expliquer que chaque couleur est déviée différemment. |
| 99 | Après la mission 09 — Spectroscope, bonus visible dans la collection | « des raies fines manquantes ou plus sombres — omises dans notre laboratoire pédagogique » | « Le spectroscope sépare les couleurs. De fines lignes sombres aident à étudier les étoiles. Elles ne sont pas montrées ici. » |
| 100 | Après la mission 09 — Kelvin, bonus visible dans la collection | « 5800 K en surface. 0 K, c’est le zéro absolu — bien plus froid que 0 °C. » | « Soleil : environ 5 800 kelvins en surface. Zéro kelvin : la température la plus basse possible, bien sous 0 °C. » **Oral :** expliquer le kelvin, Celsius et le nom zéro absolu. |
| 101 | Mission 12 — Spirale barrée, bonus ; Elliptique, bonus ; Irrégulière, définition | « ses principaux bras partent des extrémités de la barre » ; « ses nombreuses étoiles sont réparties dans un volume » ; « comme une spirale ou une ellipse » | « Ses grands bras partent des deux bouts de la barre. » ; « Ses étoiles sont réparties dans l’espace : ce n’est pas une boule pleine. » ; « comme une spirale ou une forme ovale ». |
| 102 | Mission 13 — Unité astronomique, définition | « Une unité de distance correspondant à la distance moyenne entre la Terre et le Soleil. » | « Une unité astronomique (UA) vaut la distance moyenne entre la Terre et le Soleil. » **Oral :** expliquer moyenne avant de l’utiliser dans une question. |
| 103 | Mission 13 — Univers observable, bonus | « L’expansion de l’espace explique que son diamètre actuel soit bien plus grand que 13,8 milliards d’années-lumière. » | « L’espace s’agrandit pendant le voyage de la lumière. L’Univers observable dépasse donc 13,8 milliards d’années-lumière de large. » **Oral :** expliquer expansion et distinguer la largeur actuelle de la distance parcourue par la lumière. |
| 104 | Mission 14 — Trou noir, définition ; Disque d’accrétion, définition ; Horizon des événements, bonus | « énormément de matière est concentrée dans très peu de place » ; « peuvent devenir très lumineux en chauffant » ; « une paroi solide » | « énormément de matière tient dans un tout petit espace » ; « peuvent briller en devenant très chauds » ; « un mur solide ». Garder disque d’accrétion : cette entrée sert à expliquer le mot. |

## Prise en compte des futurs dialogues

Les propositions conservent les notions qui font le sujet du jeu : équateur, axe, orbite, inclinaison, prisme, formes des galaxies, année-lumière et horizon des événements. Les dialogues pourront les introduire avec une phrase simple, puis les réutiliser.

Les termes expliqués par le glossaire ne sont toutefois pas automatiquement compréhensibles partout : seuls les mots du texte principal traités par `RichMissionText` deviennent cliquables. Les commandes, les quiz et plusieurs retours de scène ne bénéficient pas de cette aide. Les définitions bonus de la collection peuvent aussi être affichées sans leur définition principale. Les consignes et commandes doivent donc rester explicites. Pour le vocabulaire scientifique, les versions courtes peuvent s’appuyer sur un dialogue antérieur disponible et réécoutable, ou sur une aide facilement accessible.

Les indications **Oral** précisent les explications à ajouter au dialogue, sans les afficher intégralement. Prononcer les unités et les symboles en toutes lettres, expliquer les mots avant une question et nommer les boutons comme à l’écran. Les symboles et abréviations utiles peuvent rester lorsqu’ils sont accompagnés d’une légende courte ou introduits clairement. L’objectif est de comprendre avec peu de texte, pas de tout expliquer dans chaque bulle.
