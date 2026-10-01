# Champs stellaires de la mission des constellations

Les cinq tableaux utilisent chacun dix étoiles voisines réelles, fixes, et les magnitudes visuelles nominales des étoiles du dessin. Les positions du dessin et le calage des illustrations sont conservés.

## Source et attribution

Le sous-ensemble `src/content/bodies/constellationStarFields.json` est dérivé du catalogue **HYG 4.1, Astronexus**, distribué sous [Creative Commons Attribution–ShareAlike 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Ce sous-ensemble de données est distribué sous la même licence.

- [Projet HYG](https://github.com/astronexus/HYG-Database)
- [CSV HYG 4.1 utilisé](https://github.com/astronexus/HYG-Database/blob/main/hyg/CURRENT/hygdata_v41.csv)
- [Documentation des champs et licence](https://github.com/astronexus/HYG-Database/blob/main/hyg/README.md)

Modifications : extraction d’un sous-ensemble, ascension droite convertie d’heures en degrés, identifiants HIP ou HR conservés, sélection déterministe de dix voisines par tableau. Déclinaison et magnitude visuelle proviennent du catalogue (coordonnées J2000). Les noms propres, désignations de Bayer/Flamsteed ou identifiants de catalogue servent de libellés.

## Sélection et affichage

Les magnitudes des étoiles du dessin ont été associées par proximité angulaire aux positions déjà utilisées (écart maximal de 0,02 degré). Les voisines sont sélectionnées parmi les étoiles de magnitude au plus 5,8, dans un rayon angulaire de 50 degrés du centre, puis projetées dans le même repère que le dessin. Elles doivent rester entre 65 et 935 dans le carré de 1000 unités et à au moins 75 unités des autres points retenus. Les plus brillantes sont prioritaires ; l’identifiant départage les égalités. Les résultats sont enregistrés dans le JSON : aucune sélection aléatoire à l’exécution.

La projection des voisines conserve le centre, la rotation et l’échelle définis par le dessin ; elle ne modifie pas ses coordonnées ni la taille des illustrations.

Le flux relatif est calculé par `10^(-0,4 × magnitude)`. Le rayon suit le flux relatif à une étoile de magnitude 2, comprimé par une puissance de 0,25 : les étoiles faibles deviennent nettement plus petites. Pour les étoiles plus brillantes que la magnitude 2, la croissance du rayon devient douce et linéaire afin de contenir la taille des plus gros points. L’opacité suit une réponse comprimée (`flux^0,16`) pour conserver la visibilité sur les petits écrans. L’affichage conserve la hiérarchie d’éclat du catalogue, sans prétendre reproduire les rapports physiques de flux sur un écran. Les magnitudes sont nominales, sans simulation de variabilité ou d’atmosphère. Pendant le défi, les étoiles du dessin bénéficient de seulement +3 % de rayon et +4 % d’opacité ; le halo suit la même règle pour toutes les étoiles. Un dégradé radial se diffuse jusqu’à 4,5 fois le rayon du cœur, avec une opacité décroissante jusqu’à zéro, sans contour net. La lumière est blanche légèrement bleutée, et dorée pour les étoiles trouvées.

Les voisines sont sélectionnables comme les étoiles du dessin. Les zones tactiles mesurent 48 pixels ; si elles se chevauchent, l’étoile visible la plus proche du point touché est choisie, indépendamment de son appartenance au dessin. Le clavier permet aussi de sélectionner chaque étoile.
