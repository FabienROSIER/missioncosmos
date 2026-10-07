# Voix du robot — liste de production optimisée

**47 MP3 au total pour les 14 missions**, phrases communes comprises. Chaque texte est limité à **300 caractères**, espaces et ponctuation inclus. Le plus long contient 248 caractères.

Cette liste remplace l’ancien catalogue de 754 MP3. Les quiz sont proposés dans [un lot séparé entièrement facultatif](quizz-facultatifs.fr.md). Un texte = une génération dans Chatterrer = un fichier MP3.

Copier uniquement le bloc « Texte à générer », sans titre, nom de fichier ou indication de contexte. Déposer le MP3 dans [le dossier français](<D:/Programmation/Mission Cosmos/public/assets/audio/robot/fr>), dans le sous-dossier indiqué.

Les mêmes consignes peuvent accompagner plusieurs étapes. Jouer le fichier à la première étape pertinente, puis proposer une réécoute ; ne pas le rejouer automatiquement à chaque étape. La consigne écran précise l’objectif actuel.

Les quiz, fiches, badges, glossaire, variantes et films ne sont pas enregistrés dans ce lot. La voix accompagne les activités sans lire tout l’écran. Elle ne constitue donc pas une lecture intégrale pour un enfant qui ne lit pas encore : les réponses écrites des quiz peuvent demander l’aide d’un adulte.

Aucune voix n’est encore reliée au jeu. Les associations d’étapes sont une proposition d’intégration ; les messages communs ont des déclencheurs décrits dans leur contexte. La sécurité du Soleil reste également visible à l’écran.

## Phrases communes réutilisables — 4 MP3

### common.quiz

**Contexte :** À l’entrée d’un quiz, une seule fois

**Fichier :** `common/common.quiz.mp3`

**Longueur :** 120 caractères.

**Texte à générer :**

```text
À toi de jouer ! Regarde la question et les réponses, puis choisis celle qui te semble juste. Tu peux prendre ton temps.
```

### common.reessayer

**Contexte :** Après une erreur, sans répéter à chaque clic

**Fichier :** `common/common.reessayer.mp3`

**Longueur :** 67 caractères.

**Texte à générer :**

```text
Essaie encore ! Observe ce qui se passe, puis tente une autre idée.
```

### common.bravo

**Contexte :** Réussite d’une activité, réutilisable

**Fichier :** `common/common.bravo.mp3`

**Longueur :** 51 caractères.

**Texte à générer :**

```text
Bravo, tu as réussi ! Tu peux continuer ton voyage.
```

### common.maquette

**Contexte :** Aide sur les maquettes, à la demande

**Fichier :** `common/common.maquette.mp3`

**Longueur :** 117 caractères.

**Texte à générer :**

```text
Ceci est une maquette. Les tailles, les distances et le temps sont parfois changés pour que tu puisses tout observer.
```

## Notre Terre — 3 MP3

### mission-01.reperes

**Contexte :** Équateur puis pôles ; réécoute possible aux trois défis

**Étapes :** `m01-intro`, `m01-challenge-equator`, `m01-challenge-north`, `m01-challenge-south`.

**Fichier :** `mission-01/mission-01.reperes.mp3`

**Longueur :** 221 caractères.

**Texte à générer :**

```text
La Terre est une boule. Trouve d’abord l’équateur : le cercle imaginaire qui sépare le nord et le sud. Puis cherche les deux pôles, aux bouts de la ligne en pointillés. Cette ligne est l’axe autour duquel la Terre tourne.
```

### mission-01.orbite

**Contexte :** Défi du tour du Soleil

**Étapes :** `m01-challenge-orbit`.

**Fichier :** `mission-01/mission-01.orbite.mp3`

**Longueur :** 174 caractères.

**Texte à générer :**

```text
Fais avancer la Terre autour du Soleil en glissant sur la scène ou avec le bouton Avancer. Son chemin s’appelle une orbite. Fais un tour entier et observe le nombre de jours.
```

### mission-01.mouvements

**Contexte :** Bilan des deux mouvements

**Étapes :** `m01-explain`.

**Fichier :** `mission-01/mission-01.mouvements.mp3`

**Longueur :** 208 caractères.

**Texte à générer :**

