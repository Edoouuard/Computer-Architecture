import { h, remplir, etat, aller, lien, pubsBloc, pastille, sourceItem, animOk } from '../ui.js';
import { BRIQUES, NOTIONS, CAS, COUCHES_CAS } from '../data/bricks.js';
import { acteur } from '../data/actors.js';

const bit = (v) => (v ? 1 : 0);
const cls = (v) => (v ? 'fil-1' : 'fil-0');

// ---------- 1. Transistor : inverseur CMOS ----------
function vizTransistor(root) {
  let vin = 0;
  const draw = () => {
    const out = vin ? 0 : 1;
    const p = !vin; const n = !!vin; // PMOS passant si entrée à 0, NMOS si entrée à 1
    const svg = h('svg', { viewBox: '0 0 320 260', class: 'schema', role: 'img', 'aria-label': `Inverseur CMOS : entrée ${vin}, sortie ${out}` },
      h('text', { x: 160, y: 18, class: 'lbl', 'text-anchor': 'middle' }, 'Alimentation (1)'),
      h('line', { x1: 160, y1: 24, x2: 160, y2: 60, class: p ? 'fil-1 actif' : 'fil-off' }),
      h('rect', { x: 130, y: 60, width: 60, height: 50, rx: 4, class: p ? 'mos passant' : 'mos' }),
      h('text', { x: 160, y: 82, class: 'lbl', 'text-anchor': 'middle' }, 'PMOS'),
      h('text', { x: 160, y: 100, class: 'lbl-s', 'text-anchor': 'middle' }, p ? 'passant' : 'bloqué'),
      h('line', { x1: 160, y1: 110, x2: 160, y2: 150, class: p ? 'fil-1 actif' : n ? 'fil-0 actif' : 'fil-off' }),
      h('rect', { x: 130, y: 150, width: 60, height: 50, rx: 4, class: n ? 'mos passant' : 'mos' }),
      h('text', { x: 160, y: 172, class: 'lbl', 'text-anchor': 'middle' }, 'NMOS'),
      h('text', { x: 160, y: 190, class: 'lbl-s', 'text-anchor': 'middle' }, n ? 'passant' : 'bloqué'),
      h('line', { x1: 160, y1: 200, x2: 160, y2: 236, class: n ? 'fil-0 actif' : 'fil-off' }),
      h('text', { x: 160, y: 254, class: 'lbl', 'text-anchor': 'middle' }, 'Masse (0)'),
      // grilles
      h('polyline', { points: '40,130 100,130 100,85 130,85', class: cls(vin) + ' actif', fill: 'none' }),
      h('polyline', { points: '100,130 100,175 130,175', class: cls(vin) + ' actif', fill: 'none' }),
      h('text', { x: 14, y: 124, class: 'lbl' }, 'Entrée'),
      h('text', { x: 22, y: 146, class: 'val' }, String(vin)),
      // sortie
      h('line', { x1: 160, y1: 130, x2: 262, y2: 130, class: cls(out) + ' actif' }),
      h('circle', { cx: 160, cy: 130, r: 4, class: 'noeud' }),
      h('text', { x: 268, y: 124, class: 'lbl' }, 'Sortie'),
      h('text', { x: 280, y: 146, class: 'val' }, String(out)));
    remplir(root, 
      svg,
      h('div', { class: 'commandes' },
        h('button', { type: 'button', class: 'btn', id: 'viz-transistor-bascule', onclick: () => { vin = vin ? 0 : 1; draw(); } }, `Mettre l'entrée à ${vin ? 0 : 1}`)),
      h('p', { class: 'lecture', 'aria-live': 'polite' }, vin
        ? 'Entrée à 1 : le NMOS conduit et relie la sortie à la masse, le PMOS est bloqué. Sortie = 0.'
        : 'Entrée à 0 : le PMOS conduit et relie la sortie à l\'alimentation, le NMOS est bloqué. Sortie = 1.'));
  };
  draw();
}

