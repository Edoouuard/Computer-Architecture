// Données du comparateur. Deux niveaux séparés : architectures, puis groupes homogènes
// d'entreprises ou de produits. Aucun score, aucun classement.
const c = (t, s, ...src) => ({ t, s, src });

export const DIMENSIONS = [
  { id: 'position', nom: 'Fonctionnement et positionnement' },
  { id: 'licences', nom: 'Licences et modèle économique' },
  { id: 'perso', nom: 'Personnalisation' },
  { id: 'logiciel', nom: 'Écosystème logiciel' },
  { id: 'dependances', nom: 'Dépendances' },
  { id: 'usages', nom: 'Cas d\'usage' },
  { id: 'limites', nom: 'Limites et arbitrages' },
];

export const GROUPES = [
  {
    id: 'isa', niveau: 'architectures', nom: 'Jeux d\'instructions',
    note: 'Une ISA est une spécification. Elle ne fixe ni la vitesse, ni la consommation, ni le prix d\'un processeur.',
    items: [
      {
        id: 'arm', nom: 'Arm', acteur: 'isa-arm',
        cells: {
          position: [c('ISA propriétaire détenue par l\'entreprise Arm, qui la fait évoluer seule et fournit aussi des cœurs prêts à intégrer.', 'confirme', 'arm-agi', 'ded-opinion')],
          licences: [
            c('Accès sous licence payante. Deux grandes familles : licence d\'architecture (le client conçoit ses cœurs, cas de Qualcomm et de Nuvia) ou licence de cœurs conçus par Arm.', 'confirme', 'ded-opinion'),
            c('Arm ajoute les sous-systèmes CSS puis, depuis 2026, ses propres puces.', 'confirme', 'arm-agi'),
            c('Formules Total Access et Flexible Access : descriptions non rouvertes.', 'nonverifie', 'arm-total-access', 'arm-licences'),
          ],
          perso: [c('Liberté de microarchitecture avec une licence d\'architecture. L\'ISA elle-même reste définie par Arm.', 'confirme', 'ded-opinion'), c('Une licence d\'architecture n\'est pas librement transférable : celle de Nuvia interdisait le transfert sans l\'accord d\'Arm en cas d\'acquisition.', 'confirme', 'ded-opinion')],
          logiciel: [c('Écosystème établi sur mobile et en croissance dans les centres de données : selon un dirigeant d\'AWS cité par la presse, la majorité de la capacité ajoutée par AWS en 2025 tournait sur ses puces Arm Graviton.', 'nonverifie', 'implicator')],
          dependances: [c('Dépendance contractuelle à un fournisseur unique, qui est aussi devenu vendeur de puces.', 'confirme', 'arm-20f')],
          usages: [c('Mobile (environ 43 % des redevances d\'Arm viennent des processeurs d\'applications mobiles), serveurs, HPC (Rhea1), embarqué.', 'confirme', 'arm-20f', 'sipearl-2024')],
          limites: [c('Coût de licence et risque de conflit d\'intérêts avec le fournisseur, contre un écosystème mûr et des cœurs vérifiés.', 'hypothese', 'arm-20f')],
        },
      },
      {
        id: 'x86', nom: 'x86', acteur: 'isa-x86',
        cells: {
          position: [c('ISA des PC et de la majorité des serveurs, implémentée en pratique par Intel et AMD.', 'confirme', 'toms-x86eag')],
          licences: [c('Pas de programme public de licence. Intel et AMD vendent des puces, pas l\'ISA.', 'nonverifie', 'amd-10k'), c('Gouvernance coordonnée depuis octobre 2024 par le x86 Ecosystem Advisory Group.', 'confirme', 'toms-x86eag')],
          perso: [c('Aucune extension par des tiers. Les extensions (AVX10, ACE, FRED, ChkTag) sont décidées par Intel et AMD.', 'confirme', 'toms-x86eag')],
          logiciel: [c('Parc logiciel le plus ancien sur PC et serveurs ; la compatibilité binaire est son principal actif. C\'est ce parc qui a fait gagner x86 à l\'ère du PC, selon Hennessy et Patterson.', 'confirme', 'hp-2019')],
          dependances: [c('Deux fournisseurs. AMD dépend de fonderies tierces, Intel fabrique lui-même.', 'confirme', 'amd-10k', 'intel-etat')],
          usages: [c('PC, serveurs, calcul intensif.', 'confirme', 'amd-10k')],
          limites: [c('Fermé aux nouveaux entrants : un tiers ne peut pas concevoir son processeur x86. En contrepartie, une plateforme très homogène pour le logiciel.', 'hypothese', 'toms-x86eag')],
        },
      },
      {
        id: 'riscv', nom: 'RISC-V', acteur: 'isa-riscv',
        cells: {
          position: [c('Standard ouvert géré par RISC-V International, organisation à but non lucratif. Petite base (40 instructions pour RV32I) et extensions optionnelles.', 'confirme', 'riscv-isa', 'riscv-rva23')],
          licences: [c('Aucune redevance sur l\'ISA. La valeur marchande se déplace vers les cœurs, les outils et les puces : SiFive et Andes vendent des licences de cœurs, Tenstorrent vend aussi des systèmes.', 'confirme', 'sifive-g', 'tt-serie-e')],
          perso: [c('Chacun peut concevoir son cœur et ajouter des extensions. Les profils comme RVA23 fixent les extensions obligatoires pour que le logiciel reste portable.', 'confirme', 'riscv-rva23')],
          logiciel: [c('En construction. RVA23 sert de socle commun aux systèmes d\'exploitation et aux chaînes de compilation.', 'confirme', 'riscv-rva23'), c('Disponibilité de matériel conforme à RVA23 : non documentée ici.', 'nonverifie')],
          dependances: [c('Pas de dépendance à un propriétaire d\'ISA. La dépendance se reporte sur le fournisseur de cœur choisi et sur la maturité du logiciel.', 'hypothese', 'xpu-codasip')],
          usages: [c('Contrôle embarqué, accélérateurs d\'IA (Tenstorrent), sécurité (CHERI), avec une poussée annoncée vers les centres de données.', 'confirme', 'tt-ga', 'sifive-g', 'cheri')],
          limites: [c('Liberté maximale, mais l\'IP de base se différencie mal : Codasip a cédé ses cœurs d\'entrée de gamme pour un prix rapporté de 14,5 M$.', 'nonverifie', 'jpr-onsemi')],
        },
      },
    ],
  },
  {
    id: 'ip', niveau: 'entreprises', nom: 'Fournisseurs d\'IP de processeur',
    note: 'Ces entreprises vendent des plans de cœurs à des concepteurs de puces. On compare ici des modèles d\'entreprise, pas des performances.',
    items: [
      {
        id: 'arm', nom: 'Arm', acteur: 'arm',
        cells: {
          position: [c('Propriétaire de son ISA et fournisseur de cœurs, de sous-systèmes et désormais de puces.', 'confirme', 'arm-agi')],
          licences: [c('Licences et redevances ; chiffre d\'affaires trimestriel de 1,44 Md$ (T2 de l\'exercice 2027).', 'confirme', 'arm-q2fy27', 'arm-20f')],
          perso: [c('Du cœur prêt à l\'emploi à la licence d\'architecture.', 'confirme', 'ded-opinion')],
          logiciel: [c('S\'appuie sur l\'écosystème Arm existant.', 'confirme', 'arm-20f')],
          dependances: [c('Cinq clients représentent environ 57 % du chiffre d\'affaires ; contrôle par SoftBank.', 'confirme', 'arm-20f')],
          usages: [c('Mobile, centres de données, embarqué.', 'confirme', 'arm-20f')],
          limites: [c('Vendre des puces peut tendre la relation avec les licenciés, risque que l\'entreprise reconnaît elle-même.', 'confirme', 'arm-20f')],
        },
      },
      {
        id: 'sifive', nom: 'SiFive', acteur: 'sifive',
        cells: {
          position: [c('Fournisseur d\'IP RISC-V sans activité de puces en volume.', 'declaration', 'sifive-g')],
          licences: [c('Licences d\'IP ; 400 M$ levés en avril 2026. Redevances non publiées.', 'confirme', 'sifive-g')],
          perso: [c('ISA ouverte, donc extensions possibles. Offre annoncée en calcul scalaire, vectoriel et matriciel.', 'declaration', 'sifive-g')],
          logiciel: [c('Dépend de la maturité du logiciel RISC-V.', 'hypothese', 'riscv-rva23')],
          dependances: [c('Financement privé ; calendrier de puces de ses clients.', 'hypothese', 'sifive-g')],
          usages: [c('Feuille de route annoncée vers les centres de données et l\'IA.', 'declaration', 'sifive-g')],
          limites: [c('Pas de revenus publiés : la traction commerciale ne peut pas être vérifiée ici.', 'nonverifie')],
        },
      },
      {
        id: 'andes', nom: 'Andes', acteur: 'andes',
        cells: {
          position: [c('Fournisseur coté d\'IP RISC-V, du microcontrôleur au cluster multicœur.', 'declaration', 'riscv-rva23')],
          licences: [c('Environ 42 M$ de chiffre d\'affaires en 2024, dont 67 % de licences et 21 % de redevances.', 'nonverifie', 'andes-ra')],
          perso: [c('ISA ouverte ; détail de l\'offre de personnalisation non documenté ici.', 'nonverifie')],
          logiciel: [c('Déclare avoir adopté RVA23 dans son cœur AX66.', 'declaration', 'riscv-rva23')],
          dependances: [c('Clientèle concentrée à Taïwan et en Chine.', 'nonverifie', 'andes-ra')],
          usages: [c('Embarqué en priorité.', 'nonverifie', 'andes-ra')],
          limites: [c('Petite taille face à Arm.', 'nonverifie', 'andes-ra')],
        },
      },
      {
        id: 'tenstorrent', nom: 'Tenstorrent', acteur: 'tenstorrent',
        cells: {
          position: [c('Licencie ses cœurs et vend aussi ses propres serveurs d\'IA.', 'confirme', 'tt-serie-e', 'tt-ga')],
          licences: [c('Matériel et licences ; 1,5 Md$ levés en octobre 2026.', 'confirme', 'tt-serie-e')],
          perso: [c('Propose de l\'IP sur mesure et une pile logicielle ouverte.', 'declaration', 'tt-serie-e')],
          logiciel: [c('Pile logicielle en source ouverte, propre à ses puces.', 'declaration', 'tt-ga')],
          dependances: [c('Samsung serait à la fois son fondeur et l\'un de ses licenciés.', 'nonverifie', 'tt-serie-e')],
          usages: [c('Inférence d\'IA en centre de données.', 'declaration', 'tt-ga')],
          limites: [c('Même tension qu\'Arm, à plus petite échelle : vendre des systèmes tout en licenciant à des fabricants de puces.', 'hypothese', 'tt-serie-e')],
        },
      },
    ],
  },
  {
    id: 'fonderies', niveau: 'entreprises', nom: 'Fonderies de pointe',
    note: 'On compare des positions industrielles. Les rendements et les coûts par plaquette ne sont pas publics.',
    items: [
      {
        id: 'tsmc', nom: 'TSMC', acteur: 'tsmc',
        cells: {
          position: [c('Fonderie pure : ne vend aucune puce sous sa marque.', 'confirme', 'tsmc-n2')],
          licences: [c('Vente de plaquettes gravées.', 'confirme', 'tsmc-n2')],
          perso: [c('Procédé N2 en production de volume depuis fin 2025.', 'confirme', 'tsmc-n2')],
          logiciel: [c('Sans objet au sens logiciel. Les outils EDA sont qualifiés procédé par procédé.', 'hypothese')],
          dependances: [c('Non documentées ici au-delà du rapport initial.', 'nonverifie')],
          usages: [c('Sert Arm, AMD et SiPearl parmi les acteurs de cette carte.', 'confirme', 'arm-agi', 'amd-10k', 'itdaily-rhea1')],
          limites: [c('Fournisseur commun de concurrents directs : sa capacité est une ressource disputée.', 'hypothese', 'futurum-q2')],
        },
      },
      {
        id: 'samsung', nom: 'Samsung Foundry', acteur: 'samsung',
        cells: {
          position: [c('Fonderie intégrée à un groupe qui conçoit aussi ses puces.', 'confirme', 'asiae-exynos')],
          licences: [c('Services de fonderie et production interne.', 'confirme', 'asiae-exynos')],
          perso: [c('Procédé 2 nm GAA en production pour l\'Exynos 2600.', 'confirme', 'asiae-exynos')],
          logiciel: [c('Sans objet au sens logiciel.', 'hypothese')],
          dependances: [c('Premier client de son 2 nm : la division sœur System LSI.', 'confirme', 'asiae-exynos')],
          usages: [c('Clients externes en 2 nm : rapportés, non rouverts.', 'nonverifie')],
          limites: [c('Fabrique pour des clients qui peuvent concurrencer ses propres produits.', 'hypothese')],
        },
      },
      {
        id: 'intel', nom: 'Intel Foundry', acteur: 'intel',
        cells: {
          position: [c('Usines d\'un fabricant intégré, ouvertes à des tiers.', 'declaration', 'intel-etat')],
          licences: [c('Production interne surtout ; pas de volume externe significatif en 18A selon la presse.', 'nonverifie', 'fool-18a')],
          perso: [c('Procédés 18A puis 14A ; calendrier du 14A divergent selon les sources.', 'nonverifie', 'trendforce-14a', 'tweaktown-14a')],
          logiciel: [c('Sans objet au sens logiciel.', 'hypothese')],
          dependances: [c('État américain actionnaire à 9,9 % ; besoin de clients externes pour le 14A.', 'confirme', 'intel-etat')],
          usages: [c('Processeurs Intel en priorité.', 'nonverifie', 'fool-18a')],
          limites: [c('Doit convaincre des concurrents de ses propres puces de lui confier leur fabrication.', 'hypothese')],
        },
      },
    ],
  },
  {
    id: 'produits', niveau: 'entreprises', nom: 'Processeurs serveur documentés',
    note: 'Deux puces Arm aux statuts différents. Aucune mesure commune n\'existe entre elles : pas de comparaison de performance.',
    items: [
      {
        id: 'agi', nom: 'Arm AGI CPU', acteur: 'arm',
        cells: {
          position: [c('Jusqu\'à 136 cœurs Neoverse V3, 300 W, TSMC 3 nm. Annoncé le 24/03/2026.', 'declaration', 'arm-agi')],
          licences: [c('Puce vendue par Arm lui-même, en plus de ses licences.', 'confirme', 'arm-agi')],
          perso: [c('Produit standard. Les clients qui veulent du sur-mesure gardent l\'IP ou les CSS.', 'declaration', 'arm-css-n4')],
          logiciel: [c('Écosystème Arm serveur existant.', 'declaration', 'arm-agi')],
          dependances: [c('TSMC et l\'approvisionnement en mémoire, que le dirigeant d\'Arm dit avoir sécurisés.', 'declaration', 'futurum-q2')],
          usages: [c('Orchestration et hébergement de tâches dans les centres de données d\'IA.', 'declaration', 'arm-agi')],
          limites: [c('Livraisons commerciales pas encore commencées au 16/11/2026. Résultats par baie modélisés, pas mesurés.', 'confirme', 'futurum-q2', 'futurum-signal65')],
        },
      },
      {
        id: 'rhea1', nom: 'SiPearl Rhea1', acteur: 'sipearl',
        cells: {
          position: [c('80 cœurs Neoverse V1, mémoire HBM intégrée, 61 milliards de transistors.', 'declaration', 'sipearl-mai', 'sipearl-2024')],
          licences: [c('Puce vendue par un licencié d\'Arm.', 'confirme', 'sipearl-2024')],
          perso: [c('Conçu pour le calcul scientifique à forte bande passante mémoire.', 'declaration', 'sipearl-2024')],
          logiciel: [c('Écosystème Arm ; cœurs d\'une génération antérieure à ceux de l\'AGI CPU.', 'confirme', 'itdaily-rhea1')],
          dependances: [c('Arm, TSMC et un client de lancement public.', 'confirme', 'sipearl-presse')],
          usages: [c('Module cluster du supercalculateur JUPITER.', 'confirme', 'sipearl-presse')],
          limites: [c('Échantillons livrés le 22/09/2026 ; disponibilité générale annoncée pour fin 2026. Aucun résultat de performance publié n\'a été consulté.', 'confirme', 'sipearl-presse', 'sipearl-mai')],
        },
      },
    ],
  },
];

