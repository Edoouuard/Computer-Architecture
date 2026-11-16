// Parcours « De l'instruction à la puce » : sept briques, du plus petit au plus grand.
export const BRIQUES = [
  {
    id: 'transistor', nom: 'Transistor', echelle: 'quelques dizaines de nanomètres',
    court: 'Un interrupteur commandé par une tension. Une tension sur la grille ouvre ou ferme le passage du courant entre la source et le drain. Tout le reste d\'une puce numérique est fait de ces interrupteurs.',
    approfondi: [
      'Les puces utilisent deux types complémentaires. Le NMOS conduit quand sa grille est à 1 ; le PMOS conduit quand sa grille est à 0. Associés par paires (logique CMOS), l\'un relie la sortie à l\'alimentation pendant que l\'autre la coupe de la masse : hors commutation, presque aucun courant ne circule.',
      'La géométrie a changé pour garder le contrôle du canal à mesure qu\'il rétrécit : transistor plan, puis à ailette (FinFET), puis à grille enrobante sur nanofeuillets (GAA), introduit par TSMC avec son procédé N2 et par Samsung avec son 2 nm.',
    ],
    exemple: 'L\'inverseur ci-contre : deux transistors, un PMOS en haut et un NMOS en bas. Entrée à 0, la sortie est tirée à 1 ; entrée à 1, la sortie est tirée à 0. SiPearl annonce 61 milliards de transistors dans son processeur Rhea1.',
    permet: 'Représenter un bit et le transformer. C\'est la seule opération physique d\'un circuit numérique.',
    liens: [{ vers: 'portes', texte: 'Quelques transistors assemblés forment une porte logique.' }, { vers: 'package', texte: 'Leur taille et leur densité dépendent du nœud de fabrication.' }],
    limites: ['Un vrai transistor n\'est pas un interrupteur parfait : il fuit quand il est fermé et met du temps à commuter.', 'Le nom d\'un nœud (« 3 nm », « 2 nm ») est une appellation commerciale de génération, pas une dimension mesurée sur le transistor.', 'Le schéma ignore les fils, dont la résistance et la capacité pèsent autant que les transistors sur la vitesse.'],
    sources: ['tsmc-n2', 'asiae-exynos', 'sipearl-mai'],
  },
  {
    id: 'portes', nom: 'Portes logiques', echelle: 'quelques transistors',
    court: 'Une porte combine un ou deux bits pour en produire un troisième selon une règle fixe : ET, OU, NON, OU exclusif. En CMOS, les portes naturelles sont inverseuses (NON-ET, NON-OU).',
    approfondi: [
      'Une porte NON-ET à deux entrées demande quatre transistors : deux NMOS en série vers la masse, deux PMOS en parallèle vers l\'alimentation. La sortie ne tombe à 0 que si les deux entrées sont à 1.',
      'NON-ET suffit à tout construire : n\'importe quelle fonction logique peut s\'écrire avec cette seule porte. Les concepteurs ne dessinent pas les portes à la main ; ils piochent dans une bibliothèque de cellules standard fournie pour un procédé donné.',
    ],
    exemple: 'L\'additionneur complet 1 bit ci-contre : deux OU exclusifs calculent la somme, deux ET et un OU calculent la retenue. C\'est de la logique pure, sans mémoire.',
    permet: 'Calculer. Toute opération arithmétique ou de décision d\'un processeur se ramène à un réseau de portes.',
    liens: [{ vers: 'transistor', texte: 'Chaque porte est un petit montage de transistors.' }, { vers: 'alu', texte: 'Des additionneurs 1 bit chaînés forment le cœur d\'une ALU.' }],
    limites: ['Chaque porte a un délai de propagation. La fréquence maximale d\'une puce est fixée par le plus long chemin de portes entre deux registres.', 'Les bibliothèques réelles contiennent des centaines de cellules de tailles et de vitesses différentes. L\'activité d\'IP de fondation Artisan, cédée par Arm à Cadence en 2025, fournit ce type de bibliothèques.'],
    sources: ['cadence-10k'],
  },
  {
    id: 'alu', nom: 'ALU et registres', echelle: 'quelques milliers de portes',
    court: 'L\'unité arithmétique et logique (ALU) calcule : addition, soustraction, ET, OU, comparaison. Les registres mémorisent : ils retiennent une valeur d\'un front d\'horloge au suivant.',
    approfondi: [
      'L\'additionneur le plus simple chaîne des additionneurs 1 bit : la retenue de chaque bit alimente le suivant. La soustraction réutilise le même additionneur : on inverse les bits du second opérande et on injecte une retenue de 1 (complément à deux).',
      'Un registre est une rangée de bascules. Tant que l\'horloge ne bat pas, sa sortie ne change pas, même si son entrée varie. C\'est ce qui découpe le calcul en étapes : la logique calcule entre deux battements, le registre capture le résultat.',
    ],
    exemple: 'Dans la démonstration, l\'ALU 8 bits calcule en continu, mais le registre ne prend la valeur qu\'au moment où vous donnez un coup d\'horloge.',
    permet: 'Exécuter les opérations d\'une instruction et conserver les résultats intermédiaires. RV32I prévoit 32 registres de 32 bits, dont x0 câblé à zéro.',
    liens: [{ vers: 'portes', texte: 'L\'ALU est un réseau de portes, le registre une rangée de bascules faites de portes.' }, { vers: 'coeur', texte: 'Le cœur pilote l\'ALU et choisit quels registres lire et écrire.' }],
    limites: ['La retenue qui se propage bit après bit est trop lente sur 64 bits. Les ALU réelles calculent les retenues en parallèle.', 'La démonstration est sur 8 bits pour rester lisible. Le simulateur, lui, travaille bien sur 32 bits.'],
    sources: ['riscv-isa'],
  },
  {
    id: 'coeur', nom: 'Cœur CPU', echelle: 'de dizaines de milliers à des centaines de millions de transistors',
    court: 'Un cœur répète un cycle : lire l\'instruction désignée par le compteur ordinal, la décoder, l\'exécuter, écrire le résultat, passer à la suivante.',
    approfondi: [
      'Le jeu d\'instructions (ISA) fixe ce que chaque instruction doit faire. La microarchitecture est la manière dont un cœur donné y parvient : nombre d\'étages de pipeline, prédiction de branchement, exécution de plusieurs instructions à la fois, exécution dans le désordre.',
      'Deux cœurs peuvent donc exécuter exactement le même programme avec des vitesses et des consommations très différentes. Le Neoverse V1 du SiPearl Rhea1 et le Neoverse V3 de l\'Arm AGI CPU implémentent tous deux l\'architecture Arm.',
    ],
    exemple: 'La démonstration suit une instruction d\'addition à travers les cinq étapes classiques. Le simulateur du laboratoire exécute de vrais programmes de cette façon, une instruction à la fois.',
    permet: 'Exécuter un programme. C\'est aussi l\'unité que vendent les fournisseurs d\'IP : un « cœur » licencié est la description de ce circuit.',
    liens: [{ vers: 'alu', texte: 'L\'étape d\'exécution utilise l\'ALU ; les opérandes viennent des registres.' }, { vers: 'cache', texte: 'Lire une instruction ou une donnée passe par les caches.' }, { vers: 'soc', texte: 'Un SoC intègre un ou plusieurs cœurs parmi d\'autres blocs.' }],
    limites: ['Le modèle « une instruction à la fois » est fonctionnel. Un cœur moderne traite des dizaines d\'instructions en même temps et en exécute certaines par anticipation.', 'Les interruptions, les modes privilégiés et la mémoire virtuelle sont absents du schéma.'],
    sources: ['sipearl-2024', 'arm-agi', 'blem-2013'],
  },
  {
    id: 'cache', nom: 'Caches et interconnexions', echelle: 'une large part de la surface d\'un processeur',
    court: 'La mémoire vive est lente à l\'échelle d\'un cœur. Un cache garde près du cœur une copie des données récemment utilisées. Les interconnexions relient cœurs, caches, mémoire et périphériques.',
    approfondi: [
      'Un cache est découpé en lignes. Une partie de l\'adresse désigne la ligne, le reste (l\'étiquette) dit quelle donnée s\'y trouve. Si l\'étiquette correspond, c\'est un succès ; sinon, un défaut : il faut aller chercher la donnée plus loin et remplacer la ligne.',
      'L\'efficacité dépend du programme. Un parcours régulier d\'un tableau réutilise chaque ligne chargée ; des accès qui se disputent la même ligne s\'évincent mutuellement.',
    ],
    exemple: 'Dans la démonstration, un cache de 4 lignes de 4 mots. Le parcours séquentiel réussit 3 accès sur 4 ; l\'alternance entre deux adresses distantes de 16 mots échoue à chaque fois.',
    permet: 'Faire travailler le cœur à sa vitesse malgré une mémoire lente. La bande passante mémoire est un argument de vente : SiPearl intègre de la mémoire HBM dans le boîtier de Rhea1, Arm met en avant le débit mémoire par cœur de l\'AGI CPU.',
    liens: [{ vers: 'coeur', texte: 'Chaque accès mémoire d\'une instruction interroge le cache.' }, { vers: 'soc', texte: 'Les interconnexions sont le squelette d\'un SoC.' }, { vers: 'package', texte: 'Mettre la mémoire dans le boîtier raccourcit le chemin.' }],
    limites: ['Les caches réels sont associatifs (plusieurs emplacements possibles par donnée), organisés en plusieurs niveaux, et anticipent les accès.', 'La démonstration ne modélise ni les écritures, ni le temps : elle compte seulement succès et défauts.'],
    sources: ['sipearl-2024', 'arm-agi'],
  },
  {
    id: 'soc', nom: 'SoC', echelle: 'des milliards de transistors',
    court: 'Un système sur puce réunit sur un même morceau de silicium des cœurs de processeur et tout ce qui les entoure : processeur graphique, accélérateurs, contrôleurs de mémoire, entrées-sorties.',
    approfondi: [
      'Un SoC est un assemblage. Son concepteur conçoit certains blocs, en achète d\'autres sous forme d\'IP licenciée, et utilise des interfaces standard pour le reste. Le choix du cœur de processeur n\'est qu\'une des décisions.',
      'C\'est ce qui rend la question « qui a conçu cette puce ? » ambiguë : le Rhea1 est une puce SiPearl dont les cœurs viennent d\'Arm ; l\'Exynos 2600 est conçu par une division de Samsung et gravé par une autre.',
    ],
    exemple: 'Cliquez sur les blocs du schéma : chacun indique s\'il est typiquement conçu en interne, licencié ou standardisé.',
    permet: 'Vendre un produit complet et différencié. C\'est à ce niveau que se décident le coût, l\'autonomie et les fonctions d\'un appareil.',
    liens: [{ vers: 'coeur', texte: 'Les cœurs sont des blocs du SoC, conçus ou licenciés.' }, { vers: 'cache', texte: 'L\'interconnexion relie tous les blocs.' }, { vers: 'package', texte: 'Le SoC est gravé sur un die, ou réparti sur plusieurs.' }],
    limites: ['Le schéma est générique : la répartition entre blocs internes et licenciés varie d\'une entreprise à l\'autre et n\'est en général pas publique.', 'Les surfaces des blocs ne sont pas à l\'échelle.'],
    sources: ['sipearl-2024', 'asiae-exynos', 'asanovic-2014'],
  },
  {
    id: 'package', nom: 'Die, chiplets et package', echelle: 'du centimètre carré au boîtier',
    court: 'Le die est le rectangle de silicium découpé dans la plaquette. Le package est le boîtier qui le protège et le relie à la carte. Des chiplets sont plusieurs dies plus petits réunis dans un même package.',
    approfondi: [
      'Une plaquette comporte des défauts répartis au hasard. Plus un die est grand, plus il a de chances d\'en contenir un et d\'être perdu. Découper une grande puce en chiplets améliore la part de silicium utilisable, au prix d\'un assemblage plus complexe.',
      'Le nœud de fabrication désigne la génération du procédé de gravure. Il est fixé par la fonderie, pas par le concepteur ni par le jeu d\'instructions. Le packaging avancé est devenu une étape industrielle à part entière, assurée par les fonderies et par des sous-traitants spécialisés.',
    ],
    exemple: 'Dans la démonstration, comparez un grand die à quatre chiplets de même surface totale en faisant varier la densité de défauts.',
    permet: 'Passer du circuit dessiné à un composant vendable. C\'est l\'étage où interviennent TSMC, Samsung, Intel, puis Amkor ou ASE.',
    liens: [{ vers: 'soc', texte: 'Le contenu logique vient du SoC.' }, { vers: 'transistor', texte: 'Le nœud fixe les caractéristiques des transistors.' }],
    limites: ['Le rendement suit ici le modèle de Poisson, le plus simple. Les fonderies utilisent des modèles plus fins et ne publient pas leurs densités de défauts.', 'Le calcul ignore le coût du packaging, le test, et les défauts d\'assemblage des chiplets.', 'Les valeurs de densité de défauts proposées sont des ordres de grandeur pédagogiques, pas des données de fonderie.'],
    sources: ['amd-10k', 'amkor-10k', 'tsmc-n2'],
  },
];

