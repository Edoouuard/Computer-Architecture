// Acteurs, standards et relations. Chaque affirmation porte un statut et ses sources.
// f(texte, statut, ...idsDeSources)
const f = (t, s, ...src) => ({ t, s, src });

export const COUCHES = [
  { id: 'standards', nom: 'Architectures et standards', aide: 'Les jeux d\'instructions (ISA) et ceux qui les gouvernent. Une ISA est une spécification, pas une puce.' },
  { id: 'ip', nom: 'IP de processeur', aide: 'Des cœurs et sous-systèmes conçus pour être licenciés à d\'autres, qui les intègrent dans leurs puces.' },
  { id: 'conception', nom: 'Conception de puces', aide: 'Entreprises qui définissent et vendent des puces ou des systèmes, avec ou sans usine.' },
  { id: 'fabrication', nom: 'Fabrication', aide: 'Fonderies et fabricants intégrés qui gravent les plaquettes de silicium.' },
  { id: 'packaging', nom: 'Packaging et test', aide: 'Assemblage des dies dans leur boîtier, interconnexion et test final.' },
  { id: 'eda', nom: 'Logiciels EDA', aide: 'Outils de conception et de vérification utilisés par tous les étages ci-dessus.' },
];

export const TYPES = { entreprise: 'Entreprise', organisme: 'Organisme de standardisation', standard: 'Standard (ISA)' };
export const ARCHIS = { arm: 'Arm', x86: 'x86', riscv: 'RISC-V' };
export const SEGMENTS = {
  datacenter: 'Centre de données et IA', hpc: 'Calcul intensif (HPC)', mobile: 'Mobile', pc: 'PC',
  embarque: 'Embarqué, auto, industriel', outils: 'Outils et services de conception',
};
export const STADES = {
  annonce: 'Produit annoncé', prototype: 'Prototype ou démonstration', silicium: 'Silicium disponible (échantillons)',
  commercialise: 'Produit commercialisé', standard: 'Spécification publiée',
};

