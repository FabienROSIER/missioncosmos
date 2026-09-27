# Guide de contenu pédagogique — Mission Cosmos

Public : **enfants 6–12 ans**, français. Ton clair, pas infantilisant.

## Séquence type d’une mission

**Question → observation → manipulation → découverte → défi → explication → récompense**

Faire découvrir **avant** d’expliquer.

## Règles éditoriales

- Phrases courtes ; un idée centrale par mission (ou peu).
- Expliquer le vocabulaire utile plutôt que le supprimer.
- Adapter aux lecteurs débutants sans ennuyer les 10–12 ans.
- Erreur = indice ou explication, jamais punition.
- Signaler clairement ce qui n’est **pas à l’échelle**.
- Ne jamais présenter une simplification comme exactitude physique.
- Prévoir si pertinent : texte principal + « En savoir plus ».

## Idées fausses fréquentes à corriger

Documenter dans chaque mission les misconceptions ciblées, ex. :

- le Soleil « s’éteint » la nuit ;
- l’ombre de la Terre crée les phases de la Lune ;
- l’été = Terre plus proche du Soleil ;
- Pluton = 9ᵉ planète ;
- trou noir = aspirateur cosmique qui avale tout.

## Structure d’une mission (contenu)

Champs attendus (schéma TypeScript en Phase 1.3 / 4.1) :

- id, titre, difficulté, prérequis ;
- objectifs pédagogiques ;
- question d’intro ;
- scène 3D (référence) ;
- étapes, défi, explication, quiz optionnel ;
- récompense, faits, glossaire, assets.

Les textes vivent dans `src/content/` ; pas dans le code des scènes Babylon.

## Glossaire

Termes techniques introduits progressivement, consultables hors mission. Entrées enrichies débloquables via progression.

## Compagnon

- Contenu : `src/content/companion/` (persona, répliques courtes).
- Logique pose/réplique : `src/features/companion/resolveCompanionCue.ts`.
- Nom temporaire : `COMPANION_TEMP_NAME` — à valider avec le propriétaire.
- Les indices et explications scientifiques restent dans les steps de mission ; le compagnon ne fait que guider / encourager / féliciter sobrement.
- Poses : voir `docs/COMPANION_ASSETS.md`. Apparition discrète (sprite petit, flottement CSS, `prefers-reduced-motion`).

## Sources scientifiques

Avant statut FINAL d’une mission : vérifier et sourcer dans `docs/SCIENTIFIC_SOURCES.md` (Phase 17). Privilégier sources institutionnelles.
