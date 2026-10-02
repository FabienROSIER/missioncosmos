# Mission — Les dessins du ciel (conception)

Statut : mission jouable intégrée sous `mission-constellations`, dans la zone
Étoiles après la Mission 09. Les identifiants des missions 10 à 13 sont conservés.
Les sauvegardes ayant terminé la Mission 09 accèdent aussi à cette nouvelle mission.

## Sélection

Quatre découvertes dans le parcours principal, puis une découverte bonus sans
condition pour terminer la mission. Pas de chronomètre ; indices progressifs.

| Ordre | Constellation | Repère à retrouver                                                | Illustration révélée                                     |
| ----- | ------------- | ----------------------------------------------------------------- | -------------------------------------------------------- |
| 1     | Cassiopée     | Les cinq étoiles du W                                             | Une reine assise sur un trône                            |
| 2     | Grande Ourse  | Les sept étoiles de la casserole                                  | Une ourse céleste à longue queue                         |
| 3     | Cygne         | La grande croix                                                   | Un cygne aux ailes déployées                             |
| 4     | Orion         | Les trois étoiles de la ceinture, puis épaules et pieds           | Un chasseur avec une ceinture, une massue et un bouclier |
| Bonus | Aigle         | Altaïr et les deux étoiles qui l'encadrent, puis le dessin élargi | Un aigle aux ailes déployées                             |

La casserole est un astérisme à l'intérieur de la Grande Ourse, pas toute la
constellation. Après sa découverte, montrer les autres repères nécessaires à
l'ourse avant de révéler son illustration complète. La longue queue appartient
à une représentation mythologique ; elle ne décrit pas l'anatomie d'une ourse.

## Apparition des images

1. L'enfant retrouve les étoiles avec une carte simple et les relie.
2. Le dessin réussi reste visible ; l'illustration apparaît progressivement.
3. Afficher le nom et une phrase : « Des personnes ont imaginé un cygne dans ces étoiles. »
4. Donner un bouton « Voir / cacher le dessin » pour comparer à volonté.

Les PNG ont un fond transparent. Régler séparément l'opacité du personnage dans
le rendu, avec 0,30 comme point de départ et une plage de 0,20 à 0,40 à vérifier
sur mobile. Les étoiles et les traits du jeu restent devant l'image, opaques et
lisibles. L'image ne reçoit pas les interactions destinées aux étoiles.

Les illustrations sont des interprétations artistiques, sans étoiles ni carte
scientifique intégrées. Elles ne constituent pas un relevé de positions.
Le ciel utilise les positions J2000 du catalogue des noms d'étoiles de l'IAU
(Gamma Cassiopeiae : position J2000 arrondie). Une projection sur un plan tangent,
une rotation et une mise à l'échelle uniforme préservent la disposition relative.
Les étoiles ne sont pas déplacées individuellement pour rentrer dans l'image.
Le Cygne a une variante à cou droit, `cygnus-aligned.png`, pour mieux placer la
tête et la queue sur la grande croix. L'ourse est retournée horizontalement au
rendu pour suivre l'orientation du ciel. Les poses artistiques n'ont pas la
précision d'une carte scientifique. Le fond ne fournit aucune coordonnée.

## Repères de calage

- Cygne : Deneb vers la queue, Sadr à la jonction des ailes, Albireo vers la tête.
- Grande Ourse : casserole dans l'arrière du corps ; manche le long de la queue.
- Cassiopée : W dans l'ensemble reine/trône, pas cinq sommets d'une couronne.
- Orion : ceinture sur le bassin ; épaules et pieds définissent le corps.
- Aigle : tracé à huit étoiles inspiré de la référence fournie : trois étoiles pour la tête autour d’Altaïr, Delta pour le corps, Okab pour une aile, Eta–Theta pour l’autre et Lambda pour la queue. Figure calée sur ces repères ; ailes distinctes de celles du cygne.

## Défi de perspective et film final

Utiliser le Cygne comme fil conducteur entre la découverte et la profondeur.
Depuis une vue décalée, retrouver le point d'observation qui reconstitue son
dessin en déplaçant le vaisseau sur un rail simple.

Pour le film final, revenir au point de vue terrestre et révéler brièvement
l'image du cygne. Effacer l'illustration avant le déplacement latéral de caméra.
Conserver un instant les traits comme repères, puis les effacer pour révéler les
étoiles à des profondeurs différentes. Garder une petite vue terrestre en
comparaison. Revenir au point d'observation initial : le dessin se reforme,
puis le cygne réapparaît. Les étoiles restent fixes durant cette expérience.

