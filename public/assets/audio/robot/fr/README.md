# Déposer les voix françaises du robot

**47 fichiers essentiels et 44 quiz facultatifs. Chaque texte fait au maximum 300 caractères pour Chatterrer.** L'ancienne liste de 754 MP3 est remplacée. Le lot de quiz est dans [cette liste séparée](<D:/Programmation/Mission Cosmos/docs/audio/robot/quizz-facultatifs.fr.md>) ou [ce CSV](<D:/Programmation/Mission Cosmos/docs/audio/robot/quizz-facultatifs.fr.csv>) ; tu peux en produire tout ou partie, ou aucun.

1. Ouvrir [les textes à générer](<D:/Programmation/Mission Cosmos/docs/audio/robot/textes-a-generer.fr.md>) ou [le CSV](<D:/Programmation/Mission Cosmos/docs/audio/robot/textes-a-generer.fr.csv>).
2. Copier seulement le bloc **Texte à générer** dans Chatterrer, avec la même voix française pour tous les fichiers.
3. Exporter un véritable MP3 et le déposer sous le nom exact, dans le sous-dossier indiqué. Un texte correspond à un seul MP3, sans parties supplémentaires.

Exemple :

```text
mission-01/mission-01.reperes.mp3
```

Les dossiers `mission-01` à `mission-13`, `mission-constellations` et `common` sont prêts. Aucun enregistrement de glossaire n'est demandé. Les fichiers `.gitkeep` conservent les dossiers vides ; ne pas les renommer en MP3.

Pour les quiz, les sous-dossiers `quiz/` des missions concernées sont prêts. Exemple : `mission-01/quiz/mission-01.quiz.q1-shape.mp3`. Un fichier contient la question et ses choix, sans bonne réponse ni correction. Les choix sont lus sans lettre ni numéro, indépendamment de leur ordre affiché.

Choisir une voix calme, claire et encourageante, sans musique, bruitages ou introduction du service. Écouter chaque fichier pour vérifier sa prononciation. Les espaces et la ponctuation sont déjà comptés dans la liste. Ne pas inclure les titres ou noms de fichiers dans le texte envoyé à Chatterrer.

Ne pas déposer dans `out/`, qui est reconstruit à l'export, ni dans le dossier des musiques. Les anciens noms comportant des IDs d'étapes ou `part-01` sont remplacés par les noms de la liste actuelle. Aucun MP3 existant n'est supprimé par le générateur.

Les voix restent à connecter au jeu selon [la feuille de route](<D:/Programmation/Mission Cosmos/Mission_Cosmos_Feuille_de_route_voix_robot.md>).
