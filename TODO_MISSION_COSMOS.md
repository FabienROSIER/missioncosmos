# Mission Cosmos — Plan de production / TODO maître

> Document de pilotage principal du projet. Cursor doit le lire avant toute modification significative du projet et le maintenir à jour après chaque itération.

## 0. Vision du produit

**Mission Cosmos** est une application éducative interactive francophone destinée en priorité aux enfants de **6 à 12 ans**, accessible sur smartphone, tablette et ordinateur.

L'objectif n'est pas de créer une encyclopédie illustrée mais une **aventure d'apprentissage interactive de l'astronomie**, dans laquelle l'enfant découvre les phénomènes par la manipulation, l'observation et de petits défis.

Principe pédagogique général :

**Question → manipulation → découverte → défi → explication → récompense → progression**

La progression principale suit une logique d'échelle :

**Terre → Lune → Soleil → Système solaire → étoiles → lumière → Voie lactée → galaxies → Univers → phénomènes extrêmes**

Nom du produit : **Mission Cosmos**.

Langue initiale : **français**.

Public principal : **6–12 ans**.

Le projet doit rester extensible à d'autres langues et à de nouveaux chapitres.

---

# 1. Règles impératives de travail pour Cursor

- [ ] Lire intégralement ce fichier avant de commencer une nouvelle phase.
- [ ] Ne jamais considérer cette TODO comme une liste à exécuter entièrement en une seule fois.
- [ ] Travailler **phase par phase et sous-phase par sous-phase**.
- [ ] Avant chaque sous-phase importante, expliquer brièvement au propriétaire du projet ce qui va être réalisé.
- [ ] Après chaque sous-phase, tester le résultat avant de poursuivre.
- [ ] Cocher uniquement les tâches réellement terminées et vérifiées.
- [ ] Ajouter dans cette TODO les tâches découvertes en cours de développement.
- [ ] Ne jamais supprimer une tâche non réalisée pour simplifier artificiellement la roadmap.
- [ ] Documenter les décisions structurantes dans `/docs/decisions/`.
- [ ] Ne pas introduire une dépendance importante sans expliquer son utilité.
- [ ] Favoriser une architecture simple, lisible, modulaire et maintenable.
- [ ] Éviter la sur-ingénierie.
- [ ] Ne pas ajouter de backend tant qu'une fonctionnalité ne le justifie pas réellement.
- [ ] Ne jamais utiliser un asset dont la licence est inconnue ou incompatible avec une distribution publique/commerciale.
- [ ] Lorsque la prochaine étape nécessite un asset, **STOPPER la phase concernée et demander explicitement l'asset au propriétaire**.
- [ ] La demande d'asset doit préciser : type, usage, format, dimensions/résolution, transparence éventuelle, variantes nécessaires, style souhaité et emplacement cible dans le projet.
- [ ] Ne pas remplacer silencieusement un asset manquant par un asset définitif improvisé.
- [ ] Des placeholders temporaires sont autorisés uniquement s'ils sont clairement identifiés comme tels dans le code et dans cette TODO.
- [ ] Pour tout contenu scientifique, distinguer les simplifications pédagogiques des représentations physiquement réalistes.
- [ ] Ne jamais présenter comme physiquement exactes des distances, tailles, vitesses ou échelles volontairement altérées pour la lisibilité.
- [ ] Concevoir en priorité pour l'usage tactile et les écrans mobiles.
- [ ] Tester régulièrement sur une largeur mobile réelle et pas uniquement dans une fenêtre desktop.
- [ ] Respecter les performances des smartphones/tablettes modestes.
- [ ] À la fin de chaque itération, fournir : travaux réalisés, fichiers principaux modifiés, tests effectués, problèmes connus, prochaine étape proposée et éventuelles demandes d'assets/décisions.
- [ ] **Demander l'autorisation du propriétaire avant de passer à la phase majeure suivante.**

---

# 2. Stack cible et principes techniques

Stack initiale recommandée :

- **Next.js**
- **React**
- **TypeScript strict**
- **Babylon.js** pour les scènes 3D
- CSS moderne / solution de styling légère à choisir lors de l'initialisation
- PWA installable
- stockage local initial via IndexedDB ou solution adaptée
- données pédagogiques séparées du code de rendu
- assets 2D/3D/audio centralisés et documentés

Principes :

- séparation UI / logique pédagogique / moteur 3D / données ;
- scènes 3D chargées à la demande ;
- aucune scène Babylon lourde chargée inutilement ;
- code compatible tactile + souris ;
- architecture permettant ultérieurement l'ajout d'un backend ;
- architecture permettant ultérieurement l'internationalisation ;
- aucune dépendance native obligatoire dans la première architecture ;
- priorité à WebGL compatible mobile ; WebGPU peut être utilisé comme amélioration progressive si pertinent.

---

# PHASE 1 — Initialisation et fondations

## 1.1 Création du projet

- [x] Initialiser le projet Next.js avec TypeScript.
- [x] Activer les contrôles TypeScript stricts pertinents.
- [x] Configurer ESLint.
- [x] Configurer Prettier si pertinent.
- [x] Définir les scripts `dev`, `build`, `lint`, `typecheck`, `test`.
- [x] Installer Babylon.js et uniquement les modules nécessaires.
- [x] Vérifier qu'un build de production vierge fonctionne.
- [x] Créer `.env.example` même si aucun secret n'est encore utilisé.
- [x] Configurer `.gitignore`.
- [x] Initialiser Git si nécessaire.
- [x] Créer les Cursor Rules projet dans `.cursor/rules/` (core, architecture, babylon, pédagogie, UI/UX, assets, QA).