Phrase finale : « Les mêmes étoiles peuvent former un dessin très différent
quand on les regarde depuis un autre endroit de l'espace. »

Le déplacement représente un immense voyage imaginaire, pas quelques pas sur
Terre. Le modèle Babylon utilise sept profondeurs de démonstration différentes,
qui ne prétendent pas être les distances réelles des étoiles du Cygne. Cet écart
est annoncé dans les commandes et la notice de la maquette. Les positions 3D
restent fixes et reproduisent la carte depuis l'origine ; seule la caméra se
déplace. Le film démarre automatiquement dès que la scène est prête et dure 16,5 secondes.
Il reprend le rythme de la mission des étoiles avec un arrêt sur la profondeur raccourci de 1,5 seconde.
Les chapitres commencent à 0, 2, 7,3 et 10,4 secondes ; les déplacements utilisent la même
interpolation douce, avec un retour achevé à 15 secondes.
Les commandes sont « Pause / Reprendre », « Passer », puis « Revoir le voyage ».
Quand les mouvements sont réduits, une seule commande « Tableau suivant » remplace la lecture
automatique. Les quatre boutons permettant de choisir directement un chapitre sont supprimés.

## Parcours réalisé

- Carte sans numéros, étoiles à retrouver dans n’importe quel ordre, indice temporaire de six secondes et essais illimités. Les traits apparaissent quand leurs deux extrémités ont été trouvées. Les erreurs conservent les réussites.
- Dix étoiles voisines réelles par tableau, fixes et sélectionnables, avec un éclat issu de leur magnitude visuelle. Voir [sources et méthode](constellation-star-fields.md).
- Révélation de l'image à 30 % d'opacité, étoiles et traits devant ; bouton pour la cacher.
- Quatre constellations requises ; Aigle facultatif avec bouton pour passer le bonus.
- Défi de point de vue sur un rail passant de part et d’autre de l’observateur terrestre. Le bon point de vue se situe à l’intérieur du curseur (43/100, tolérance ±3), sans repère de réponse affiché ; ni les extrémités ni le milieu exact ne valident le défi. La comparaison à la carte guide la recherche.
- Vue 3D : les marqueurs stellaires conservent un cœur lisible selon leur magnitude pendant le déplacement (minimum de trois pixels de diamètre), avec un halo radial doux partagé. Leur taille représente un repère lumineux pédagogique, pas le rayon physique de l’étoile. Les traits fictifs et la grille de profondeur sont atténués pour laisser les étoiles dominer.
- Film : lecture automatique, pause/reprise, possibilité de passer et de revoir. Variante sans mouvements automatiques avec « Tableau suivant ».
- Question de compréhension sans punition, puis une question de quiz sur l’origine des constellations (peuples anciens : se repérer, suivre les saisons, raconter des histoires ; pas un seul inventeur récent). Badge Cartographe du ciel ensuite.
- Atlas libre des cinq constellations après la mission.
- Reprise à l'étape sauvegardée ; un dessin en cours reprend au début de ce dessin.

## Vérifications

Tests de contenu, projection et retour de caméra ; compatibilité des anciennes
sauvegardes. Parcours navigateur jusqu'au badge, bonus passé, lecture du film et
pause, commandes clavier, reprise, mauvaises réponses et tableaux sans animation.
Affichage contrôlé sur ordinateur et dans une fenêtre mobile de 390 × 844.

Éviter d'affirmer que toutes les étoiles d'une constellation sont sans relation
physique : certaines peuvent appartenir à un même groupe. Le propos porte sur
le dessin apparent et les différentes distances.

## Références

- [IAU — The Constellations](https://iauarchive.eso.org/public/themes/constellations/) : noms, figures traditionnelles, régions du ciel et diversité des représentations.
- [IAU — Naming Stars](https://iauarchive.eso.org/public/themes/naming_stars/) : coordonnées J2000 des étoiles nommées.
- [NASA — What Are Asterisms?](https://science.nasa.gov/solar-system/skywatching/what-are-asterisms/) : distinction entre casserole et Grande Ourse.
- [ESA — How far away are the stars?](https://www.cosmos.esa.int/web/gaia/dr3-how-far-away-are-the-stars) : distance et changement de point d'observation.
