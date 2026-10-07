# Mission Cosmos — Feuille de route pour le système de dialogues, voix et réglage audio

## 1. Objectif

Mettre en place dans **Mission Cosmos** un système centralisé permettant au petit robot compagnon :

- d'afficher des textes courts à l'écran ;
- de lire une version orale adaptée aux enfants ;
- de différencier les consignes, explications, indices, réussites et erreurs ;
- de permettre à l'utilisateur d'activer ou désactiver la voix du robot depuis les réglages ;
- de permettre de rejouer la dernière phrase ;
- de rester entièrement jouable sans audio ;
- de préparer facilement l'ajout futur de nouvelles langues ou de fichiers audio préenregistrés.

Cette feuille de route doit être utilisée par Cursor comme **spécification de travail**.

**Mise à jour du 6 octobre 2026 :** les textes écran ont été simplifiés en tenant compte du responsive et de la lecture courte. Les versions orales peuvent expliquer les mots scientifiques, sans rallonger les bulles. Le dossier des MP3 et le catalogue de production sont maintenant préparés ; le lecteur de voix reste à intégrer. Les décisions propres au dépôt sont précisées en section 31. Les exemples génériques ci-dessous ne créent pas de nouveaux défis dans le jeu.

**Production optimisée pour Chatterrer : 47 MP3 au total, chacun limité à 300 caractères, espaces et ponctuation inclus.** Cette sélection remplace le précédent catalogue de 754 fichiers. Les contraintes de production de la section 31 priment sur les exemples génériques : un inventaire des textes du jeu n'est pas une liste de fichiers à enregistrer. Ne pas recréer un MP3 pour chaque question, choix, badge ou variante.

**Ajout demandé : 44 MP3 de quiz facultatifs**, dans une liste séparée. Un seul fichier par question inclut ses choix ; aucun fichier par choix ou correction. Les 47 voix essentielles restent indépendantes de ce lot, soit 91 fichiers si tout est produit. La limite de 300 caractères s'applique aux deux lots.

Cursor ne doit pas inventer une nouvelle architecture si le projet possède déjà un système équivalent. Il doit d'abord analyser le repo, identifier les conventions existantes, puis adapter cette spécification à la structure réelle du projet.

---

# 2. Mission à donner à Cursor

## Étape 1 — Auditer le repo avant toute modification

Avant d'écrire du code, analyser l'ensemble du projet et identifier :

1. le framework utilisé ;
2. le système de routing ;
3. le système de gestion d'état ;
4. l'existence éventuelle d'un système de traduction / i18n ;
5. l'emplacement actuel :
   - des textes pédagogiques ;
   - des dialogues du robot ;
   - des niveaux / missions ;
   - des réglages utilisateur ;
   - des composants UI ;
   - des assets audio ;
6. l'existence éventuelle :
   - d'un composant Robot ;
   - d'un composant Dialogue / SpeechBubble ;
   - d'un store de préférences ;
   - d'un LocalStorage ;
   - d'un système audio ;
   - d'un Text-To-Speech navigateur ;
7. les conventions actuelles de nommage des fichiers et dossiers.

## Résultat attendu de cet audit

Avant toute implémentation, Cursor doit me fournir un compte rendu sous cette forme :

```md
## Audit Mission Cosmos

### Architecture détectée

- Framework :
- Routing :
- State management :
- i18n :
- Persistance locale :
- Système audio existant :

### Fichiers concernés

- Robot :
- Dialogues :
- Missions :
- Réglages :
- Audio :
- Traductions :

### Recommandation

Architecture proposée pour intégrer les dialogues et la voix sans casser l'existant.

### Fichiers à créer

- ...

### Fichiers à modifier

- ...
```

Ne modifier aucun fichier avant d'avoir établi cette cartographie.

---

# 3. Principe fonctionnel

Le robot ne doit **pas simplement lire mot pour mot tout le texte affiché**.

Chaque message peut contenir :

- `text` : texte court affiché à l'écran ;
- `speech` : version plus naturelle destinée à la voix ;
- `type` : type de message ;
- `target` : élément de l'interface éventuellement mis en évidence ;
- `audio` : futur emplacement d'un fichier audio préenregistré ;
- `autoPlay` : lecture automatique ou non ;
- `skippable` : possibilité de passer rapidement le message.

Exemple conceptuel :

