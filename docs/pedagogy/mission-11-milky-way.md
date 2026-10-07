# Mission 11 — Notre galaxie

## Parcours

1. Observer le Soleil et les huit planètes texturées du pack existant AST-012. Même maquette lisible que la mission Système solaire, mêmes matériaux que les missions Système solaire/Orbites : proportions visuelles, espacements amplifiés, anneaux de Saturne et atmosphère de la Terre. Une réduction uniforme du groupe permet de l’intégrer dans les coordonnées de la galaxie.
2. Voyage automatique de huit secondes : prendre du recul et découvrir la Voie lactée. Le bouton « Passer le voyage » permet de rejoindre directement la vue globale.
3. Explorer le disque et le renflement central : rotation au doigt/souris, zoom, vues « De face » et « De profil », rotation automatique facultative.
4. Situer notre quartier parmi trois repères : extérieur, centre, disque loin du centre. Le choix se fait dans la scène ou avec les boutons accessibles au clavier. Les erreurs donnent un indice sans bloquer les essais suivants.
5. Comprendre l’emboîtement Terre → Système solaire → Voie lactée.
6. Défi « Le grand voyage du Soleil » : comparer trois trajectoires partant du Soleil, puis lancer celle qui entoure le centre galactique. Les trois trajets sont animés. Le petit cercle autour d’un autre point et la spirale qui tombe vers le centre se terminent par une validation négative rouge et un indice, sans bloquer les essais suivants. Le bon trajet devient vert et une grande coche valide la réussite. Les lettres des repères et des trajets sont mélangées à l’entrée de chacun des deux défis, puis restent stables pendant les essais. Le tour correct est animé en cinq secondes avant de valider le défi. En mouvement réduit, la validation montre le trajet complet sans animation. Le Soleil est agrandi uniquement pour suivre son déplacement dans ce défi ; la caméra reste manipulable, les bras et le fond ne tournent pas avec lui. L’orbite circulaire est schématique, pas une simulation dynamique ; les autres étoiles ne sont pas animées. Le Soleil emporte ses planètes autour du centre en environ 230 millions d’années ([NASA — Sun facts](https://science.nasa.gov/sun/facts/)).
7. Trois questions, une à la fois, dans le panneau commun animé par le robot. La scène reste visible en parallèle. Badge « Habitant de la Voie lactée », puis exploration libre.

## Modèle et limites

La galaxie est un **objet pédagogique**, pas un fond de ciel généré et pas une carte astronomique. Le fond reste l’image artistique AST-021 existante (ADR-002).

Un seul nuage de points dessine un disque mince, des bras artistiques et un centre plus épais. La distribution centrale suit une densité gaussienne avec des contours arrondis et décroissants, et les couleurs passent progressivement du crème au bleu selon la distance au centre. Aux 1 600 / 3 200 / 5 200 points principaux s’ajoutent des points de 42 % de leur taille, plus discrets : total borné de 3 200 / 9 600 / 15 600 points selon le niveau graphique, en un seul rendu. La distribution est déterministe. Chaque point représente beaucoup d’étoiles. Leur couleur souligne les régions de la maquette ; elle n’est pas une mesure des étoiles réelles.

Une lueur diffuse épouse le volume du disque, du bulbe et de la barre centrale. Les composantes lisses sont intégrées analytiquement ; les bras lumineux sont intégrés dans une tranche mince, avec 12 échantillons en qualité basse et 20 dans les autres qualités. Leur lumière suit le même tracé spiralé que les points, avec des variations douces et de légères bandes d’atténuation évoquant les filaments sombres observés sur les photos. Un disque diffus continu reste visible entre les bras : son volume aplati et ses bords progressifs renforcent la lumière vers le centre, sans masquer le tracé des spirales. La barre centrale conserve sa lumière plus chaude. Le résultat reste adapté aux vues de face, de profil et intermédiaires, en un seul rendu supplémentaire, sans texture ni bloom. Le volume n’est pas sélectionnable et ne remplace pas les repères du défi. Les allocations et les distributions sont calculées au chargement, sans reconstruire de géométrie à chaque image.

Les points sont plus fins, moins dominants et rendus en mélange additif : leurs bords ne doivent pas assombrir la lumière diffuse. L’accentuation des contours est désactivée pour cette scène seulement, afin d’éviter les anneaux noirs autour de petites sources lumineuses. Les autres missions conservent leur réglage par défaut.

Le nombre et le tracé des bras ne prétendent pas restituer les bras majeurs et secondaires connus. Le gaz, la poussière, le halo sphérique d’étoiles et la matière noire ne sont pas modélisés physiquement. Les bandes d’atténuation sont stylistiques. La lueur est un effet artistique traduisant la concentration lumineuse du disque et du centre, pas une carte de rayonnement ou de matière noire. Le quiz porte sur le disque dominant, sans affirmer que toute la galaxie se limite au disque.

Le repère du Soleil est approximativement à mi-rayon du disque. Il sert à distinguer « dans le disque, loin du centre » de « au centre » et « hors de la galaxie ». Il ne cartographie pas précisément le bras d’Orion. Les sphères, les orbites planétaires, les distances et le voyage sont amplifiés et ne sont pas à l’échelle. Le voyage n’est ni une simulation de vitesse ni une observation réelle depuis un vaisseau.

La préférence de réduction des animations supprime le voyage automatique, les mouvements orbitaux et la rotation automatique facultative. L’enfant rejoint alors la galaxie avec « Découvrir la galaxie » ; les manipulations directes restent disponibles.

L’introduction reprend les fonctions `orbitalAngularSpeed` et `spinAngularSpeed` des cinématiques existantes : révolution antihoraire vue du nord, périodes relatives cohérentes et rotations axiales tenant compte des inclinaisons. Les vitesses sont accélérées avec la même horloge pédagogique ; elles ne simulent pas un trajet à vitesse réelle. Le groupe des modèles est masqué lorsque les planètes deviennent invisibles, avec un relais lumineux à la position du Soleil.

Pendant le recul, la taille du groupe solaire diminue exponentiellement. Huit étoiles voisines apparaissent avant que le Soleil soit relayé par un point lumineux. Ce voisinage est schématique, sans noms ni coordonnées de catalogue : il illustre que le Soleil est entouré d’autres étoiles, sans prétendre cartographier Proxima ou les distances réelles. Après leur apparition, leur espacement traverse rapidement plusieurs ordres de grandeur : dès 12 % de progression, le voisinage occupe moins de 0,1 % du diamètre galactique. Les points lumineux diminuent aussi pour éviter un amas de huit grosses étoiles autour du repère solaire. Cette compression logarithmique des échelles sert la transition pédagogique ; ce n’est pas une calibration des distances physiques. Les voisines s’effacent ensuite pendant que la galaxie apparaît, avec des fondus qui se chevauchent. Il n’y a donc pas de passage vide entre la maquette du Système solaire et la vue galactique.

Le Soleil reste un point à la position de notre quartier après la disparition des planètes. Il utilise le même diamètre, la même couleur locale, la même opacité et le même shader lumineux que les points principaux du disque, sans traitement distinctif. Ce point est caché lors du défi de localisation non résolu pour ne pas révéler le bon repère. Une légende explique le relais. L’anneau utilisé ensuite est aussi un repère agrandi, pas la taille du Système solaire. La caméra et les huit secondes de voyage restent identiques. Les étoiles voisines et le point solaire ajoutent deux petits rendus groupés, sans texture ni objet par étoile.

## Sources scientifiques

- [NASA — The Milky Way Galaxy](https://science.nasa.gov/resource/the-milky-way-galaxy/) : représentation artistique vue de l’extérieur, structure barrée, Soleil dans le bras d’Orion entre les bras du Sagittaire et de Persée.
- [NASA — Galaxies](https://science.nasa.gov/universe/galaxies/) : galaxies constituées d’étoiles, de gaz et de poussière ; distinction avec les systèmes planétaires.
- [NASA — Exploring the Milky Way](https://science.nasa.gov/wp-content/uploads/2023/10/Exploring_the_Milky_Way.pdf) : ordre de grandeur d’environ 26 000 années-lumière entre le Soleil et le centre.

Ces sources étayent le texte ; elles ne fournissent pas des coordonnées pour ce nuage artistique.

Références visuelles consultées pour les bras diffus, la barre crème et les filaments sombres : [NASA/ESA/Hubble — NGC 1300](https://esahubble.org/images/opo0501a/) et [NASA/Hubble — NGC 253](https://science.nasa.gov/asset/hubble/ngc-253-from-the-angst-survey/). Ce sont des observations d’autres galaxies, utilisées pour comparer l’aspect ; leurs photographies ne sont pas intégrées comme textures dans la mission.

## Vérifications du 2 octobre 2026

- Parcours navigateur complet : voyage automatique, vues de face/profil, deux erreurs de localisation, bonne réponse, trois questions, badge, sauvegarde et déblocage de M12. Recommencer réinitialise le défi.
- Chromium avec rendu WebGL logiciel : 1365×900, 390×844, 320×568, 844×390, 568×320, 768×1024. Questions et retours corrects/incorrects sans débordement ni défilement du quiz. Robot présent à chaque question.
- Sélection d’un repère directement dans la scène dans ces six formats ; reprise d’une session aux étapes localisation/quiz ; voyage manuel avec réduction des animations.
- Tests unitaires : maquette bornée et reproductible dans les trois qualités, disque/centre d’épaisseurs distinctes, quartier du Soleil dans le disque, voyage monotone et borné, mission/quiz/badge/glossaire branchés.
- Suite complète : 138 tests réussis. TypeScript, lint des fichiers concernés et compilation de production réussis ; route M11 générée pour l’export statique.

Ces essais ne mesurent pas les performances sur un téléphone physique.