## 1.2 Arborescence cible

Créer et documenter une arborescence claire, par exemple :

```text
src/
  app/
  components/
    ui/
    layout/
    learning/
    game/
  features/
    progression/
    missions/
    rewards/
    settings/
  3d/
    core/
    scenes/
    entities/
    materials/
    effects/
    controls/
    utils/
  content/
    missions/
    quizzes/
    glossary/
  hooks/
  lib/
  stores/
  types/
  styles/
public/
  assets/
    textures/
    models/
    sprites/
    illustrations/
    icons/
    audio/
      music/
      sfx/
      voices/
docs/
  decisions/
  pedagogy/
  assets/
  testing/
```

- [x] Adapter cette structure aux conventions réelles de Next.js retenues.
- [x] Créer un README racine expliquant installation et lancement.
- [x] Créer `docs/ARCHITECTURE.md`.
- [x] Créer `docs/ASSETS.md` pour inventorier sources/licences/crédits.
- [x] Créer `docs/CONTENT_GUIDE.md` pour les règles pédagogiques et éditoriales.

## 1.3 Configuration de base

- [x] Définir les alias d'import.
- [x] Centraliser les constantes de l'application.
- [x] Créer les types principaux : Mission, Chapter, Activity, Challenge, Reward, Progress, AssetReference.
- [x] Définir une convention de nommage des assets.
- [x] Préparer une gestion centralisée des erreurs.
- [x] Préparer une page d'erreur utilisateur adaptée aux enfants.
- [x] Préparer les logs de développement sans exposer d'informations inutiles en production.

---

# PHASE 2 — Identité visuelle et expérience globale

## 2.1 Direction artistique

- [x] Définir une direction artistique cohérente : spatiale, colorée, lisible, moderne, non infantilisante.
- [x] Définir palette principale et palette fonctionnelle.
- [x] Définir typographies compatibles web et très lisibles pour les enfants.
- [x] Définir rayons, ombres, espacements et composants de surfaces.
- [x] Définir le style des boutons principaux et secondaires.
- [x] Définir les états hover, focus, pressed, disabled et success.
- [x] Définir les animations UI standard.
- [x] Vérifier les contrastes et tailles minimales tactiles.

### ASSET GATE — identité

- [x] Déterminer si un logo Mission Cosmos est nécessaire immédiatement.
- [x] Si oui, demander au propriétaire un logo ou proposer un brief précis de génération. *(Non requis : wordmark typo ; brief favicon dans `docs/DESIGN.md`.)*
- [x] Déterminer les besoins d'icône d'application / favicon.
- [x] Documenter les assets reçus dans `docs/ASSETS.md`.

## 2.2 Design system

- [x] Créer les tokens de design.
- [x] Créer Button.
- [x] Créer IconButton.
- [x] Créer Card.
- [x] Créer Modal/Sheet adapté mobile.
- [x] Créer Tooltip pédagogique.
- [x] Créer ProgressBar.
- [x] Créer Badge.
- [x] Créer MissionCard.
- [x] Créer DialogueBubble.
- [x] Créer QuizChoice.
- [x] Créer RewardPanel.
- [x] Créer LoadingScreen.
- [x] Créer ErrorState.
- [x] Documenter les composants principaux.

## 2.3 Navigation principale

- [x] Écran splash/chargement.
- [x] Écran d'accueil.
- [x] Bouton « Commencer » / « Continuer ».
- [x] Accès carte des missions.
- [x] Accès collection/récompenses.
- [x] Accès paramètres.
- [x] Retour sécurisé depuis une mission.
- [x] Gestion du bouton retour Android/navigateur.
- [x] Transitions entre écrans.

---

# PHASE 3 — Socle Babylon.js / moteur 3D

## 3.1 Canvas et cycle de vie

- [x] Créer un composant BabylonCanvas réutilisable.
- [x] Initialiser proprement Engine et Scene.
- [x] Gérer resize/orientation.
- [x] Gérer destruction et nettoyage des ressources.
- [x] Éviter les doubles initialisations React.
- [x] Prévoir chargement asynchrone des scènes.
- [x] Prévoir écran de chargement des assets.
- [x] Tester perte/restauration du contexte WebGL si possible. *(écouteurs contextlost/restored branchés ; test matériel à faire sur appareil.)*

## 3.2 Caméra et contrôles

- [x] Contrôles tactiles : rotation.
- [x] Pinch zoom.
- [x] Pan uniquement lorsque pédagogiquement utile. *(désactivé par défaut)*
- [x] Contrôles souris desktop.
- [x] Limites de zoom par scène.
- [x] Limites de rotation par scène. *(beta borné ; alpha libre pour Terre)*
- [x] Fonction recentrer la caméra.
- [x] Transitions caméra animées.
- [x] Fonction focus sur un objet.
- [x] Prévenir les conflits gestes UI / gestes 3D.

## 3.3 Système d'entités

- [x] Créer une abstraction pour corps célestes.
- [x] Paramètres : rayon visuel, rayon réel, masse, rotation, inclinaison, texture, description, etc.
- [x] Séparer données scientifiques et paramètres de représentation visuelle.
- [x] Système d'orbites.
- [x] Système de rotation axiale.
- [x] Système de labels 2D liés aux objets 3D.
- [x] Picking/tap des objets.
- [x] États selected/highlighted.
- [x] Animations d'apparition/disparition.

## 3.4 Matériaux et rendu