```ts
{
  id: "solar-system.mars.place",
  type: "instruction",
  text: "Place Mars sur son orbite.",
  speech: "À toi de jouer ! Attrape Mars et place-la sur son orbite autour du Soleil.",
  target: "mars",
  autoPlay: true,
  skippable: true
}
```

---

# 4. Types de messages à prévoir

Créer une structure capable de gérer au minimum :

```ts
type RobotMessageType =
  'intro' | 'instruction' | 'explanation' | 'hint' | 'success' | 'error' | 'transition' | 'outro';
```

## Rôle de chaque type

### `intro`

Présentation d'une mission ou d'un sujet.

### `instruction`

Indique clairement ce que l'enfant doit faire.

Le texte écran doit être très court.

### `explanation`

Explication pédagogique.

La version audio peut être plus naturelle que la version affichée.

### `hint`

Indice fourni après une erreur ou une période d'inactivité.

### `success`

Réaction positive après une bonne réponse.

Éviter les messages trop longs.

### `error`

Réaction à une mauvaise réponse.

Ne pas employer de formulation punitive.

Préférer une invitation à réessayer ou un indice.

### `transition`

Permet de passer d'une étape pédagogique à la suivante.

### `outro`

Conclusion d'une mission ou d'un niveau.

---

# 5. Règles éditoriales

Tous les textes devront respecter les règles suivantes.

## Texte affiché

Le texte affiché doit :

- être compris rapidement ;
- utiliser des phrases courtes ;
- éviter les paragraphes longs ;
- rester lisible par un enfant ;
- utiliser autant que possible une seule idée par message.

Exemple :

```text
Place Mars sur son orbite.
```

et non :

```text
Maintenant que tu as observé la position des différentes planètes, nous allons te demander de placer Mars sur la bonne orbite autour du Soleil.
```

## Texte oral

La version `speech` doit :

- être naturelle à l'oral ;
- reprendre exactement le même sens que `text` ;
- apporter des exemples et expliquer les mots scientifiques, sans charger le texte écran ;
- rester concise : une intervention courte, ou plusieurs clips séparés à des pauses naturelles ;
- éviter les formulations scolaires ou trop formelles ;
- conserver à l’écran toutes les actions, les choix et les indications de sécurité indispensables ;
- rendre les explications nécessaires également accessibles sans son, dans le texte, le glossaire ou une aide visible. Un complément oral ne doit pas rendre le quiz impossible sans audio.

Exemple :

```text
Text :
Place Mars sur son orbite.

Speech :
À toi de jouer ! Attrape Mars et place-la sur son orbite autour du Soleil.
```

---

# 6. Accessibilité

Règle obligatoire :

> Aucune information indispensable au jeu ne doit être disponible uniquement par la voix.

Le jeu doit être utilisable :

- sans haut-parleur ;
- avec le son coupé ;
- dans une salle de classe ;
- par un enfant malentendant ;
- sur un navigateur ne supportant pas la synthèse vocale.

Le texte et les indications visuelles restent donc la référence fonctionnelle.

---

# 7. Réglages audio

Ajouter dans les réglages du jeu une option claire :

```text
Voix du robot
[ Activée / Désactivée ]
```

Le réglage doit être persistant localement.

Valeur par défaut recommandée :

```ts
robotVoiceEnabled = true;
```

Cursor doit toutefois vérifier les conventions déjà utilisées par l'application avant de créer une nouvelle clé.

## Persistance

Utiliser en priorité le système de préférences existant.

S'il n'existe aucun système :

```text
localStorage
```

peut être utilisé.

Nom recommandé :

```text
mc:robot-voice-enabled
```

ou convention équivalente déjà présente dans le repo.

Ne jamais stocker de donnée personnelle.

---

# 8. Contrôles du joueur

Prévoir au minimum :

## Dans les réglages

- commutateur `Voix du robot` ;
- état activé / désactivé immédiatement appliqué.

## Dans l'interface du robot

Lorsque cela est pertinent :

- bouton `Réécouter` ;
- bouton permettant de passer un message si le dialogue bloque la progression.

Le bouton Réécouter doit relancer la dernière phrase audible du robot.

---

# 9. Comportement de la voix

Ordre de priorité recommandé pour la lecture :

```text
1. fichier audio préenregistré si disponible ;
2. synthèse vocale si activée et compatible ;
3. aucun son, tout en conservant le texte à l'écran.
```