// ---------- 2. Portes logiques et additionneur complet ----------
const PORTES = {
  'NON-ET': (a, b) => bit(!(a && b)), 'NON-OU': (a, b) => bit(!(a || b)), ET: (a, b) => bit(a && b),
  OU: (a, b) => bit(a || b), 'OU exclusif': (a, b) => a ^ b,
};
function vizPortes(root) {
  let porte = 'NON-ET'; let a = 1; let b = 0; let cin = 0;
  const tog = (label, v, set, id) => h('button', { type: 'button', class: 'bitbtn ' + (v ? 'on' : ''), id, 'aria-pressed': String(!!v), onclick: () => { set(v ? 0 : 1); draw(); } }, `${label} = ${v}`);
  const draw = () => {
    const f = PORTES[porte];
    const x1 = a ^ b; const s = x1 ^ cin; const a1 = a & b; const a2 = x1 & cin; const cout = a1 | a2;
    const box = (x, y, t, v) => [h('rect', { x, y, width: 62, height: 34, rx: 4, class: 'porte ' + (v ? 'porte-1' : '') }), h('text', { x: x + 31, y: y + 22, class: 'lbl', 'text-anchor': 'middle' }, t)];
    const w = (pts, v) => h('polyline', { points: pts, class: cls(v) + ' actif', fill: 'none' });
    const svg = h('svg', { viewBox: '0 0 420 210', class: 'schema', role: 'img', 'aria-label': `Additionneur complet : A=${a}, B=${b}, retenue entrante=${cin}, somme=${s}, retenue sortante=${cout}` },
      h('text', { x: 6, y: 34, class: 'lbl' }, `A=${a}`), h('text', { x: 6, y: 64, class: 'lbl' }, `B=${b}`), h('text', { x: 6, y: 114, class: 'lbl' }, `Cin=${cin}`),
      w('44,30 110,30', a), w('44,60 110,60', b), w('60,30 60,150 110,150', a), w('76,60 76,170 110,170', b),
      box(110, 28, 'OU-X', x1),
      w('172,45 240,45', x1), w('44,110 200,110 200,60 240,60', cin),
      box(240, 36, 'OU-X', s), w('302,53 372,53', s), h('text', { x: 376, y: 58, class: 'val' }, `S=${s}`),
      w('190,45 190,96 240,96', x1), w('200,110 240,110', cin),
      box(240, 86, 'ET', a2),
      box(110, 143, 'ET', a1),
      w('172,160 320,160', a1), w('302,103 310,103 310,146 320,146', a2),
      box(320, 136, 'OU', cout), w('382,153 396,153', cout), h('text', { x: 350, y: 196, class: 'val', 'text-anchor': 'middle' }, `Cout=${cout}`));
    const table = h('table', { class: 'verite' },
      h('thead', {}, h('tr', {}, h('th', {}, 'A'), h('th', {}, 'B'), h('th', {}, porte))),
      h('tbody', {}, [[0, 0], [0, 1], [1, 0], [1, 1]].map(([x, y]) => h('tr', { class: x === a && y === b ? 'courant' : '' }, h('td', {}, x), h('td', {}, y), h('td', {}, f(x, y))))));
    remplir(root, 
      h('div', { class: 'commandes' },
        h('label', { for: 'viz-porte' }, 'Porte '),
        h('select', { id: 'viz-porte', onchange: (e) => { porte = e.target.value; draw(); } }, Object.keys(PORTES).map((k) => h('option', { value: k, selected: k === porte }, k))),
        tog('A', a, (v) => { a = v; }, 'viz-a'), tog('B', b, (v) => { b = v; }, 'viz-b')),
      h('div', { class: 'deux' }, table, h('p', { class: 'lecture', 'aria-live': 'polite' }, `${porte} de ${a} et ${b} = `, h('strong', { id: 'viz-porte-sortie' }, f(a, b)), '. La ligne correspondante est surlignée dans la table de vérité.')),
      h('h4', {}, 'Additionneur complet 1 bit'),
      h('div', { class: 'commandes' }, tog('Retenue entrante', cin, (v) => { cin = v; }, 'viz-cin')),
      svg,
      h('p', { class: 'lecture', 'aria-live': 'polite' }, `${a} + ${b} + ${cin} = ${a + b + cin} en décimal, soit retenue ${cout} et somme ${s} en binaire.`));
  };
  draw();
}