// Notions à ne pas confondre.
export const NOTIONS = [
  { id: 'ISA', def: 'Le jeu d\'instructions : le contrat entre le logiciel et le matériel. Il liste les instructions, les registres visibles et leur effet. C\'est une spécification, pas un circuit.', pasConfondre: 'Ni un processeur, ni une entreprise. « Arm » désigne à la fois une ISA et la société qui la détient.', brique: 'coeur' },
  { id: 'Microarchitecture', def: 'La façon dont un cœur donné réalise l\'ISA : pipeline, caches, prédiction de branchement, exécution dans le désordre. C\'est elle qui fait l\'essentiel de la performance.', pasConfondre: 'Deux microarchitectures différentes peuvent exécuter la même ISA.', brique: 'coeur' },
  { id: 'Cœur de processeur', def: 'Un circuit complet capable d\'exécuter un flux d\'instructions : une microarchitecture concrète. Une puce en contient un ou plusieurs.', pasConfondre: 'Un cœur n\'est pas une puce : il lui manque la mémoire, les entrées-sorties et le reste du SoC.', brique: 'coeur' },
  { id: 'IP réutilisable', def: 'La description d\'un bloc (un cœur, une interface, une mémoire) vendue sous licence pour être intégrée dans la puce d\'un autre. On achète un droit d\'usage et des fichiers, pas du silicium.', pasConfondre: 'Vendre de l\'IP n\'est pas vendre des puces. Arm fait désormais les deux.', brique: 'soc' },
  { id: 'SoC', def: 'Système sur puce : cœurs, accélérateurs, contrôleurs et interfaces réunis dans une même puce.', pasConfondre: 'Le SoC est le contenu logique. Il peut tenir sur un die ou être réparti sur plusieurs.', brique: 'soc' },
  { id: 'Die', def: 'Le morceau de silicium découpé dans la plaquette après gravure.', pasConfondre: 'Le die est nu ; ce que l\'on soude sur une carte est un package.', brique: 'package' },
  { id: 'Chiplet', def: 'Un die conçu pour être assemblé avec d\'autres dans un même package et former ensemble une puce.', pasConfondre: 'Un chiplet n\'est pas un cœur : il peut en contenir plusieurs, ou aucun (mémoire, entrées-sorties).', brique: 'package' },
  { id: 'Package', def: 'Le boîtier : il protège le ou les dies, les alimente, évacue la chaleur et les relie à la carte.', pasConfondre: 'Le packaging est un métier distinct de la gravure, avec ses propres industriels.', brique: 'package' },
  { id: 'Nœud de fabrication', def: 'La génération du procédé de gravure d\'une fonderie (N2 chez TSMC, 18A chez Intel). Il fixe la densité et les caractéristiques des transistors.', pasConfondre: 'Le nœud ne dépend pas de l\'ISA, et son nom n\'est pas une dimension physique.', brique: 'transistor' },
];

