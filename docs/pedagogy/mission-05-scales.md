# Mission 05 — Comparer sans fausse échelle

Trois vues remplacent le mode « À l’échelle » qui utilisait deux facteurs incompatibles.

- **Explorer** : maquette 3D, dimensions et orbites adaptées, positions illustratives. Navigation, fiches et défi conservés. Le défi impose cette vue.
- **Tailles** : modèles indépendants alignés, rayons issus des rayons moyens en km avec un facteur commun. Caméra orthographique frontale, fixe : pas de raccourcissement par perspective. Groupes Terre/Jupiter, rocheuses, huit planètes, Terre/Soleil. Espacements arbitraires annoncés. Les anneaux ne sont pas inclus dans le diamètre de Saturne ; leur encombrement est réservé dans le placement.
- **Distances** : règle SVG linéaire des demi-grands axes arrondis, présentés comme distances moyennes. Vue jusqu’à Neptune et zoom Soleil–Mars. Repères numérotés, sélection nommée, UA/km et curseur de parcours. Ce n’est ni une éphéméride, ni un alignement orbital réel, ni un voyage à vitesse simulée.
- **Même échelle** : les repères sont remplacés par les disques géométriques à leur vraie dimension relative aux distances. Même conversion km → UA → pixels pour tous, Soleil compris. Aucun rayon minimal ni contour artificiel. Les boutons de navigation restent explicitement des repères. La taille de la Terre en pixels CSS dépend de la largeur réelle de la règle.

Les modèles du pack restent des approximations artistiques sphériques (rayon source normalisé ≈ 1). Les textures, l’éclairage de comparaison et la rotation visuelle ne prétendent pas restituer une observation à une date donnée. La règle omet les anneaux, satellites, excentricités et mouvements orbitaux. Le rendu sous-pixel de la démonstration commune dépend de l’anticrénelage du navigateur.

## Sources et unités

- Rayons moyens : https://ssd.jpl.nasa.gov/planets/phys_par.html (Mercure actualisé à 2439,4 km ; Terre arrondie à 6371 km).
- Demi-grands axes : valeurs pédagogiques arrondies du catalogue existant ; référence des éléments orbitaux : https://ssd.jpl.nasa.gov/planets/approx_pos.html . Ces valeurs ne sont pas des distances instantanées.
- Unité astronomique : exactement 149 597 870,7 km, https://ssd.jpl.nasa.gov/glossary/au.html .
- Rayon solaire nominal 695 700 km : résolution UAI 2015 B3, https://www.iau.org/static/resolutions/IAU2015_English.pdf .

## Vérification

`solarSystem.test.ts` contrôle les rapports pour chaque groupe, l’absence de chevauchement des encombrements, la linéarité du zoom et surtout l’identité du facteur pour les rayons et les distances. L’étape distances précède le défi. Le guide et les commandes sont mesurés avec ResizeObserver pour réserver l’espace réellement disponible sur mobile.

## Mini-jeux enfants

- « Le voyage de la sonde » propose trois repères par destination (Mars, Jupiter, Neptune). Un indice qualitatif suffit : aucun calcul, aucune saisie de distance, aucun chronomètre. Une erreur invite à réessayer sans retirer de points. Chaque repère utilise la même projection linéaire ; la bonne réponse correspond à la distance du catalogue. Le changement de zoom est annoncé entre destinations.
- La carte libre conserve les valeurs UA/km et la révélation des tailles à échelle commune.
- « Qui est le plus grand ? » propose trois questions qualitatives. La réponse révèle les modèles à leurs proportions, y compris en cas d’erreur pour aider à réessayer. Les jeux restent facultatifs et n’ajoutent aucun verrou au parcours.
- Les portraits de destination et icônes sont explicitement agrandis, sans prétendre représenter les diamètres sur la règle.