// ---------- 3. ALU 8 bits et registre ----------
const OPS = ['Addition', 'Soustraction', 'ET', 'OU', 'OU exclusif'];
function vizAlu(root) {
  let A = 0b00101101; let B = 0b00010111; let op = 'Addition'; let reg = 0; let ticks = 0;
  const calc = () => {
    if (op === 'ET') return { r: A & B, carries: null };
    if (op === 'OU') return { r: A | B, carries: null };
    if (op === 'OU exclusif') return { r: A ^ B, carries: null };
    const b2 = op === 'Soustraction' ? (~B) & 0xff : B;
    let c = op === 'Soustraction' ? 1 : 0; let r = 0; const carries = [];
    for (let i = 0; i < 8; i++) {
      const x = (A >> i) & 1; const y = (b2 >> i) & 1;
      r |= (x ^ y ^ c) << i; c = (x & y) | (x & c) | (y & c); carries.push(c);
    }
    return { r, carries, b2 };
  };
  const signe = (v) => (v & 0x80 ? v - 256 : v);
  const bits = (val, set, nom) => h('div', { class: 'bits', role: 'group', 'aria-label': `Bits de ${nom}` },
    [7, 6, 5, 4, 3, 2, 1, 0].map((i) => {
      const v = (val >> i) & 1;
      return set
        ? h('button', { type: 'button', class: 'bit ' + (v ? 'on' : ''), 'aria-pressed': String(!!v), 'aria-label': `${nom}, bit ${i}`, onclick: () => { set(val ^ (1 << i)); draw(); } }, v)
        : h('span', { class: 'bit ro ' + (v ? 'on' : '') }, v);
    }));
  const draw = () => {
    const { r, carries } = calc();
    remplir(root, 
      h('div', { class: 'alu-grille' },
        h('span', { class: 'lbl' }, 'A'), bits(A, (v) => { A = v; }, 'A'), h('span', { class: 'num' }, `${A} (${signe(A)} signé)`),
        h('span', { class: 'lbl' }, 'B'), bits(B, (v) => { B = v; }, 'B'), h('span', { class: 'num' }, `${B} (${signe(B)} signé)`),
        h('label', { class: 'lbl', for: 'viz-alu-op' }, 'Opération'),
        h('select', { id: 'viz-alu-op', onchange: (e) => { op = e.target.value; draw(); } }, OPS.map((o) => h('option', { value: o, selected: o === op }, o))),
        h('span', {}),
        carries ? h('span', { class: 'lbl' }, 'Retenues') : null,
        carries ? h('div', { class: 'bits' }, [7, 6, 5, 4, 3, 2, 1, 0].map((i) => h('span', { class: 'bit ro petit ' + (carries[i] ? 'on' : '') }, carries[i]))) : null,
        carries ? h('span', { class: 'num' }, op === 'Soustraction' ? 'B est inversé, retenue initiale à 1' : 'chaque retenue alimente le bit suivant') : null,
        h('span', { class: 'lbl' }, 'Sortie ALU'), bits(r, null, 'résultat'), h('span', { class: 'num', id: 'viz-alu-res' }, `${r} (${signe(r)} signé)`),
        h('span', { class: 'lbl' }, 'Registre'), bits(reg, null, 'registre'), h('span', { class: 'num', id: 'viz-alu-reg' }, `${reg}, après ${ticks} coup(s) d'horloge`)),
      h('div', { class: 'commandes' },
        h('button', { type: 'button', class: 'btn', id: 'viz-alu-horloge', onclick: () => { reg = calc().r; ticks += 1; draw(); } }, 'Coup d\'horloge : capturer le résultat')),
      h('p', { class: 'lecture', 'aria-live': 'polite' }, reg === r
        ? 'Le registre contient la valeur présente en sortie de l\'ALU.'
        : 'La sortie de l\'ALU a changé, mais le registre garde l\'ancienne valeur jusqu\'au prochain coup d\'horloge.',
      carries && carries[7] ? ' La retenue sort du 8ᵉ bit : le résultat est tronqué à 8 bits, comme RV32I tronque à 32 bits.' : ''));
  };
  draw();
}