// Pourquoi une ISA ne décide pas seule de la performance.
export const ISA_NE_DECIDE_PAS = {
  titre: 'Ce qu\'une ISA ne détermine pas',
  points: [
    c('Mesuré sur quatre processeurs (Arm Cortex-A8 et A9, Intel Atom et Core i7) et 26 charges de travail : les écarts de performance et de consommation s\'expliquent par la microarchitecture et les choix de conception, pas par le caractère RISC ou CISC de l\'ISA.', 'experimental', 'blem-2013'),
    c('Limites de cette étude : charges mono-fil, plateformes de 2010-2012, puissance du processeur estimée par soustraction de la consommation de la carte, x86 testé en 32 bits. Les auteurs laissent ouvert le cas des microcontrôleurs très basse consommation.', 'experimental', 'blem-2013'),
    c('Une même ISA couvre des puces très différentes : le cœur Neoverse V1 du Rhea1 et le Neoverse V3 de l\'AGI CPU partagent l\'architecture Arm mais pas la microarchitecture, ni le nœud de gravure, ni le budget thermique.', 'confirme', 'sipearl-2024', 'arm-agi'),
    c('Le coût dépend surtout du nœud de fabrication, de la surface du die, du rendement et du packaging, et le prix dépend du modèle économique du vendeur.', 'hypothese'),
  ],
};