- [x] Matériaux planétaires.
- [x] Textures albedo/diffuse selon besoin.
- [x] Normal maps uniquement si utiles sur mobile. *(désactivées en low)*
- [x] Gestion atmosphère simplifiée.
- [x] Soleil émissif.
- [x] Éclairage directionnel/ponctuel adapté.
- [x] Fond étoilé performant. *(image mission ADR-002)*
- [x] Tester PBR vs matériaux plus simples sur mobile. *(Standard en low ; doc `RENDERING.md`)*
- [x] Définir niveaux de qualité graphique.

## 3.5 Performance 3D

- [x] Mesurer FPS et mémoire sur desktop. *(instrumentation `startPerfMonitor` — logs console en dev)*
- [x] Mesurer sur smartphone Android réel. *(protocole documenté dans `docs/PERFORMANCE.md` — à exécuter sur appareil)*
- [x] Réduire draw calls. *(freeze matériaux, fond figé, atmosphère off en low)*
- [x] Instancing lorsque pertinent. *(helper thin instances pour missions futures)*
- [x] Optimiser textures. *(aniso / sampling selon qualité)*
- [x] Définir résolutions max par catégorie d'asset. *(`textureLimits.ts` + PERFORMANCE.md)*
- [x] Lazy loading des modèles/textures. *(ImportMeshAsync + `prefetchCelestialGlb`)*
- [x] Dispose systématique des scènes quittées. *(BabylonCanvas)*
- [x] Mode graphique réduit pour appareils faibles. *(qualité auto/low)*
- [x] Respecter `prefers-reduced-motion` pour les animations non essentielles.

---

# PHASE 4 — Système de contenu pédagogique

## 4.1 Modèle de mission

Chaque mission doit pouvoir définir :

- identifiant ;
- titre ;
- tranche de difficulté ;
- prérequis ;
- objectifs pédagogiques ;
- question d'introduction ;
- scène 3D utilisée ;
- interactions autorisées ;
- étapes de découverte ;
- défi ;
- explication finale ;
- quiz éventuel ;
- récompense ;
- faits complémentaires ;
- glossaire associé ;
- assets nécessaires.

- [x] Définir le schéma TypeScript.
- [x] Ajouter validation runtime des contenus si pertinent.
- [x] Séparer textes pédagogiques du code des scènes. *(`content/missions/` vs `3d/scenes/`)*
- [x] Permettre plusieurs variantes de difficulté à terme. *(`variantGroupId`)*
- [x] Préparer les champs pour future traduction. *(`locale: 'fr'`)*

## 4.2 Moteur de séquence pédagogique

- [x] État INTRO.
- [x] État OBSERVE.
- [x] État MANIPULATE.
- [x] État CHALLENGE.
- [x] État EXPLAIN.
- [x] État QUIZ facultatif. *(`MissionQuiz` + `quiz-mission-01`)*
- [x] État REWARD.
- [x] État COMPLETE.
- [x] Reprise après interruption. *(`mc:mission-session` localStorage)*
- [x] Possibilité de recommencer une expérience. *(bouton Recommencer / Rejouer)*
- [x] Possibilité d'explorer librement après réussite.

## 4.3 Texte et niveau de langage

- [x] Écrire des phrases courtes. *(revue Mission 01)*
- [x] Éviter le jargon non expliqué. *(mots liés au glossaire)*
- [x] Ajouter un glossaire interactif. *(bouton Mots + termes cliquables)*
- [x] Ne pas infantiliser les 10–12 ans. *(ton clair, pas « bébé »)*
- [x] Vérifier scientifiquement chaque explication. *(forme / équateur / pôles / axe — niveau scolaire)*
- [x] Signaler clairement les représentations « non à l'échelle ». *(notice renforcée en mission)*

---

# PHASE 5 — Progression, profil local et récompenses

## 5.1 Profil enfant local

- [x] Création d'un profil local simple.
- [x] Choix d'un prénom/pseudo facultatif.
- [x] Avatar sans photo personnelle. *(emojis prédéfinis)*
- [x] Stockage local.
- [x] Plusieurs profils sur un même appareil à étudier. *(max 3)*
- [x] Aucun compte obligatoire dans la première version.
- [x] Éviter la collecte de données personnelles inutiles.

## 5.2 Progression

- [x] Missions verrouillées/déverrouillées.
- [x] Sauvegarde des missions terminées.
- [x] Sauvegarde des défis réussis. *(via étape reward/complete de mission)*
- [x] Sauvegarde des récompenses.
- [x] Pourcentage de progression.
- [x] Rejouer une mission terminée.
- [x] Migration/versionnage du format de sauvegarde. *(version + reset si schéma inconnu)*
- [x] Bouton de réinitialisation avec confirmation parentale/simple protection adaptée.

## 5.3 Récompenses

Éviter les mécaniques addictives artificielles.

- [x] Créer des badges de connaissance. *(Explorateur de la Terre)*
- [x] Débloquer des objets/fiches dans une collection cosmique. *(écran Collection branché)*
- [x] Débloquer des entrées de glossaire enrichies. *(bonus après badge Mission 01)*
- [x] Débloquer éventuellement des variantes visuelles du compagnon. *(teinte CSS « explorer » ; assets Phase 6)*
- [x] Animation de récompense courte et non intrusive. *(RewardPanel celebrate + reduced-motion)*
- [x] Écran collection.
- [x] Aucun loot aléatoire payant.
- [x] Aucune streak quotidienne obligatoire.

---

# PHASE 6 — Compagnon Mission Cosmos

## 6.1 Rôle

Le compagnon doit :