L'architecture doit donc permettre une évolution future sans réécrire tous les dialogues.

Exemple :

```ts
{
  id: "solar-system.mars.place",
  text: "...",
  speech: "...",
  audio: null
}
```

Puis plus tard :

```ts
audio: '/assets/audio/robot/fr/mission-05/mission-05.order-mars.hint.mp3';
```

---

# 10. Organisation recommandée des textes

Cursor doit d'abord vérifier l'organisation réelle du repo.

Si aucun système n'existe, préférer une structure centralisée et indépendante du code des composants.

Exemple générique :

```text
src/
  content/
    robot/
      fr/
        common.ts
        solar-system.ts
        earth.ts
        moon.ts
        seasons.ts
        constellations.ts
```

ou, si le projet utilise JSON :

```text
src/
  content/
    robot/
      fr/
        common.json
        solar-system.json
        earth.json
        moon.json
        seasons.json
        constellations.json
```

Ne pas retenir cette structure si le repo possède déjà une organisation i18n cohérente.

---

# 11. Convention des identifiants

Chaque message doit avoir un identifiant stable.

Format recommandé :

```text
<module>.<section>.<action>
```

Exemples :

```text
common.welcome.intro
common.settings.voice
solar-system.intro.start
solar-system.sun.explanation
solar-system.mercury.place
solar-system.mercury.success
solar-system.mercury.error
solar-system.mercury.hint
solar-system.venus.place
earth.rotation.explanation
earth.revolution.explanation
seasons.intro.start
moon.phases.explanation
constellations.orion.hint
```

Les identifiants :

- ne doivent pas contenir de texte français ;
- ne doivent pas changer si le texte éditorial est modifié ;
- doivent être uniques ;
- doivent pouvoir servir plus tard pour les traductions et les fichiers audio.

---

# 12. Convention des fichiers audio

La convention retenue dans ce dépôt est :

```text
public/assets/audio/robot/fr/
  common/
  mission-01/
  ...
  mission-09/
  mission-10/
  mission-11/
  ...
  mission-14/
  glossary/
```

Nom de fichier : `<id-du-message>.mp3`. Un fichier contient une intervention essentielle de 300 caractères maximum, sans découpage en parties. Plusieurs étapes peuvent réutiliser le même fichier. Les associations aux IDs existants des étapes figurent dans le manifeste. Les fichiers restent en minuscules ASCII, sans espace ni accent.

Exemple réel : `mission-01/mission-01.reperes.mp3`.

Le catalogue `docs/audio/robot/manifest.fr.json` fournit la correspondance entre chaque message, son texte oral, ses clips et leur chemin. Appliquer `withBasePath` aux URLs au moment de la lecture, comme pour les musiques, afin de fonctionner sur GitHub Pages.

Ne pas saisir un chemin audio différent dans chaque composant. Les sous-dossiers linguistiques permettent ensuite d’ajouter d’autres langues.

---

# 13. Structure de données recommandée

Cursor doit adapter cette structure au langage réel du projet.

Exemple TypeScript :

```ts
export type RobotMessageType =
  'intro' | 'instruction' | 'explanation' | 'hint' | 'success' | 'error' | 'transition' | 'outro';

export interface RobotMessage {
  id: string;
  type: RobotMessageType;

  text: string;

  speech?: string;

  target?: string;

  audio?: string;

  autoPlay?: boolean;

  skippable?: boolean;
}
```

Comportement attendu :

```ts
const spokenText = message.speech ?? message.text;
```

Ainsi, il n'est pas nécessaire de créer un texte oral différent lorsqu'une reformulation n'apporte rien.

---

# 14. Ne pas dupliquer les textes dans les composants

À éviter :

```tsx
<Robot speech="Bravo ! Tu as trouvé Mars !" />
```

Préférer :

```tsx
<Robot messageId="solar-system.mars.success" />
```

ou :

```tsx
const message = getRobotMessage('solar-system.mars.success');
```

Les contenus éditoriaux doivent rester centralisés.

---

# 15. Mise en évidence visuelle

Le système doit permettre à un dialogue de cibler un élément de l'écran.

Exemple :

```ts
target: 'mars';
```

Pendant l'instruction :

```text
Place Mars sur son orbite.
```

l'objet correspondant peut :

- pulser légèrement ;
- recevoir un halo ;
- être indiqué par une flèche ;
- être mis en évidence.

