// Registre des sources. `audit: true` = source rouverte lors de l'audit du 16/11/2026
// (page ou extrait consulté). `audit: false` = référence reprise du rapport de recherche
// initial, non rouverte : les affirmations qui n'ont que ce type de source sont affichées
// comme « non vérifiées ».
export const DATE_VERIF = '2026-11-16';

export const STATUTS = {
  confirme: { label: 'Fait confirmé', court: 'Confirmé', aide: 'Établi par une source primaire ou par plusieurs sources concordantes, rouvertes lors de l\'audit.' },
  declaration: { label: 'Déclaration d\'un fabricant', court: 'Déclaration', aide: 'Affirmé par l\'entreprise concernée ; non vérifié de façon indépendante.' },
  experimental: { label: 'Résultat expérimental', court: 'Expérimental', aide: 'Mesuré dans une étude dont la méthode et les limites sont décrites.' },
  estimation: { label: 'Estimation ou modélisation', court: 'Estimation', aide: 'Calculé à partir d\'hypothèses, pas mesuré directement.' },
  hypothese: { label: 'Hypothèse stratégique', court: 'Hypothèse', aide: 'Lecture ou scénario plausible, non établi par les faits.' },
  nonverifie: { label: 'Information non vérifiée', court: 'Non vérifié', aide: 'Rapporté par une source secondaire ou repris du rapport initial sans avoir été rouvert.' },
};

const S = (id, titre, editeur, date, url, nature, audit) => ({ id, titre, editeur, date, url, nature, audit });

