# Cursor Rules — Mission Cosmos

## Rôle général

Tu travailles sur **Mission Cosmos**, une application éducative francophone d'astronomie destinée aux enfants de 6 à 12 ans.

Le document `TODO_MISSION_COSMOS.md` est la source principale de pilotage du projet. Lis-le avant toute intervention importante et maintiens-le à jour.

## Méthode de travail obligatoire

1. Identifier la phase et la sous-phase actives dans la TODO.
2. Ne traiter qu'un ensemble cohérent et limité de tâches.
3. Expliquer brièvement l'objectif avant une modification structurante.
4. Implémenter proprement.
5. Exécuter les contrôles pertinents : lint, typecheck, tests, build selon la modification.
6. Corriger les erreurs provoquées par l'itération.
7. Mettre à jour la TODO : tâches terminées, nouvelles tâches, problèmes connus.
8. Résumer le travail réalisé.
9. Demander validation avant de changer de phase majeure.

Ne tente jamais d'exécuter toute la roadmap en une seule fois.

## Assets

Si une fonctionnalité nécessite un asset qui n'existe pas :

- ne choisis pas silencieusement un asset définitif ;
- un placeholder temporaire est possible uniquement pour débloquer le code ;
- demande au propriétaire l'asset avant finalisation ;
- donne un brief exploitable : sujet, style, format, résolution, fond transparent ou non, variantes, animations éventuelles et chemin de destination ;
- mets à jour le registre des assets de la TODO ;
- renseigne source, auteur et licence dans `docs/ASSETS.md`.

## Architecture

Priorités : simplicité, lisibilité, modularité, performances mobiles.

Séparer :

- UI React ;
- contenu pédagogique ;
- logique de progression ;
- scènes et objets Babylon.js ;
- stockage ;
- assets.

Ne pas créer de backend, système de compte distant ou infrastructure cloud sans besoin validé.

Ne pas coupler le texte pédagogique à l'implémentation Babylon lorsque cela peut être évité.

## 3D

- Penser smartphone avant desktop.
- Nettoyer toutes les ressources Babylon lors d'un changement de scène.
- Éviter les textures inutilement lourdes.
- Lazy-loader les scènes et assets lourds.
- Distinguer données scientifiques et dimensions visuelles.
- Toute représentation non à l'échelle doit pouvoir être signalée à l'utilisateur.
- Ne pas présenter une animation simplifiée comme une simulation scientifique exacte.

## Pédagogie

Le pattern privilégié est :

**Question → manipulation → découverte → défi → explication → récompense.**

Le texte doit être compréhensible par un enfant sans être infantilisant.

Lorsqu'une notion est simplifiée, conserver l'idée scientifique correcte.

Les erreurs de l'enfant doivent produire une explication ou un indice, pas une punition.

## Sécurité / enfants

- Minimiser les données personnelles.
- Aucun tracking publicitaire.
- Aucun dark pattern.
- Aucun mécanisme de récompense compulsif.
- Aucun lien externe facilement déclenchable par un enfant sans conception adaptée.
- Signaler les implications légales avant toute fonctionnalité collectant des données personnelles d'enfants.

## Qualité

Avant de déclarer une tâche terminée :

- code typé ;
- absence d'erreur connue introduite ;
- responsive vérifié lorsque pertinent ;
- tactile vérifié lorsque pertinent ;
- lint/typecheck/tests pertinents passés ;
- TODO actualisée ;
- documentation mise à jour si nécessaire.