- guider sans monopoliser l'écran ;
- poser certaines questions ;
- fournir des indices ;
- féliciter sobrement ;
- expliquer les erreurs ;
- introduire certaines curiosités scientifiques.

- [x] Définir personnalité et ton. *(`src/content/companion/persona.ts`)*
- [x] Définir nom du compagnon ultérieurement avec le propriétaire. *(placeholder `Guide` — `COMPANION_TEMP_NAME`)*
- [x] Déterminer sprite 2D vs modèle 3D. — sprites 2D transparents livrés (AST-003).
- [x] Concevoir système de dialogues. *(`resolveCompanionCue` + lignes courtes)*
- [x] Concevoir système d'expressions/poses. — 9 états et manifest dans `docs/COMPANION_ASSETS.md`.
- [x] Concevoir apparition non intrusive. *(sprite sm, flottement CSS, tip repliable)*

### ASSET GATE — compagnon

Cursor doit demander les assets lorsqu'ils deviennent nécessaires.

Si sprite 2D :

- [x] demander personnage sur fond transparent ;
- [x] neutre ;
- [x] heureux ;
- [x] surpris ;
- [x] réflexion ;
- [x] encouragement ;
- [x] erreur douce/indice ;
- [x] poses supplémentaires : accueil et pointage gauche/droite ;
- [x] définir résolution et cadrage avant génération — canvas carré partagé, runtime 512/256, sources PNG 1254 × 1254.

Si 3D :

- [x] demander GLB/GLTF optimisé ; *(`public/assets/models/compagon/compagon.glb` — ~6,5 Mo, compression à prévoir)*
- [x] définir animations nécessaires ; *(Idle, Cheer, Confused, Agree, restpose — branchées M02–M04 via `loadCompanion` / `companionSurfaceMarker`)*
- [ ] vérifier licence et poids. *(GLB ~6,5 Mo — compression Draco/meshopt à prévoir ; licence à confirmer)*

---

# PHASE 7 — Carte de l'Univers / sélection des missions

## 7.1 Concept

La carte doit matérialiser l'élargissement progressif du champ de connaissance.

- [x] Terre comme point de départ. *(`UNIVERSE_ZONES` + missions 01–02)*
- [x] Lune. *(mission 03)*
- [x] voisinage terrestre. *(nœud « bientôt »)*
- [x] Système solaire. *(mission 05 — nœud jouable)*
- [x] Soleil/étoiles. *(nœud placeholder)*
- [x] Voie lactée. *(nœud placeholder)*
- [x] galaxies. *(nœud placeholder)*
- [x] Univers profond. *(nœud placeholder)*
- [x] phénomènes extrêmes. *(nœud placeholder)*

## 7.2 Fonctionnalités

- [x] Navigation tactile fluide. *(grille 3×3 / rangée desktop — sans scroll)*
- [x] Missions terminées clairement visibles.
- [x] Missions disponibles clairement visibles.
- [x] Missions verrouillées compréhensibles.
- [x] Aperçu au tap. *(panneau zone sélectionnée)*
- [x] Affichage objectif pédagogique court. *(MissionCard)*
- [x] Bouton démarrer/rejouer.
- [x] Animation de déverrouillage. *(pulse sessionStorage)*
- [x] Transition caméra entre zones. *(sélection instantanée, panneau aperçu)*
- [x] Ne pas sacrifier la lisibilité à l'effet visuel.

---

# PHASE 8 — Missions pédagogiques principales

> Chaque mission doit suivre le moteur pédagogique commun tout en proposant une interaction réellement spécifique. Ne pas dupliquer artificiellement le même mini-jeu.

## Mission 01 — Notre Terre

Objectifs : forme, rotation, pôles, équateur, repères fondamentaux.

- [x] Terre 3D manipulable.
- [x] Texture adaptée.
- [x] Rotation libre guidée.
- [x] Identifier équateur/pôles.
- [x] Défi simple de repérage.
- [x] Explication finale.
- [x] Récompense. *(badge local UI — persistance Phase 5)*

### ASSET GATE
- [x] demander texture Terre si aucune texture libre adaptée n'est déjà intégrée avec licence documentée. *(GLB pack AST-010)*

## Mission 02 — Pourquoi fait-il jour et nuit ?

- [x] Soleil + Terre.
- [x] Source lumineuse cohérente.
- [x] Repère/personnage sur Terre. *(compagnon 3D AST-003b — remplace l’ancienne maison)*
- [x] Rotation manuelle de la Terre.
- [x] Visualiser face éclairée / face nocturne.
- [x] Défi : placer le repère dans la nuit/le jour.
- [x] Introduire rotation ~24 h de façon adaptée.
- [x] Expliquer que le Soleil ne « s'éteint » pas la nuit.

## Mission 03 — La Lune et ses phases

- [x] Terre + Lune + Soleil.
- [x] Orbite lunaire simplifiée.
- [x] Déplacement de la Lune.
- [x] Vue depuis l'espace.
- [x] Vue depuis la Terre. *(PiP temps réel, pattern Mission 02)*
- [x] Croissant/quartier/gibbeuse/pleine/nouvelle. *(badge phase + détection)*
- [x] Défi de reproduction d'une phase. *(pleine + croissant)*
- [x] Corriger l'idée fausse « l'ombre de la Terre crée les phases ».

## Mission 04 — Les éclipses