Cette logique doit rester facultative.

Un dialogue ne doit pas dépendre obligatoirement d'un `target`.

---

# 16. Gestion des erreurs

Éviter les réactions comme :

```text
Faux.
Mauvaise réponse.
Erreur.
```

Préférer :

```text
Pas tout à fait. Essaie encore !
```

ou :

```text
Regarde bien sa couleur. Quelle planète appelle-t-on la planète rouge ?
```

Prévoir si nécessaire plusieurs variantes de messages afin d'éviter une impression trop répétitive.

Exemple :

```ts
successVariants?: string[];
errorVariants?: string[];
```

Seulement si cela reste simple et cohérent avec l'architecture actuelle.

Ne pas ajouter cette complexité si elle n'apporte rien au projet actuel.

---

# 17. Durée des interventions

Le robot ne doit pas parler après chaque clic.

Priorité aux moments suivants :

1. lancement d'une mission ;
2. nouvelle consigne ;
3. notion scientifique importante ;
4. erreur nécessitant un indice ;
5. réussite importante ;
6. transition vers une nouvelle étape ;
7. fin de mission.

Éviter les dialogues inutiles.

---

# 18. Gestion d'âge

Ne pas demander obligatoirement l'âge de l'enfant pour utiliser le jeu.

Le système doit fonctionner correctement pour toute la cible 6–12 ans.

La simplicité doit venir :

- des textes courts ;
- de la voix ;
- des animations ;
- des indications visuelles.

Une adaptation par tranche d'âge pourra être envisagée ultérieurement mais n'est pas requise pour cette première version.

---

# 19. Première mission de Cursor après l'audit

Après avoir analysé le repo, Cursor doit dresser **l'inventaire exhaustif de tous les textes actuellement présentés par le robot**.

Créer un tableau comme celui-ci :

| ID proposé                  | Emplacement actuel | Type        | Texte actuel | Texte écran proposé | Texte oral proposé | Fichier cible |
| --------------------------- | ------------------ | ----------- | ------------ | ------------------- | ------------------ | ------------- |
| `solar-system.intro.start`  | `...`              | intro       | `...`        | `...`               | `...`              | `...`         |
| `solar-system.mars.place`   | `...`              | instruction | `...`        | `...`               | `...`              | `...`         |
| `solar-system.mars.success` | `...`              | success     | `...`        | `...`               | `...`              | `...`         |

L'audit des textes ne doit pas conduire à tout enregistrer. La sélection de production est disponible dans `docs/audio/robot/textes-a-generer.fr.md`, avec un export CSV et un manifeste JSON. Elle ne contient que les 47 interventions retenues. Repartir de ces fichiers et des sources actuelles, pas des formulations antérieures à l’audit.

Cursor doit rechercher :

- tous les textes codés directement dans les composants ;
- tous les textes présents dans les données des niveaux ;
- toutes les chaînes déjà utilisées par le robot ;
- toutes les instructions ;
- toutes les explications ;
- tous les messages d'erreur ;
- tous les messages de réussite ;
- tous les écrans d'introduction ou de fin.

---

# 20. Ce que Cursor doit me demander de produire

À partir de l'inventaire précédent, Cursor doit me fournir une liste **actionnable** des contenus à créer.

Pour les voix françaises, la liste actuelle de 47 MP3 est la liste complète à produire. Chaque texte doit tenir dans une seule génération Chatterrer de 300 caractères maximum. Ne pas transformer le format d'exemple ci-dessous en obligation de produire une voix pour chaque texte affiché.

Format obligatoire :

```md
# Textes à produire

## Fichier : src/.../solar-system.ts

### 1. solar-system.intro.start

Type : intro

Texte écran :
[À rédiger]

Texte oral :
[À rédiger]

Contexte :
Le robot présente le système solaire au début du niveau.

Durée orale recommandée :
5 à 10 secondes.

---

### 2. solar-system.mars.place

Type : instruction

Texte écran :
[À rédiger]

Texte oral :
[À rédiger]

Contexte :
L'enfant doit déplacer Mars jusqu'à son orbite.

Durée orale recommandée :
3 à 6 secondes.
```

Je dois pouvoir prendre cette liste et rédiger/générer tous les contenus sans avoir à analyser moi-même le code.

---

# 21. Variante souhaitée : Cursor peut proposer les textes

En plus de la liste ci-dessus, Cursor peut proposer directement une première version des formulations.