// ---------- 4. Cœur : les cinq étapes d'une instruction ----------
const ETAPES = [
  { id: 'lecture', nom: 'Lecture', blocs: ['pc', 'imem'], texte: 'Le compteur ordinal vaut 0x008. Le cœur lit l\'instruction rangée à cette adresse : « add x7, x5, x6 ».' },
  { id: 'decodage', nom: 'Décodage', blocs: ['dec', 'regs'], texte: 'Le décodeur reconnaît une addition registre-registre. Il lit x5 (7) et x6 (35) dans le banc de registres.' },
  { id: 'execution', nom: 'Exécution', blocs: ['alu'], texte: 'L\'ALU additionne les deux opérandes : 7 + 35 = 42.' },
  { id: 'memoire', nom: 'Accès mémoire', blocs: ['dmem'], texte: 'Une addition ne lit ni n\'écrit en mémoire : cette étape ne fait rien ici. Elle servirait pour un « lw » ou un « sw ».' },
  { id: 'ecriture', nom: 'Écriture', blocs: ['regs', 'pc'], texte: 'Le résultat 42 est écrit dans x7. Le compteur ordinal passe à 0x00c, l\'instruction suivante.' },
];
function vizCoeur(root) {
  let k = 0; let timer = null;
  const B = { pc: [10, 70, 70, 'Compteur ordinal'], imem: [100, 70, 90, 'Mémoire d\'instructions'], dec: [210, 70, 70, 'Décodeur'], regs: [210, 150, 70, 'Registres'], alu: [300, 110, 60, 'ALU'], dmem: [380, 110, 90, 'Mémoire de données'] };
  const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
  const draw = () => {
    const e = ETAPES[k];
    const svg = h('svg', { viewBox: '0 0 480 230', class: 'schema', role: 'img', 'aria-label': `Chemin de données, étape ${e.nom}` },
      h('polyline', { points: '80,90 100,90', class: 'fil-off' }), h('polyline', { points: '190,90 210,90', class: 'fil-off' }),
      h('polyline', { points: '245,110 245,150', class: 'fil-off' }), h('polyline', { points: '280,170 290,170 290,130 300,130', class: 'fil-off' }),
      h('polyline', { points: '360,130 380,130', class: 'fil-off' }), h('polyline', { points: '425,150 425,205 245,205 245,190', class: 'fil-off', fill: 'none' }),
      h('polyline', { points: '45,70 45,40 330,40 330,110', class: 'fil-off', fill: 'none' }),
      Object.entries(B).map(([id, [x, y, w, t]]) => {
        const on = e.blocs.includes(id);
        const mots = t.split(' ');
        const l1 = mots.length > 1 ? mots.slice(0, Math.ceil(mots.length / 2)).join(' ') : t;
        const l2 = mots.length > 1 ? mots.slice(Math.ceil(mots.length / 2)).join(' ') : '';
        return h('g', {}, h('rect', { x, y, width: w, height: 40, rx: 4, class: 'bloc ' + (on ? 'bloc-actif' : '') }),
          h('text', { x: x + w / 2, y: y + (l2 ? 17 : 24), class: 'lbl-s', 'text-anchor': 'middle' }, l1),
          l2 ? h('text', { x: x + w / 2, y: y + 31, class: 'lbl-s', 'text-anchor': 'middle' }, l2) : null);
      }));
    remplir(root, 
      h('ol', { class: 'etapes' }, ETAPES.map((x, i) => h('li', { class: i === k ? 'courant' : i < k ? 'fait-ok' : '' }, x.nom))),
      svg,
      h('p', { class: 'lecture', id: 'viz-coeur-texte', 'aria-live': 'polite' }, h('strong', {}, e.nom + '. '), e.texte),
      h('div', { class: 'commandes' },
        h('button', { type: 'button', class: 'btn', id: 'viz-coeur-suivant', disabled: k === ETAPES.length - 1, onclick: () => { stop(); k += 1; draw(); } }, 'Étape suivante'),
        h('button', { type: 'button', class: 'btn sec', onclick: () => { stop(); k = 0; draw(); } }, 'Recommencer'),
        h('button', { type: 'button', class: 'btn sec', disabled: !animOk(), title: animOk() ? '' : 'Désactivé : les animations sont coupées dans les réglages.', onclick: () => {
          if (timer) { stop(); draw(); return; }
          if (k === ETAPES.length - 1) k = 0;
          timer = setInterval(() => { if (!root.isConnected || k >= ETAPES.length - 1) { stop(); if (root.isConnected) draw(); return; } k += 1; draw(); }, 1600);
          draw();
        } }, timer ? 'Arrêter' : 'Dérouler automatiquement'),
        lien('Exécuter ce programme dans le simulateur', 'simulateur', { programme: 'addition' }, 'btn sec')),
      !animOk() ? h('p', { class: 'aide' }, 'Le déroulé automatique est désactivé car les animations sont coupées. Le pas à pas reste disponible.') : null);
  };
  draw();
}

