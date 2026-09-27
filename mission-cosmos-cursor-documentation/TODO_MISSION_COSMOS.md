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

- [ ] Initialiser le projet Next.js avec TypeScript.
- [ ] Activer les contrôles TypeScript stricts pertinents.
- [ ] Configurer ESLint.
- [ ] Configurer Prettier si pertinent.
- [ ] Définir les scripts `dev`, `build`, `lint`, `typecheck`, `test`.
- [ ] Installer Babylon.js et uniquement les modules nécessaires.
- [ ] Vérifier qu'un build de production vierge fonctionne.
- [ ] Créer `.env.example` même si aucun secret n'est encore utilisé.
- [ ] Configurer `.gitignore`.
- [ ] Initialiser Git si nécessaire.

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

- [ ] Adapter cette structure aux conventions réelles de Next.js retenues.
- [ ] Créer un README racine expliquant installation et lancement.
- [ ] Créer `docs/ARCHITECTURE.md`.
- [ ] Créer `docs/ASSETS.md` pour inventorier sources/licences/crédits.
- [ ] Créer `docs/CONTENT_GUIDE.md` pour les règles pédagogiques et éditoriales.

## 1.3 Configuration de base

- [ ] Définir les alias d'import.
- [ ] Centraliser les constantes de l'application.
- [ ] Créer les types principaux : Mission, Chapter, Activity, Challenge, Reward, Progress, AssetReference.
- [ ] Définir une convention de nommage des assets.
- [ ] Préparer une gestion centralisée des erreurs.
- [ ] Préparer une page d'erreur utilisateur adaptée aux enfants.
- [ ] Préparer les logs de développement sans exposer d'informations inutiles en production.

---

# PHASE 2 — Identité visuelle et expérience globale

## 2.1 Direction artistique

- [ ] Définir une direction artistique cohérente : spatiale, colorée, lisible, moderne, non infantilisante.
- [ ] Définir palette principale et palette fonctionnelle.
- [ ] Définir typographies compatibles web et très lisibles pour les enfants.
- [ ] Définir rayons, ombres, espacements et composants de surfaces.
- [ ] Définir le style des boutons principaux et secondaires.
- [ ] Définir les états hover, focus, pressed, disabled et success.
- [ ] Définir les animations UI standard.
- [ ] Vérifier les contrastes et tailles minimales tactiles.

### ASSET GATE — identité

- [ ] Déterminer si un logo Mission Cosmos est nécessaire immédiatement.
- [ ] Si oui, demander au propriétaire un logo ou proposer un brief précis de génération.
- [ ] Déterminer les besoins d'icône d'application / favicon.
- [ ] Documenter les assets reçus dans `docs/ASSETS.md`.

## 2.2 Design system

- [ ] Créer les tokens de design.
- [ ] Créer Button.
- [ ] Créer IconButton.
- [ ] Créer Card.
- [ ] Créer Modal/Sheet adapté mobile.
- [ ] Créer Tooltip pédagogique.
- [ ] Créer ProgressBar.
- [ ] Créer Badge.
- [ ] Créer MissionCard.
- [ ] Créer DialogueBubble.
- [ ] Créer QuizChoice.
- [ ] Créer RewardPanel.
- [ ] Créer LoadingScreen.
- [ ] Créer ErrorState.
- [ ] Documenter les composants principaux.

## 2.3 Navigation principale

- [ ] Écran splash/chargement.
- [ ] Écran d'accueil.
- [ ] Bouton « Commencer » / « Continuer ».
- [ ] Accès carte des missions.
- [ ] Accès collection/récompenses.
- [ ] Accès paramètres.
- [ ] Retour sécurisé depuis une mission.
- [ ] Gestion du bouton retour Android/navigateur.
- [ ] Transitions entre écrans.

---

# PHASE 3 — Socle Babylon.js / moteur 3D

## 3.1 Canvas et cycle de vie

- [ ] Créer un composant BabylonCanvas réutilisable.
- [ ] Initialiser proprement Engine et Scene.
- [ ] Gérer resize/orientation.
- [ ] Gérer destruction et nettoyage des ressources.
- [ ] Éviter les doubles initialisations React.
- [ ] Prévoir chargement asynchrone des scènes.
- [ ] Prévoir écran de chargement des assets.
- [ ] Tester perte/restauration du contexte WebGL si possible.

