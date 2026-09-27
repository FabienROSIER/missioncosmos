# Mercure — texture artistique v2

Texture originale générée avec l’outil intégré ImageGen pour Mission Cosmos, cohérente avec les textures du pack. Interprétation artistique inspirée de Mercure, non géolocalisée et non issue de données de sonde.

- `mercury.png` : sortie originale, 1774 × 887, équirectangulaire 2:1, RGB.
- `mercury.webp` : version mobile, même résolution native, qualité 90. Aucun agrandissement artificiel.
- `mercury.glb` : modèle du pack avec cette texture embarquée ; géométrie et UV inchangés.
- `preview.png` et `preview-seam.png` : vues Babylon.js du GLB texturé.
- `prompt.txt` : prompt exact de génération ; outil ImageGen intégré, sans API/CLI.

Pour adopter cette version, remplacer `public/assets/celestial-bodies/mercury/mercury.glb` et le WebP voisin par les fichiers de ce dossier. Remplacer seulement le WebP externe ne modifie pas la texture déjà embarquée dans l’ancien GLB. Le ZIP précédent et les fichiers sources du projet n’ont pas été modifiés. Son manifest et ses empreintes concernent l’ancienne texture ; les mettre à jour en cas de remplacement.

La texture est conçue pour une sphère. Des détails de relief sont suggérés dans la couleur ; ce n’est pas une mesure d’albédo ni une normal map. Le caractère parfaitement périodique des pixels de bord n’est pas garanti par la génération.