// ---------- 5. Cache à correspondance directe ----------
const MOTIFS = {
  'Parcours séquentiel d\'un tableau': (i) => i * 4,
  'Deux adresses qui se disputent une ligne': (i) => (i % 2) * 64,
  'Deux tableaux bien répartis': (i) => (i % 2 ? 80 : 0) + Math.floor(i / 2) * 4,
};
function vizCache(root) {
  let motif = Object.keys(MOTIFS)[0]; let lignes; let n; let hits; let dernier;
  const reset = () => { lignes = [null, null, null, null]; n = 0; hits = 0; dernier = null; };
  const acces = () => {
    const addr = MOTIFS[motif](n); const bloc = addr >> 4; const idx = bloc & 3; const tag = bloc >> 2;
    const hit = lignes[idx] !== null && lignes[idx] === tag;
    if (!hit) lignes[idx] = tag; else hits += 1;
    n += 1; dernier = { addr, idx, tag, hit };
  };
  reset();
  const draw = () => {
    remplir(root, 
      h('div', { class: 'commandes' },
        h('label', { for: 'viz-cache-motif' }, 'Suite d\'accès '),
        h('select', { id: 'viz-cache-motif', onchange: (e) => { motif = e.target.value; reset(); draw(); } }, Object.keys(MOTIFS).map((m) => h('option', { value: m, selected: m === motif }, m)))),
      h('table', { class: 'cache' },
        h('thead', {}, h('tr', {}, h('th', {}, 'Ligne'), h('th', {}, 'Étiquette'), h('th', {}, 'Adresses contenues'))),
        h('tbody', {}, lignes.map((t, i) => h('tr', { class: dernier && dernier.idx === i ? (dernier.hit ? 'succes' : 'defaut') : '' },
          h('td', {}, i), h('td', {}, t === null ? 'vide' : t),
          h('td', {}, t === null ? '' : `0x${((t * 4 + i) * 16).toString(16).padStart(3, '0')} à 0x${((t * 4 + i) * 16 + 15).toString(16).padStart(3, '0')}`))))),
      h('div', { class: 'commandes' },
        h('button', { type: 'button', class: 'btn', id: 'viz-cache-acces', onclick: () => { acces(); draw(); } }, 'Accès suivant'),
        h('button', { type: 'button', class: 'btn sec', id: 'viz-cache-8', onclick: () => { for (let i = 0; i < 8; i++) acces(); draw(); } }, '8 accès'),
        h('button', { type: 'button', class: 'btn sec', onclick: () => { reset(); draw(); } }, 'Vider le cache')),
      h('p', { class: 'lecture', id: 'viz-cache-bilan', 'aria-live': 'polite' },
        dernier ? `Accès à 0x${dernier.addr.toString(16).padStart(3, '0')} : ligne ${dernier.idx}, étiquette ${dernier.tag}. ${dernier.hit ? 'Succès : la donnée était déjà là.' : 'Défaut : la ligne est chargée depuis la mémoire.'} ` : 'Aucun accès pour l\'instant. ',
        `Bilan : ${hits} succès sur ${n} accès${n ? ` (${Math.round((100 * hits) / n)} %)` : ''}.`));
  };
  draw();
}

