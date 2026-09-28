# ADR-003 — Export statique et GitHub Pages (PWA)

Date : 2026-09-28  
Statut : accepté

## Contexte

Mission Cosmos doit être installable comme PWA Android via une URL HTTPS, sans VPS, Vercel ni APK. Le dépôt GitHub est `FabienROSIER/missioncosmos`.

## Décision

- `output: 'export'` + `trailingSlash: true` pour un site 100 % statique.
- `basePath` / `assetPrefix` = `/missioncosmos` uniquement lorsque `GITHUB_PAGES=true` ou `NEXT_PUBLIC_BASE_PATH` est défini (workflow CI / `npm run build:pages`).
- `next/image` : `unoptimized` + loader custom `src/lib/imageLoader.ts` qui applique `withBasePath`.
- Chemins assets logiques restent `/assets/...` ; le préfixe Pages est ajouté au moment du chargement (Babylon, audio, CSS, Image).
- PWA : `app/manifest.ts` + `public/sw.js` + enregistrement hors localhost.
- Déploiement : GitHub Actions → artifact Pages (`actions/deploy-pages`).

## Conséquences

- `next start` n’est plus adapté : utiliser `npm run preview` / `preview:pages`.
- Les routes dynamiques de missions nécessitent `generateStaticParams`.
- Une URL GitHub Pages expose publiquement le site (même si le dépôt reste privé, sous conditions de plan GitHub). Voir `docs/ASSETS.md` pour les freins licence avant publication.

## Alternatives rejetées

- Hébergement Node (`next start`) : hors contrainte « Pages only ».
- Précache de tout le pack 3D/audio : trop lourd, hors-ligne non garanti.