// Vue « qui tient quelle couche ? » sur quatre cas documentés.
export const COUCHES_CAS = ['ISA', 'Microarchitecture', 'IP', 'Puce', 'Fabrication'];
export const CAS = [
  {
    id: 'agi', nom: 'Arm AGI CPU', statut: 'declaration', src: ['arm-agi'],
    couches: [
      { qui: 'Arm', quoi: 'Architecture Arm', acteur: 'isa-arm' },
      { qui: 'Arm', quoi: 'Cœur Neoverse V3', acteur: 'arm' },
      { qui: 'Arm', quoi: 'IP interne, non achetée', acteur: 'arm' },
      { qui: 'Arm', quoi: 'Conçoit et vend la puce', acteur: 'arm' },
      { qui: 'TSMC', quoi: 'Procédé 3 nm', acteur: 'tsmc' },
    ],
    lecture: 'Un seul acteur tient quatre couches sur cinq. C\'est la nouveauté de 2026.',
  },
  {
    id: 'rhea1', nom: 'SiPearl Rhea1', statut: 'confirme', src: ['sipearl-2024', 'itdaily-rhea1'],
    couches: [
      { qui: 'Arm', quoi: 'Architecture Arm', acteur: 'isa-arm' },
      { qui: 'Arm', quoi: 'Cœur Neoverse V1', acteur: 'arm' },
      { qui: 'Arm → SiPearl', quoi: 'Cœur licencié', acteur: 'sipearl' },
      { qui: 'SiPearl', quoi: 'Conçoit et vend la puce', acteur: 'sipearl' },
      { qui: 'TSMC', quoi: 'Fabrication', acteur: 'tsmc' },
    ],
    lecture: 'Le modèle classique d\'Arm : l\'ISA et le cœur viennent du fournisseur d\'IP, la puce est celle du licencié.',
  },
  {
    id: 'epyc', nom: 'AMD EPYC 9755', statut: 'confirme', src: ['amd-10k', 'futurum-signal65'],
    couches: [
      { qui: 'Intel et AMD', quoi: 'x86-64', acteur: 'isa-x86' },
      { qui: 'AMD', quoi: 'Cœur Zen 5', acteur: 'amd' },
      { qui: 'AMD', quoi: 'IP interne, non licenciée à des tiers', acteur: 'amd' },
      { qui: 'AMD', quoi: 'Conçoit et vend la puce', acteur: 'amd' },
      { qui: 'TSMC', quoi: 'Fonderie des produits HPC d\'AMD', acteur: 'tsmc' },
    ],
    lecture: 'Intégration du jeu d\'instructions à la puce, mais fabrication sous-traitée.',
  },
  {
    id: 'ascalon', nom: 'Cœur Tenstorrent TT-Ascalon chez un licencié', statut: 'declaration', src: ['tt-serie-e', 'riscv-rva23'],
    couches: [
      { qui: 'RISC-V International', quoi: 'Standard ouvert RISC-V', acteur: 'isa-riscv' },
      { qui: 'Tenstorrent', quoi: 'Cœur TT-Ascalon', acteur: 'tenstorrent' },
      { qui: 'Tenstorrent → licencié', quoi: 'Cœur licencié (Samsung, LG cités)', acteur: 'tenstorrent' },
      { qui: 'Le licencié', quoi: 'Puce non documentée', acteur: 'samsung' },
      { qui: 'Au choix du licencié', quoi: 'Non documenté', acteur: null },
    ],
    lecture: 'Personne ne possède l\'ISA. La valeur commence à la microarchitecture.',
  },
];
