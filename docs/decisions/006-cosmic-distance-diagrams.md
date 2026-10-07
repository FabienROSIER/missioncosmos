# ADR-006 — Voyage cosmique avec les modèles du jeu

Révision après retour utilisateur : les schémas SVG indépendants sont remplacés par une scène Babylon continue. Les planètes, la Lune, le Soleil et leurs textures réutilisent CelestialBodyEntity et les matériaux du jeu ; les orbites et leur horloge viennent de solarSystem.ts. Les galaxies réutilisent createGalaxySpecimen et createMilkyWayGlow de M11/M12, avec une atténuation des points des petits spécimens et une bordure douce du halo propre à M13. Le rendu des missions existantes conserve ses paramètres.

Les repères sont des référentiels imbriqués : les astres du système solaire diminuent ensemble, puis les étoiles du voisinage, puis la Voie lactée et Andromède. Les couches entrantes apparaissent avant la disparition des précédentes. Interpolation logarithmique des facteurs de taille, centrage progressif et caméra à limites explicites. Le trajet entre deux repères est animé, y compris en exploration manuelle. Les sauts d’échelle sont artistiquement comprimés : ce n’est pas une simulation métrique ni une simulation cosmologique.

Le dernier champ contient 48 petits spécimens espacés en profondeur (24 en qualité basse ou zone de jeu étroite), avec 350/180 points chacun. Les shaders et géométries proviennent du jeu. Fond AST-021 et modèles existants : aucun nouvel asset externe ni nouvelle dépendance.

La règle numérique est remplacée par trois messages lumineux, mélangés après hydratation. Même vitesse et même durée d’observation, sources fictives à des distances différentes : l’enfant détermine si leur lumière a atteint la Terre au moment de l’arrêt. Le dessin représente aussi des sources invisibles pour expliquer le trajet, ce n’est pas une prétendue observation de régions hors de notre horizon. Le modèle ne simule ni l’expansion ni l’évolution future de l’horizon.

Les deux vrais défis réutilisent la célébration commune ; le voyage automatique reste une découverte sans faux succès. Réduction des animations respectée. Quiz, badge et progression communs conservés.

_Choix final utilisateur : une seule découverte des échelles au début, sous forme de voyage manuel. Sélecteur et boutons Plus près/Plus loin, transitions animées sans avance automatique. Atteindre le dernier repère ouvre le premier défi directement. Exploration libre finale conservée._

_Repère lunaire : Terre et Lune seules, séparation visuelle augmentée et cadrage sur leur milieu. Soleil révélé pendant la transition vers le repère solaire ; autres planètes révélées pendant la transition vers la vue du Système solaire. Ces apparitions empêchent les rayons et orbites de la maquette lisible de donner l’impression d’un voisinage lunaire rempli de planètes. L’espacement reste comprimé, sans prétendre reproduire les distances physiques._