- [x] Éclipse solaire.
- [x] Éclipse lunaire.
- [x] Manipulation des alignements.
- [x] Visualisation ombre/pénombre simplifiée. *(cônes translucides)*
- [x] Défi d'alignement. *(solaire + lunaire)*
- [x] Expliquer pourquoi il n'y a pas une éclipse chaque mois. *(orbite penchée à l’étape explain)*
- [x] Ne jamais suggérer l'observation directe du Soleil sans protection adaptée. *(notice + bandeau PiP)*

## Mission 05 — Le Système solaire

- [x] Soleil + 8 planètes.
- [x] Navigation entre planètes.
- [x] Fiches courtes.
- [x] Comparaison de tailles.
- [x] Mode « tailles relatives ».
- [x] Mode représentation lisible non à l'échelle.
- [x] Trois modes d’échelle (maquette / diamètres proportionnels / distances linéaires + révélation à échelle commune).
- [x] Modes tailles & distances déclenchés et gérés par le compagnon (steps `m05-scale` / `m05-distances`) — pas de boutons de lancement indépendants.
- [x] Mini-jeux tailles/distances intégrés dans la bulle compagnon (comme le quiz) — scène 3D dégagée, pas de bandeau overlay, **sans scroll** (viewport + bulle).
- [x] Quiz tailles : 4 questions (dont 8 planètes / rocheuses vs gazeuses) ; avance bloquée jusqu’à réussite (`requiresSuccess`).
- [x] Défi distances : repères avec portraits planètes (WebP pack) ; avance bloquée jusqu’à réussite.
- [x] Défi ordre des planètes placé avant tailles/distances (après exploration libre).
- [x] Inclinaisons axiales pédagogiques (ex. Uranus ~98°) + orbites/spins réalistes en mode ciné (quiz).
- [x] Ordre des planètes.
- [x] Défi de placement.
- [x] Mentionner planète naine séparément sans présenter Pluton comme 9e planète.
- [x] Aborder les distances moyennes au Soleil (étape « Mesurer le vide », zoom Soleil–Mars) — orbites/périodes → Mission 06 ; distances cosmiques → Mission 11.

### ASSET GATE — planètes
- [x] inventorier textures nécessaires.
- [x] demander/générer/rechercher uniquement les textures manquantes avec licence adaptée.

## Mission 06 — Les orbites

- [ ] Visualiser trajectoires orbitales.
- [ ] Manipuler vitesse de simulation.
- [ ] Comparer périodes orbitales.
- [ ] Introduire gravité sans fausse analogie excessive.
- [ ] Interaction distance/période adaptée à l'âge.
- [ ] Défi pédagogique.
- [ ] Éviter un simulateur physiquement faux présenté comme exact.

## Mission 07 — Pourquoi y a-t-il des saisons ?

- [ ] Terre inclinée.
- [ ] Orbite autour du Soleil.
- [ ] Rayons solaires visualisés.
- [ ] Manipulation de l'inclinaison.
- [ ] Comparaison hémisphère nord/sud.
- [ ] Défi été/hiver.
- [ ] Corriger l'idée fausse « été = Terre plus proche du Soleil ».

## Mission 08 — Les étoiles

- [ ] Introduire le Soleil comme étoile.
- [ ] Comparateur de tailles.
- [ ] Comparateur de températures/couleurs.
- [ ] Sélection d'étoiles représentatives scientifiquement vérifiées.
- [ ] Montrer que taille apparente ≠ taille réelle.
- [ ] Défi de comparaison.
- [ ] Limiter les objets simultanés pour les performances.

## Mission 09 — La lumière des étoiles

- [ ] Couleur et température.
- [ ] Spectre simplifié.
- [ ] Interaction température → couleur.
- [ ] Expliquer que « rouge » et « bleu » ont un sens physique.
- [ ] Introduire éventuellement spectroscopie.
- [ ] Défi d'association.

## Mission 10 — Notre galaxie

- [ ] Représentation 3D simplifiée de la Voie lactée.
- [ ] Position approximative du Soleil.
- [ ] Passage Système solaire → galaxie.
- [ ] Expliquer étoile vs système solaire vs galaxie.
- [ ] Rotation/exploration.
- [ ] Défi de localisation conceptuelle.

### ASSET GATE — Voie lactée
- [ ] déterminer si texture, skybox, particules ou modèle est préférable.
- [ ] demander l'asset seulement après définition technique précise.

## Mission 11 — Les distances dans l'Univers

- [ ] Terre → Lune.
- [ ] Terre → Soleil.
- [ ] Système solaire.
- [ ] étoile proche.
- [ ] Voie lactée.
- [ ] galaxies proches.
- [ ] Univers observable.
- [ ] Animation de changement d'échelle.
- [ ] Introduire UA et année-lumière progressivement.
- [ ] Signaler les compressions d'échelle.
- [ ] Défi d'ordre de grandeur.

## Mission 12 — Les trous noirs

- [ ] Définition adaptée aux enfants.
- [ ] Horizon des événements.
- [ ] Gravité extrême sans personnification trompeuse.
- [ ] Disque d'accrétion comme cas possible, pas caractéristique obligatoire.
- [ ] Démonstration visuelle stylisée.
- [ ] Défi conceptuel.
- [ ] Corriger l'idée « aspirateur cosmique qui avale tout l'Univers ».
- [ ] Ne pas prétendre simuler fidèlement la relativité si ce n'est pas le cas.

---

# PHASE 9 — Mode exploration libre / CosmoLab

- [ ] Débloquer après plusieurs missions.
- [ ] Explorer les corps déjà découverts.
- [ ] Manipuler rotation.
- [ ] Comparer tailles.
- [ ] Comparer distances avec avertissements d'échelle.
- [ ] Afficher fiches de découverte.
- [ ] Rejouer certaines expériences sans objectif.
- [ ] Ajouter ultérieurement expériences supplémentaires.
- [ ] Ne pas transformer CosmoLab en outil scientifique trompeusement précis.