```text
La Terre tourne sur elle-même en environ vingt-quatre heures : un jour et une nuit. Elle fait aussi le tour du Soleil en environ trois cent soixante-cinq jours : une année. Ce sont deux mouvements différents.
```

## Jour et nuit — 1 MP3

### mission-02.jour-nuit

**Contexte :** Observation puis défis jour et nuit ; même fichier

**Étapes :** `m02-intro`, `m02-observe`, `m02-challenge-day`, `m02-challenge-night`, `m02-explain`.

**Fichier :** `mission-02/mission-02.jour-nuit.mp3`

**Longueur :** 221 caractères.

**Texte à générer :**

```text
Le Soleil éclaire un côté de la Terre : c’est le jour. L’autre côté est dans l’ombre : c’est la nuit. Tourne la Terre pour faire passer le Guide de la lumière à l’ombre. Le Soleil brille toujours, même pendant notre nuit.
```

## Phases de la Lune — 2 MP3

### mission-03.observer

**Contexte :** Observation et recherche de la pleine Lune ou du croissant

**Étapes :** `m03-intro`, `m03-observe`, `m03-challenge-full`, `m03-challenge-crescent`.

**Fichier :** `mission-03/mission-03.observer.mp3`

**Longueur :** 194 caractères.

**Texte à générer :**

```text
Fais glisser la Lune autour de la Terre. Regarde sa forme dans la petite vue avec le Guide. Cherche une Lune toute ronde, puis un fin croissant. Le Soleil éclaire toujours une moitié de la Lune.
```

### mission-03.phases

**Contexte :** Explication des phases

**Étapes :** `m03-explain`.

**Fichier :** `mission-03/mission-03.phases.mp3`

**Longueur :** 191 caractères.

**Texte à générer :**

```text
La Lune reste une boule. Selon sa position, nous voyons une plus ou moins grande partie de sa moitié éclairée. Ces formes s’appellent les phases. Elles ne viennent pas de l’ombre de la Terre.
```

## Les éclipses — 3 MP3

### mission-04.securite

**Contexte :** Avant l’observation des éclipses ; message indépendant

**Étapes :** `m04-observe`.

**Fichier :** `mission-04/mission-04.securite.mp3`

**Longueur :** 134 caractères.

**Texte à générer :**

```text
Attention : ne regarde le vrai Soleil qu’avec une protection spéciale vérifiée par un adulte. Des lunettes de soleil ne suffisent pas.
```

### mission-04.aligner

**Contexte :** Observation et deux défis d’éclipse ; réécoute possible

**Étapes :** `m04-intro`, `m04-observe`, `m04-challenge-solar`, `m04-challenge-lunar`.

**Fichier :** `mission-04/mission-04.aligner.mp3`

**Longueur :** 224 caractères.

**Texte à générer :**

```text
Place la Lune entre la Terre et le Soleil : elle cache le Soleil, c’est une éclipse solaire. Puis place-la de l’autre côté de la Terre, dans son ombre : c’est une éclipse lunaire. Regarde la petite vue, puis relâche la Lune.
```

### mission-04.orbite-penchee

**Contexte :** Pourquoi il n’y a pas toujours une éclipse

**Étapes :** `m04-explain`.

**Fichier :** `mission-04/mission-04.orbite-penchee.mp3`

**Longueur :** 183 caractères.

**Texte à générer :**

```text
Le chemin de la Lune est un peu penché. Souvent, elle passe au-dessus ou en dessous de l’ombre de la Terre. Pour une éclipse, le Soleil, la Terre et la Lune doivent être bien alignés.
```

## Le Système solaire — 3 MP3

### mission-05.planetes

**Contexte :** Introduction et défi de l’ordre ; aucun fichier par planète

**Étapes :** `m05-intro`, `m05-observe`, `m05-challenge-order`, `m05-explain`.

**Fichier :** `mission-05/mission-05.planetes.mp3`

**Longueur :** 232 caractères.

**Texte à générer :**

```text
Huit planètes tournent autour du Soleil. Touche-les de la plus proche à la plus lointaine : Mercure, Vénus, Terre, Mars, Jupiter, Saturne, Uranus, Neptune. Pluton est une planète naine : elle ne fait pas partie de ces huit planètes.
```

