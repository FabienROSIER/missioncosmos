# Mission 09 — Le secret des couleurs

Un seul parcours pour les enfants de 6 à 12 ans, sans variante d’âge ni chiffres à viser.

## Parcours

1. Découvrir la lumière blanche du Soleil dans le laboratoire spatial existant.
2. Placer le prisme d’un appui sur le triangle ou sur un grand bouton. L’action est requise.
3. Explorer six repères de couleur de l’arc-en-ciel. Les faisceaux partent tous du prisme ; choisir un repère le met en évidence. Les sélections sont illimitées et ne changent pas d’expérience. Le bouton « Passer aux mélanges » ouvre les projecteurs quand l’enfant est prêt.
4. Allumer et éteindre trois projecteurs avec des boutons libellés ou en touchant leurs lentilles.
5. Observer rouge + vert = jaune.
6. Un seul défi de l’observatoire : trouver jaune, rose (magenta), cyan, puis blanc. Chaque couleur apparaît une seule fois. Chaque mélange est validé séparément ; les projecteurs repartent éteints entre les commandes.
7. Distinguer séparation par le prisme et addition de lumières sur l’écran.
8. Recevoir le badge Explorateur des couleurs, sans deuxième défi ni retour guidé au prisme.
9. Explorer librement prisme et projecteurs, ou rejouer.

Après le défi, le bilan et le badge montrent un laboratoire statique, sans commandes supplémentaires à réaliser.

Essais illimités, aucun chronomètre, indice général au premier essai puis suggestion concrète à partir du deuxième. Les états allumé/éteint, noms et résultats sont affichés en texte. Boutons clavier/tactile d’au moins 48 px, sans glisser précisément ni distinguer uniquement des couleurs.

## Exactitude

Le prisme sépare les couleurs déjà présentes dans la lumière blanche solaire. Il ne les crée pas. Les six repères représentent un spectre continu et ne prétendent pas être six rayons isolés du vrai Soleil. Les trois projecteurs illustrent l’addition de lumières, pas le mélange de peinture. Rouge + vert = jaune, rouge + bleu = magenta, vert + bleu = cyan, et rouge + vert + bleu = blanc. Ce blanc obtenu avec trois lumières ne signifie pas que le spectre du Soleil ne comporte que trois couleurs.

Les faisceaux sont rendus visibles pour observer leur trajet ; le laboratoire, ses angles, ses tailles et sa diffusion sont schématiques. Le Soleil utilise sa texture existante (granulation et taches solaires), désaturée à 100 % dans un matériau local avec une luminosité de 0,92. Son halo est blanc ; plus de curseur de température, kelvins, pic spectral ou courbe de corps noir.

Références : [NASA Space Place](https://spaceplace.nasa.gov/blue-sky/en/), [AMNH — Color and Light](https://www.amnh.org/explore/ology/physics/play-with-color-and-light).

## Rendu et budget

Prisme triangulaire transparent avec arêtes lisibles, banc optique, faisceau blanc à bords doux et éventail coloré issu d’un point commun. Trois projecteurs convergent vers une tache unique sur un écran mat.

Masques partagés de 64 px en faible/moyen, 128 px en élevé. Deux rubans croisés par faisceau ; un cœur fin supplémentaire uniquement en élevé. Les six couleurs restent disponibles dans tous les niveaux. DPR plafonné à 1,25 / 1,5 / 2. Aucune particule, ombre dynamique, passe de bloom ni calcul volumétrique. Aucun calcul d’animation permanent ajouté. Le placement dure 14 images (~230 ms) seulement si les préférences de mouvement autorisent les déplacements ; sinon il est immédiat. Les transparences ne s’empilent pas entre les expériences : une seule expérience est visible à la fois. Une tache blanche et une diffusion douce apparaissent sur l’écran avant le placement du prisme. La texture solaire nécessite un seul échantillonnage par fragment ; elle ne modifie pas les autres couleurs de la scène.

La scène et ses ressources sont libérées à la sortie. Les identifiants de mission, des étapes restantes et de récompense sont conservés pour préserver la progression existante. Une reprise sur une étape restaure ses éléments ; les défis reprennent au début de leur série.