## 3.2 Caméra et contrôles

- [ ] Contrôles tactiles : rotation.
- [ ] Pinch zoom.
- [ ] Pan uniquement lorsque pédagogiquement utile.
- [ ] Contrôles souris desktop.
- [ ] Limites de zoom par scène.
- [ ] Limites de rotation par scène.
- [ ] Fonction recentrer la caméra.
- [ ] Transitions caméra animées.
- [ ] Fonction focus sur un objet.
- [ ] Prévenir les conflits gestes UI / gestes 3D.

## 3.3 Système d'entités

- [ ] Créer une abstraction pour corps célestes.
- [ ] Paramètres : rayon visuel, rayon réel, masse, rotation, inclinaison, texture, description, etc.
- [ ] Séparer données scientifiques et paramètres de représentation visuelle.
- [ ] Système d'orbites.
- [ ] Système de rotation axiale.
- [ ] Système de labels 2D liés aux objets 3D.
- [ ] Picking/tap des objets.
- [ ] États selected/highlighted.
- [ ] Animations d'apparition/disparition.

## 3.4 Matériaux et rendu

- [ ] Matériaux planétaires.
- [ ] Textures albedo/diffuse selon besoin.
- [ ] Normal maps uniquement si utiles sur mobile.
- [ ] Gestion atmosphère simplifiée.
- [ ] Soleil émissif.
- [ ] Éclairage directionnel/ponctuel adapté.
- [ ] Fond étoilé performant.
- [ ] Tester PBR vs matériaux plus simples sur mobile.
- [ ] Définir niveaux de qualité graphique.

## 3.5 Performance 3D

- [ ] Mesurer FPS et mémoire sur desktop.
- [ ] Mesurer sur smartphone Android réel.
- [ ] Réduire draw calls.
- [ ] Instancing lorsque pertinent.
- [ ] Optimiser textures.
- [ ] Définir résolutions max par catégorie d'asset.
- [ ] Lazy loading des modèles/textures.
- [ ] Dispose systématique des scènes quittées.
- [ ] Mode graphique réduit pour appareils faibles.
- [ ] Respecter `prefers-reduced-motion` pour les animations non essentielles.

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

- [ ] Définir le schéma TypeScript.
- [ ] Ajouter validation runtime des contenus si pertinent.
- [ ] Séparer textes pédagogiques du code des scènes.
- [ ] Permettre plusieurs variantes de difficulté à terme.
- [ ] Préparer les champs pour future traduction.

## 4.2 Moteur de séquence pédagogique

- [ ] État INTRO.
- [ ] État OBSERVE.
- [ ] État MANIPULATE.
- [ ] État CHALLENGE.
- [ ] État EXPLAIN.
- [ ] État QUIZ facultatif.
- [ ] État REWARD.
- [ ] État COMPLETE.
- [ ] Reprise après interruption.
- [ ] Possibilité de recommencer une expérience.
- [ ] Possibilité d'explorer librement après réussite.

## 4.3 Texte et niveau de langage

- [ ] Écrire des phrases courtes.
- [ ] Éviter le jargon non expliqué.
- [ ] Ajouter un glossaire interactif.
- [ ] Ne pas infantiliser les 10–12 ans.
- [ ] Vérifier scientifiquement chaque explication.
- [ ] Signaler clairement les représentations « non à l'échelle ».

---

# PHASE 5 — Progression, profil local et récompenses

## 5.1 Profil enfant local

- [ ] Création d'un profil local simple.
- [ ] Choix d'un prénom/pseudo facultatif.
- [ ] Avatar sans photo personnelle.
- [ ] Stockage local.
- [ ] Plusieurs profils sur un même appareil à étudier.
- [ ] Aucun compte obligatoire dans la première version.
- [ ] Éviter la collecte de données personnelles inutiles.

## 5.2 Progression

- [ ] Missions verrouillées/déverrouillées.
- [ ] Sauvegarde des missions terminées.
- [ ] Sauvegarde des défis réussis.
- [ ] Sauvegarde des récompenses.
- [ ] Pourcentage de progression.
- [ ] Rejouer une mission terminée.
- [ ] Migration/versionnage du format de sauvegarde.
- [ ] Bouton de réinitialisation avec confirmation parentale/simple protection adaptée.

## 5.3 Récompenses

Éviter les mécaniques addictives artificielles.

