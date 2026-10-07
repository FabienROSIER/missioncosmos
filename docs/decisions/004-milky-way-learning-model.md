# ADR-004 — Maquette pédagogique de la Voie lactée

Date : 2026-10-02. Statut : adopté pour la mission 11.

## Besoin

Montrer la Voie lactée de face et de profil, passer du Système solaire à la galaxie et situer approximativement notre quartier. Le panorama artistique AST-020 montre le ciel de l’intérieur ; il ne suffit pas pour cette exploration extérieure.

## Décision

Utiliser un nuage de points 3D déterministe, plafonné selon les qualités graphiques, avec disque, bras symboliques et renflement central. Réutiliser AST-021 comme fond image, conformément à l’ADR-002. Aucune nouvelle texture, photographie, skybox ou modèle externe n’est nécessaire : l’asset gate est résolu par ce choix technique.

La géométrie est la maquette interactive de la mission, pas un ciel astronomique procédural. Elle porte explicitement une notice de simplification. La position du Soleil est approximative ; les points ne proviennent pas d’un catalogue d’étoiles.

L’introduction réutilise les neuf modèles texturés du pack Système solaire AST-012 déjà intégré, leurs dimensions lisibles et l’horloge des cinématiques Système solaire/Orbites. Le groupe est réduit uniformément pour la transition vers la maquette galactique ; aucun nouvel asset n’est créé pour cette introduction.

## Conséquences

Chargement léger, vues interactives, pas de nouvel asset à demander ni de nouvelle licence. Les bras restent artistiques ; cette représentation ne remplace pas une carte de la Voie lactée. Une éventuelle version cartographique demanderait des données sourcées et une définition technique distincte. Sources et limites dans `docs/pedagogy/mission-11-milky-way.md`.
