# Computer-Architecture : Labo Puces

Laboratoire interactif en français : processeurs, design de puces, industrie des semi-conducteurs.
Six espaces reliés : explorateur « de l'instruction à la puce », simulateur RV32I, carte de l'industrie,
comparateur, dossier Arm, bibliothèque de publications.

## Ouvrir le site

Le site est déjà construit : ouvrez `dist/index.html` dans un navigateur. Aucun serveur, compte ni clé d'API.
Seules les polices (Google Fonts) et les liens vers les sources utilisent le réseau ; hors ligne, des polices système prennent le relais.

## Modifier et reconstruire

Prérequis : Node.js 20 ou plus récent.

    npm install        # installe esbuild, seule dépendance (développement)
    npm test           # 29 tests : simulateur et intégrité des données
    npm run build      # produit dist/index.html (fichier unique)
    npm run check      # parcours dans Chrome sans interface (nécessite Playwright et Chrome ;
                       # chemin de Chrome réglable par la variable CHROME)

## Organisation

    src/sim/rv32i.js      assembleur simplifié et machine RV32I (sans dépendance, testable sous Node)
    src/sim/programs.js   les trois programmes d'exemple
    src/data/             contenu : sources, acteurs et relations, comparateur, dossier, publications, briques
    src/views/            un fichier par espace
    src/ui.js             aides d'affichage : statuts, sources, navigation
    test/                 tests unitaires, tests de données, parcours navigateur

## Règles de contenu

- Chaque affirmation porte un statut : fait confirmé, déclaration d'un fabricant, résultat expérimental,
  estimation ou modélisation, hypothèse stratégique, information non vérifiée.
- Un fait « confirmé » exige au moins une source rouverte lors de l'audit (`audit: true` dans `src/data/sources.js`).
  Les tests refusent le contraire.
- Date de vérification : 16 novembre 2026 (`DATE_VERIF`). Pour mettre à jour un fait, modifiez le fichier
  de données concerné, puis relancez `npm test` et `npm run build`.

## Limites connues

- Simulateur : 38 des 40 instructions de RV32I (sans `ecall` ni `fence`), assembleur simplifié sans encodage
  binaire, mémoire de 1024 octets, modèle fonctionnel sans notion de cycle. Ce n'est ni un cœur complet,
  ni un modèle certifié.
- Les grands documents réglementaires (20-F d'Arm, 10-K d'AMD, de Synopsys, de Cadence, d'Amkor) n'ont été lus
  qu'en partie (premiers 100 000 caractères).
- Les fiches d'Andes et d'ASE reposent surtout sur des sources non rouvertes : elles sont marquées « non vérifié ».