- [ ] Créer des badges de connaissance.
- [ ] Débloquer des objets/fiches dans une collection cosmique.
- [ ] Débloquer des entrées de glossaire enrichies.
- [ ] Débloquer éventuellement des variantes visuelles du compagnon.
- [ ] Animation de récompense courte et non intrusive.
- [ ] Écran collection.
- [ ] Aucun loot aléatoire payant.
- [ ] Aucune streak quotidienne obligatoire.

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

- [ ] Définir personnalité et ton.
- [ ] Définir nom du compagnon ultérieurement avec le propriétaire.
- [ ] Déterminer sprite 2D vs modèle 3D.
- [ ] Concevoir système de dialogues.
- [ ] Concevoir système d'expressions/poses.
- [ ] Concevoir apparition non intrusive.

### ASSET GATE — compagnon

Cursor doit demander les assets lorsqu'ils deviennent nécessaires.

Si sprite 2D :

- [ ] demander personnage sur fond transparent ;
- [ ] neutre ;
- [ ] heureux ;
- [ ] surpris ;
- [ ] réflexion ;
- [ ] encouragement ;
- [ ] erreur douce/indice ;
- [ ] éventuelles poses supplémentaires ;
- [ ] définir résolution et cadrage avant génération.

Si 3D :

- [ ] demander GLB/GLTF optimisé ;
- [ ] définir animations nécessaires ;
- [ ] vérifier licence et poids.

---

# PHASE 7 — Carte de l'Univers / sélection des missions

## 7.1 Concept

La carte doit matérialiser l'élargissement progressif du champ de connaissance.

- [ ] Terre comme point de départ.
- [ ] Lune.
- [ ] voisinage terrestre.
- [ ] Système solaire.
- [ ] Soleil/étoiles.
- [ ] Voie lactée.
- [ ] galaxies.
- [ ] Univers profond.
- [ ] phénomènes extrêmes.

## 7.2 Fonctionnalités

- [ ] Navigation tactile fluide.
- [ ] Missions terminées clairement visibles.
- [ ] Missions disponibles clairement visibles.
- [ ] Missions verrouillées compréhensibles.
- [ ] Aperçu au tap.
- [ ] Affichage objectif pédagogique court.
- [ ] Bouton démarrer/rejouer.
- [ ] Animation de déverrouillage.
- [ ] Transition caméra entre zones.
- [ ] Ne pas sacrifier la lisibilité à l'effet visuel.

---

# PHASE 8 — Missions pédagogiques principales

> Chaque mission doit suivre le moteur pédagogique commun tout en proposant une interaction réellement spécifique. Ne pas dupliquer artificiellement le même mini-jeu.

## Mission 01 — Notre Terre

Objectifs : forme, rotation, pôles, équateur, repères fondamentaux.

- [ ] Terre 3D manipulable.
- [ ] Texture adaptée.
- [ ] Rotation libre guidée.
- [ ] Identifier équateur/pôles.
- [ ] Défi simple de repérage.
- [ ] Explication finale.
- [ ] Récompense.

### ASSET GATE
- [ ] demander texture Terre si aucune texture libre adaptée n'est déjà intégrée avec licence documentée.

## Mission 02 — Pourquoi fait-il jour et nuit ?

- [ ] Soleil + Terre.
- [ ] Source lumineuse cohérente.
- [ ] Repère/maison/personnage sur Terre.
- [ ] Rotation manuelle de la Terre.
- [ ] Visualiser face éclairée / face nocturne.
- [ ] Défi : placer le repère dans la nuit/le jour.
- [ ] Introduire rotation ~24 h de façon adaptée.
- [ ] Expliquer que le Soleil ne « s'éteint » pas la nuit.

## Mission 03 — La Lune et ses phases

- [ ] Terre + Lune + Soleil.
- [ ] Orbite lunaire simplifiée.
- [ ] Déplacement de la Lune.
- [ ] Vue depuis l'espace.
- [ ] Vue depuis la Terre.
- [ ] Croissant/quartier/gibbeuse/pleine/nouvelle.
- [ ] Défi de reproduction d'une phase.
- [ ] Corriger l'idée fausse « l'ombre de la Terre crée les phases ».

## Mission 04 — Les éclipses