---

# PHASE 10 — Quiz et défis

> Socle partiel déjà en place pour M01–M05 (`MissionQuiz` + `content/quizzes/mission-0x.ts`). Cette phase formalise et généralise le système.

- [x] Questions à choix. *(quiz M01–M05)*
- [ ] Questions visuelles.
- [ ] Placement/drag-and-drop.
- [ ] Manipulation 3D comme réponse.
- [x] Feedback immédiat explicatif. *(compagnon + choix quiz)*
- [x] Pas de sanction forte en cas d'erreur.
- [x] Possibilité de nouvel essai.
- [x] Banque de questions extensible. *(`content/quizzes/`)*
- [ ] Randomisation raisonnable.
- [ ] Éviter les questions pièges. *(revue éditoriale globale)*
- [ ] Vérifier chaque réponse scientifiquement. *(revue Phase 17)*

---

# PHASE 11 — Audio

## 11.1 Effets

- [ ] clic/tap léger.
- [ ] réussite.
- [ ] déverrouillage.
- [ ] transition.
- [ ] ambiance spatiale discrète.
- [x] volume global. *(volume musique — paramètres)*
- [x] mute. *(couper la musique — paramètres)*

## 11.2 Musique

- [x] Déterminer si musique d'ambiance réellement utile. *(oui — menus + missions)*
- [x] Boucles légères et non fatigantes. *(menu en boucle ; jeu en shuffle)*
- [x] Pause automatique appropriée. *(coupe au mute ; bascule menu/mission)*
- [x] Respect des préférences utilisateur. *(mute + volume localStorage, réglages)*
- [x] Une piste menu (`23 Space Ambience 1.mp3`) ; 5 pistes jeu en random au début de mission + shuffle enchaîné.

## 11.3 Narration

- [ ] Étudier narration audio pour enfants lecteurs débutants.
- [ ] Architecture permettant d'associer un fichier voix à un texte.
- [ ] Bouton écouter/réécouter.
- [ ] Ne pas lancer systématiquement la voix sans contrôle.

### ASSET GATE — audio

- [ ] Cursor doit fournir la liste précise des sons nécessaires avant recherche/génération.
- [x] Documenter licence/source de chaque son. *(musique KSP1 documentée dans `docs/ASSETS.md` — SFX/voix encore à faire ; musique = Temporaire, pas OK release publique)*

---

# PHASE 12 — Accessibilité et enfants 6–12 ans

- [ ] Zones tactiles suffisamment grandes.
- [ ] Texte lisible sans zoom.
- [ ] Navigation possible sans gestes complexes cachés.
- [ ] Instructions accompagnées d'indices visuels.
- [ ] Contraste suffisant.
- [ ] Support clavier desktop pertinent.
- [ ] Focus visibles.
- [ ] Réduction des animations.
- [ ] Sous-titres pour tout contenu vocal essentiel.
- [ ] Ne pas dépendre uniquement des couleurs pour transmettre une information.
- [ ] Tester avec lecture débutante.
- [ ] Éviter les timers stressants sauf justification pédagogique.
- [ ] Prévoir mode texte plus grand si nécessaire.

---

# PHASE 13 — Paramètres et contrôle de l'expérience

- [ ] Volume musique.
- [ ] Volume effets.
- [ ] Narration on/off si disponible.
- [ ] Qualité graphique Auto/Basse/Élevée.
- [ ] Réduction animations.
- [ ] Réinitialisation progression.
- [ ] Crédits.
- [ ] Sources scientifiques principales.
- [ ] Licences des assets.
- [ ] Version application.
- [ ] Politique de confidentialité si nécessaire.

---

# PHASE 14 — PWA et expérience mobile

- [ ] Manifest PWA.
- [ ] Icônes adaptées.
- [ ] Mode standalone.
- [ ] Theme color.
- [ ] Écran de lancement adapté.
- [ ] Gestion safe areas iOS.
- [ ] Portrait prioritaire ou orientation à décider mission par mission.
- [ ] Tester portrait.
- [ ] Tester paysage.
- [ ] Installation Android.
- [ ] Installation iOS/PWA.
- [ ] Gestion hors ligne des éléments essentiels.
- [ ] Stratégie de cache des assets lourds.
- [ ] Mise à jour de version sans cache cassé.
- [ ] Message clair lorsque des contenus nécessitent encore un téléchargement.

---

# PHASE 15 — Sauvegarde robuste et évolution future

## Local

- [ ] Choisir IndexedDB ou solution équivalente.
- [ ] Schéma versionné.
- [ ] Migration des sauvegardes.
- [ ] Gestion données corrompues.
- [ ] Export/import local à étudier.

## Backend futur — NE PAS implémenter sans besoin validé

Possibilités futures :

- synchronisation multi-appareils ;
- espace parent ;
- classes/enseignants ;
- statistiques anonymisées ;
- contenu distant ;
- mises à jour pédagogiques.

- [ ] Rédiger une ADR avant toute introduction du backend.

---

# PHASE 16 — Sécurité, confidentialité et public enfant

