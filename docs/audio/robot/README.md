# Voix du robot — production optimisée

Le catalogue précédent était trop volumineux. Il est remplacé par **47 MP3 essentiels pour les 14 missions**, dont **4 phrases communes réutilisables**, et un lot séparé de **44 MP3 de quiz entièrement facultatifs**. Chaque texte tient dans une seule génération Chatterrer : **300 caractères maximum**, espaces et ponctuation inclus. Le plus long fait 248 caractères pour le lot essentiel et 281 pour les quiz.

## Générer et déposer les fichiers

1. Ouvrir [la liste des textes](<D:/Programmation/Mission Cosmos/docs/audio/robot/textes-a-generer.fr.md>) ou [le CSV](<D:/Programmation/Mission Cosmos/docs/audio/robot/textes-a-generer.fr.csv>).
2. Copier uniquement le bloc **Texte à générer** dans Chatterrer. Garder la même voix pour tout le jeu.
3. Exporter en MP3 et utiliser le nom et le sous-dossier indiqués, sous `public/assets/audio/robot/fr/`.

Un texte = une génération = un MP3. Exemple : `mission-01/mission-01.reperes.mp3`. Les textes longs ne sont plus découpés en plusieurs prises. Les quiz se trouvent dans [leur liste facultative](quizz-facultatifs.fr.md) et [leur CSV](quizz-facultatifs.fr.csv). Tu peux produire seulement les 47 voix essentielles, ajouter quelques quiz, ou produire les deux lots : 91 fichiers au maximum.

## Ce qui est retenu

Les consignes des activités, les explications scientifiques essentielles et la sécurité pour observer le Soleil. Les mêmes consignes peuvent servir à plusieurs étapes ; le texte à l'écran indique l'objectif actuel. Les phrases communes couvrent l'entrée des quiz, une nouvelle tentative, une réussite et les simplifications des maquettes.

Le lot facultatif comporte un enregistrement par question avec ses choix, sans réponse correcte ni commentaire de correction. Les choix sont nommés sans lettre ni numéro ; leur ordre oral peut différer de l'ordre affiché. Ne pas associer les positions de l'énumération orale aux boutons ni surligner les choix dans cet ordre. Les réussites et erreurs réutilisent les fichiers communs. Si le fichier de la question est absent, garder le quiz écrit et jouable. Sans les quiz facultatifs, les enfants qui ne lisent pas encore peuvent avoir besoin d'un adulte.

Pas d'enregistrement spécifique des fiches de planètes, badges, variantes aléatoires, définitions du glossaire ou chapitres de film. Le bonus facultatif de l'Aigle reste sans voix dédiée.

## Fichiers et entretien

- `dialogues-essentiels.fr.json` : unique source éditoriale des textes à générer et des associations d'étapes.
- `textes-a-generer.fr.md` et `.csv` : listes de production générées ; le CSV utilise UTF-8 et le point-virgule.
- `manifest.fr.json` : correspondances des MP3, contextes, étapes, textes écran de référence et empreintes des sources. Schéma version 2, catalogue de préparation non importé par le jeu.
- `quizz-facultatifs.fr.md` et `.csv`, `manifest-quizz-facultatifs.fr.json` : production et correspondances du lot facultatif, générées directement depuis les questions et les choix actuels dans `src/content/quizzes/`.
- `scripts/generate-robot-voice-inventory.mjs` : génère les deux lots, vérifie les étapes, les identifiants et les 300 caractères. Le budget de 50 fichiers maximum concerne seulement le lot essentiel.

Après une modification des dialogues, lancer depuis la racine :

```powershell
node scripts/generate-robot-voice-inventory.mjs
```

Le script ne modifie ni les textes du jeu ni les MP3 déposés. Si le texte oral change, refaire seulement le MP3 concerné. Si une étape change, relire le dialogue lié : la reformulation orale ne se met pas à jour automatiquement. Conserver les IDs existants. Les anciens fichiers `speech-overrides.fr.json` et `scene-dialogues.fr.json` ne sont plus utilisés et ont été retirés.

## Intégration runtime

Les 47 voix essentielles sont branchées : catalogue `src/content/audio/robotVoiceCatalog.ts`, lecteur `robotVoicePlayer`, réglage **Voix du robot** dans les paramètres, réécoute **Écouter** en mission.

Règles en jeu : consigne à la première étape pertinente (pas de répétition auto ensuite), sécurité éclipses prioritaire sur `m04-observe`, phrases communes quiz / erreur / réussite, maquette à l’ouverture de « La maquette », silence pendant les films, ducking musique, jeu jouable sans voix. Les quiz facultatifs restent optionnels et non branchés.

Régénérer le catalogue runtime après édition de `dialogues-essentiels.fr.json` :

```powershell
node scripts/generate-robot-voice-inventory.mjs
node scripts/gen-robot-voice-catalog.mjs
```