- [ ] Éclipse solaire.
- [ ] Éclipse lunaire.
- [ ] Manipulation des alignements.
- [ ] Visualisation ombre/pénombre simplifiée.
- [ ] Défi d'alignement.
- [ ] Expliquer pourquoi il n'y a pas une éclipse chaque mois.
- [ ] Ne jamais suggérer l'observation directe du Soleil sans protection adaptée.

## Mission 05 — Le Système solaire

- [ ] Soleil + 8 planètes.
- [ ] Navigation entre planètes.
- [ ] Fiches courtes.
- [ ] Comparaison de tailles.
- [ ] Mode « tailles relatives ».
- [ ] Mode représentation lisible non à l'échelle.
- [ ] Ordre des planètes.
- [ ] Défi de placement.
- [ ] Mentionner planète naine séparément sans présenter Pluton comme 9e planète.

### ASSET GATE — planètes
- [ ] inventorier textures nécessaires.
- [ ] demander/générer/rechercher uniquement les textures manquantes avec licence adaptée.

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

- [ ] Questions à choix.
- [ ] Questions visuelles.
- [ ] Placement/drag-and-drop.
- [ ] Manipulation 3D comme réponse.
- [ ] Feedback immédiat explicatif.
- [ ] Pas de sanction forte en cas d'erreur.
- [ ] Possibilité de nouvel essai.
- [ ] Banque de questions extensible.
- [ ] Randomisation raisonnable.
- [ ] Éviter les questions pièges.
- [ ] Vérifier chaque réponse scientifiquement.

---

# PHASE 11 — Audio

## 11.1 Effets

- [ ] clic/tap léger.
- [ ] réussite.
- [ ] déverrouillage.
- [ ] transition.
- [ ] ambiance spatiale discrète.
- [ ] volume global.
- [ ] mute.

## 11.2 Musique

- [ ] Déterminer si musique d'ambiance réellement utile.
- [ ] Boucles légères et non fatigantes.
- [ ] Pause automatique appropriée.
- [ ] Respect des préférences utilisateur.

## 11.3 Narration

- [ ] Étudier narration audio pour enfants lecteurs débutants.
- [ ] Architecture permettant d'associer un fichier voix à un texte.
- [ ] Bouton écouter/réécouter.
- [ ] Ne pas lancer systématiquement la voix sans contrôle.

### ASSET GATE — audio

- [ ] Cursor doit fournir la liste précise des sons nécessaires avant recherche/génération.
- [ ] Documenter licence/source de chaque son.

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
| AST-001 | Logo Mission Cosmos | 2D | SVG/PNG | À définir | — | Branding |
| AST-002 | Icône application | 2D | PNG/SVG | À définir | — | PWA/store |
| AST-003 | Compagnon | 2D ou 3D | PNG/WebP ou GLB | À définir | — | Guide |
| AST-010 | Terre | texture | WebP/AVIF/JPG | À définir | — | Missions 1+ |
| AST-011 | Lune | texture | WebP/AVIF/JPG | À définir | — | Missions 3+ |
| AST-012 | Planètes | textures | WebP/AVIF/JPG | À définir | — | Mission 5 |
| AST-020 | Voie lactée | texture/modèle | À définir | À définir | — | Mission 10 |
| AST-100 | UI SFX | audio | OGG/MP3 | À définir | — | Interface |

États possibles : `À définir`, `Demandé`, `Reçu`, `Temporaire`, `Validé`, `À remplacer`.

---

# Journal des décisions

Les décisions importantes doivent avoir une ADR dans `/docs/decisions/` et être résumées ici.

| Date | Décision | ADR |
|---|---|---|
| — | Next.js + React + TypeScript comme socle web | À créer |
| — | Babylon.js comme moteur 3D | À créer |
| — | PWA avant application native | À créer |
| — | Pas de backend initial sans besoin fonctionnel | À créer |

---

# État global du projet

**Statut : PRÉPARATION / NON INITIALISÉ**

Phase actuelle : **Phase 1 — Initialisation et fondations**

Prochaine action attendue de Cursor :

1. analyser ce document ;
2. vérifier l'état réel du dépôt ;
3. proposer les choix techniques précis nécessaires à la Phase 1 ;
4. réaliser uniquement la première sous-phase validée ;
5. tester ;
6. mettre à jour ce document ;
7. demander confirmation avant de poursuivre si une décision importante ou un changement de phase est nécessaire.