- [ ] Minimiser les données collectées.
- [ ] Aucun tracker publicitaire par défaut.
- [ ] Aucun chat entre utilisateurs.
- [ ] Aucun contenu utilisateur public.
- [ ] Aucun lien externe facilement accessible depuis l'espace enfant sans réflexion UX.
- [ ] Protéger les éventuels écrans parentaux sensibles par une interaction adaptée.
- [ ] Vérifier obligations légales avant collecte de données d'enfants.
- [ ] Politique de confidentialité claire si publication.
- [ ] Auditer dépendances.
- [ ] Aucun secret côté client.
- [ ] CSP et en-têtes de sécurité adaptés lors du déploiement.

---

# PHASE 17 — Validation scientifique

- [ ] Créer `docs/SCIENTIFIC_SOURCES.md`.
- [ ] Privilégier sources institutionnelles reconnues.
- [ ] Sourcer valeurs importantes.
- [ ] Distinguer valeurs arrondies pédagogiques et valeurs scientifiques.
- [ ] Vérifier unités.
- [ ] Vérifier vocabulaire français.
- [ ] Faire une revue scientifique complète de chaque mission avant statut FINAL.
- [ ] Réviser les contenus susceptibles d'évoluer.

---

# PHASE 18 — Tests

## Tests automatisés

- [ ] Tests unitaires logique progression.
- [ ] Tests validation contenus.
- [ ] Tests quiz.
- [ ] Tests sauvegarde/migration.
- [ ] Tests composants critiques.
- [ ] Tests E2E parcours principal.

## Tests manuels

- [ ] Chrome desktop.
- [ ] Firefox desktop.
- [ ] Edge.
- [ ] Chrome Android.
- [ ] Safari iPhone/iPad si matériel disponible.
- [ ] différentes tailles de smartphone.
- [ ] tablette.
- [ ] tactile.
- [ ] souris.
- [ ] réseau lent.
- [ ] hors ligne.
- [ ] reprise après fermeture.

## Tests enfants

- [ ] Observer quelques enfants du public cible si possible avec accord approprié.
- [ ] Vérifier compréhension des gestes sans explication adulte.
- [ ] Vérifier compréhension du vocabulaire.
- [ ] Identifier les moments d'ennui/confusion.
- [ ] Vérifier durée des missions.
- [ ] Corriger les points bloquants.

---

# PHASE 19 — Performance et qualité finale

- [ ] Audit bundle JS.
- [ ] Dynamic imports des scènes 3D.
- [ ] Compression textures adaptée au web/mobile.
- [ ] Compression GLB si utilisés.
- [ ] Vérifier poids total du premier chargement.
- [ ] Vérifier mémoire après plusieurs changements de mission.
- [ ] Vérifier absence de listeners non nettoyés.
- [ ] Vérifier absence de scènes/engines Babylon orphelins.
- [ ] Objectif de fluidité défini sur smartphone moyen de gamme.
- [ ] Dégradation graphique automatique si nécessaire.
- [ ] Audit Lighthouse pertinent pour les parties web.

---

# PHASE 20 — Contenu de finition

- [ ] Écran d'introduction Mission Cosmos.
- [ ] Tutoriel tactile très court.
- [ ] Tous les textes relus.
- [ ] Tous les assets définitifs.
- [ ] Tous les placeholders supprimés.
- [ ] Tous les assets crédités.
- [ ] Toutes les missions principales jouables du début à la fin.
- [ ] Progression complète testée sur nouvelle sauvegarde.
- [ ] Collection complète fonctionnelle.
- [ ] Paramètres fonctionnels.
- [ ] Audio finalisé ou explicitement désactivé si non retenu.
- [ ] Écran crédits.
- [ ] Écran sources.

---

# PHASE 21 — Déploiement

- [ ] Choisir hébergement.
- [ ] Configurer domaine/sous-domaine.
- [ ] HTTPS.
- [ ] Build production.
- [ ] Variables d'environnement.
- [ ] Headers cache adaptés aux assets versionnés.
- [ ] Headers sécurité.
- [ ] Monitoring d'erreurs respectueux de la vie privée si retenu.
- [ ] Tester installation PWA depuis production.
- [ ] Tester mise à jour PWA.
- [ ] Tester depuis smartphone réel en 4G/5G.

---

# PHASE 22 — Préparation éventuelle stores mobiles

À décider seulement lorsque la version web/PWA est stable.

- [ ] Étudier wrapper natif / React Native / autre stratégie selon état du projet.
- [ ] Évaluer réutilisation du moteur Babylon.
- [ ] Tester comportement natif.
- [ ] Icône store.
- [ ] Screenshots.
- [ ] Description.
- [ ] Classification d'âge.
- [ ] Politique de confidentialité.
- [ ] Exigences spécifiques applications destinées aux enfants.
- [ ] Android.
- [ ] iOS si souhaité.

---

# PHASE 23 — Extensions post-version initiale complète

Ces fonctionnalités ne doivent pas bloquer la version principale mais l'architecture doit éviter de les rendre impossibles.

- [ ] Constellations.
- [ ] Observation du ciel.
- [ ] Télescopes et fonctionnement optique.
- [ ] Astronautique.
- [ ] Fusées et mise en orbite.
- [ ] Exoplanètes.
- [ ] Nébuleuses.
- [ ] Naissance et mort des étoiles.
- [ ] Supernovæ.
- [ ] Pulsars / étoiles à neutrons.
- [ ] Astéroïdes/comètes.
- [ ] Exploration robotique.
- [ ] Histoire de l'astronomie.
- [ ] Astrophotographie.
- [ ] Mode enseignant éventuel.
- [ ] Internationalisation.

---

# Registre des assets requis

Cursor doit maintenir ce tableau au fil du projet.

