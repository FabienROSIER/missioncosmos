# Mission 08 — Les étoiles (notes pédagogiques)

## Objectifs

- Reconnaître le **Soleil comme une étoile**.
- Comparer des **tailles** et des **couleurs / températures** de façon simplifiée.
- Distinguer **taille réelle** et **taille apparente**.

## Catalogue utilisé (arrondis)

| Étoile              | Rayon (× Soleil) | T° surface (K) | Couleur pédagogique |
| ------------------- | ---------------- | -------------- | ------------------- |
| Proxima du Centaure | ≈ 0,15           | ≈ 3000         | rouge-orangé        |
| Soleil              | 1                | ≈ 5800         | jaune-blanc         |
| Sirius A            | ≈ 1,7            | ≈ 9900         | blanc-bleuté        |
| Bételgeuse          | ≈ 700 (estimé)   | ≈ 3500         | rouge               |

Bételgeuse est une **géante rouge variable** : le rayon exact change selon les mesures et les modèles. L’app affiche un **ordre de grandeur** et le signale à l’écran.

## Échelles de la maquette

- **Comparaison de tailles** : échelle **compressée (log)** pour garder Proxima, Soleil et Bételgeuse visibles ensemble. Ce n’est **pas** une échelle linéaire.
- **Couleurs** : jetons de même taille visuelle pour isoler la lecture couleur / température.
- **Taille apparente** : distances **pédagogiques** (pas des années-lumière exactes). Formule UI : `θ ∝ rayon / distance`.
- **Défi photo** : même cadre pour chaque étoile ; le joueur déplace le télescope sur un rail pédagogique.

## Défi « Photographe d’étoiles »

Avant les photographies, deux étapes libres se succèdent : tailles, puis couleurs.
Elles permettent de toucher autant d’étoiles que souhaité, sans nombre minimum de clics.
Les étoiles restent cliquables et le bouton de continuation est toujours visible,
même quand la consigne est repliée. Après les couleurs, le bouton ouvre directement
le défi photo : le réglage de distance et la taille apparente y sont découverts.
Les clics et les mouvements de caméra ne changent pas d’étape.

Une seule mécanique répétée trois fois :

1. cadrer Proxima ;
2. cadrer le Soleil ;
3. cadrer Bételgeuse.

Le joueur rapproche ou éloigne le télescope jusqu’à ce que le disque remplisse la mire, puis prend la photo. Les indices expliquent directement la correction : « déborde → éloigne » ou « trop petite → rapproche ».

Un PiP synchronisé montre la scène de profil : l’étoile reste à gauche et le télescope glisse sur un rail. Il rend concret le changement de distance qui serait sinon seulement visible par le grossissement dans la mire.

Enjeu ludique : compléter un album `0/3`, avec flash et validation de chaque photo, puis activer l’observatoire. Pas de chronomètre ni de pénalité.

## Frontière avec la Mission 09

Ici : introduction couleur ↔ température.  
Mission 09 : lumière, spectre simplifié, association plus fine.

## Sources (ordre de grandeur)

- NASA / ESA fiches grand public (Soleil, Sirius, Proxima).
- Rayon de Bételgeuse : littérature observationnelle récente (valeur variable) — traité comme estimation dans l’UI.
