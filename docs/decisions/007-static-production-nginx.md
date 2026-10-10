# ADR-007 — Publication statique sur missioncosmos.fr

Date : 2026-10-10  
Statut : accepté

## Contexte

Mission Cosmos doit être public, gratuit, sans compte et sans serveur applicatif. Le code reste sur le PC de développement. Le VPS ne reçoit que des fichiers statiques.

## Décision

- Le site public est à la racine `https://missioncosmos.fr` (`basePath` vide).
- `npm run build` / `build-production.ps1` produisent `out/`.
- Nginx sert le contenu de `out/` dans `/home/ubuntu/missioncosmos/build/` (pas de dossier `out/` imbriqué).
- Pas de `next start`, Node permanent, Django, base de données, ni déploiement automatique.
- `auto-build.ps1` ne fait que régénérer `out/` tant que la fenêtre PowerShell est ouverte.
- `build:pages` (GitHub Pages, basePath `/missioncosmos`) reste disponible et distinct.
- Chaque export de production reçoit un `NEXT_PUBLIC_BUILD_ID` horodaté (`yyyyMMdd-HHmmss`), recopié dans `out/sw.js`.
- Le cache runtime du Service Worker s’appelle `mc-runtime-<version>` et les anciens `mc-runtime-*` sont supprimés à l’activation. Les GLB et audio ne sont pas précachés.

## Conséquences

- La copie vers le VPS se fait avec `deploy-production.ps1` (ssh/scp Windows, puis rsync sur le VPS). Seuls `.deploy-temp` et `build/` sous `/home/ubuntu/missioncosmos` sont touchés. Nginx n’est pas rechargé.
- L’image Open Graph 1200×630 (AST-004) n’existe pas encore : le partage utilise temporairement `icon-512.png`.