### mission-05.tailles

**Contexte :** Mini-jeu des tailles

**Étapes :** `m05-scale`.

**Fichier :** `mission-05/mission-05.tailles.mp3`

**Longueur :** 242 caractères.

**Texte à générer :**

```text
Compare les tailles des planètes, puis réponds aux questions. Le diamètre, c’est la largeur d’une planète en passant par son centre. Les quatre planètes proches du Soleil sont rocheuses, avec un sol solide. Les quatre autres sont des géantes.
```

### mission-05.distances

**Contexte :** Mini-jeu des distances ; mêmes instructions pour tous les tirages

**Étapes :** `m05-distances`.

**Fichier :** `mission-05/mission-05.distances.mp3`

**Longueur :** 229 caractères.

**Texte à générer :**

```text
Lis l’indice du voyage, puis choisis ta destination. Les planètes sont très éloignées les unes des autres : ici, les distances sont raccourcies. Une unité astronomique correspond à la distance moyenne entre la Terre et le Soleil.
```

## Les orbites — 3 MP3

### mission-06.comparer

**Contexte :** Observer les orbites puis choisir la planète la plus rapide

**Étapes :** `m06-intro`, `m06-observe`, `m06-challenge`.

**Fichier :** `mission-06/mission-06.comparer.mp3`

**Longueur :** 225 caractères.

**Texte à générer :**

```text
Les anneaux montrent les chemins des planètes autour du Soleil. Observe leurs tours avec Pause ou Rapide. Touche la planète qui finit son tour en premier. Plus une planète est proche du Soleil, moins son année dure longtemps.
```

### mission-06.lancer

**Contexte :** Défi du lancement du Guide

**Étapes :** `m06-fall`.

**Fichier :** `mission-06/mission-06.lancer.mp3`

**Longueur :** 195 caractères.

**Texte à générer :**

```text
Lance le Guide autour de la Terre et règle sa vitesse. Trop lent, il tombe. Trop rapide, il s’éloigne. Essaie de trouver la vitesse qui le garde en orbite, en train de tourner autour de la Terre.
```

### mission-06.gravite

**Contexte :** Explication de l’orbite

**Étapes :** `m06-explain`.

**Fichier :** `mission-06/mission-06.gravite.mp3`

**Longueur :** 200 caractères.

**Texte à générer :**

```text
La gravité, c’est l’attraction entre les objets. Le Soleil attire les planètes, mais elles avancent aussi de côté. Ces deux effets les font tourner autour de lui au lieu de tomber tout droit vers lui.
```

## Les saisons — 2 MP3

### mission-07.experimenter

**Contexte :** Observation et défi de l’été au nord

**Étapes :** `m07-intro`, `m07-observe`, `m07-challenge`.

**Fichier :** `mission-07/mission-07.experimenter.mp3`

**Longueur :** 215 caractères.

**Texte à générer :**

```text
La Terre est penchée. Déplace-la autour du Soleil et trouve l’été dans sa moitié nord. Puis redresse-la avec le curseur pour comparer. La vraie Terre reste penchée : le curseur sert seulement à faire une expérience.
```

### mission-07.saisons

**Contexte :** Explication des saisons

**Étapes :** `m07-explain`.

**Fichier :** `mission-07/mission-07.saisons.mp3`

**Longueur :** 246 caractères.

**Texte à générer :**

```text
Quand une moitié de la Terre penche vers le Soleil, sa lumière arrive moins de travers et les journées durent plus longtemps : c’est l’été. Dans l’autre moitié, c’est l’hiver. Les saisons ne viennent pas du rapprochement de la Terre et du Soleil.
```

## Les étoiles — 3 MP3

### mission-08.etoiles

**Contexte :** Introduction et comparaison des étoiles

**Étapes :** `m08-intro`, `m08-observe`.

**Fichier :** `mission-08/mission-08.etoiles.mp3`

**Longueur :** 241 caractères.

**Texte à générer :**

```text
Le Soleil est une étoile ! Touche les étoiles pour comparer leurs tailles et leurs couleurs. Une étoile bleue est plus chaude en surface qu’une étoile rouge. Déplace le curseur : même une étoile géante paraît petite quand elle est très loin.
```

