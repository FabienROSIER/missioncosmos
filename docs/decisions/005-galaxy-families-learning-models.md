# ADR-005 — Maquettes des familles de galaxies

Date : 2026-10-02. Statut : adopté pour la mission 11.

## Décision

Représenter les galaxies par des volumes de points et des halos 3D générés par le code du projet. Réutiliser le disque, les bras et le bulbe de la mission 10 pour les spirales ; ajouter un ellipsoïde d’étoiles sans bras et une distribution irrégulière en plusieurs concentrations. Conserver le fond image AST-021 déjà documenté, conformément à l’ADR-002.

L’asset gate est résolu par ces modèles pédagogiques, sans photographie, texture ou modèle tiers supplémentaire. La géométrie et les shaders ajoutés sont du code original du projet ; ils ne nécessitent pas de licence d’asset externe. La provenance du fond image reste celle de `docs/ASSETS.md`. Les références NASA servent uniquement à vérifier les notions : aucun média NASA n’est importé.

## Limites

La Voie lactée et Andromède sont deux spirales distinctes dans les textes et dans la navigation. À la demande du propriétaire, leurs vues réutilisent la maquette artistique de spirale précédente, avec un volume légèrement allongé et incliné pour Andromède. Elles ne reproduisent pas une carte d’étoiles, la structure centrale réelle des galaxies ou leur projection depuis la Terre. Le modèle barré générique est réservé au défi de l’album ; il n’est pas attribué à une galaxie nommée. Les elliptiques et irrégulières sont aussi des exemples génériques. La notice du jeu indique ces simplifications.

Les cartes Soleil → Système solaire → Voie lactée représentent une relation d’inclusion, pas des tailles comparables à l’échelle. Aucune fausse distance relative entre galaxies n’est mise en scène.

## Budget et interaction

Quatre modèles conservés, avec 2 400 / 5 000 / 8 000 points chacun selon la qualité low / medium / high. Un seul modèle visible en régime normal ; deux temporairement lors d’un fondu. Pas de modèle 3D détaillé par étoile. Halos additifs sans écriture de profondeur ; 12 ou 20 échantillons pour les bras. Nettoyage à la sortie de la scène. Fondu et transitions de caméra supprimés avec la préférence de réduction des animations.

Les défis utilisent les contrôles tactiles communs, sans glisser-déposer obligatoire. Quiz et succès réutilisent les composants communs. Les étapes d’observation ne déclenchent pas de célébration de défi.

## Ajustement — spirales barrées et halos

Ajout de deux maquettes de spirales distinctes : la barrée possède une barre centrale allongée et deux bras partant de ses extrémités, avec un halo correspondant au nuage de points. Les quatre maquettes utilisent un halo renforcé (intensité × 1,65) dans M11 ; le réglage historique de M10 reste inchangé. La barre est expliquée comme une sous-catégorie des spirales dans la mission, le quiz et le glossaire. Album étendu à quatre fiches, boutons sur deux colonnes pour rester lisibles sur mobile.

Correction de périmètre : le modèle barré générique reste dans les quatre fiches du défi, avec sa définition dans le glossaire. Les vues des galaxies nommées sont rétablies, le quiz revient à la question sur les bras des spirales, et l’exploration libre propose trois familles. Cette simplification visuelle n’est pas une reclassification scientifique de la Voie lactée.

À la demande suivante du propriétaire, le modèle barré générique est également proposé dans la découverte et l’exploration de fin de mission. Les vues des galaxies nommées restent celles rétablies ci-dessus.
