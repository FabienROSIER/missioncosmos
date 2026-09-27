# Architecture — Mission Cosmos

## Objectif

Application web éducative d’astronomie (6–12 ans), mobile-first, sans backend initial. Progression et profils en stockage local.

## Stack

| Couche | Choix |
|---|---|
| Framework | Next.js (App Router) + React + TypeScript strict |
| 3D | Babylon.js (`@babylonjs/core`), scènes lazy-loadées |
| Styles | CSS natif + variables (design system Phase 2) |
| Tests | Vitest |
| Distribution | PWA (Phase 14) avant natif |

Décision détaillée : [`decisions/001-stack-initiale.md`](./decisions/001-stack-initiale.md).

## Séparation des responsabilités

```text
UI React          → src/components, src/app
Logique métier    → src/features (progression, missions, rewards, settings)
Contenu pédagogique → src/content (textes, quiz, glossaire — pas de Babylon)
Moteur 3D         → src/3d (core, scenes, entities, …)
Stockage          → src/stores (+ IndexedDB plus tard)
Assets statiques  → public/assets
```

Règle : **ne pas coupler** les textes pédagogiques aux scènes Babylon. Les missions référencent une scène par id ; le contenu vit dans `src/content`.

## Arborescence `src/`

| Dossier | Rôle |
|---|---|
| `app/` | Routes Next.js (App Router) |
| `components/ui` | Primitives UI (Button, Modal, …) |
| `components/layout` | Chrome app (header, nav, shell) |
| `components/learning` | UI pédagogique (dialogue, quiz, glossaire) |
| `components/game` | UI liée aux interactions / défis |
| `features/*` | Logique de domaine par feature |
| `3d/core` | Engine, canvas React, cycle de vie |
| `3d/scenes` | Une scène (ou factory) par mission / lab |
| `3d/entities` | Corps célestes paramétriques |
| `3d/materials` | Matériaux / textures |
| `3d/effects` | Effets (étoiles, atmosphère, …) |
| `3d/controls` | Gestes caméra tactile/souris |
| `3d/utils` | Helpers 3D |
| `content/*` | Données missions / quiz / glossaire |
| `hooks/` | Hooks React transverses |
| `lib/` | Utilitaires non React |
| `stores/` | État client / persistance |
| `types/` | Types partagés |
| `styles/` | Tokens / CSS globaux hors `app/` |

## Imports

Alias unique (TypeScript + Vitest) :

| Alias | Cible |
|---|---|
| `@/*` | `./src/*` |

Exemples : `@/lib/logger`, `@/types`, `@/components/ui/ErrorState`.

Pas d'alias supplémentaires pour l'instant (évite la sur-ingénierie).

## Erreurs et logs

- `AppError` + `toUserMessage` → `src/lib/errors.ts`
- `logger` (détails en dev seulement) → `src/lib/logger.ts`
- UI enfant → `src/components/ui/ErrorState.tsx`
- Boundaries Next → `src/app/error.tsx`, `global-error.tsx`, `not-found.tsx`

## Principes

1. Simplicité avant abstraction.
2. Smartphone avant desktop.
3. Dispose Babylon à chaque changement de scène.
4. Pas de backend sans ADR validée.
5. Distinguer données scientifiques et paramètres de représentation visuelle.