### mission-08.photos

**Contexte :** Album du télescope ; même fichier pour toutes les étoiles

**Étapes :** `m08-challenge`.

**Fichier :** `mission-08/mission-08.photos.mp3`

**Longueur :** 157 caractères.

**Texte à générer :**

```text
Complète l’album de l’observatoire. Pour chaque étoile, rapproche ou éloigne le télescope jusqu’à ce que son disque remplisse le cadre. Puis prends la photo.
```

### mission-08.taille-apparente

**Contexte :** Bilan ; aussi disponible après le film

**Étapes :** `m08-explain`.

**Fichier :** `mission-08/mission-08.taille-apparente.mp3`

**Longueur :** 221 caractères.

**Texte à générer :**

```text
La taille réelle d’une étoile et la place qu’elle prend dans notre ciel sont différentes. Le Soleil paraît grand parce qu’il est proche. Une étoile bien plus grande peut sembler un petit point parce qu’elle est très loin.
```

## Le secret des couleurs — 3 MP3

### mission-09.prisme

**Contexte :** Introduction et placement du prisme

**Étapes :** `m09-intro`, `m09-color`.

**Fichier :** `mission-09/mission-09.prisme.mp3`

**Longueur :** 219 caractères.

**Texte à générer :**

```text
La lumière blanche du Soleil contient plusieurs couleurs. Place le triangle de verre sur son chemin en le touchant ou avec Placer le prisme. Ce triangle s’appelle un prisme : il sépare les couleurs comme un arc-en-ciel.
```

### mission-09.melanger

**Contexte :** Exploration puis défi des quatre mélanges

**Étapes :** `m09-spectrum`, `m09-challenge`.

**Fichier :** `mission-09/mission-09.melanger.mp3`

**Longueur :** 214 caractères.

**Texte à générer :**

```text
Ici, tu mélanges des lumières, pas de la peinture. Allume les projecteurs pour obtenir les couleurs demandées : jaune, rose, bleu-vert, puis blanc. Valide chaque mélange. Tu peux essayer autant de fois que tu veux.
```

### mission-09.lumiere-blanche

**Contexte :** Bilan des mélanges

**Étapes :** `m09-explain`.

**Fichier :** `mission-09/mission-09.lumiere-blanche.mp3`

**Longueur :** 175 caractères.

**Texte à générer :**

```text
Le prisme sépare les couleurs de la lumière blanche. Les projecteurs font l’inverse : leurs lumières s’ajoutent. Ensemble, les lumières rouge, verte et bleue donnent du blanc.
```

## Les dessins du ciel — 6 MP3

### mission-10.atlas

**Contexte :** Introduction ; consigne commune aux dessins de l’atlas

**Étapes :** `m10-intro`.

**Fichier :** `mission-10/mission-10.atlas.mp3`

**Longueur :** 220 caractères.

**Texte à générer :**

```text
Une constellation est un dessin que nous imaginons avec les étoiles. Compare le ciel avec la carte de ton atlas. Touche les étoiles du dessin dans l’ordre que tu veux. Leur place et leurs écarts t’aident à les retrouver.
```

### mission-10.cassiopee

**Contexte :** Défi Cassiopée

**Étapes :** `m10-cassiopeia`.

**Fichier :** `mission-10/mission-10.cassiopee.mp3`

**Longueur :** 144 caractères.

**Texte à générer :**

```text
Pour Cassiopée, cherche cinq étoiles qui dessinent un double vé un peu penché. Compare avec la carte de ton atlas, puis touche les cinq étoiles.
```

### mission-10.grande-ourse

**Contexte :** Défi Grande Ourse

**Étapes :** `m10-ursa-major`.

**Fichier :** `mission-10/mission-10.grande-ourse.mp3`

**Longueur :** 156 caractères.

**Texte à générer :**

```text
Pour la Grande Ourse, cherche une casserole : quatre étoiles pour le récipient et trois pour le manche. Compare avec ta carte, puis touche les sept étoiles.
```

### mission-10.cygne

**Contexte :** Défi Cygne

**Étapes :** `m10-cygnus`.

**Fichier :** `mission-10/mission-10.cygne.mp3`

**Longueur :** 157 caractères.

**Texte à générer :**