Il doit néanmoins distinguer clairement :

```text
Texte écran
```

et :

```text
Texte oral
```

afin que je puisse valider ou modifier les formulations avant intégration.

---

# 22. Workflow d'intégration

Le travail doit être réalisé dans cet ordre.

## Phase A — Analyse

- analyser le repo ;
- identifier l'existant ;
- produire le compte rendu d'architecture.

## Phase B — Inventaire

- rechercher toutes les interventions actuelles du robot ;
- proposer un ID stable pour chacune ;
- les classer par type.

## Phase C — Proposition éditoriale

- proposer le texte écran ;
- proposer la version orale ;
- indiquer le contexte ;
- indiquer le fichier cible.

## Phase D — Validation humaine

Ne pas modifier automatiquement tous les textes pédagogiques sans validation.

Me fournir d'abord l'inventaire et les propositions.

## Phase E — Architecture

Après validation :

- créer ou adapter le système centralisé de messages ;
- migrer les messages validés ;
- connecter le robot au système ;
- connecter la voix.

## Phase F — Réglages

Ajouter :

```text
Voix du robot
[ Activée / Désactivée ]
```

avec persistance locale.

## Phase G — Réécoute

Ajouter le bouton de réécoute si pertinent dans l'interface actuelle du robot.

## Phase H — Tests

Tester :

- voix activée ;
- voix désactivée ;
- changement du réglage pendant une phrase ;
- rechargement de la page ;
- navigation entre niveaux ;
- absence de `speech` ;
- navigateur sans synthèse vocale ;
- lecture répétée ;
- interruption d'un message lorsqu'un autre commence ;
- retour arrière ;
- changement de page pendant une lecture.

---

# 23. Gestion des lectures simultanées

Une nouvelle phrase ne doit pas se superposer à l'ancienne.

Lorsqu'un nouveau message doit être lu :

```text
1. arrêter la lecture précédente ;
2. charger le nouveau message ;
3. lancer la nouvelle lecture si la voix est activée.
```

Lorsque l'utilisateur désactive la voix :

```text
arrêter immédiatement la lecture en cours.
```

Lorsque l'utilisateur quitte la mission :

```text
arrêter la lecture en cours.
```

---

# 24. Synthèse vocale navigateur

Si le projet utilise dans un premier temps la Web Speech API :

```ts
window.speechSynthesis;
```

Cursor doit encapsuler son usage dans un service ou hook dédié.

Exemple conceptuel :

```text
useRobotVoice()
```

ou :

```text
robotVoiceService
```

Éviter d'appeler directement `speechSynthesis` dans plusieurs composants.

Ce service doit gérer :

- lecture ;
- arrêt ;
- activation/désactivation ;
- réécoute ;
- changement de message ;
- nettoyage lors du démontage du composant.

---

# 25. Préparer l'évolution vers de vraies voix enregistrées

L'architecture doit permettre plus tard de remplacer la synthèse vocale par :

```text
MP3 / OGG / autre audio préenregistré
```

sans modifier la logique des niveaux.

Les niveaux doivent demander :

```text
joue le message X
```

et non :

```text
utilise SpeechSynthesis pour prononcer cette chaîne.
```

Le système de voix décidera ensuite s'il doit :

```text
lire un fichier audio
```

ou :

```text
utiliser le TTS.
```

---

# 26. Traductions futures

Même si Mission Cosmos est actuellement en français, l'organisation doit permettre plus tard :

```text
fr
en
es
...
```

Les IDs ne doivent donc jamais dépendre de la langue.

Correct :

```text
solar-system.mars.place
```

Incorrect :

```text
place-mars-sur-son-orbite
```

---

# 27. Format final attendu de Cursor

Après analyse du projet, Cursor doit me fournir exactement ces quatre sections.

## 1 — Architecture actuelle

Description courte et factuelle.

## 2 — Fichiers à modifier / créer

Avec chemin complet de chaque fichier.

Exemple :

```text
src/...
src/...
public/...
```

## 3 — Inventaire des dialogues

Tableau exhaustif avec :

```text
ID
type
texte actuel
texte écran proposé
texte oral proposé
fichier cible
```

## 4 — Plan d'implémentation

Étapes ordonnées permettant d'intégrer le système sans casser le jeu.

---

# 28. Contraintes importantes

Cursor doit respecter les points suivants :

