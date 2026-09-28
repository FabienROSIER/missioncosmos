# Soleil — photosphère illustrative

Création ImageGen pour Mission Cosmos, 28 septembre 2026. Carte équirectangulaire 2:1, **1774 × 887 pixels natifs**, WebP qualité 88, 477 822 octets. Même image dans `sun.glb` (578 052 octets) et `sun.webp`. Aucun agrandissement ; géométrie et UV inchangés.

Direction : photosphère à granulation fine, quelques petits groupes bipolaires de taches avec ombre et pénombre, teinte crème dorée, luminosité homogène, sans halo ni flammes dessinés dans la carte. La couleur et les dimensions des détails sont illustratives ; aucune prétention à une observation datée ou à une cartographie scientifique. Référence physique : [NASA SDO, HMI Intensity](https://svs.gsfc.nasa.gov/3988). L’image NASA n’a pas été copiée dans cette texture.

Prompt de génération : carte plate 2:1 de la photosphère, granules fins irréguliers séparés par des interstices ambrés, petits groupes de taches aux latitudes ±35°, moins de 1 % de couverture ; base crème dorée, pas de lave orange/rouge, pas de sphère ni disque, pas de fond noir, pas de halo, pas de gradient d’éclairage ; raccord horizontal et contraste réduit aux pôles demandés. Les raccords générés ne sont pas garantis pixel à pixel.

Le WebP est la source locale conservée pour le réassemblage : `node scripts/refresh-planet-textures.mjs --sun-only`. Cette commande n’appelle pas ImageGen et ne retranscode pas l’image. Le matériau applicatif utilise une émission blanche à 1,15 pour préserver la teinte et les détails de la carte.