```text
Pour le Cygne, cherche une croix : une longue ligne et deux ailes de chaque côté. Compare la place des étoiles avec ta carte, puis retrouve-les dans le ciel.
```

### mission-10.orion

**Contexte :** Défi Orion

**Étapes :** `m10-orion`.

**Fichier :** `mission-10/mission-10.orion.mp3`

**Longueur :** 171 caractères.

**Texte à générer :**

```text
Pour Orion, repère les trois étoiles presque alignées de sa ceinture. Puis retrouve ses épaules et ses pieds grâce à la carte. Touche les étoiles pour révéler le chasseur.
```

### mission-10.point-de-vue

**Contexte :** Défi du point de vue ; explication réécoutable après le film

**Étapes :** `m10-perspective`, `m10-understand`.

**Fichier :** `mission-10/mission-10.point-de-vue.mp3`

**Longueur :** 239 caractères.

**Texte à générer :**

```text
Déplace le vaisseau avec le curseur pour retrouver la croix de ta carte, puis vérifie ton point de vue. Les étoiles ne bougent pas. Elles sont à des distances différentes : quand nous changeons de place, leur dessin dans notre ciel change.
```

## Notre galaxie — 3 MP3

### mission-11.galaxie

**Contexte :** Introduction et voyage vers la Voie lactée

**Étapes :** `m11-intro`, `m11-journey`, `m11-explain`.

**Fichier :** `mission-11/mission-11.galaxie.mp3`

**Longueur :** 234 caractères.

**Texte à générer :**

```text
Le Soleil et ses huit planètes forment notre Système solaire. Il appartient à la Voie lactée : une galaxie avec énormément d’étoiles, du gaz et de la poussière. La gravité les rassemble. Prenons du recul pour découvrir notre galaxie !
```

### mission-11.quartier

**Contexte :** Explorer la galaxie puis retrouver le quartier du Soleil

**Étapes :** `m11-explore`, `m11-locate`.

**Fichier :** `mission-11/mission-11.quartier.mp3`

**Longueur :** 193 caractères.

**Texte à générer :**

```text
Regarde la galaxie de face, puis de profil. Notre Soleil est dans le disque, dans un petit bras appelé bras d’Orion. Il n’est ni au centre, ni à l’extérieur. Touche le repère de notre quartier.
```

### mission-11.trajet

**Contexte :** Défi du trajet galactique

**Étapes :** `m11-orbit`.

**Fichier :** `mission-11/mission-11.trajet.mp3`

**Longueur :** 186 caractères.

**Texte à générer :**

```text
Le Soleil voyage dans la galaxie avec toutes ses planètes. Compare les trois trajets. Choisis celui qui lui fait faire un tour autour du centre sans plonger dedans, puis lance le voyage.
```

## Les galaxies — 3 MP3

### mission-12.voisines

**Contexte :** Introduction et comparaison avec Andromède

**Étapes :** `m12-intro`, `m12-neighbour`, `m12-explain`.

**Fichier :** `mission-12/mission-12.voisines.mp3`

**Longueur :** 200 caractères.

**Texte à générer :**

```text
La Voie lactée n’est pas seule : il existe énormément d’autres galaxies. Andromède est notre plus proche grande voisine. Une galaxie n’est pas un Soleil géant : sa lumière vient de toutes ses étoiles.
```

### mission-12.formes

**Contexte :** Exploration des familles et album des quatre formes

**Étapes :** `m12-families`, `m12-album`.

**Fichier :** `mission-12/mission-12.formes.mp3`

**Longueur :** 248 caractères.

**Texte à générer :**

```text
Observe les quatre formes pour réparer l’album. Une spirale a des bras enroulés. Une spirale barrée a aussi une barre au centre. Une elliptique est arrondie, sans bras. Une irrégulière n’a pas de forme bien organisée. Regarde les maquettes de face.
```

### mission-12.classer

**Contexte :** Défi des cartes du plus petit au plus grand

**Étapes :** `m12-scale`.

**Fichier :** `mission-12/mission-12.classer.mp3`

**Longueur :** 201 caractères.

**Texte à générer :**

```text
Classe les cartes du plus petit au plus grand. Le Soleil est dans notre Système solaire, qui est lui-même dans la Voie lactée. Pense à ce qui est contenu dans quoi, puis touche les cartes dans l’ordre.
```