- ne pas réécrire inutilement l'architecture existante ;
- réutiliser les systèmes de state, i18n et préférences déjà présents ;
- ne pas introduire de dépendance lourde sans justification ;
- ne pas utiliser un service cloud obligatoire pour le TTS ;
- ne pas collecter de données utilisateur ;
- ne pas créer de compte utilisateur ;
- conserver le jeu fonctionnel hors connexion autant que possible ;
- éviter les modifications destructives ;
- conserver une séparation claire entre contenu éditorial et logique de jeu ;
- préserver la possibilité de transformer Mission Cosmos en PWA ou application native ultérieurement.

---

# 29. Critères de validation

La fonctionnalité sera considérée comme correctement intégrée lorsque :

- [ ] les textes du robot ne sont plus dispersés inutilement dans les composants ;
- [ ] chaque dialogue possède un identifiant stable ;
- [ ] `text` et `speech` peuvent être différents ;
- [ ] sans fichier enregistré, le texte reste visible et le jeu reste jouable ; aucune synthèse automatique de tout l'écran n'est imposée ;
- [ ] le robot peut lire une phrase ;
- [ ] la lecture peut être interrompue ;
- [ ] une nouvelle phrase interrompt proprement la précédente ;
- [ ] un bouton permet de réécouter la dernière phrase lorsque pertinent ;
- [ ] le réglage `Voix du robot` existe ;
- [ ] ce réglage persiste après rechargement ;
- [ ] désactiver la voix coupe immédiatement une lecture en cours ;
- [ ] le jeu reste intégralement jouable sans audio ;
- [ ] aucune donnée personnelle n'est nécessaire ;
- [ ] les MP3 préparés sont reliés au manifeste et au lecteur ;
- [ ] chaque fichier de production correspond à un texte de 300 caractères maximum ;
- [ ] les consignes communes réutilisent le même MP3 sans répétition à chaque étape ;
- [ ] une modification du texte oral indique quels MP3 doivent être régénérés ;
- [ ] les textes restent courts et lisibles sur téléphone ;
- [ ] aucun MP3 par question ou choix de quiz n'est exigé dans ce lot ;
- [ ] l'architecture permet l'ajout futur d'autres langues.

---

# 30. Instruction finale pour Cursor

Commence par **analyser le repository Mission Cosmos**.

Ne commence pas par coder.

Je veux d'abord obtenir :

1. la structure actuelle concernée ;
2. les fichiers qui devront être créés ou modifiés ;
3. l'inventaire de tous les dialogues et textes du robot déjà présents ;
4. la proposition de nommage stable de chaque message ;
5. pour chaque message :
   - le texte écran recommandé ;
   - la version orale recommandée ;
   - le contexte d'utilisation ;
   - le fichier exact où il devra être placé ;
6. le plan d'intégration du commutateur `Voix du robot` dans les réglages ;
7. la stratégie retenue pour la lecture, l'arrêt et la réécoute.

Une fois cette analyse produite, attendre ma validation des textes et de l'architecture avant de migrer massivement les dialogues.

---

# 31. Décisions retenues après l’audit des textes

## État réel du projet

Next.js 16.3.6, App Router, export statique, React 19 et scènes Babylon.js. Les textes principaux sont dans `src/content/missions/` et `src/content/quizzes/`. Les scènes et les mini-jeux contiennent également des retours contextuels. Le Guide est affiché par `MissionImmersive` et `Companion`.

La musique possède déjà un lecteur central, `MusicProvider`, des préférences `mc:music-muted` et `mc:music-volume`, et un déblocage au premier geste utilisateur. Il n’y a pas encore de lecteur de voix du robot ni de synthèse vocale reliée au Guide. Les textes français utilisent des IDs stables ; il n’existe pas encore de système de traduction complet.

## Production des voix

- Dossier de dépôt : `D:\Programmation\Mission Cosmos\public\assets\audio\robot\fr`.
- Liste lisible : `docs/audio/robot/textes-a-generer.fr.md`.
- Tableau de production : `docs/audio/robot/textes-a-generer.fr.csv` (UTF-8, séparateur point-virgule).
- Correspondance machine : `docs/audio/robot/manifest.fr.json`.
- Source éditoriale unique : `docs/audio/robot/dialogues-essentiels.fr.json`.
- Quiz facultatifs : `docs/audio/robot/quizz-facultatifs.fr.md` et `.csv` ; correspondances dans `docs/audio/robot/manifest-quizz-facultatifs.fr.json`.
- Régénération de la liste : `node scripts/generate-robot-voice-inventory.mjs`.

