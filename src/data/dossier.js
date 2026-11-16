// Dossier stratégique : « Arm commercialise sa propre puce : qu'est-ce que cela change ? »
const c = (t, s, ...src) => ({ t, s, src });

export const DOSSIER_ARM = {
  id: 'dossier-arm',
  titre: 'Arm commercialise sa propre puce : qu\'est-ce que cela change ?',
  chapo: 'Pendant trente-cinq ans, Arm a vendu des plans de processeurs sans vendre de processeurs. Le 24 mars 2026, l\'entreprise a annoncé l\'Arm AGI CPU, une puce serveur qu\'elle conçoit et vend elle-même. Ce dossier sépare ce qui est établi de ce qui reste une hypothèse.',
  enBref: [
    c('Arm a annoncé une puce serveur de sa conception, fabriquée par TSMC, avec Meta comme partenaire principal.', 'confirme', 'arm-agi'),
    c('Au 16 novembre 2026, Arm annonce ses premières livraisons commerciales pour janvier-mars 2027. Les revenus de puces restent donc à venir.', 'declaration', 'futurum-q2', 'arm-q2fy27'),
    c('Arm reconnaît dans son rapport annuel que des clients licenciés peuvent subir sa concurrence directe et se tourner vers d\'autres architectures.', 'confirme', 'arm-20f'),
    c('Aucune source consultée ne documente, à ce jour, le départ d\'un licencié à cause de cette décision.', 'nonverifie'),
  ],
  chronologie: [
    { date: '2019-09-27', titre: 'Nuvia signe une licence d\'architecture avec Arm', texte: 'La licence prévoit qu\'elle n\'est pas transférable sans l\'accord d\'Arm en cas d\'acquisition.', s: 'confirme', src: ['ded-opinion'], liens: [{ acteur: 'qualcomm' }] },
    { date: '2022-03-01', titre: 'Arm résilie la licence de Nuvia', texte: 'Arm notifie la résiliation le 1er février 2022, avec effet au 1er mars, après le rachat de Nuvia par Qualcomm. Arm assigne Qualcomm en justice en 2022.', s: 'confirme', src: ['ded-opinion', 'futurum-verdict'], liens: [{ acteur: 'qualcomm' }] },
    { date: '2024-12-20', titre: 'Premier procès : le jury donne raison à Qualcomm sur deux points', texte: 'Procès du 16 au 20 décembre 2024. Le jury juge les processeurs de Qualcomm couverts par sa propre licence, sans trancher la question de la faute de Nuvia.', s: 'confirme', src: ['ded-opinion'], liens: [{ acteur: 'qualcomm' }] },
    { date: '2025-08', titre: 'Arm cède son IP de fondation Artisan à Cadence', texte: 'Arm se sépare de ses bibliothèques de cellules et compilateurs mémoire au profit de Cadence, au cours de l\'exercice 2025 de ce dernier.', s: 'confirme', src: ['cadence-10k'], liens: [{ acteur: 'cadence' }] },
    { date: '2025-10-07', titre: 'Arm fait appel du premier jugement', texte: 'L\'appel est enregistré devant la cour d\'appel fédérale du troisième circuit.', s: 'confirme', src: ['justia-ca3'], liens: [{ acteur: 'qualcomm' }] },
    { date: '2025-11-25', titre: 'SoftBank finalise le rachat d\'Ampere', texte: 'L\'actionnaire de contrôle d\'Arm détient désormais aussi, à 100 %, un concepteur de processeurs serveurs Arm, pour 6,5 Md$.', s: 'confirme', src: ['bloomberg-ampere', 'evertiq-ampere'], liens: [{ acteur: 'ampere' }] },
    { date: '2026-03-24', titre: 'Arm annonce l\'AGI CPU', texte: 'Jusqu\'à 136 cœurs Neoverse V3, 300 W, fabrication TSMC en 3 nm. Meta est partenaire principal ; Arm cite huit autres clients et plus de 50 entreprises en soutien, dont AWS, Google, Microsoft et Nvidia.', s: 'confirme', src: ['arm-agi', 'arm-agi-blog'], liens: [{ acteur: 'arm' }, { acteur: 'meta' }, { acteur: 'tsmc' }] },
    { date: '2026-04-09', titre: 'SiFive lève 400 M$', texte: 'Une dépêche de l\'annonce présente le virage d\'Arm vers les puces comme une ouverture pour les plans personnalisables de SiFive.', s: 'hypothese', src: ['sifive-g', 'ground-sifive'], liens: [{ acteur: 'sifive' }] },
    { date: '2026-07-29', titre: 'Arm dit avoir livré de premiers exemplaires', texte: 'Lors de sa conférence de résultats, la direction indique que du « produit initial » a été remis à plusieurs clients.', s: 'declaration', src: ['arm-q1fy27'], liens: [{ acteur: 'arm' }] },
    { date: '2026-10-13', titre: 'Second procès : verdict partagé', texte: 'Un jury du Delaware retient qu\'Arm a manqué à sa licence d\'architecture avec Qualcomm et a perturbé sa relation avec Meta, pour un dollar de dommages par grief, et donne raison à Arm sur les autres griefs. Des questions restent à trancher par la juge.', s: 'confirme', src: ['bloomberg-verdict', 'futurum-verdict'], liens: [{ acteur: 'qualcomm' }, { acteur: 'meta' }] },
    { date: '2026-10-13', titre: 'Arm publie une étude de performance commandée à Signal65', texte: 'Résultat mis en avant : 1,99 fois le travail par baie d\'un système AMD EPYC 9755, sur sept charges. Les résultats par baie sont modélisés à partir d\'hypothèses de puissance. Par puce, la moyenne est de 1,20 et AMD l\'emporte sur deux charges.', s: 'estimation', src: ['futurum-signal65', 'magica-signal65', 'arm-bench'], liens: [{ pub: 'signal65-2026' }, { acteur: 'amd' }] },
    { date: '2026-11-04', titre: 'Arm maintient son calendrier', texte: 'Arm se dit plus confiant dans un revenu AGI CPU allant jusqu\'à 2 Md$ sur ses exercices 2027-2028, avec des premières livraisons commerciales au 4ᵉ trimestre de l\'exercice 2027. Oracle prévoit des instances en 2027.', s: 'declaration', src: ['arm-q2fy27', 'futurum-q2'], liens: [{ acteur: 'arm' }] },
  ],
  // Chaîne de valeur : qui tient quel étage, avant et après.
  chaine: {
    etages: [
      { id: 'isa', nom: 'Jeu d\'instructions', notion: 'ISA' },
      { id: 'coeur', nom: 'Cœurs et sous-systèmes (IP)', notion: 'IP réutilisable' },
      { id: 'puce', nom: 'Conception et vente de la puce', notion: 'SoC' },
      { id: 'fab', nom: 'Fabrication', notion: 'Nœud de fabrication' },
      { id: 'systeme', nom: 'Serveurs', notion: 'Package' },
      { id: 'exploitant', nom: 'Exploitation en centre de données' },
    ],
    avant: {
      isa: [{ qui: 'Arm', arm: true }],
      coeur: [{ qui: 'Arm', arm: true }, { qui: 'Licenciés d\'architecture (Qualcomm…)' }],
      puce: [{ qui: 'Licenciés : Ampere, opérateurs de cloud, SiPearl…' }],
      fab: [{ qui: 'Fonderies choisies par les licenciés' }],
      systeme: [{ qui: 'Constructeurs de serveurs' }],
      exploitant: [{ qui: 'Opérateurs de cloud, entreprises' }],
    },
    apres: {
      isa: [{ qui: 'Arm', arm: true }],
      coeur: [{ qui: 'Arm', arm: true }, { qui: 'Licenciés d\'architecture (Qualcomm…)' }],
      puce: [{ qui: 'Arm (AGI CPU)', arm: true, nouveau: true }, { qui: 'Licenciés : Ampere, opérateurs de cloud, SiPearl…' }],
      fab: [{ qui: 'TSMC, pour le compte d\'Arm', nouveau: true }, { qui: 'Fonderies choisies par les licenciés' }],
      systeme: [{ qui: 'ASRock Rack, Lenovo, Quanta, Supermicro autour de l\'AGI CPU', nouveau: true }, { qui: 'Constructeurs de serveurs' }],
      exploitant: [{ qui: 'Meta et clients annoncés de l\'AGI CPU', nouveau: true }, { qui: 'Opérateurs de cloud, entreprises' }],
    },
    etabli: [
      c('Arm occupe un étage de plus : la conception et la vente de la puce.', 'confirme', 'arm-agi'),
      c('Arm devient client direct de TSMC et s\'appuie sur des constructeurs de serveurs partenaires.', 'confirme', 'arm-agi'),
      c('Arm maintient ses deux autres offres, IP et CSS, et a lancé un nouveau CSS (Neoverse CSS N4) après l\'AGI CPU.', 'confirme', 'arm-css-n4'),
    ],
    hypotheses: [
      c('Arm capterait plus de valeur par unité : selon des propos du directeur financier rapportés par la presse, une puce finie rapporterait environ 500 $ de marge brute, contre quelques cents de redevance, mais avec une marge brute d\'environ 50 %, bien inférieure à celle des licences.', 'nonverifie', 'implicator'),
      c('Objectif évoqué par le PDG selon la presse : environ 15 Md$ de revenus de puces à cinq ans.', 'nonverifie', 'implicator'),
      c('Les licenciés qui vendent des puces serveurs à des tiers seraient plus exposés que les opérateurs de cloud qui conçoivent pour leur propre usage.', 'hypothese', 'implicator'),
    ],
  },
  tensions: [
    { a: 'arm', b: 'ampere', titre: 'Arm et Ampere', texte: 'Ampere vend des processeurs serveurs Arm à des tiers : c\'est le licencié le plus directement concurrencé. Les deux sociétés sont contrôlées par SoftBank, ce qui peut atténuer ou au contraire organiser cette concurrence.', s: 'hypothese', src: ['implicator', 'bloomberg-ampere', 'arm-20f'] },
    { a: 'arm', b: 'meta', titre: 'Arm et les opérateurs qui conçoivent leurs puces', texte: 'AWS, Google et Microsoft, qui conçoivent leurs propres puces Arm, ont publiquement soutenu l\'annonce. Meta, lui, co-développe la puce d\'Arm. Fournisseur d\'IP d\'un côté, fournisseur de puces de l\'autre : la même relation change de nature selon le client.', s: 'confirme', src: ['arm-agi', 'implicator'] },
    { a: 'arm', b: 'qualcomm', titre: 'Arm et Qualcomm', texte: 'La relation était déjà conflictuelle avant l\'AGI CPU. Qualcomm est le seul grand licencié à ne pas avoir publié de soutien lors de l\'annonce, selon Implicator. Le second jury a retenu en octobre 2026 qu\'Arm avait perturbé la relation de Qualcomm avec Meta.', s: 'confirme', src: ['implicator', 'bloomberg-verdict'] },
    { a: 'arm', b: 'amd', titre: 'Arm face à Intel et AMD', texte: 'La concurrence devient frontale : Arm compare lui-même sa puce à un processeur AMD nommé. Auparavant, cette comparaison était portée par ses licenciés.', s: 'confirme', src: ['futurum-signal65', 'arm-bench'] },
    { a: 'arm', b: 'tsmc', titre: 'Arm et TSMC', texte: 'Nouvelle relation client-fournisseur. Arm entre en concurrence avec ses propres licenciés pour la capacité de production et la mémoire, que son PDG dit avoir sécurisées.', s: 'hypothese', src: ['futurum-q2'] },
  ],
  implications: [
    { pour: 'Clients licenciés', points: [
      c('Une voie de plus : acheter une puce finie plutôt que financer une conception.', 'declaration', 'arm-agi', 'arm-css-n4'),
      c('Un risque que le fournisseur d\'IP arbitre en faveur de sa propre puce (feuille de route, prix, accès aux nouveautés).', 'hypothese', 'arm-20f'),
    ] },
    { pour: 'Fournisseurs d\'IP concurrents', points: [
      c('Un argument commercial de neutralité : un fournisseur d\'IP qui ne vend pas de puces ne concurrence pas ses clients.', 'hypothese', 'ground-sifive'),
      c('Cet argument a une limite : Tenstorrent, dans le camp RISC-V, vend lui aussi des systèmes tout en licenciant ses cœurs.', 'confirme', 'tt-serie-e', 'tt-ga'),
    ] },
    { pour: 'Acteurs RISC-V', points: [
      c('Les investisseurs financent la thèse d\'une alternative : 400 M$ pour SiFive en avril 2026, 1,5 Md$ pour Tenstorrent en octobre 2026.', 'confirme', 'sifive-g', 'tt-serie-e'),
      c('La même année, Codasip a quitté la licence d\'IP RISC-V, signe que la valeur ne se trouve pas dans le cœur de base.', 'confirme', 'xpu-codasip', 'jpr-onsemi'),
      c('Aucun basculement d\'un grand licencié Arm vers RISC-V n\'est documenté dans les sources consultées.', 'nonverifie'),
    ] },
  ],
  contradictoire: [
    { these: 'Les clients y voient une offre de plus, pas une menace', arguments: [
      c('Plus de 50 entreprises, dont des licenciés majeurs, ont soutenu publiquement l\'annonce.', 'confirme', 'arm-agi'),
      c('Lecture d\'Implicator : la demande de processeurs pour l\'IA dépasse l\'offre d\'Intel et d\'AMD ; la puce d\'Arm est reçue comme de la capacité supplémentaire. Les opérateurs de cloud, qui conçoivent déjà leurs puces, ont peu à perdre.', 'hypothese', 'implicator'),
    ] },
    { these: 'Arm a renoncé à sa neutralité', arguments: [
      c('Arm l\'écrit lui-même parmi ses facteurs de risque : des clients peuvent réduire ou cesser leur relation et chercher d\'autres architectures.', 'confirme', 'arm-20f'),
      c('Risques d\'exécution relevés par la presse : Arm n\'a jamais livré de puce en volume ni géré une chaîne d\'approvisionnement matérielle.', 'hypothese', 'implicator'),
      c('La thèse dépend d\'une forte demande de processeurs pour l\'IA « agentique », qui reste une prévision.', 'hypothese', 'implicator'),
    ] },
  ],
  incertitudes: [
    c('Les livraisons commerciales n\'ont pas commencé au 16/11/2026 : calendrier annoncé, pas réalisé.', 'declaration', 'futurum-q2'),
    c('« Jusqu\'à 2 Md$ » de revenus est une attente de la direction, pas un carnet de commandes publié.', 'declaration', 'arm-q2fy27', 'futurum-q2'),
    c('Les performances par baie publiées sont modélisées et l\'étude est commandée par Arm. En dimensionnant la mémoire par cœur physique plutôt que par fil d\'exécution, la moyenne passe de 1,99 à environ 1,81. La comparaison vise la génération actuelle d\'AMD, pas la suivante.', 'estimation', 'futurum-signal65', 'magica-signal65'),
    c('L\'appel d\'Arm dans la première affaire Qualcomm et les décisions de la juge après le second verdict ne sont pas rendus.', 'confirme', 'justia-ca3', 'bloomberg-verdict'),
    c('Part de Qualcomm dans le chiffre d\'affaires d\'Arm : chiffre du rapport initial non retrouvé.', 'nonverifie', 'arm-20f'),
    c('Effet réel sur les licenciés : aucune donnée publique ne permet encore de le mesurer.', 'nonverifie'),
  ],
  notions: ['ISA', 'IP réutilisable', 'Cœur de processeur', 'SoC', 'Nœud de fabrication'],
  pubs: ['arm-agi-2026', 'arm-20f-2026', 'signal65-2026', 'implicator-2026', 'ded-2025', 'byrne-2026'],
};