export const ACTEURS = [
  // ---------- Standards ----------
  {
    id: 'isa-arm', nom: 'Architecture Arm', type: 'standard', fiche: 'courte', archi: ['arm'], segments: ['datacenter', 'mobile', 'embarque', 'pc', 'hpc'],
    roles: [{ couche: 'standards', label: 'ISA propriétaire, licenciée' }],
    resume: 'Famille de jeux d\'instructions (Armv8-A, Armv9-A…) définie et détenue par l\'entreprise Arm. Ce n\'est ni une puce ni une entreprise.',
    faits: {
      'Nature': [f('Spécification propriétaire : pour concevoir ou utiliser un cœur compatible, il faut une licence d\'Arm.', 'confirme', 'ded-opinion', 'arm-agi')],
    },
  },
  {
    id: 'isa-x86', nom: 'x86-64', type: 'standard', fiche: 'courte', archi: ['x86'], segments: ['datacenter', 'pc', 'hpc'],
    roles: [{ couche: 'standards', label: 'ISA propriétaire, non licenciée' }],
    resume: 'Jeu d\'instructions des PC et de la majorité des serveurs. En pratique, seuls Intel et AMD conçoivent des processeurs x86 actuels.',
    faits: {
      'Gouvernance': [
        f('Intel et AMD ont créé en octobre 2024 le x86 Ecosystem Advisory Group pour coordonner l\'évolution de l\'ISA. Chantiers communs annoncés : FRED, AVX10, ChkTag et ACE.', 'confirme', 'toms-x86eag'),
        f('Une spécification ACE v1 a été publiée par ce groupe en 2026.', 'nonverifie', 'x86eag-ace'),
        f('Les droits d\'AMD sur x86 reposeraient sur un accord de licence croisée avec Intel. La partie du rapport annuel d\'AMD consultée ne mentionne que des « accords de licences croisées » sans nommer Intel.', 'nonverifie', 'amd-10k'),
      ],
    },
  },
  {
    id: 'isa-riscv', nom: 'RISC-V', type: 'standard', fiche: 'courte', archi: ['riscv'], segments: ['datacenter', 'embarque', 'mobile', 'hpc'],
    roles: [{ couche: 'standards', label: 'ISA ouverte, sans redevance' }],
    resume: 'Standard ouvert de jeu d\'instructions. Chacun peut l\'implémenter sans payer de licence sur l\'ISA elle-même.',
    faits: {
      'Contenu': [
        f('La base entière 32 bits, RV32I, compte 40 instructions. Des extensions standard s\'y ajoutent (multiplication, flottants, vecteurs…).', 'confirme', 'riscv-isa'),
        f('Le profil RVA23, ratifié le 21 octobre 2024, fixe un socle commun pour les processeurs applicatifs 64 bits : les extensions Vector et Hypervisor y sont obligatoires.', 'confirme', 'riscv-rva23'),
      ],
    },
    produits: [{ nom: 'Profil RVA23', stade: 'standard', detail: 'Ratifié le 21/10/2024.', s: 'confirme', src: ['riscv-rva23'] }],
  },
  {
    id: 'riscv-intl', nom: 'RISC-V International', type: 'organisme', fiche: 'courte', archi: ['riscv'], segments: ['outils'],
    roles: [{ couche: 'standards', label: 'Organisme de standardisation' }],
    resume: 'Organisation à but non lucratif qui héberge le standard RISC-V, ses spécifications et sa communauté. Elle ne vend ni cœur ni puce.',
    faits: {
      'Rôle': [
        f('Se décrit comme l\'organisation à but non lucratif qui héberge le standard RISC-V. La ratification d\'un profil passe par des groupes de travail puis un vote du conseil d\'administration.', 'confirme', 'riscv-rva23'),
      ],
      'Modèle économique': [f('Financement par les cotisations des membres, aucune redevance sur l\'ISA.', 'nonverifie', 'riscv-rapport')],
    },
  },
  // ---------- Arm ----------
  {
    id: 'arm', nom: 'Arm', type: 'entreprise', fiche: 'complete', archi: ['arm'], segments: ['datacenter', 'mobile', 'embarque', 'pc'],
    roles: [
      { couche: 'standards', label: 'Propriétaire de l\'ISA Arm' },
      { couche: 'ip', label: 'Fournisseur d\'IP CPU et de sous-systèmes (CSS)' },
      { couche: 'conception', label: 'Vendeur de puces depuis mars 2026' },
    ],
    resume: 'Propriétaire de l\'architecture Arm et fournisseur d\'IP de processeur. Depuis le 24 mars 2026, Arm vend aussi une puce de sa conception, l\'Arm AGI CPU.',
    faits: {
      'Rôle exact': [
        f('Arm présente trois façons d\'accéder à sa plateforme : licencier de l\'IP, adopter un sous-système CSS, ou déployer du silicium conçu par Arm.', 'confirme', 'arm-agi'),
        f('SoftBank Group est l\'actionnaire de contrôle d\'Arm.', 'confirme', 'arm-20f'),
      ],
      'Ce qu\'il vend, et à qui': [
        f('Des licences et des redevances à des concepteurs de puces. Arm a par exemple conclu des licences d\'architecture avec Qualcomm et avec Nuvia.', 'confirme', 'ded-opinion', 'arm-20f'),
        f('L\'Arm AGI CPU, à des opérateurs de centres de données. Meta est partenaire principal et co-développeur ; Arm cite aussi Cerebras, Cloudflare, F5, OpenAI, Positron, Rebellions, SAP et SK Telecom.', 'declaration', 'arm-agi'),
      ],
      'Ce qu\'il conçoit, ce qu\'il obtient': [
        f('Arm conçoit l\'ISA, les cœurs (Neoverse V3 pour l\'AGI CPU) et la puce. La fabrication est confiée à TSMC, en 3 nm.', 'confirme', 'arm-agi'),
        f('Les serveurs sont construits par des partenaires : ASRock Rack, Lenovo, Quanta Computer et Supermicro.', 'declaration', 'arm-agi'),
      ],
      'Modèle économique': [
        f('Licences (paiements initiaux) et redevances par puce expédiée. Les processeurs d\'applications mobiles représentaient environ 43 % des redevances sur l\'exercice clos en mars 2026.', 'confirme', 'arm-20f'),
        f('Chiffre d\'affaires de 1,44 Md$ au trimestre clos le 30/09/2026, en hausse de 27 % sur un an.', 'confirme', 'arm-q2fy27'),
        f('Arm dit viser jusqu\'à 2 Md$ de revenus AGI CPU cumulés sur ses exercices 2027 et 2028.', 'declaration', 'futurum-q2', 'arm-q2fy27'),
        f('Détail des formules de licence (architecture, technologie, Total Access, Flexible Access) : descriptions reprises du rapport initial, pages Arm non rouvertes.', 'nonverifie', 'arm-licences', 'arm-total-access'),
      ],
      'Dépendances majeures': [
        f('Concentration clients : Arm China pèse environ 16 % du chiffre d\'affaires de l\'exercice 2026 et les cinq premiers clients environ 57 %.', 'confirme', 'arm-20f'),
        f('Arm écrit dans son rapport annuel que des clients historiques peuvent désormais subir sa concurrence directe sur certains segments et chercher d\'autres architectures.', 'confirme', 'arm-20f'),
        f('Qualcomm représenterait 9 % du chiffre d\'affaires de l\'exercice 2026.', 'nonverifie', 'arm-20f'),
        f('TSMC pour la fabrication de l\'AGI CPU.', 'confirme', 'arm-agi'),
      ],
    },
    produits: [
      { nom: 'Arm AGI CPU', stade: 'silicium', detail: 'Annoncé le 24/03/2026. Jusqu\'à 136 cœurs Neoverse V3, 300 W, TSMC 3 nm. Arm déclare avoir livré de premiers exemplaires à plusieurs clients (juillet 2026). Premières livraisons commerciales annoncées pour le 4ᵉ trimestre de son exercice 2027, soit janvier-mars 2027.', s: 'declaration', src: ['arm-agi', 'arm-q1fy27', 'futurum-q2'] },
    ],
    dossier: 'dossier-arm',
  },
  // ---------- IP RISC-V ----------
  {
    id: 'sifive', nom: 'SiFive', type: 'entreprise', fiche: 'complete', archi: ['riscv'], segments: ['datacenter', 'embarque'],
    roles: [{ couche: 'ip', label: 'Fournisseur d\'IP CPU RISC-V' }],
    resume: 'Entreprise privée qui conçoit des cœurs RISC-V et les licencie à des concepteurs de puces. Elle ne vend pas de puces en volume.',
    faits: {
      'Rôle exact': [f('Vend de l\'IP de processeur RISC-V. Se présente comme la référence de ce marché.', 'declaration', 'sifive-g')],
      'Ce qu\'il vend, et à qui': [
        f('Des licences de cœurs et d\'IP de calcul (scalaire, vectoriel, matriciel) à des concepteurs de puces. La feuille de route annoncée vise les centres de données.', 'declaration', 'sifive-g'),
        f('A annoncé en janvier 2026 l\'intégration de l\'interconnexion NVLink Fusion de Nvidia dans ses futurs designs.', 'declaration', 'dcd-sifive'),
      ],
      'Ce qu\'il conçoit, ce qu\'il obtient': [f('Conçoit ses microarchitectures. L\'ISA est le standard ouvert RISC-V ; la fabrication relève de ses clients.', 'confirme', 'sifive-g')],
      'Modèle économique': [
        f('Licences d\'IP. La part des redevances n\'est pas publiée.', 'nonverifie', 'sifive-g'),
        f('Levée de 400 M$ (série G) annoncée le 9 avril 2026, menée par Atreides Management avec Nvidia, Apollo, Point72 Turion, T. Rowe Price, Prosperity7 et Sutter Hill.', 'confirme', 'sifive-g', 'dcd-sifive'),
        f('Valorisation de 3,65 Md$ selon l\'entreprise.', 'declaration', 'sifive-g'),
      ],
      'Dépendances majeures': [f('Dépend des lancements de puces de ses licenciés et de la maturité du logiciel RISC-V. Aucun dépôt d\'introduction en bourse n\'a été trouvé.', 'hypothese', 'ground-sifive')],
    },
  },
  {
    id: 'andes', nom: 'Andes Technology', type: 'entreprise', fiche: 'complete', archi: ['riscv'], segments: ['embarque', 'datacenter'],
    roles: [{ couche: 'ip', label: 'Fournisseur d\'IP CPU RISC-V' }],
    resume: 'Fournisseur taïwanais coté de cœurs RISC-V, du microcontrôleur au cluster multicœur.',
    faits: {
      'Rôle exact': [f('Fournisseur d\'IP CPU RISC-V. Son PDG, Frankwell Lin, s\'exprime au nom de l\'entreprise dans le communiqué de ratification de RVA23.', 'confirme', 'riscv-rva23')],
      'Ce qu\'il vend, et à qui': [f('Andes déclare avoir adopté RVA23 dans son cluster multiprocesseur AX66 à exécution dans le désordre.', 'declaration', 'riscv-rva23')],
      'Modèle économique': [f('En 2024 : environ 42 M$ de chiffre d\'affaires, dont 67 % de licences et 21 % de redevances.', 'nonverifie', 'andes-ra')],
      'Dépendances majeures': [f('Clientèle concentrée en Asie (Taïwan 38 %, Chine continentale 23 % du chiffre d\'affaires 2024).', 'nonverifie', 'andes-ra')],
    },
  },
  {
    id: 'codasip', nom: 'Codasip', type: 'entreprise', fiche: 'complete', archi: ['riscv'], segments: ['embarque'],
    roles: [{ couche: 'conception', label: 'Puces et plateformes sécurisées CHERI (depuis 2026)' }, { couche: 'eda', label: 'Outil de conception de processeurs Studio' }],
    resume: 'Ancien fournisseur d\'IP RISC-V. En 2026, Codasip a cédé cette activité à onsemi et s\'est recentré sur les architectures sécurisées CHERI.',
    faits: {
      'Rôle exact': [
        f('Mise en vente de l\'entreprise rapportée en juillet 2025.', 'confirme', 'semimedia-codasip'),
        f('Le 8 avril 2026, Codasip annonce un recentrage sur les architectures « cyber-résilientes » et la cession de son activité de cœurs RISC-V d\'entrée de gamme.', 'confirme', 'jpr-codasip-pivot'),
        f('L\'acquéreur est onsemi.', 'confirme', 'jpr-onsemi', 'xpu-codasip'),
        f('Prix rapporté : 14,5 M$.', 'nonverifie', 'jpr-onsemi', 'onsemi-10q'),
      ],
      'Ce qu\'il vend, et à qui': [f('Des processeurs, SoC et plateformes FPGA fondés sur CHERI, pour la défense et les infrastructures critiques. Codasip continue de licencier son outil Studio à onsemi.', 'confirme', 'xpu-codasip', 'jpr-codasip-pivot')],
      'Ce qu\'il conçoit, ce qu\'il obtient': [f('CHERI vient de la recherche publique (Cambridge et SRI International). Codasip figure parmi les soutiens remerciés par le projet.', 'confirme', 'cheri')],
      'Modèle économique': [f('Passage de la licence d\'IP à la vente de puces compatibles CHERI, selon l\'analyste Joseph Byrne.', 'hypothese', 'xpu-codasip')],
      'Dépendances majeures': [f('Marché de niche : la protection fine de CHERI demande de modifier les applications.', 'confirme', 'xpu-codasip')],
    },
  },
  {
    id: 'tenstorrent', nom: 'Tenstorrent', type: 'entreprise', fiche: 'complete', archi: ['riscv'], segments: ['datacenter'],
    roles: [{ couche: 'ip', label: 'Donneur de licences : CPU RISC-V et cœurs IA' }, { couche: 'conception', label: 'Puces et serveurs d\'IA (fabless)' }],
    resume: 'Double modèle : vend des cartes et serveurs d\'IA fondés sur RISC-V, et licencie ses cœurs TT-Ascalon (CPU) et Tensix (IA).',
    faits: {
      'Rôle exact': [f('Concepteur sans usine dirigé par Jim Keller, à la fois vendeur de systèmes et donneur de licences.', 'confirme', 'tt-ga', 'tt-serie-e')],
      'Ce qu\'il vend, et à qui': [
        f('Le serveur Galaxy Blackhole (32 puces Blackhole) est en disponibilité générale depuis le 28 avril 2026.', 'confirme', 'tt-ga', 'register-tt'),
        f('Prix annoncés : environ 110 000 $ le serveur, 440 000 $ le groupe de quatre.', 'declaration', 'tt-ga', 'register-tt'),
        f('Licences TT-Ascalon et Tensix ; Tenstorrent nomme Samsung et LG parmi ses licenciés.', 'declaration', 'tt-serie-e'),
      ],
      'Ce qu\'il conçoit, ce qu\'il obtient': [f('Conçoit ses puces et sa pile logicielle ouverte. La fonderie de Blackhole serait Samsung.', 'nonverifie', 'tt-serie-e')],
      'Modèle économique': [f('Vente de matériel et licences d\'IP. Série E de 1,5 Md$ annoncée le 19 octobre 2026, valorisation de 6,2 Md$ après opération.', 'confirme', 'tt-serie-e')],
      'Dépendances majeures': [f('Capacité de production en volume et adoption par les licenciés.', 'hypothese', 'tt-serie-e')],
    },
    produits: [
      { nom: 'Galaxy Blackhole', stade: 'commercialise', detail: 'Disponibilité générale annoncée le 28/04/2026.', s: 'confirme', src: ['tt-ga'] },
      { nom: 'TT-Ascalon S', stade: 'annonce', detail: 'IP annoncée le 30/06/2026 ; puces de licenciés non documentées.', s: 'nonverifie', src: ['tt-ascalon-s'] },
    ],
  },
  {
    id: 'gf', nom: 'GlobalFoundries (MIPS)', type: 'entreprise', fiche: 'courte', archi: ['riscv'], segments: ['embarque'],
    roles: [{ couche: 'fabrication', label: 'Fonderie' }, { couche: 'ip', label: 'IP processeur via MIPS et ARC' }],
    resume: 'Fonderie qui possède aussi de l\'IP de processeur : MIPS, puis l\'activité ARC rachetée à Synopsys.',
    faits: {
      'Rôle': [
        f('Acquisition de l\'activité ARC Processor IP de Synopsys finalisée le 2 juin 2026 et réunie avec MIPS.', 'confirme', 'gf-arc'),
        f('L\'ensemble revendique plus de 150 brevets et plus de 300 clients licenciés.', 'declaration', 'gf-arc'),
      ],
    },
  },
  {
    id: 'onsemi', nom: 'onsemi', type: 'entreprise', fiche: 'courte', archi: ['riscv'], segments: ['embarque'],
    roles: [{ couche: 'conception', label: 'Fabricant de puces (auto, industriel)' }, { couche: 'fabrication', label: 'Fabricant intégré' }],
    resume: 'Fabricant de semi-conducteurs pour l\'automobile et l\'industrie. A repris en 2026 les cœurs RISC-V de Codasip.',
    faits: { 'Rôle': [f('Acquéreur de l\'activité de cœurs RISC-V de Codasip. L\'usage attendu est interne et pour ses clients ASIC, selon un analyste.', 'hypothese', 'xpu-codasip')] },
  },
  // ---------- Conception ----------
  {
    id: 'amd', nom: 'AMD', type: 'entreprise', fiche: 'complete', archi: ['x86'], segments: ['datacenter', 'pc', 'hpc', 'embarque'],
    roles: [{ couche: 'conception', label: 'Concepteur sans usine (CPU x86, GPU, FPGA)' }, { couche: 'standards', label: 'Co-pilote du x86 EAG' }],
    resume: 'Conçoit des processeurs x86, des GPU et des FPGA, et fait fabriquer ses puces par des fonderies tierces.',
    faits: {
      'Rôle exact': [f('AMD s\'appuie sur des fonderies tierces pour ses plaquettes et sur des partenaires pour l\'assemblage et le test.', 'confirme', 'amd-10k')],
      'Ce qu\'il vend, et à qui': [f('Des puces : CPU, GPU, FPGA et SoC adaptatifs. Exemple : l\'EPYC 9755, 128 cœurs Zen 5.', 'confirme', 'amd-10k', 'futurum-signal65')],
      'Ce qu\'il conçoit, ce qu\'il obtient': [
        f('TSMC fabrique ses produits HPC, FPGA et SoC adaptatifs. GlobalFoundries fournit des plaquettes en 12 et 14 nm. Samsung et UMC sont aussi cités pour la logique programmable.', 'confirme', 'amd-10k'),
        f('Assemblage et test : deux coentreprises avec Tongfu Microelectronics, ainsi que SPIL et KYEC.', 'confirme', 'amd-10k'),
      ],
      'Modèle économique': [f('Vente de puces et de plateformes.', 'confirme', 'amd-10k')],
      'Dépendances majeures': [
        f('Fonderies tierces, en premier lieu TSMC.', 'confirme', 'amd-10k'),
        f('Accord de licence croisée avec Intel sur x86 : non retrouvé dans la partie du rapport annuel consultée.', 'nonverifie', 'amd-10k'),
      ],
    },
  },
  {
    id: 'sipearl', nom: 'SiPearl', type: 'entreprise', fiche: 'complete', archi: ['arm'], segments: ['hpc', 'datacenter'],
    roles: [{ couche: 'conception', label: 'Concepteur sans usine (CPU pour HPC)' }],
    resume: 'Concepteur français de processeurs pour supercalculateurs. Son premier produit, Rhea1, utilise des cœurs Arm sous licence et est fabriqué par TSMC.',
    faits: {
      'Rôle exact': [f('Conçoit Rhea1, processeur de 80 cœurs Arm Neoverse V1 avec mémoire HBM intégrée et interfaces DDR5.', 'declaration', 'sipearl-2024', 'sipearl-mai')],
      'Ce qu\'il vend, et à qui': [
        f('Rhea1 équipera le module cluster CPU de JUPITER, supercalculateur de EuroHPC exploité à Jülich. Les premiers exemplaires ont été livrés à l\'intégrateur Bull le 22 septembre 2026.', 'confirme', 'sipearl-presse', 'dcd-sipearl'),
        f('Cette commande est le premier revenu significatif de l\'entreprise, selon la presse.', 'nonverifie', 'dcd-sipearl'),
        f('La partition Rhea1 de JUPITER compterait 162 nœuds bi-processeurs, contre plus de 1 300 nœuds évoqués en 2024.', 'nonverifie', 'blogspan-jupiter'),
      ],
      'Ce qu\'il conçoit, ce qu\'il obtient': [
        f('Cœurs : licence Arm (Neoverse V1). Fabrication : TSMC.', 'confirme', 'sipearl-2024', 'itdaily-rhea1'),
        f('Procédé de gravure TSMC N6.', 'nonverifie', 'sipearl-rhea1'),
      ],
      'Modèle économique': [f('Vente de processeurs. Le successeur Rhea2 est annoncé pour le supercalculateur Alice Recoque.', 'declaration', 'sipearl-mai')],
      'Dépendances majeures': [
        f('Arm pour les cœurs, TSMC pour la fabrication, commandes publiques européennes.', 'confirme', 'sipearl-mai', 'itdaily-rhea1'),
        f('Calendrier : les premiers échantillons, annoncés pour 2025, sont arrivés en 2026.', 'confirme', 'sipearl-2024', 'sipearl-presse'),
      ],
    },
    produits: [{ nom: 'Rhea1', stade: 'silicium', detail: 'Première mise sous tension le 13/05/2026, échantillons livrés à Bull le 22/09/2026. Disponibilité générale annoncée pour fin 2026.', s: 'confirme', src: ['sipearl-mai', 'sipearl-presse'] }],
  },
  {
    id: 'ampere', nom: 'Ampere Computing', type: 'entreprise', fiche: 'courte', archi: ['arm'], segments: ['datacenter'],
    roles: [{ couche: 'conception', label: 'Concepteur sans usine (CPU serveurs Arm)' }],
    resume: 'Concepteur de processeurs serveurs Arm, filiale à 100 % de SoftBank depuis novembre 2025.',
    faits: { 'Rôle': [f('SoftBank a finalisé le 25 novembre 2025 l\'achat d\'Ampere pour 6,5 Md$. SoftBank contrôle aussi Arm.', 'confirme', 'bloomberg-ampere', 'evertiq-ampere', 'arm-20f')] },
  },
  {
    id: 'qualcomm', nom: 'Qualcomm', type: 'entreprise', fiche: 'courte', archi: ['arm'], segments: ['mobile', 'pc'],
    roles: [{ couche: 'conception', label: 'Concepteur sans usine (SoC mobiles et PC)' }],
    resume: 'Licencié d\'architecture Arm qui conçoit ses propres cœurs depuis le rachat de Nuvia. En litige avec Arm depuis 2022.',
    faits: { 'Rôle': [f('Qualcomm et Nuvia détenaient chacun une licence d\'architecture Arm. Arm a résilié celle de Nuvia au 1er mars 2022, après le rachat de Nuvia par Qualcomm.', 'confirme', 'ded-opinion')] },
  },
  {
    id: 'meta', nom: 'Meta', type: 'entreprise', fiche: 'courte', archi: ['arm'], segments: ['datacenter'],
    roles: [{ couche: 'conception', label: 'Opérateur qui conçoit ses accélérateurs (MTIA)' }],
    resume: 'Opérateur de centres de données. Partenaire principal et co-développeur de l\'Arm AGI CPU, qu\'il déploie avec ses accélérateurs MTIA.',
    faits: { 'Rôle': [f('Arm désigne Meta comme partenaire principal et client de l\'AGI CPU, avec une collaboration prévue sur plusieurs générations.', 'declaration', 'arm-agi', 'arm-agi-blog')] },
  },
  {
    id: 'nvidia', nom: 'Nvidia', type: 'entreprise', fiche: 'courte', archi: ['arm', 'riscv'], segments: ['datacenter', 'pc'],
    roles: [{ couche: 'conception', label: 'Concepteur sans usine (GPU, systèmes d\'IA)' }],
    resume: 'Concepteur de GPU et de systèmes d\'IA. Apparaît ici pour ses liens : investisseur de SiFive, soutien public de l\'AGI CPU d\'Arm.',
    faits: { 'Rôle': [
      f('Investisseur de la série G de SiFive (avril 2026).', 'confirme', 'sifive-g', 'dcd-sifive'),
      f('Cité par Arm parmi les soutiens de l\'AGI CPU.', 'declaration', 'arm-agi'),
      f('Aurait investi 5 Md$ dans Intel fin 2025.', 'nonverifie', 'intel-ra'),
    ] },
  },
  // ---------- Fabricants intégrés et fonderies ----------
  {
    id: 'intel', nom: 'Intel', type: 'entreprise', fiche: 'complete', archi: ['x86'], segments: ['datacenter', 'pc', 'hpc'],
    roles: [
      { couche: 'standards', label: 'Propriétaire de l\'ISA x86, co-pilote du x86 EAG' },
      { couche: 'conception', label: 'Concepteur de CPU x86' },
      { couche: 'fabrication', label: 'Fabricant intégré et fonderie (Intel Foundry)' },
    ],
    resume: 'Conçoit et fabrique ses processeurs x86, et propose ses usines à des tiers via Intel Foundry.',
    faits: {
      'Rôle exact': [
        f('Intel se décrit comme la seule entreprise menant R&D et fabrication de logique de pointe aux États-Unis.', 'declaration', 'intel-etat'),
        f('Co-fondateur avec AMD du x86 Ecosystem Advisory Group (octobre 2024).', 'confirme', 'toms-x86eag'),
      ],
      'Ce qu\'il vend, et à qui': [
        f('Des processeurs x86 et des services de fonderie. Le procédé Intel 18A ne produit pas de volumes significatifs pour des clients externes, selon la presse début 2026.', 'nonverifie', 'fool-18a'),
        f('Des puces Panther Lake gravées en 18A seraient livrées.', 'nonverifie', 'tweaktown-14a'),
      ],
      'Ce qu\'il conçoit, ce qu\'il obtient': [f('Conçoit et fabrique en interne. Le recours à TSMC pour certains produits est rapporté par le rapport initial.', 'nonverifie', 'intel-ra')],
      'Modèle économique': [f('Vente de puces et services de fonderie.', 'confirme', 'intel-etat')],
      'Dépendances majeures': [
        f('L\'État américain a acquis 433,3 millions d\'actions à 20,47 $, soit 9,9 % du capital (8,9 Md$), sans siège au conseil. Annonce du 22 août 2025.', 'confirme', 'intel-etat'),
        f('Le procédé suivant, 14A, dépend de l\'engagement de clients externes. Son calendrier diffère selon les sources : prêt en 2027, ou production à risque en 2028.', 'nonverifie', 'trendforce-14a', 'tweaktown-14a'),
      ],
    },
    produits: [{ nom: 'Intel 14A', stade: 'annonce', detail: 'En développement ; calendrier et clients non confirmés.', s: 'nonverifie', src: ['trendforce-14a', 'tweaktown-14a'] }],
  },
  {
    id: 'samsung', nom: 'Samsung Electronics', type: 'entreprise', fiche: 'complete', archi: ['arm', 'riscv'], segments: ['mobile', 'datacenter'],
    roles: [{ couche: 'conception', label: 'Concepteur de SoC Exynos (System LSI)' }, { couche: 'fabrication', label: 'Fabricant intégré et fonderie (Samsung Foundry)' }],
    resume: 'Conçoit ses SoC Exynos, fabrique de la mémoire, et grave des puces pour des tiers via Samsung Foundry.',
    faits: {
      'Rôle exact': [f('L\'Exynos 2600 est conçu par la division System LSI et fabriqué par Samsung Foundry en 2 nm GAA. Samsung l\'affiche « en production de masse » depuis décembre 2025.', 'confirme', 'asiae-exynos')],
      'Ce qu\'il vend, et à qui': [
        f('Fonderie pour des tiers : AMD cite Samsung parmi ses fondeurs pour la logique programmable.', 'confirme', 'amd-10k'),
        f('Contrats 2 nm avec des clients externes (Tesla, autres) rapportés par le rapport initial.', 'nonverifie'),
      ],
      'Ce qu\'il conçoit, ce qu\'il obtient': [f('Tenstorrent nomme Samsung parmi les licenciés de ses cœurs TT-Ascalon et Tensix.', 'declaration', 'tt-serie-e')],
      'Modèle économique': [f('Vente de puces et de mémoire, services de fonderie.', 'confirme', 'asiae-exynos')],
      'Dépendances majeures': [f('La fonderie sert des clients qui peuvent concurrencer les produits Exynos de la même entreprise.', 'hypothese')],
    },
    produits: [{ nom: 'Exynos 2600 (procédé 2 nm GAA)', stade: 'commercialise', detail: 'Statut « mass production » sur le site de Samsung (19/12/2025).', s: 'confirme', src: ['asiae-exynos'] }],
  },
  {
    id: 'tsmc', nom: 'TSMC', type: 'entreprise', fiche: 'complete', archi: [], segments: ['datacenter', 'mobile', 'pc', 'hpc', 'embarque'],
    roles: [{ couche: 'fabrication', label: 'Fonderie pure' }, { couche: 'packaging', label: 'Packaging avancé' }],
    resume: 'Fonderie pure : fabrique les puces conçues par d\'autres et ne vend pas de produits sous sa marque.',
    faits: {
      'Rôle exact': [f('Fabrique pour des concepteurs concurrents entre eux : l\'AGI CPU d\'Arm en 3 nm, les produits HPC d\'AMD, le Rhea1 de SiPearl.', 'confirme', 'arm-agi', 'amd-10k', 'itdaily-rhea1')],
      'Ce qu\'il vend, et à qui': [f('Le procédé N2 (2 nm, premiers transistors nanosheet de TSMC) est en production de volume depuis le 4ᵉ trimestre 2025.', 'confirme', 'tsmc-n2')],
      'Ce qu\'il conçoit, ce qu\'il obtient': [f('Conçoit ses procédés de fabrication, pas de puces. Les calendriers des nœuds suivants (N2P, A16) n\'ont pas été rouverts.', 'nonverifie', 'tsmc-n2-page')],
      'Modèle économique': [f('Vente de plaquettes gravées et de services de packaging.', 'confirme', 'tsmc-n2')],
      'Dépendances majeures': [f('Partenariat de packaging avec Amkor en Arizona, selon le rapport initial.', 'nonverifie', 'amkor-10k')],
    },
    produits: [{ nom: 'Procédé N2', stade: 'commercialise', detail: 'Production de volume depuis le T4 2025.', s: 'confirme', src: ['tsmc-n2'] }],
  },
  // ---------- EDA ----------
  {
    id: 'synopsys', nom: 'Synopsys', type: 'entreprise', fiche: 'complete', archi: [], segments: ['outils'],
    roles: [{ couche: 'eda', label: 'Éditeur EDA et simulation' }, { couche: 'ip', label: 'IP d\'interface et de fondation (plus d\'IP CPU depuis juin 2026)' }],
    resume: 'Éditeur de logiciels de conception de puces, de simulation (Ansys) et fournisseur d\'IP. A cédé son IP de processeur ARC en 2026.',
    faits: {
      'Rôle exact': [
        f('Deux segments : Design Automation (EDA et simulation Ansys) et Design IP (interfaces, mémoires et logique, sécurité, automobile).', 'confirme', 'synopsys-10k'),
        f('La fusion avec Ansys a été finalisée en juillet 2025.', 'confirme', 'synopsys-10k'),
        f('L\'activité ARC Processor IP a été cédée à GlobalFoundries le 2 juin 2026. Synopsys conserve son IP d\'interface et de fondation.', 'confirme', 'gf-arc'),
      ],
      'Ce qu\'il vend, et à qui': [f('Des outils à l\'ensemble des concepteurs et fonderies, y compris à des entreprises concurrentes entre elles.', 'confirme', 'synopsys-10k')],
      'Modèle économique': [f('Licences logicielles non exclusives, abonnements à durée déterminée, IP licenciée par design avec parfois des redevances, matériel d\'émulation vendu ou loué.', 'confirme', 'synopsys-10k')],
      'Dépendances majeures': [f('Un petit nombre de grands clients pèse lourd. Synopsys indique que des difficultés avec un grand client fonderie ont pesé sur son exercice 2025.', 'confirme', 'synopsys-10k')],
    },
  },
  {
    id: 'cadence', nom: 'Cadence', type: 'entreprise', fiche: 'complete', archi: [], segments: ['outils'],
    roles: [{ couche: 'eda', label: 'Éditeur EDA et analyse de systèmes' }, { couche: 'ip', label: 'IP de semi-conducteurs (hors cœurs CPU généralistes)' }],
    resume: 'Éditeur de logiciels de conception de puces et de systèmes, fournisseur d\'IP et de matériel d\'émulation.',
    faits: {
      'Rôle exact': [f('Trois catégories de produits : Core EDA, Semiconductor IP, System Design and Analysis.', 'confirme', 'cadence-10k')],
      'Ce qu\'il vend, et à qui': [f('A acquis en 2025 l\'activité d\'IP de fondation Artisan d\'Arm (bibliothèques de cellules, compilateurs mémoire).', 'confirme', 'cadence-10k', 'cadence-artisan')],
      'Modèle économique': [f('5 297 M$ de chiffre d\'affaires en 2025, dont 91 % en produits et maintenance. Licences logicielles surtout à durée déterminée, de deux à trois ans.', 'confirme', 'cadence-10k')],
      'Dépendances majeures': [f('Dépend des budgets de conception de ses clients ; les outils sont qualifiés procédé par procédé avec les fonderies.', 'hypothese')],
    },
  },
  // ---------- Packaging ----------
  {
    id: 'amkor', nom: 'Amkor Technology', type: 'entreprise', fiche: 'courte', archi: [], segments: ['mobile', 'datacenter', 'embarque'],
    roles: [{ couche: 'packaging', label: 'Sous-traitant d\'assemblage et de test (OSAT)' }],
    resume: 'Sous-traitant d\'assemblage et de test : met les dies en boîtier et les teste pour le compte des concepteurs.',
    faits: { 'Rôle': [
      f('Se décrit comme le plus grand OSAT ayant son siège aux États-Unis. Chiffre d\'affaires 2025 : 6 708 M$, dont 82,8 % en produits avancés.', 'confirme', 'amkor-10k'),
      f('Ses dix premiers clients pèsent 72 % du chiffre d\'affaires 2025 ; Apple 29,8 %, Qualcomm 11,1 %.', 'confirme', 'amkor-10k'),
    ] },
  },
  {
    id: 'ase', nom: 'ASE Technology', type: 'entreprise', fiche: 'courte', archi: [], segments: ['mobile', 'datacenter', 'embarque'],
    roles: [{ couche: 'packaging', label: 'Sous-traitant d\'assemblage et de test (OSAT)' }],
    resume: 'Groupe taïwanais d\'assemblage et de test, dont fait partie SPIL.',
    faits: { 'Rôle': [
      f('AMD cite SPIL parmi ses prestataires d\'assemblage et de test.', 'confirme', 'amd-10k'),
      f('Rang de premier OSAT mondial et répartition du chiffre d\'affaires : repris du rapport initial.', 'nonverifie', 'ase-20f'),
    ] },
  },
];

