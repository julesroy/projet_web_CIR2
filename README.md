# Projet Web CIR2 S2

### DUMAS Antonin - HU Lucas - BASSET Maxime - ROY Jules

Installation des dépendances (si c'est la première fois que le projet est ouvert):

```bash
npm install
```

Exécution (on se base à la racine du projet):

```bash
npm start
```

#### Technologies utilisées:

-   Node.js
-   Express.js
-   EJS
-   Tailwind CSS
-   Sortable.js
-   SQLite

#### Présentation:

Le but est de tenter de prédire le classement du prochain Grand Prix de Formule 1.
Un accès administrateur permet de rentrer le résultat du Grand Prix, les scores des joueurs sont alors calculés, et on passe au
Grand Prix suivant.
Il existe également des pages présentant les circuits, pilotes, et écuries.
L'utilisateur peut également changer sa photo de profil via les paramètres.
Les données sont stockées dans une base de données sqlite, et la librairie Sortable.js a permis l'implémentation du sytème de drag and drop pour les classements.

#### Accès

Pour tester le site, nous avons inclus 2 comptes:
Un accès administrateur:
mail: f1.admin@junia.com
mdp: admin123

Un accès user:
mail: f1.user@junia.com
mdp: user123

#### Github

Vous pouvez trouver le code source de ce projet sur GitHub à l'adresse suivante : [Lien vers le dépôt](https://github.com/julesroy/projet_web_CIR2)
