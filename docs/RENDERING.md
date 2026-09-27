# Rendu 3D — matériaux & qualité

## Qualité (`graphicsQuality.ts`)

| Niveau | Comportement |
|---|---|
| `auto` | Low si mobile / peu de cœurs / DPR élevé |
| `low` | StandardMaterial lite, pas d’atmosphère, MSAA 1, DPR plafonné |
| `high` | PBR possible, atmosphère, MSAA 4, sharpen léger |

Stockage : `localStorage` clé `mc:graphics-quality` (réglages UI).

## Matériaux

- **Planètes** : `applyPlanetaryMaterials` — low force Standard sans normal map ; high garde PBR soft si présent.
- **Atmosphère** : `createSimpleAtmosphere` — coquille alpha (high uniquement).
- **Soleil** : `applyEmissiveSunMaterial` — émissif, n’éclaire pas seul (DirectionalLight séparée).
- **Fond missions** : image `MISSION_STARFIELD_SRC` (ADR-002), pas procédural.

## Décision PBR vs Standard

Sur mobile / low : **Standard** prioritaire (coût).  
PBR conservé en high seulement s’il arrive déjà du GLB, avec metallic quasi nul.