// Types de relation, lus dans le sens a → b.
export const TYPES_REL = {
  client: { label: 'client de', inverse: 'fournisseur de' },
  partenaire: { label: 'partenaire de', inverse: 'partenaire de' },
  concurrent: { label: 'concurrent de', inverse: 'concurrent de' },
  capital: { label: 'investisseur ou repreneur d\'activité chez', inverse: 'a pour investisseur ou repreneur' },
};
export const NIVEAUX = { isa: 'ISA', ip: 'IP CPU', puces: 'Puces', fonderie: 'Fonderie', eda: 'EDA', packaging: 'Packaging', capital: 'Capital' };

const r = (a, type, b, niveau, date, texte, s, ...src) => ({ id: `${a}-${type}-${b}-${niveau}`, a, type, b, niveau, date, texte, s, src });

export const RELATIONS = [
  r('arm', 'client', 'tsmc', 'fonderie', '2026', 'TSMC fabrique l\'Arm AGI CPU en 3 nm. Arm devient ainsi client direct d\'une fonderie, comme ses propres licenciés.', 'confirme', 'arm-agi'),
  r('meta', 'client', 'arm', 'puces', '2026-03-24', 'Meta est partenaire principal, co-développeur et premier client de l\'AGI CPU.', 'declaration', 'arm-agi', 'arm-agi-blog'),
  r('arm', 'concurrent', 'ampere', 'puces', 'depuis 2026-03', 'Arm vend désormais un processeur serveur, le marché d\'Ampere. Ampere reste licencié d\'Arm, et les deux sociétés ont le même actionnaire de contrôle, SoftBank.', 'confirme', 'arm-agi', 'bloomberg-ampere', 'arm-20f'),
  r('ampere', 'client', 'arm', 'ip', 'en cours', 'Ampere conçoit des processeurs serveurs fondés sur la technologie Arm.', 'confirme', 'bloomberg-ampere'),
  r('arm', 'concurrent', 'amd', 'puces', 'depuis 2026-03', 'Avec l\'AGI CPU, Arm se compare directement aux processeurs serveurs x86. Avant 2026, la concurrence passait par les puces de ses licenciés.', 'confirme', 'arm-agi', 'futurum-signal65'),
  r('arm', 'concurrent', 'intel', 'puces', 'depuis 2026-03', 'Même situation qu\'avec AMD : concurrence directe sur les processeurs serveurs, pas sur l\'ISA elle-même.', 'confirme', 'arm-agi'),
  r('qualcomm', 'client', 'arm', 'isa', 'en cours', 'Qualcomm détient une licence d\'architecture Arm et conçoit ses propres cœurs.', 'confirme', 'ded-opinion'),
  r('arm', 'concurrent', 'qualcomm', 'isa', '2022-2026', 'Litige contractuel, pas concurrence commerciale classique. En décembre 2024, un jury juge les cœurs issus de Nuvia couverts par la licence de Qualcomm. Le 13 octobre 2026, un second jury retient deux griefs de Qualcomm contre Arm (un dollar de dommages chacun) et donne raison à Arm sur les autres. L\'appel d\'Arm est pendant.', 'confirme', 'ded-opinion', 'bloomberg-verdict', 'justia-ca3'),
  r('sipearl', 'client', 'arm', 'ip', 'en cours', 'Rhea1 utilise 80 cœurs Arm Neoverse V1 sous licence.', 'confirme', 'sipearl-2024'),
  r('sipearl', 'client', 'tsmc', 'fonderie', '2025-2026', 'TSMC fabrique Rhea1.', 'confirme', 'itdaily-rhea1', 'igorslab-rhea1'),
  r('samsung', 'client', 'arm', 'ip', 'en cours', 'Les SoC Exynos utilisent l\'architecture Arm. Lien de licence non rouvert sur source primaire.', 'nonverifie', 'asiae-exynos'),
  r('amd', 'client', 'tsmc', 'fonderie', 'en cours', 'TSMC fabrique les produits HPC, FPGA et SoC adaptatifs d\'AMD.', 'confirme', 'amd-10k'),
  r('amd', 'client', 'gf', 'fonderie', 'en cours', 'AMD achète à GlobalFoundries des plaquettes en 12 et 14 nm.', 'confirme', 'amd-10k'),
  r('amd', 'client', 'samsung', 'fonderie', 'en cours', 'Samsung figure parmi les fondeurs d\'AMD pour la logique programmable.', 'confirme', 'amd-10k'),
  r('amd', 'client', 'ase', 'packaging', 'en cours', 'SPIL, filiale du groupe ASE, assemble et teste des produits AMD.', 'confirme', 'amd-10k'),
  r('intel', 'concurrent', 'amd', 'puces', 'en cours', 'Concurrents directs sur les processeurs x86 pour PC et serveurs.', 'confirme', 'toms-x86eag'),
  r('intel', 'partenaire', 'amd', 'isa', 'depuis 2024-10', 'Les deux rivaux coordonnent l\'évolution de x86 au sein du x86 Ecosystem Advisory Group : concurrents sur les puces, partenaires sur l\'ISA.', 'confirme', 'toms-x86eag'),
  r('intel', 'concurrent', 'tsmc', 'fonderie', 'en cours', 'Concurrence au seul niveau de la fonderie : Intel Foundry propose ses procédés à des tiers. Intel n\'est pas concurrent de TSMC sur les puces, TSMC n\'en vend pas.', 'nonverifie', 'fool-18a'),
  r('samsung', 'concurrent', 'tsmc', 'fonderie', 'en cours', 'Les deux proposent un procédé 2 nm : N2 chez TSMC, 2 nm GAA chez Samsung Foundry.', 'confirme', 'tsmc-n2', 'asiae-exynos'),
  r('samsung', 'concurrent', 'intel', 'fonderie', 'en cours', 'Concurrents comme fonderies de pointe ouvertes à des tiers.', 'nonverifie', 'fool-18a'),
  r('samsung', 'client', 'tenstorrent', 'ip', '2026', 'Tenstorrent nomme Samsung parmi les licenciés de TT-Ascalon et Tensix.', 'declaration', 'tt-serie-e'),
  r('tenstorrent', 'client', 'samsung', 'fonderie', 'non daté', 'Samsung Foundry fabriquerait les puces Blackhole. Samsung serait ainsi à la fois fournisseur et client de Tenstorrent.', 'nonverifie', 'tt-serie-e'),
  r('sifive', 'concurrent', 'andes', 'ip', 'en cours', 'Concurrents directs : tous deux licencient des cœurs RISC-V.', 'confirme', 'sifive-g', 'riscv-rva23'),
  r('sifive', 'concurrent', 'tenstorrent', 'ip', 'en cours', 'Concurrents sur l\'IP CPU RISC-V haute performance. Tenstorrent vend en plus ses propres systèmes, pas SiFive.', 'confirme', 'sifive-g', 'tt-serie-e'),
  r('sifive', 'concurrent', 'gf', 'ip', 'depuis 2026-06', 'MIPS et ARC, réunis chez GlobalFoundries, licencient aussi de l\'IP de processeur RISC-V.', 'confirme', 'gf-arc', 'sifive-g'),
  r('arm', 'concurrent', 'sifive', 'ip', 'en cours', 'Concurrence au niveau de l\'IP CPU, sur des ISA différentes. Une dépêche de la levée de fonds présente le virage d\'Arm vers les puces comme une ouverture pour SiFive.', 'hypothese', 'ground-sifive'),
  r('arm', 'concurrent', 'andes', 'ip', 'en cours', 'Concurrence au niveau de l\'IP CPU, sur des ISA différentes.', 'hypothese', 'riscv-rva23'),
  r('nvidia', 'capital', 'sifive', 'capital', '2026-04-09', 'Nvidia participe à la série G de SiFive.', 'confirme', 'sifive-g', 'dcd-sifive'),
  r('sifive', 'partenaire', 'nvidia', 'ip', '2026-01', 'SiFive annonce l\'intégration de NVLink Fusion dans ses futurs designs.', 'declaration', 'dcd-sifive'),
  r('onsemi', 'capital', 'codasip', 'ip', '2026', 'onsemi reprend l\'activité de cœurs RISC-V de Codasip et reçoit une licence de l\'outil Studio.', 'confirme', 'jpr-onsemi', 'xpu-codasip'),
  r('gf', 'capital', 'synopsys', 'ip', '2026-06-02', 'GlobalFoundries acquiert l\'activité ARC Processor IP de Synopsys.', 'confirme', 'gf-arc'),
  r('cadence', 'capital', 'arm', 'ip', '2025', 'Cadence acquiert l\'IP de fondation Artisan d\'Arm.', 'confirme', 'cadence-10k'),
  r('synopsys', 'concurrent', 'cadence', 'eda', 'en cours', 'Concurrents directs sur les logiciels EDA et l\'IP d\'interface.', 'confirme', 'synopsys-10k', 'cadence-10k'),
  r('amkor', 'partenaire', 'tsmc', 'packaging', '2024-2026', 'Accord de packaging en Arizona, selon le rapport initial.', 'nonverifie', 'amkor-10k'),
  r('qualcomm', 'client', 'amkor', 'packaging', '2025', 'Qualcomm représente 11,1 % du chiffre d\'affaires 2025 d\'Amkor.', 'confirme', 'amkor-10k'),
  r('nvidia', 'capital', 'intel', 'capital', '2025-12', 'Nvidia aurait acquis environ 4 % d\'Intel pour 5 Md$.', 'nonverifie', 'intel-ra'),
  r('riscv-intl', 'partenaire', 'andes', 'isa', 'en cours', 'Andes est membre de RISC-V International et a pris part à l\'annonce de RVA23.', 'confirme', 'riscv-rva23'),
];

export const acteur = (id) => ACTEURS.find((a) => a.id === id);
export const relationsDe = (id) => RELATIONS.filter((x) => x.a === id || x.b === id);