## Les distances dans l’Univers — 4 MP3

### mission-13.voyage

**Contexte :** Introduction et parcours des sept repères

**Étapes :** `m13-intro`, `m13-journey`.

**Fichier :** `mission-13/mission-13.voyage.mp3`

**Longueur :** 248 caractères.

**Texte à générer :**

```text
Découvre les distances dans l’espace. Utilise Plus loin pour avancer et Plus près pour revenir. Observe les sept repères. Nos distances sont raccourcies pour tout montrer : dans l’espace, les étoiles et les galaxies sont bien plus loin que la Lune.
```

### mission-13.destinations

**Contexte :** Défi des destinations des messages lumineux

**Étapes :** `m13-order`.

**Fichier :** `mission-13/mission-13.destinations.mp3`

**Longueur :** 189 caractères.

**Texte à générer :**

```text
Le robot prépare quatre messages lumineux depuis notre voisinage. Classe leurs destinations de la plus proche à la plus lointaine. Touche les cartes dans cet ordre pour préparer les envois.
```

### mission-13.signaux

**Contexte :** Expérience des trois flashs et explication

**Étapes :** `m13-signals`.

**Fichier :** `mission-13/mission-13.signaux.mp3`

**Longueur :** 236 caractères.

**Texte à générer :**

```text
Trois galaxies envoient un flash en même temps. Observe les arrivées, puis cherche l’image la plus ancienne. La lumière met du temps à voyager : celle de la galaxie la plus lointaine arrive plus tard et nous montre un passé plus ancien.
```

### mission-13.annee-lumiere

**Contexte :** Bilan des distances et de l’Univers observable

**Étapes :** `m13-explain`.

**Fichier :** `mission-13/mission-13.annee-lumiere.mp3`

**Longueur :** 203 caractères.

**Texte à générer :**

```text
Une année-lumière est une distance : le chemin parcouru par la lumière en un an. L’Univers observable est la partie de l’Univers dont la lumière peut nous arriver. Ce n’est pas le bord de tout l’Univers.
```

## Les trous noirs — 4 MP3

### mission-14.indices

**Contexte :** Introduction, observation de l’étoile et défi de détection

**Étapes :** `m14-intro`, `m14-observe`, `m14-detect`.

**Fichier :** `mission-14/mission-14.indices.mp3`

**Longueur :** 239 caractères.

**Texte à générer :**

```text
Un trou noir rassemble énormément de matière dans très peu de place. Observe les étoiles : elles peuvent tourner autour de lui sans tomber dedans. Pour trouver l’objet invisible, cherche la région où elles tournent autour d’un même centre.
```

### mission-14.disque

**Contexte :** Observation du gaz autour d’un trou noir

**Étapes :** `m14-surroundings`.

**Fichier :** `mission-14/mission-14.disque.mp3`

**Longueur :** 166 caractères.

**Texte à générer :**

```text
Ce disque lumineux est du gaz très chaud autour du trou noir. Ce n’est pas le trou noir lui-même. Tous les trous noirs n’ont pas un disque lumineux. Observe sa forme.
```

### mission-14.limite

**Contexte :** Expérience des signaux lumineux et explication de l’horizon

**Étapes :** `m14-signals`, `m14-explain`.

**Fichier :** `mission-14/mission-14.limite.mp3`

**Longueur :** 203 caractères.

**Texte à générer :**

```text
Envoie la lumière vers l’extérieur, d’abord depuis le point dehors, puis depuis celui dedans. La limite s’appelle l’horizon des événements. Une fois à l’intérieur, même la lumière ne peut plus ressortir.
```

### mission-14.meme-masse

**Contexte :** Expérience de l’étoile remplacée par un trou noir

**Étapes :** `m14-orbit`.

**Fichier :** `mission-14/mission-14.meme-masse.mp3`

**Longueur :** 221 caractères.

**Texte à générer :**

```text
Imagine qu’on remplace l’étoile par un trou noir de même masse, avec autant de matière. Que fera la planète qui tourne loin ? Choisis, puis vérifie. De loin, le trou noir attire autant que l’étoile : il n’aspire pas tout.
```