// ---------- 6. SoC : blocs et provenance ----------
const BLOCS_SOC = [
  { id: 'cpu', nom: 'Cœurs CPU', origine: 'Licenciés ou conçus en interne', texte: 'Le choix le plus visible. Un concepteur peut licencier des cœurs (SiPearl avec Arm), les concevoir sous licence d\'architecture (Qualcomm), ou partir d\'une ISA ouverte (RISC-V).', large: true },
  { id: 'gpu', nom: 'Processeur graphique', origine: 'Souvent licencié', texte: 'Bloc de calcul parallèle pour l\'affichage. Il existe des fournisseurs d\'IP graphique, comme pour les CPU.' },
  { id: 'npu', nom: 'Accélérateur d\'IA', origine: 'Souvent interne', texte: 'Circuit spécialisé pour les réseaux de neurones. C\'est un terrain de différenciation : Meta conçoit ses accélérateurs MTIA, Tenstorrent licencie ses cœurs Tensix.' },
  { id: 'bus', nom: 'Interconnexion', origine: 'Protocoles standard, IP licenciée', texte: 'Le réseau interne qui relie tous les blocs. Son débit limite souvent la puce avant les cœurs.', large: true },
  { id: 'mem', nom: 'Contrôleurs mémoire', origine: 'IP d\'interface licenciée', texte: 'Pilotent la mémoire vive (DDR5, HBM). Synopsys et Cadence vendent ce type d\'IP d\'interface.' },
  { id: 'io', nom: 'Entrées-sorties', origine: 'Standards (USB, PCIe), IP licenciée', texte: 'Les interfaces vers l\'extérieur suivent des standards publics ; leur réalisation physique est le plus souvent achetée.' },
  { id: 'sec', nom: 'Sécurité', origine: 'Interne ou licenciée', texte: 'Démarrage sécurisé, clés, isolation. Des approches comme CHERI déplacent une partie de la sécurité dans le cœur lui-même.' },
  { id: 'fond', nom: 'Cellules et mémoires de base', origine: 'IP de fondation, liée au procédé', texte: 'Bibliothèques de portes et de mémoires propres à chaque procédé de fonderie. Tout le reste est construit avec.' },
];
function vizSoc(root) {
  let sel = 'cpu';
  const draw = () => {
    const b = BLOCS_SOC.find((x) => x.id === sel);
    remplir(root, 
      h('div', { class: 'soc', role: 'group', 'aria-label': 'Blocs d\'un système sur puce' }, BLOCS_SOC.map((x) => h('button', {
        type: 'button', class: 'soc-bloc ' + (x.large ? 'large ' : '') + (x.id === sel ? 'actif' : ''), id: 'viz-soc-' + x.id, 'aria-pressed': String(x.id === sel), onclick: () => { sel = x.id; draw(); },
      }, x.nom))),
      h('div', { class: 'lecture', 'aria-live': 'polite' }, h('strong', {}, b.nom + '. '), b.texte, h('br', {}), h('span', { class: 'etiquette' }, 'Provenance typique : ' + b.origine)));
  };
  draw();
}