Le générateur ne modifie pas les textes du jeu, ne crée pas de faux MP3 et n’écrase aucun MP3 déposé. Il valide les étapes référencées, impose 300 caractères maximum par texte et refuse un catalogue dépassant 50 fichiers. Il ne découpe jamais automatiquement un texte trop long : le texte doit être raccourci. Le lot retenu compte 47 fichiers, dont quatre phrases communes. Le plus long contient 248 caractères.

Il n'y a plus de lots P1/P2/P3 à produire. Le catalogue unique couvre les consignes et notions essentielles des 14 missions. Les quatre phrases communes servent aux quiz, erreurs, réussites et explications sur les maquettes. Les fiches de planètes, le glossaire, les badges, les variantes aléatoires, les chapitres des films et le bonus facultatif de l'Aigle restent sans enregistrement spécifique.

Pour un quiz, `common.quiz.mp3` sert à son introduction. Si le MP3 facultatif d'une question est présent, le jouer à l'arrivée sur cette question ou à la demande. Il contient la question et tous ses choix, sans révéler la bonne réponse. Les choix sont mélangés à l'écran : ne pas enregistrer de lettre ou de numéro. L'ordre oral peut différer de l'ordre visuel ; l'enfant choisit le texte correspondant, pas sa position. Ne pas associer cette énumération à un surlignage successif des boutons. Les corrections restent écrites ; les retours courts réutilisent les phrases communes.

Sans le fichier facultatif, conserver les textes et la jouabilité. Le lot essentiel ne lit pas toute l'interface ; un enfant qui ne lit pas encore peut avoir besoin d'un adulte pour les choix écrits. Une éventuelle lecture navigateur à la demande reste une évolution distincte non implémentée. Le lot facultatif est généré depuis les sources actuelles des quiz : 44 fichiers, 281 caractères maximum actuellement. Le budget de 50 fichiers du générateur ne concerne que les voix essentielles ; la limite de 300 caractères est vérifiée pour tous les fichiers.

## Texte court et complément oral

Les instructions à effectuer restent explicites à l’écran. La voix définit les mots nécessaires avant leur premier emploi : axe, hémisphère, diamètre, année-lumière, masse, horizon. Les définitions restent accessibles sans audio. Ne pas réintroduire des paragraphes longs dans les bulles pour faire correspondre leur longueur à l’enregistrement.

Réussites et erreurs utilisent les fichiers communs. Chaque intervention tient dans une génération de 300 caractères maximum, sans parties supplémentaires. Les durées sont indicatives, pas mesurées. Un fichier associé à plusieurs étapes est joué à la première étape pertinente, puis disponible à la demande : pas de répétition automatique à chaque étape. La consigne écran précise l'objectif actuel. Réécouter relance l'aide pertinente pour l'étape actuelle. La sécurité des éclipses utilise un fichier dédié et reste visible à l'écran. Si un fichier manque, conserver le texte et la jouabilité.

## Lecture et musique

Utiliser un lecteur de voix distinct de la musique, avec un réglage indépendant. Un fichier MP3 disponible est prioritaire ; un fallback de synthèse vocale peut être ajouté sans service cloud obligatoire. La lecture attend un geste utilisateur si le navigateur bloque l’autoplay. Le blocage ne doit pas empêcher de continuer.

Pendant la voix, baisser temporairement la musique, puis rétablir son volume choisi par le joueur. Respecter la musique déjà coupée. Annuler la lecture et toute suite de clips lors d’un changement d’étape, d’une navigation, d’un changement de profil ou de la désactivation de la voix.

Les films ne demandent pas de narration par chapitre dans ce lot. Garder leurs textes et proposer le bilan oral de la mission après le film, à la demande. Ne pas superposer une consigne au film. Les réglages de réduction des animations restent respectés.

Les assets de `public` doivent être présents avant l’export statique. Le simple dépôt de fichiers ne les rend pas audibles : le branchement du lecteur, des réglages et de la réécoute constitue une étape d’implémentation séparée. Prévoir un chargement à la demande, pas le préchargement de tout le catalogue. Pour le hors connexion, préciser la politique de cache et sa taille avant d’inclure toutes les voix dans le service worker.
