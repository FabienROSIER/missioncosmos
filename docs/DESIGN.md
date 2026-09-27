# Direction artistique — Mission Cosmos

## Intention

Espace **lisible et accueillant** : aventure spatiale moderne, colorée, jamais criarde ni bébé. Ton : curiosité, calme, clarté — pas arcade ultra-flashy.

## Palette

### Principale (ambiance)

| Token | Hex | Usage |
|---|---|---|
| `--color-space-950` | `#070B16` | Fond profond |
| `--color-space-900` | `#0B1220` | Fond app |
| `--color-space-800` | `#152238` | Surfaces |
| `--color-space-700` | `#1E3352` | Surfaces élevées / hover |
| `--color-star` | `#F5F7FB` | Texte principal |
| `--color-star-muted` | `#B7C0D4` | Texte secondaire |
| `--color-nebula` | `#3DB8C5` | Accent primaire (télescope / UI) |
| `--color-nebula-soft` | `#7ED6DF` | Accent clair |
| `--color-solar` | `#F4C95F` | CTA / récompenses / focus chaleureux |

### Fonctionnelle

| Token | Hex | Usage |
|---|---|---|
| `--color-success` | `#5FCF8A` | Réussite |
| `--color-warning` | `#F0A202` | Attention douce |
| `--color-danger` | `#E85D5D` | Erreur (jamais punitive) |
| `--color-info` | `#5BA0E0` | Indice / info |
| `--color-focus` | `#7ED6DF` | Anneau focus clavier |

Contraste texte principal / fond : élevé (cible WCAG AA+ sur UI critique).

## Typographie

| Rôle | Fonte | Usage |
|---|---|---|
| Marque / titres | **Space Grotesk** | Logo-texte, H1–H2 |
| Corps / UI | **Nunito** | Phrases enfants, boutons, labels |

Tailles fluides (`clamp`). Corps min ~16px mobile. Interligne confortable (1.4–1.5).

## Surfaces & rythme

- Rayons : `--radius-sm` 8px · `--radius-md` 14px · `--radius-lg` 22px · `--radius-pill` 999px
- Ombres légères (pas de multi-couches lourdes) : halo doux spatial
- Espacements base 4px (`--space-1` … `--space-8`)
- Zones tactiles min **48×48 px**

## Boutons (définition visuelle — composants en 2.2)

- **Primary** : fond `--color-solar`, texte sombre, pill
- **Secondary** : bordure `--color-nebula`, fond transparent / space-800
- États : hover (éclaircir), pressed (légère scale 0.98), focus-visible (anneau), disabled (opacité 0.45), success (fond success)

## Motion

- Durées : `--motion-fast` 120ms · `--motion-base` 220ms · `--motion-slow` 400ms
- Easing : `cubic-bezier(0.22, 1, 0.36, 1)`
- Respecter `prefers-reduced-motion: reduce` (désactiver mouvements non essentiels)

## ASSET GATE — identité (décisions 2026-09-26)

| Besoin | Décision |
|---|---|
| Logo graphique immédiat | **Non** — wordmark typographique « Mission Cosmos » suffit pour les fondations |
| Favicon / icône PWA | **Utile bientôt** — pas bloquant pour 2.1 ; brief ci-dessous quand tu veux générer |

### Brief favicon / icône (quand demandé)

```text
ID : AST-002
Nom : Icône Mission Cosmos
Utilisation : favicon navigateur + PWA
Type : 2D
Format : SVG + PNG 512 / 192 / 180
Fond : opaque ou adaptatif (pas semi-transparent seul)
Style : spatiale, lisible en 32px, 1 symbole simple (astre / orbite), pas de texte long
Variantes : icône app, favicon mono
Chemin : public/assets/icons/
```

## UX type jeu natif

- **Pas de scroll document** : `html`/`body` en `100dvh` + `overflow: hidden`.
- Scroll interne uniquement via `ScrollRegion` (ex. liste de missions).
- Viewport `userScalable: false` pour éviter le conflit pinch navigateur / gestes 3D.
- Safe areas iOS respectées.
- **Orientation** (décision actuelle) :
  - Menus : **portrait prioritaire** (usage enfant, une main) ; paysage supporté en layout densifié.
  - Missions 3D : **les deux** ; en paysage le guide passe en panneau latéral pour maximiser la scène.
  - Pas de lock d’orientation forcé pour l’instant (à revoir mission par mission en Phase 14 / stores).
