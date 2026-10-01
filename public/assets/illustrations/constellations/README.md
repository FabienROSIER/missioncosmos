# Illustrations de constellations

Cinq illustrations à fond transparent, générées avec l'outil intégré image_gen (skill imagegen), plus une variante du Cygne adaptée à la mission.
Les fichiers sont des illustrations artistiques. La mission `mission-constellations` utilise ces superpositions sur des positions stellaires issues du catalogue de l'IAU.

| Fichier            | Sujet                                                                        |
| ------------------ | ---------------------------------------------------------------------------- |
| cassiopeia.png     | Reine assise sur son trône                                                   |
| ursa-major.png     | Grande Ourse céleste                                                         |
| cygnus.png         | Cygne en vol                                                                 |
| cygnus-aligned.png | Variante à cou droit utilisée par la mission et son film ; original conservé |
| orion.png          | Orion, chasseur                                                              |
| aquila.png         | Aigle en vol (bonus)                                                         |

Afficher à une opacité initiale de 0,30 à ajuster, avec les vraies étoiles et les traits rendus devant. Le fond transparent des PNG permet de régler l'opacité au rendu sans modifier les originaux.

Voir [la conception de mission](../../../../docs/pedagogy/mission-constellations.md).

## Versions calées sur les étoiles

La mission utilise désormais `cassiopeia-registered.png`, `ursa-major-upright.png` et `aquila-registered.png`, générées avec image_gen sur la base des tracés astronomiques et de poses calées. Les versions originales ci-dessus et la première reprise `ursa-major-registered.png` sont conservées. Le Cygne et Orion restent ceux validés par l’utilisateur.

Grande Ourse : queue haute à gauche et tête basse à droite, figure agrandie avec marges, tracé principal à sept étoiles complété par des branches plus fines pour la tête et les pattes. Les [prompts de cette nouvelle pose](../../../../docs/pedagogy/grande-ourse-illustration-prompts.md) sont conservés.

Le rendu ajuste les repères peints aux positions stellaires dans le même SVG carré que les étoiles. Un ajustement continu évite les cassures entre les repères ; les découpes se recouvrent légèrement pour éviter les raccords d’anticrénelage sur petit écran. Les positions des étoiles ne sont pas modifiées pour suivre les dessins.

Les [prompts complets de reprise](../../../../docs/pedagogy/constellation-illustration-prompts.md) sont conservés. Validation visuelle dans la mission : 1365×900, 390×844, 844×390 et 768×1024.

## Prompts de génération

Chaque image utilise le prompt commun suivi de son sujet. Les prompts sont conservés en anglais pour reproduire les assets.

### Prompt commun

Use case: illustration-story. Create ONE production PNG illustration overlay for Mission Cosmos astronomy game ages 6–12. Actual transparent alpha background, no backdrop. Style: a cohesive refined celestial storybook / vintage star atlas illustration, soft pearl ivory and very pale turquoise translucent-looking watercolor washes, restrained warm gold details, delicate readable silver-cyan outlines, gentle shaded feather/fur/fabric detail. Luminous but NO broad glow or solid dark shadow. All contours visible over navy #070B16. Center whole subject with 10% transparent padding, roughly square canvas. This is a symbolic mythological illustration to overlay a separately rendered real constellation, NOT an astronomical star chart. Absolutely NO drawn stars, no dots, no constellation connector lines, no text, no labels, no borders, no ground, no checkerboard painted into image, no decorative starfield. Keep interior quiet so independently rendered bright stars remain legible. Silhouette must be readable at 250px. Complete subject uncut. Subject:

### cygnus

One elegant white swan in flight, dorsal view from slightly above, wings spread horizontally left and right, feathery tail at TOP center, long graceful extended neck pointing DOWN and slightly left, small head at lower center. Pose fits a Northern Cross: Deneb at the tail, Sadr in middle chest at wing intersection, Albireo at head. Wing shape long and airy. Swan not eagle; long recognizable neck.

### ursa-major

One friendly majestic great she-bear, full-body SIDE PROFILE facing LEFT, four legs visible below, round ears, large torso across left-middle of frame, an intentionally unusually LONG graceful raised tail curving from rump on right toward upper right. Traditional celestial bear: dipper bowl sits over rump/torso, dipper handle follows the long tail. Clearly a bear, not a wolf or fox. Gentle natural anatomy except mythological long tail.

### cassiopeia

One regal seated queen Cassiopeia in side/three-quarter view facing LEFT, seated on a simple elegant high-backed throne. Small crown, composed gentle expression, flowing pale robe, one arm gracefully raised toward upper left. Silhouette of queen and throne broad enough to contain five-star W across lap and torso; do not draw W or stars. Recognizable seated queen, not standing princess. No oversized jewelry.

### orion

One kind heroic Orion hunter, full body front three-quarter view, standing with legs apart, left arm (image left) raised holding a simple wooden club pointing upward, right arm (image right) extended holding a curved shield. Simple short ancient tunic, belt prominently diagonal slightly upward toward image right for the three belt stars to overlay later; shoulders wide and two feet well separated. Friendly nonviolent classical sky atlas hunter, no threat, no blood, no modern armor.

### aquila

One majestic golden eagle in flight, viewed from above at slight angle, wings fully spread diagonally upper left to lower right, compact body centered, short hooked beak facing LEFT and slightly up, fan-shaped tail extending toward lower right. Strong broad feathered wings, short neck, distinct from swan. Wing/body junction leaves a clear landmark for Altair near upper middle of body. Natural recognizable eagle, no aggressive expression.

### Retouche de la Grande Ourse

Remove ALL gold jewelry, gold cords, stars, medallions, embroidered star symbols and decorations entirely from the bear and its tail. Replace those areas with continuous natural ivory/pale turquoise fur matching surrounding fur. Keep the bear's pose, friendly face, raised long tail, four legs, illustration style and transparent background unchanged. NO stars, NO dots, NO connector lines anywhere. Full uncut subject.

### Retouche du Cygne pour la mission

Edit the swan pose for an astronomy-game constellation overlay. Keep the same refined ivory / pale turquoise / fine gold watercolor feather style and transparent background. Full swan, no stars, dots, lines or labels. Make its long neck extend STRAIGHT DOWN the exact vertical centerline, with its head at x=50%, y=84% of the square canvas, and tail center at x=50%, y=17%. Very important: attach both wings to the chest at x=50%, y=35%, spread wings to left and right around y=37%, tips approximately x=20% and x=80%. Thus the whole bird maps to a Northern Cross, with a SHORT tail-to-chest section and a LONG chest-to-head neck section. The head should face left in profile but stay centered horizontally, not drift to the left. Wing tips may curve naturally. Preserve visible swan anatomy, gentle elegant mood, no eagle or jewelry. Leave generous transparent padding and no cropping.