export const LECTURE_BUSINESS = [
  { q: 'Où se trouve la propriété intellectuelle ?', r: [
    c('Arm : dans l\'ISA et dans les cœurs. Le client paie l\'accès puis l\'usage.', 'confirme', 'arm-20f', 'ded-opinion'),
    c('x86 : chez Intel et AMD, qui la monétisent en vendant des puces.', 'nonverifie', 'amd-10k'),
    c('RISC-V : l\'ISA est un bien commun. La propriété intellectuelle est dans les implémentations (SiFive, Andes, Tenstorrent, MIPS), les outils (Studio de Codasip) et les puces.', 'confirme', 'riscv-rva23', 'xpu-codasip', 'gf-arc'),
  ] },
  { q: 'Pourquoi un client paie-t-il ?', r: [
    c('Pour un cœur déjà vérifié et un écosystème logiciel existant, donc un délai de mise sur le marché plus court. Arm dit prendre à sa charge davantage de travail d\'ingénierie avec les CSS puis les puces.', 'declaration', 'arm-agi'),
    c('Sur RISC-V, on ne paie pas l\'ISA mais le cœur, le support et parfois la certification de sûreté, qui ajoutait de la valeur aux cœurs de Codasip pour l\'automobile.', 'confirme', 'xpu-codasip'),
  ] },
  { q: 'Qu\'est-ce qui crée des coûts de changement ?', r: [
    c('Le logiciel d\'abord : la portabilité entre fournisseurs est la raison d\'être des profils RISC-V.', 'confirme', 'riscv-rva23'),
    c('Les contrats : une licence d\'architecture Arm ne suit pas automatiquement l\'entreprise rachetée, comme l\'a montré l\'affaire Nuvia.', 'confirme', 'ded-opinion'),
    c('La requalification des produits et les compétences des équipes.', 'hypothese'),
  ] },
  { q: 'Qu\'est-ce qui fait barrière à l\'entrée ?', r: [
    c('x86 : une barrière juridique, faute de licence disponible.', 'nonverifie'),
    c('Arm : une barrière contractuelle et financière.', 'hypothese', 'ded-opinion'),
    c('RISC-V : barrière juridique faible, mais barrière commerciale réelle. L\'analyste Joseph Byrne décrit un marché de la licence encombré où il est difficile de prospérer.', 'hypothese', 'xpu-codasip'),
    c('Pour tous : l\'accès aux fonderies de pointe et au packaging.', 'hypothese'),
  ] },
];