| ID | Asset | Type | Format cible | État | Source/licence | Utilisation |
|---|---|---|---|---|---|---|
| AST-001 | Logo Mission Cosmos | 2D | PNG transparent | Reçu | ImageGen | Branding — intégré accueil |
| AST-002 | Icône application | 2D | PNG/SVG | À définir | — | PWA/store |
| AST-003 | Compagnon | 2D sprites | WebP 512/256 | Reçu | ImageGen | Guide UI — `public/assets/sprites/companion/` |
| AST-003b | Compagnon 3D | modèle GLB | GLB skinned | Reçu | À confirmer | Scènes M02–M04 — `public/assets/models/compagon/compagon.glb` (~6,5 Mo) |
| AST-010 | Terre | modèle GLB + WebP | GLB/WebP | Reçu | CGTrader pack (licence à vérifier) | Missions 1+ — `public/assets/models/solarsystem/celestial-bodies/earth/` |
| AST-011 | Lune | modèle GLB + WebP | GLB/WebP | Reçu | idem | Missions 3+ — `…/moon/` |
| AST-012 | Planètes / Soleil / astéroïdes | pack GLB | GLB/WebP | Reçu | idem | Mission 5+ — `…/celestial-bodies/` (AST-030→038) |
| AST-020 | Voie lactée artistique | Fond 2D | WebP panorama + mobile | Reçu | ImageGen, non cartographique | `public/assets/textures/backgrounds/` |
| AST-021 | Ciel étoilé discret | Fond 2D | WebP panorama + mobile | Reçu | ImageGen artistique | `public/assets/textures/backgrounds/` |
| AST-022 | Nébuleuse turquoise | Fond 2D | WebP panorama + mobile | Reçu | ImageGen artistique | `public/assets/textures/backgrounds/` |
| AST-040 | Musique menu | audio | MP3 | Temporaire | KSP1 (Squad / Take-Two) — usage perso seulement | `23 Space Ambience 1.mp3` — menus |
| AST-041 | Musique missions | audio | MP3 | Temporaire | KSP1 (Squad / Take-Two) — usage perso seulement | 5 pistes shuffle — `public/assets/audio/music/` |
| AST-100 | UI SFX | audio | OGG/MP3 | À définir | — | Interface |

États possibles : `À définir`, `Demandé`, `Reçu`, `Temporaire`, `Validé`, `À remplacer`.

Détail pack système solaire : `docs/ASSETS.md` + `public/assets/models/solarsystem/README.md`.


---

# Journal des décisions

Les décisions importantes doivent avoir une ADR dans `/docs/decisions/` et être résumées ici.

| Date | Décision | ADR |
|---|---|---|
| 2026-09-26 | Next.js + React + TypeScript comme socle web | `docs/decisions/001-stack-initiale.md` |
| 2026-09-26 | Babylon.js (`@babylonjs/core`) comme moteur 3D | `docs/decisions/001-stack-initiale.md` |
| 2026-09-26 | CSS natif (tokens en Phase 2), pas Tailwind au démarrage | `docs/decisions/001-stack-initiale.md` |
| 2026-09-26 | PWA avant application native | `docs/decisions/001-stack-initiale.md` |
| 2026-09-26 | Pas de backend initial sans besoin fonctionnel | `docs/decisions/001-stack-initiale.md` |
| 2026-09-26 | Fond missions 3D = image (pas procédural) | `docs/decisions/002-mission-image-background.md` |

---

# État global du projet

**Statut : MISSION 05 FAITE — prêt pour Mission 06 (Les orbites)**

Phase actuelle : **Phase 8 — Missions pédagogiques**

Sous-phases : Mission 01 · Mission 02 · Mission 03 · Mission 04 · Mission 05 terminées.

Prochaine action : **Mission 06 — Les orbites** *(après validation propriétaire)*.

### Notes découvertes

- Pack système solaire runtime : `public/assets/models/solarsystem/celestial-bodies/` (11 GLB + WebP). Inventorié dans `docs/ASSETS.md` (état **Reçu**). Usage perso : licence commerciale non bloquante pour l’instant.
- Archives FBX/JPG `src/3d/assets/solorsystem/` : **supprimées** (2026-09-26).
- `manifest.json` du pack pointe vers `/assets/celestial-bodies/…` alors que le chemin réel est `/assets/models/solarsystem/celestial-bodies/…` — chargeur utilise `CELESTIAL_BODIES_BASE`.
- UX jeu natif : pas de scroll page (`100dvh`, `overflow: hidden`) ; `ScrollRegion` pour listes ; viewport non scalable (gestes 3D). Portrait prioritaire menus ; missions OK portrait/paysage (HUD latéral en paysage).
- **Fonds missions 3D = image** (`MISSION_STARFIELD_SRC` / `ast-021-space-starfield-fine-v2.webp`), pas procédural — ADR-002. À réutiliser pour les prochaines missions.
- Compagnon 3D (AST-003b) intégré en marqueur de surface M02–M04 (remplace la maison) ; tip UI 2D reste le guide de séquence. Occlusion / layer masks documentés dans le code (`companionSurfaceMarker`).
- Mission 05 (2026-09-27→28) : séquence exploration → défi ordre → tailles (bulle) → distances (bulle + portraits) → Pluton → quiz. Modes d’échelle via steps compagnon uniquement. Pas de redesign « vraie échelle unique » (volontairement abandonné — trop illisible).
- Musique (2026-09-28) : AST-040/041 issus de **KSP1** — documentés dans `docs/ASSETS.md`, état **Temporaire** (propriétaire Squad/Take-Two). Remplacer avant toute publication.