export const SOURCES = Object.fromEntries([
  // Arm
  S('arm-agi', 'Arm expands compute platform to silicon products in historic company first', 'Arm (communiqué)', '2026-03-24', 'https://newsroom.arm.com/news/arm-agi-cpu-launch', 'primaire', true),
  S('arm-agi-blog', 'Announcing Arm AGI CPU', 'Arm (blog, M. Awad)', '2026-03-24', 'https://newsroom.arm.com/blog/introducing-arm-agi-cpu', 'primaire', true),
  S('arm-q1fy27', 'Arm Q1 FY2027 earnings call (transcription)', 'Arm, via roic.ai', '2026-07-29', 'https://www.roic.ai/quote/ARM/transcripts', 'secondaire', true),
  S('arm-q2fy27', 'Arm delivers a record second quarter (Q2 FYE27)', 'Arm (communiqué)', '2026-11-04', 'https://newsroom.arm.com/news/arm-q2-fye27-results', 'primaire', true),
  S('arm-css-n4', 'Arm expands AI infrastructure with AGI CPU and Neoverse CSS N4', 'Arm (communiqué)', '2026', 'https://newsroom.arm.com/news/arm-agi-cpu-neoverse-css-n4-agentic-ai', 'primaire', true),
  S('arm-bench', 'Arm introduces a new CPU evaluation methodology', 'Arm (communiqué)', '2026-10', 'https://newsroom.arm.com/news/arm-agi-cpu-agentic-benchmarks', 'primaire', true),
  S('arm-20f', 'Arm Holdings plc, Form 20-F, exercice clos le 31/03/2026', 'SEC EDGAR', '2026', 'https://www.sec.gov/Archives/edgar/data/0001973239/000197323926000097/arm-20260331.htm', 'primaire', true),
  S('arm-licences', 'Arm licensing models', 'Arm (blog)', '', 'https://newsroom.arm.com/blog/arm-licensing-models', 'primaire', false),
  S('arm-total-access', 'Arm Total Access FAQs', 'Arm', '', 'https://www.arm.com/products/licensing/arm-total-access/faqs', 'primaire', false),
  S('futurum-signal65', 'Arm AGI CPU Posts 2x the Agentic Work Per Rack of AMD\'s EPYC 9755 at OCP 2026', 'Futurum Group (B. Burke)', '2026-10-13', 'https://futurumgroup.com/insights/arm-agi-cpu-posts-2x-the-agentic-work-per-rack-of-amds-epyc-9755-at-ocp-2026/', 'secondaire', true),
  S('magica-signal65', 'Arm agentic CPU tests report 1.99× modeled rack performance', 'Magica', '2026-10', 'https://magica.com/news/arm-agentic-cpu-benchmark-modeled-rack-performance', 'secondaire', true),
  S('futurum-q2', 'Arm Q2 FY 2027: AGI CPU Orders Expand Data Center Opportunity', 'Futurum Research', '2026-11-06', 'https://futurumgroup.com/?p=97611', 'secondaire', true),
  S('implicator', 'Arm Abandoned Neutrality. Its Biggest Customers Cheered.', 'Implicator.ai (M. Schuler)', '2026-03-25', 'https://www.implicator.ai/arm-abandoned-neutrality-its-biggest-customers-cheered/', 'secondaire', true),
  S('cadence-artisan', 'Cadence completes acquisition of Arm Artisan foundation IP', 'Cadence (communiqué)', '2025-08-27', 'https://www.cadence.com/en_US/home/company/newsroom/press-releases/pr/2025/cadence-completes-acquisition-of-arm-artisan-foundation-ip.html', 'primaire', false),
  // Arm / Qualcomm
  S('ded-opinion', 'Arm Ltd. v. Qualcomm Inc., C.A. 22-1146, memorandum opinion', 'U.S. District Court, D. Delaware', '2025', 'https://www.ded.uscourts.gov/sites/ded/files/opinions/22-1146.pdf', 'primaire', true),
  S('justia-ca3', 'Arm Ltd. v. Qualcomm Inc., 3rd Cir. n° 25-2923 (registre)', 'Justia Dockets', '2025-10-07', 'https://dockets.justia.com/docket/circuit-courts/ca3/25-2923', 'primaire', true),
  S('bloomberg-verdict', 'Qualcomm Gets Mixed Jury Verdict in Licensing Feud With Arm', 'Bloomberg Law', '2026-10-13', 'https://news.bgov.com/mergers-and-acquisitions/qualcomm-wins-mixed-jury-verdict-in-licensing-feud-with-arm', 'secondaire', true),
  S('futurum-verdict', 'Qualcomm Wins Liability Verdict Against Arm', 'Futurum Group (O. Blanchard)', '2026-10-27', 'https://futurumgroup.com/?p=97135', 'secondaire', true),
  // SoftBank / Ampere
  S('bloomberg-ampere', 'SoftBank Completes Acquisition of Chipmaker Ampere Computing', 'Bloomberg', '2025-11-26', 'https://www.bloomberg.com/news/articles/2025-11-26/softbank-completes-acquisition-of-chipmaker-ampere-computing', 'secondaire', true),
  S('evertiq-ampere', 'SoftBank has completed its acquisition of Ampere', 'Evertiq', '2025-12-05', 'https://evertiq.com/design/2025-12-05-softbank-has-completed-its-acquisition-of-ampere', 'secondaire', true),
  // RISC-V
  S('riscv-rva23', 'RISC-V Announces Ratification of the RVA23 Profile Standard', 'RISC-V International', '2024-10-21', 'https://riscv.org/blog/risc-v-announces-ratification-of-the-rva23-profile-standard/', 'primaire', true),
  S('riscv-isa', 'The RISC-V Instruction Set Manual, Volume I: Unprivileged ISA (v20260120), chapitre RV32I', 'RISC-V International', '2026-01-20', 'https://docs.riscv.org/reference/isa/v20260120/unpriv/rv32.html', 'primaire', true),
  S('riscv-rapport', 'RISC-V International Annual Report 2025', 'RISC-V International', '2026-01', 'https://riscv.org/wp-content/uploads/2026/01/RISC-V-Annual-Report-2025.pdf', 'primaire', false),
  S('sifive-g', 'SiFive Raises $400 Million to Accelerate High-Performance RISC-V Data Center Solutions', 'SiFive (Business Wire)', '2026-04-09', 'https://www.businesswire.com/news/home/20260409986099/en', 'primaire', true),
  S('dcd-sifive', 'RISC-V chip designer SiFive raises $400m', 'Data Center Dynamics', '2026-04', 'https://www.datacenterdynamics.com/en/news/risc-v-chip-designer-sifive-raises-400m-in-funding-round-that-saw-participation-from-nvidia/', 'secondaire', true),
  S('ground-sifive', 'SiFive raises $400 million from Atreides, Nvidia (synthèse de dépêches)', 'Ground News', '2026-04-09', 'https://ground.news/article/sifive-raises-400-million-from-atreides-nvidia-for-data-center-chip-technology_df627f', 'secondaire', true),
  S('andes-ra', 'Andes Technology, rapport annuel 2024', 'Andes Technology', '2025', 'https://andestech.com/wp-content/uploads/113%E5%B9%B4%E5%A0%B1%E8%8B%B1%E6%96%87%E7%89%88-v1.0-%E5%90%88%E4%BD%B5-a.pdf', 'primaire', false),
  S('jpr-codasip-pivot', 'Codasip bets the company on secure compute', 'Jon Peddie Research (D. Harold)', '2026-04', 'https://www.jonpeddie.com/news/codasip-bets-the-company-on-secure-compute/', 'secondaire', true),
  S('jpr-onsemi', 'Onsemi picks up Codasip\'s low-end RISC-V business for $14.5 million', 'Jon Peddie Research (D. Harold)', '2026-10', 'https://www.jonpeddie.com/news/onsemi-picks-up-codasips-low-end-risc-v-business-for-14-5-million/', 'secondaire', true),
  S('xpu-codasip', 'Codasip Pivots Away from RISC-V IP', 'XPU.pub (J. Byrne)', '2026-04-27', 'https://xpu.pub/2026/04/27/codasip-onsemi/', 'secondaire', true),
  S('onsemi-10q', 'onsemi, Form 10-Q (trimestre clos le 02/10/2026)', 'SEC EDGAR', '2026', 'https://www.sec.gov/Archives/edgar/data/0001097864/000109786426000021/on-20261002.htm', 'primaire', false),
  S('gf-arc', 'GlobalFoundries completes acquisition of Synopsys\' Processor IP Solutions Business', 'GlobalFoundries (communiqué)', '2026-06-02', 'https://investors.gf.com/node/10841/pdf', 'primaire', true),
  S('tt-ga', 'Tenstorrent Enables AI at Scale with Industry-Leading Performance', 'Tenstorrent (communiqué)', '2026-04-28', 'https://tenstorrent.com/newsroom/tenstorrent-enables-ai-at-scale-with-industry-leading-performance', 'primaire', true),
  S('register-tt', 'Tenstorrent\'s Galaxy Blackhole AI servers escape the event horizon', 'The Register', '2026-04-28', 'https://theregister.com/2026/04/28/tenstorrent_galaxy_blackhole_ai_servers_ga', 'secondaire', true),
  S('tt-serie-e', 'Tenstorrent Raises $1.5 Billion Series E At $6.2 Billion Valuation', 'Pulse 2.0', '2026-10', 'https://pulse2.com/tenstorrent-raises-1-5-billion-series-e-at-6-2-billion-valuation/', 'secondaire', true),
  S('tt-ascalon-s', 'Tenstorrent Sets New Performance Records, Launches TT-Ascalon S', 'Tenstorrent (communiqué)', '2026-06-30', 'https://tenstorrent.com/en/newsroom/tenstorrent-sets-new-performance-records-launches-tt--ascalon-s', 'primaire', false),
  // SiPearl
  S('sipearl-presse', 'SiPearl x Bull: delivery of the 1st Rhea1 CPUs for JUPITER', 'SiPearl (espace presse)', '2026-09-22', 'https://sipearl.com/relations-presse-sipearl', 'primaire', true),
  S('sipearl-mai', 'Communiqué Rhea1 : mise sous tension et calendrier', 'SiPearl (communiqué)', '2026-05', 'https://sipearl.com/wp-content/uploads/2026/05/PR_Rhea1_announcement_VDEF.pdf', 'primaire', true),
  S('sipearl-2024', 'SiPearl unveils the key features of Rhea1', 'SiPearl (communiqué)', '2024-05-14', 'https://sipearl.com/wp-content/uploads/2024/05/PR_SiPearl_Rhea1_EN.pdf', 'primaire', true),
  S('sipearl-rhea1', 'Rhea1 (page produit)', 'SiPearl', '', 'https://sipearl.com/rhea1', 'primaire', false),
  S('dcd-sipearl', 'SiPearl delivers first samples of Rhea1 CPU to Bull', 'Data Center Dynamics', '2026-09-24', 'https://www.datacenterdynamics.com/en/news/sipearl-delivers-first-samples-of-rhea1-cpu-to-bull-for-jupiter-exascale-supercomputer/', 'secondaire', true),
  S('igorslab-rhea1', 'SiPearl Rhea1 bring-up', 'Igor\'sLAB', '2026', 'https://www.igorslab.de/en/sipearl-rhea1-bring-up-europas-80-core-hpc-prozessor-2026/', 'secondaire', true),
  S('itdaily-rhea1', 'European Rhea1 processor powered on for the first time', 'ITdaily', '2026-05', 'https://itdaily.com/blogs/innovation/eu-rhea1-cpu-live/', 'secondaire', true),
  S('blogspan-jupiter', 'Jupiter-Cluster: Europas Rhea1 landet in 162 Knoten', 'Blogspan.net', '2026-09-22', 'https://www.blogspan.net/jupiter-cluster-rhea1-sipearl-knoten/', 'secondaire', true),
  // Intel / AMD / x86
  S('intel-etat', 'Intel and Trump Administration Reach Historic Agreement', 'Intel (communiqué)', '2025-08-22', 'https://www.intel.com/content/www/us/en/newsroom/news/corporate/intel-and-trump-administration-reach-historic-agreement.html', 'primaire', true),
  S('intel-ra', 'Intel, rapport annuel (déposé en 2026)', 'SEC EDGAR', '2026', 'https://www.sec.gov/Archives/edgar/data/50863/000005086326000060/intc014890-arsa.pdf', 'primaire', false),
  S('amd-10k', 'AMD, Form 10-K, exercice clos le 27/12/2025', 'AMD (relations investisseurs)', '2026-02-04', 'https://ir.amd.com/financial-information/sec-filings/content/0000002488-26-000018/amd-20251227.htm', 'primaire', true),
  S('toms-x86eag', 'AMD and Intel celebrate first anniversary of x86 alliance', 'Tom\'s Hardware', '2025-10', 'https://www.tomshardware.com/pc-components/cpus/amd-and-intel-celebrate-first-anniversary-of-x86-alliance-new-security-features-coming-to-x86-cpus', 'secondaire', true),
  S('x86eag-ace', 'ACE v1 Specification', 'x86 Ecosystem Advisory Group', '2026-07', 'https://x86ecosystem.org/wp-content/uploads/2026/06/ACE_v1_Specification_public.pdf', 'primaire', false),
  // Fonderies, EDA, OSAT
  S('tsmc-n2', 'TSMC officially begins 2nm chip volume production in Q4 2025', 'Focus Taiwan (CNA), d\'après le site de TSMC', '2025-12-30', 'https://focustaiwan.tw/sci-tech/202512300026', 'secondaire', true),
  S('tsmc-n2-page', '2nm Technology', 'TSMC', '', 'https://www.tsmc.com/english/dedicatedFoundry/technology/logic/l_2nm', 'primaire', false),
  S('asiae-exynos', 'Samsung Electronics Unveils Industry\'s First 2nm AP Exynos 2600', 'Asia Economy, d\'après le site de Samsung', '2025-12-19', 'https://cm.asiae.co.kr/en/article/2025121915134763681', 'secondaire', true),
  S('trendforce-14a', 'Intel reportedly reaffirms 14A commitment', 'TrendForce', '2026-01-13', 'https://www.trendforce.com/news/2026/01/13/news-intel-reportedly-reaffirms-14a-commitment-as-lip-bu-tan-hints-at-possible-customer-interest/', 'secondaire', true),
  S('tweaktown-14a', 'Intel\'s 14A node will enter risk production in 2028', 'TweakTown', '2026', 'https://www.tweaktown.com/news/111778/intels-14a-node-will-enter-risk-production-in-2028-while-10a-and-7a-nodes-are-on-the-roadmap/index.html', 'secondaire', true),
  S('fool-18a', 'Intel\'s make-or-break foundry moment arrives this year', 'The Motley Fool', '2026-01-26', 'https://www.fool.com/investing/2026/01/26/intels-make-or-break-foundry-moment-arrives-this-y', 'secondaire', true),
  S('semimedia-codasip', 'Codasip seeks buyer amid growing pressure in RISC-V processor market', 'SemiMedia', '2025-07-02', 'https://www.semimedia.cc/codasip-seeks-buyer-amid-growing-pressure-in-risc-v-processor-market/', 'secondaire', true),
  S('synopsys-10k', 'Synopsys, Form 10-K, exercice 2025', 'SEC EDGAR', '2025', 'https://www.sec.gov/Archives/edgar/data/883241/000088324125000028/snps-20251031.htm', 'primaire', true),
  S('cadence-10k', 'Cadence, Form 10-K, exercice 2025', 'SEC EDGAR', '2026', 'https://www.sec.gov/Archives/edgar/data/813672/000081367226000016/cdns-20251231.htm', 'primaire', true),
  S('amkor-10k', 'Amkor Technology, Form 10-K, exercice 2025', 'SEC EDGAR', '2026', 'https://www.sec.gov/Archives/edgar/data/1047127/000104712726000014/amkr-20251231.htm', 'primaire', true),
  S('ase-20f', 'ASE Technology Holding, Form 20-F, exercice 2025', 'SEC EDGAR', '2026', 'https://www.sec.gov/Archives/edgar/data/1122411/000119312526135585/d50802d20f.htm', 'primaire', false),
  // Publications scientifiques et techniques
  S('blem-2013', 'Power Struggles: Revisiting the RISC vs. CISC Debate on Contemporary ARM and x86 Architectures', 'HPCA 2013 (Blem, Menon, Sankaralingam)', '2013', 'https://research.cs.wisc.edu/vertical/papers/2013/hpca13-isa-power-struggles.pdf', 'primaire', true),
  S('asanovic-2014', 'Instruction Sets Should Be Free: The Case For RISC-V', 'UC Berkeley, UCB/EECS-2014-146', '2014-08-06', 'https://www2.eecs.berkeley.edu/Pubs/TechRpts/2014/EECS-2014-146.html', 'primaire', true),
  S('waterman-2016', 'Design of the RISC-V Instruction Set Architecture', 'UC Berkeley, UCB/EECS-2016-1', '2016-01-03', 'https://www2.eecs.berkeley.edu/Pubs/TechRpts/2016/EECS-2016-1.html', 'primaire', true),
  S('hp-2019', 'A New Golden Age for Computer Architecture', 'Communications of the ACM', '2019', 'https://cacm.acm.org/research/a-new-golden-age-for-computer-architecture/', 'primaire', true),
  S('celio-2016', 'The Renewed Case for the Reduced Instruction Set Computer', 'arXiv:1607.02318', '2016-07-08', 'https://arxiv.org/abs/1607.02318', 'primaire', true),
  S('cheri', 'CHERI (page du projet)', 'University of Cambridge / SRI International', '', 'https://www.cl.cam.ac.uk/research/security/ctsrd/cheri/', 'primaire', true),
].map((s) => [s.id, s]));
