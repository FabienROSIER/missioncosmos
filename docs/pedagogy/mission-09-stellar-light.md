# Mission 09 — La lumière des étoiles (notes pédagogiques)

## Objectifs

- Relier **couleur** et **température de surface**.
- Lire un **spectre simplifié** (maquette de corps noir) et repérer le **pic**.
- Comprendre qu’une étoile émet **plusieurs couleurs**, mais qu’une zone **domine**.

## Valeurs utilisées (arrondis)

| Étoile              | T° surface (K) | Bande pédagogique | Couleur d’affichage |
| ------------------- | -------------- | ----------------- | ------------------- |
| Proxima du Centaure | ≈ 3000         | froide            | rouge-orangé        |
| Soleil              | ≈ 5800         | moyenne           | jaune-blanc         |
| Sirius A            | ≈ 9900         | chaude            | blanc-bleuté        |

Plage du laboratoire : **2500–12 000 K**. Tolérance du défi : **±450 K** (pas de Kelvin exact exigé).

## Modèle scientifique simplifié

- **Couleur** : approximation température → RGB (corps noir pédagogique), pas une simulation radiative exacte.
- **Pic** : loi de Wien λ_max ≈ 2,897×10⁶ / T (nm si T en K).
- **Courbe** : formule de Planck relative sur 380–750 nm, normalisée au maximum.
- **Raies d’absorption** : **volontairement omises**. L’UI le signale.

Message clé : toutes les étoiles « envoient » plusieurs couleurs ; la zone dominante se déplace avec la température.

## Scène « Laboratoire du prisme »

Étoile émissive + faisceau blanc + prisme stylisé + éventail spectral. Un panneau SVG montre bande arc-en-ciel, courbe d’intensité et repère du pic. Le curseur unique met à jour couleur + spectre.

Modes de séquence : intro → couleur → spectre → labo libre → comparaison → défi → exploration.

## Défi « Commandes du prisme »

Une seule mécanique, trois fois :

1. Proxima (froide) ;
2. Soleil (moyenne) ;
3. Sirius A (chaude).

Carte cible (couleur + silhouette de spectre + bande), indices « refroidis » / « chauffe », jauge `0/3`, puis activation lumineuse du prisme. Pas de chronomètre ni de pénalité.

## Frontière avec la Mission 08

Mission 08 : Soleil = étoile ; tailles ; intro couleur ↔ température.  
Mission 09 : lumière, spectre, association fine via le laboratoire.

## Sources (ordre de grandeur)

- NASA / ESA fiches grand public (Soleil, Sirius, Proxima).
- Loi de Wien / corps noir : manuels introductifs d’astronomie (simplifié pour 6–12 ans).
