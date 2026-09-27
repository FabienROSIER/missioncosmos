# ADR-002 — Fond spatial des missions 3D

- **Date** : 2026-09-26
- **Statut** : Accepté
- **Contexte** : Choix fond mission (procédural vs image)

## Décision

Pour les **scènes 3D de mission**, utiliser un **fond image** (`createSpaceBackground` + `MISSION_STARFIELD_SRC`, actuellement `ast-021-space-starfield-fine-v2.webp`) plutôt qu’un champ d’étoiles procédural.

Les panoramas WebP (`AST-020/021/022`) restent aussi utilisés en **CSS** pour les menus.

## Pourquoi

- Rendu jugé plus joli / immersif par le propriétaire.
- Le procédural reste disponible (`createPunctualStarfield`) en secours technique, mais n’est pas le défaut missions.

## Conséquences

- Les prochaines missions doivent réutiliser `createSpaceBackground` + `MISSION_STARFIELD_SRC` (ou variante documentée).
- Surveiller poids (`fine-v2` ~1,2 Mo) et prévoir variante mobile si perf faible.
- UV tiling (4×2) pour éviter des étoiles trop grosses sur la voûte.
