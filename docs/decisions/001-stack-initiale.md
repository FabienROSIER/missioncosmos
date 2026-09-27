# ADR-001 — Stack initiale Mission Cosmos

- **Date** : 2026-09-26
- **Statut** : Accepté
- **Contexte** : Initialisation Phase 1.1

## Décision

- **Next.js** (App Router) + **React** + **TypeScript strict** comme socle web
- **Babylon.js** (`@babylonjs/core`) pour les scènes 3D
- **CSS natif** (variables / modules) plutôt que Tailwind au démarrage — tokens design en Phase 2
- **Vitest** pour les tests unitaires
- **Prettier** + ESLint (config Next + prettier)
- **PWA** avant toute application native
- **Pas de backend** tant qu'aucun besoin fonctionnel ne le justifie

## Conséquences

- Application déployable en static/Node sans infrastructure serveur métier
- Progression et profils en stockage local (Phase 5)
- Extensibilité backend possible via ADR ultérieure