// ---------- 7. Die, chiplets, rendement ----------
function vizPackage(root) {
  let D = 0.2; let A = 4;
  const la = h('label', { for: 'viz-pkg-a' }); const ld = h('label', { for: 'viz-pkg-d' });
  const sortie = h('div', {});
  // Les curseurs sont créés une seule fois : seul le résultat est redessiné pendant le glissement.
  remplir(root, 
    h('div', { class: 'commandes col' },
      la, h('input', { type: 'range', id: 'viz-pkg-a', min: 1, max: 8, step: 0.5, value: A, oninput: (e) => { A = Number(e.target.value); draw(); } }),
      ld, h('input', { type: 'range', id: 'viz-pkg-d', min: 0.05, max: 0.5, step: 0.05, value: D, oninput: (e) => { D = Number(e.target.value); draw(); } })),
    sortie);
  const draw = () => {
    const yMono = Math.exp(-A * D); const yChip = Math.exp(-(A / 4) * D);
    const barre = (v, id) => h('div', { class: 'barre', role: 'img', 'aria-label': `${Math.round(v * 100)} %` }, h('div', { class: 'barre-plein', style: `width:${(v * 100).toFixed(1)}%` }), h('span', { class: 'barre-val', id }, `${(v * 100).toFixed(0)} %`));
    const grille = (n, y, grand) => h('div', { class: 'dies ' + (grand ? 'grand' : '') }, Array.from({ length: n }, (_, i) => h('span', { class: 'die ' + (((i * 37 + 11) % 100) / 100 < y ? 'bon' : 'perdu') })));
    la.textContent = `Surface totale de silicium : ${A} cm²`;
    ld.textContent = `Densité de défauts : ${D.toFixed(2)} par cm²`;
    remplir(sortie, 
      h('div', { class: 'rendement' },
        h('div', {}, h('h4', {}, `Un seul die de ${A} cm²`), grille(12, yMono, true), barre(yMono, 'viz-pkg-mono'), h('p', { class: 'aide' }, 'Part des dies sans défaut.')),
        h('div', {}, h('h4', {}, `Quatre chiplets de ${(A / 4).toFixed(2)} cm²`), grille(48, yChip, false), barre(yChip, 'viz-pkg-chip'), h('p', { class: 'aide' }, 'Part des chiplets sans défaut, triés avant assemblage.'))),
      h('p', { class: 'lecture', 'aria-live': 'polite' }, pastille('estimation'), ` Modèle de Poisson : rendement = e^(−surface × densité). Pour la même surface totale, ${(yChip * 100).toFixed(0)} % du silicium est utilisable en chiplets contre ${(yMono * 100).toFixed(0)} % d'un seul tenant. L'écart se paie en assemblage et en test.`));
  };
  draw();
}

const VIZ = { transistor: vizTransistor, portes: vizPortes, alu: vizAlu, coeur: vizCoeur, cache: vizCache, soc: vizSoc, package: vizPackage };

