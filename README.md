# Mission Cosmos

Application éducative interactive d’astronomie (français, 6–12 ans).

## Prérequis

- Node.js LTS (20+)
- npm
- Git

## Installation

```bash
npm install
copy .env.example .env.local
```

## Lancement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Rôle |
|---|---|
| `npm run dev` | Développement |
| `npm run build` | Build production |
| `npm run start` | Servir le build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |
| `npm run test` | Vitest |
| `npm run format` | Prettier |

## Documentation

| Fichier | Contenu |
|---|---|
| `TODO_MISSION_COSMOS.md` | Roadmap / pilotage |
| `docs/ARCHITECTURE.md` | Architecture et arborescence |
| `docs/ASSETS.md` | Inventaire assets / licences |
| `docs/CONTENT_GUIDE.md` | Règles pédagogiques |
| `docs/decisions/` | ADR |
| `.cursor/rules/` | Règles Cursor |

## Stack

Next.js · React · TypeScript · Babylon.js · PWA prévue · pas de backend initial.