// ---------- Vue ----------
export function vueExplorateur(root) {
  const st = etat.explorateur;
  if (!st.brique) st.brique = 'transistor';
  if (!st.cas) st.cas = 'agi';

  const draw = () => {
    const b = BRIQUES.find((x) => x.id === st.brique);
    const zone = h('div', { class: 'viz', id: 'viz-zone' });
    const cas = CAS.find((x) => x.id === st.cas);
    const notion = st.notion ? NOTIONS.find((n) => n.id === st.notion) : null;

    remplir(root, 
      h('header', { class: 'vue-tete' }, h('h1', {}, 'De l\'instruction à la puce'), h('p', { class: 'chapo' }, 'Sept briques emboîtées, du transistor au boîtier. Choisissez-en une pour la manipuler.')),
      h('nav', { class: 'chaine', 'aria-label': 'Briques, de la plus petite à la plus grande' }, BRIQUES.map((x, i) => [
        i ? h('span', { class: 'fleche', 'aria-hidden': 'true' }, '→') : null,
        h('button', { type: 'button', class: 'maillon ' + (x.id === st.brique ? 'actif' : ''), id: 'brique-' + x.id, 'aria-current': x.id === st.brique ? 'step' : null, onclick: () => { st.brique = x.id; draw(); } },
          h('span', { class: 'maillon-n' }, String(i + 1)), x.nom),
      ])),
      h('section', { class: 'brique', 'aria-labelledby': 'brique-titre' },
        h('div', { class: 'brique-viz' }, h('h2', { id: 'brique-titre' }, b.nom), h('p', { class: 'echelle' }, 'Ordre de grandeur : ' + b.echelle), zone),
        h('div', { class: 'brique-texte' },
          h('p', { class: 'court' }, b.court),
          h('details', { class: 'approfondir' }, h('summary', {}, 'Approfondir'), b.approfondi.map((p) => h('p', {}, p))),
          h('h3', {}, 'Exemple concret'), h('p', {}, b.exemple),
          h('h3', {}, 'Ce que cette brique permet'), h('p', {}, b.permet),
          h('h3', {}, 'Liens avec les autres briques'),
          h('ul', { class: 'liens-briques' }, b.liens.map((l) => h('li', {}, h('button', { type: 'button', class: 'lien', onclick: () => { st.brique = l.vers; draw(); document.getElementById('brique-' + l.vers).focus(); } }, BRIQUES.find((x) => x.id === l.vers).nom), ' : ' + l.texte))),
          h('h3', {}, 'Simplifications de ce schéma'), h('ul', { class: 'limites' }, b.limites.map((l) => h('li', {}, l))),
          b.sources.length ? h('details', { class: 'preuve bloc' }, h('summary', {}, `Sources des exemples cités (${b.sources.length})`), h('ul', { class: 'srcs' }, b.sources.map(sourceItem))) : null,
          pubsBloc('brique:' + b.id))),

      h('section', { class: 'distinctions', 'aria-labelledby': 'dist-titre' },
        h('h2', { id: 'dist-titre' }, 'ISA, microarchitecture, IP, puce, fabrication : qui tient quoi ?'),
        h('p', {}, 'Cinq couches que le langage courant confond. Sur un cas réel, chacune peut appartenir à un acteur différent.'),
        h('div', { class: 'commandes' }, h('label', { for: 'cas-select' }, 'Cas étudié '),
          h('select', { id: 'cas-select', onchange: (e) => { st.cas = e.target.value; draw(); document.getElementById('cas-select').focus(); } }, CAS.map((x) => h('option', { value: x.id, selected: x.id === st.cas }, x.nom)))),
        h('div', { class: 'table-scroll' }, h('table', { class: 'couches' },
          h('thead', {}, h('tr', {}, h('th', {}, 'Couche'), h('th', {}, 'Qui la tient'), h('th', {}, 'Sous quelle forme'))),
          h('tbody', {}, COUCHES_CAS.map((nom, i) => {
            const c = cas.couches[i];
            return h('tr', {}, h('th', { scope: 'row' }, nom),
              h('td', {}, c.acteur && acteur(c.acteur) ? lien(c.qui, 'carte', { sel: c.acteur }) : c.qui), h('td', {}, c.quoi));
          })))),
        h('p', { class: 'lecture' }, pastille(cas.statut), ' ', cas.lecture),
        h('details', { class: 'preuve bloc' }, h('summary', {}, `Sources de ce cas (${cas.src.length})`), h('ul', { class: 'srcs' }, cas.src.map(sourceItem))),

        h('h3', {}, 'Neuf notions à ne pas confondre'),
        h('div', { class: 'notions', role: 'group', 'aria-label': 'Notions' }, NOTIONS.map((n) => h('button', { type: 'button', class: 'puce-btn ' + (st.notion === n.id ? 'actif' : ''), 'aria-pressed': String(st.notion === n.id), onclick: () => { st.notion = st.notion === n.id ? null : n.id; draw(); } }, n.id))),
        notion ? h('div', { class: 'notion-def', id: 'notion-def', 'aria-live': 'polite' },
          h('h4', {}, notion.id), h('p', {}, notion.def), h('p', {}, h('strong', {}, 'À ne pas confondre. '), notion.pasConfondre),
          h('button', { type: 'button', class: 'lien', onclick: () => { st.brique = notion.brique; draw(); window.scrollTo({ top: 0, behavior: animOk() ? 'smooth' : 'auto' }); } }, `Voir la brique « ${BRIQUES.find((x) => x.id === notion.brique).nom} »`))
          : h('p', { class: 'aide' }, 'Choisissez une notion pour lire sa définition.')));
    VIZ[b.id](zone);
  };
  draw();
}
