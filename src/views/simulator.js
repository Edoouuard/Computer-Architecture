import { h, remplir, etat, pubsBloc, animOk, sourceItem } from '../ui.js';
import { assemble, Machine, disasm, ABI, SUPPORTED, PSEUDO, UNSUPPORTED, hex32, hexAddr, DATA_BASE, MEM_SIZE, TEXT_BASE } from '../sim/rv32i.js';
import { PROGRAMS } from '../sim/programs.js';

const LIMITE_AUTO = 5000;

export function vueSimulateur(root) {
  const st = etat.simulateur;
  if (!st.source) { st.source = PROGRAMS[0].source; st.progId = PROGRAMS[0].id; }
  if (st.programme) { // demandé depuis un autre espace
    const p = PROGRAMS.find((x) => x.id === st.programme);
    if (p) { st.source = p.source; st.progId = p.id; }
    st.programme = null;
  }
  let prog = null; let machine = null; let dernier = null; let timer = null; let sale = false;
  let base = st.base || 'dec'; let vitesse = st.vitesse || 600; let memBase = DATA_BASE;
  let journal = [];

  const editeur = h('textarea', { id: 'sim-editeur', class: 'editeur', spellcheck: 'false', autocapitalize: 'off', autocomplete: 'off', rows: 16, 'aria-describedby': 'sim-editeur-aide' });
  editeur.value = st.source;
  editeur.addEventListener('input', () => { st.source = editeur.value; st.progId = null; sale = true; stop(); majEtat(); });

  const zErreurs = h('div', { id: 'sim-erreurs', 'aria-live': 'assertive' });
  const zListing = h('div', { id: 'sim-listing', class: 'listing', tabindex: '0', 'aria-label': 'Programme assemblé' });
  const zExplication = h('div', { id: 'sim-explication', class: 'explication', 'aria-live': 'polite' });
  const zRegs = h('div', { id: 'sim-registres' });
  const zMem = h('div', { id: 'sim-memoire' });
  const zEtat = h('div', { id: 'sim-etat', class: 'sim-etat', 'aria-live': 'polite' });
  const zJournal = h('ol', { id: 'sim-journal', class: 'journal' });
  const bPas = h('button', { type: 'button', class: 'btn', id: 'sim-pas', onclick: () => { stop(); pas(); } }, 'Pas');
  const bAuto = h('button', { type: 'button', class: 'btn', id: 'sim-auto', onclick: () => (timer ? (stop(), rendre()) : lecture()) }, 'Lecture');
  const bReset = h('button', { type: 'button', class: 'btn sec', id: 'sim-reset', onclick: () => { stop(); reinit(); } }, 'Réinitialiser');
  const bAsm = h('button', { type: 'button', class: 'btn sec', id: 'sim-assembler', onclick: () => { stop(); assembler(); } }, 'Assembler');

  function stop() { if (timer) { clearInterval(timer); timer = null; } }

  function assembler() {
    prog = assemble(editeur.value);
    sale = false; dernier = null; journal = [];
    if (!prog.ok) {
      machine = null;
      remplir(zErreurs, h('div', { class: 'erreurs', role: 'alert' },
        h('strong', {}, `${prog.errors.length} erreur${prog.errors.length > 1 ? 's' : ''} d'assemblage. Corrigez le texte puis assemblez de nouveau.`),
        h('ul', {}, prog.errors.map((e) => h('li', {}, `Ligne ${e.line} : ${e.message}`)))));
    } else {
      remplir(zErreurs, );
      machine = new Machine(prog);
    }
    rendre();
  }

  function reinit() {
    if (sale || !machine) { assembler(); return; }
    machine.reset(); dernier = null; journal = [];
    rendre();
  }

  function pas() {
    if (sale) assembler();
    if (!machine || machine.halted) { rendre(); return null; }
    dernier = machine.step();
    journal.push({ n: machine.steps || journal.length + 1, pc: dernier.pc, texte: dernier.text, erreur: !!dernier.error });
    if (journal.length > 200) journal.shift();
    rendre();
    return dernier;
  }

  function lecture() {
    if (sale) assembler();
    if (!machine || machine.halted) { rendre(); return; }
    if (!animOk()) { // sans animation : exécution d'une traite, résultat final affiché
      let n = 0;
      while (!machine.halted && n < LIMITE_AUTO) { dernier = machine.step(); journal.push({ n: machine.steps, pc: dernier.pc, texte: dernier.text, erreur: !!dernier.error }); if (journal.length > 200) journal.shift(); n += 1; }
      rendre(n >= LIMITE_AUTO && !machine.halted ? `Arrêt après ${LIMITE_AUTO} instructions : le programme boucle peut-être sans fin.` : null);
      return;
    }
    let n = 0;
    timer = setInterval(() => {
      if (!root.isConnected) { stop(); return; }
      pas(); n += 1;
      if (!machine || machine.halted || n >= LIMITE_AUTO) { stop(); rendre(n >= LIMITE_AUTO ? `Arrêt après ${LIMITE_AUTO} instructions : le programme boucle peut-être sans fin.` : null); }
    }, vitesse);
    rendre();
  }

  const fmt = (v) => (base === 'hex' ? hex32(v) : base === 'bin' ? (v >>> 0).toString(2).padStart(32, '0').replace(/(.{8})(?=.)/g, '$1 ') : String(v | 0));

  function majEtat(note) {
    bPas.disabled = !!(machine && machine.halted && !sale) || (!machine && !sale);
    bAuto.disabled = bPas.disabled;
    bAuto.textContent = timer ? 'Pause' : 'Lecture';
    bAuto.setAttribute('aria-pressed', String(!!timer));
    let msg;
    if (sale) msg = 'Le texte a changé : il sera réassemblé au prochain pas.';
    else if (!machine) msg = 'Programme non exécutable tant que des erreurs subsistent.';
    else if (machine.error) msg = 'Arrêt sur erreur.';
    else if (machine.halted) msg = `Programme terminé en ${machine.steps} instruction${machine.steps > 1 ? 's' : ''}.`;
    else msg = `Prêt. Compteur ordinal : ${hexAddr(machine.pc)}. Instructions exécutées : ${machine.steps}.`;
    remplir(zEtat, h('span', { class: machine && machine.error ? 'alerte' : '' }, msg), note ? h('span', { class: 'alerte' }, ' ' + note) : null);
  }

  function rendre(note) {
    majEtat(note);
    // Listing : une ligne par instruction réelle, la prochaine à exécuter est surlignée.
    if (prog && prog.ok) {
      const etiqTexte = new Map([...prog.labels].filter(([, v]) => v < DATA_BASE).map(([k, v]) => [v, k]));
      remplir(zListing, h('table', { class: 'listing-table' },
        h('thead', {}, h('tr', {}, h('th', {}, 'Adresse'), h('th', {}, 'Instruction exécutée'), h('th', {}, 'Ligne source'))),
        h('tbody', {}, prog.instrs.map((i) => {
          const courant = machine && !machine.halted && i.addr === machine.pc;
          const vient = dernier && dernier.instr === i;
          return h('tr', { class: (courant ? 'courant ' : '') + (vient ? 'vient' : ''), 'aria-current': courant ? 'true' : null, 'data-addr': i.addr },
            h('td', { class: 'mono' }, hexAddr(i.addr)),
            h('td', { class: 'mono' }, etiqTexte.has(i.addr) ? h('span', { class: 'etiq' }, etiqTexte.get(i.addr) + ': ') : null,
              disasm(i), i.pseudo ? h('span', { class: 'pseudo' }, ` ← ${i.pseudo}`) : null),
            h('td', { class: 'mono src-l' }, `${i.line}`));
        }))));
      const cur = zListing.querySelector('tr.courant');
      if (cur && zListing.scrollHeight > zListing.clientHeight) cur.scrollIntoView({ block: 'nearest' });
    } else {
      remplir(zListing, h('p', { class: 'aide' }, 'Aucun programme assemblé.'));
    }

    // Explication du dernier pas.
    if (dernier) {
      remplir(zExplication, 
        h('h3', {}, 'Ce qui vient de se passer'),
        dernier.instr ? h('p', { class: 'mono instr-courante' }, `${hexAddr(dernier.pc)}  ${disasm(dernier.instr)}`) : null,
        h('p', { class: dernier.error ? 'alerte' : '' }, dernier.text),
        dernier.instr && dernier.instr.pseudo ? h('p', { class: 'aide' }, `Cette instruction vient de la pseudo-instruction « ${dernier.instr.pseudo} » de la ligne ${dernier.instr.line}.`) : null);
    } else {
      const next = machine && machine.current;
      remplir(zExplication, h('h3', {}, 'Ce qui vient de se passer'),
        h('p', { class: 'aide' }, next ? `Rien encore. Prochaine instruction : ${disasm(next)} (ligne ${next.line}). Appuyez sur « Pas ».` : 'Rien encore.'));
    }

    // Registres.
    const ecrits = new Set(dernier ? dernier.regWrites.map((w) => w.reg) : []);
    const regs = machine ? machine.regs : new Int32Array(32);
    remplir(zRegs, 
      h('div', { class: 'pc-ligne' }, h('span', { class: 'lbl' }, 'Compteur ordinal (PC)'), h('span', { class: 'mono val-pc ' + (dernier && !dernier.error ? 'modifie' : ''), id: 'sim-pc' }, machine ? hexAddr(machine.pc) : '—')),
      h('div', { class: 'regs', role: 'table', 'aria-label': 'Registres' }, Array.from({ length: 32 }, (_, i) => h('div', { class: 'reg ' + (ecrits.has(i) ? 'modifie' : ''), role: 'row', id: 'reg-' + i },
        h('span', { class: 'reg-nom', role: 'rowheader' }, `x${i}`, h('span', { class: 'abi' }, ABI[i])),
        h('span', { class: 'reg-val mono', role: 'cell' }, fmt(regs[i])),
        ecrits.has(i) ? h('span', { class: 'sr' }, ' modifié') : null))));

    // Mémoire : 16 mots à partir de l'adresse choisie.
    const touche = new Set();
    if (dernier) for (const w of dernier.memWrites) for (let k = 0; k < w.size; k++) touche.add((w.addr + k) & ~3);
    const lus = new Set();
    if (dernier) for (const w of dernier.memReads) lus.add(w.addr & ~3);
    const etiqs = new Map(prog && prog.ok ? prog.dataWords.map((w) => [w.addr, [...prog.labels].find(([, v]) => v === w.addr)]) : []);
    remplir(zMem, h('table', { class: 'mem' },
      h('thead', {}, h('tr', {}, h('th', {}, 'Adresse'), h('th', {}, 'Mot de 32 bits'), h('th', {}, 'Étiquette'))),
      h('tbody', {}, Array.from({ length: 16 }, (_, k) => {
        const a = memBase + 4 * k;
        if (a + 4 > MEM_SIZE) return null;
        const v = machine ? machine.readMem(a, 4) | 0 : 0;
        const e = etiqs.get(a);
        return h('tr', { class: (touche.has(a) ? 'modifie ' : '') + (lus.has(a) ? 'lu' : ''), id: 'mem-' + a },
          h('td', { class: 'mono' }, hexAddr(a)), h('td', { class: 'mono' }, fmt(v), touche.has(a) ? h('span', { class: 'sr' }, ' modifié') : lus.has(a) ? h('span', { class: 'sr' }, ' lu') : null),
          h('td', { class: 'mono' }, e ? e[0] : ''));
      }))));

    remplir(zJournal, ...journal.slice(-8).reverse().map((j) => h('li', { class: j.erreur ? 'alerte' : '' }, h('span', { class: 'mono' }, hexAddr(j.pc) + ' '), j.texte)));
  }

  const charger = (p) => { stop(); editeur.value = p.source; st.source = p.source; st.progId = p.id; assembler(); majExemples(); };
  const zExemples = h('div', { class: 'exemples', role: 'group', 'aria-label': 'Programmes d\'exemple' });
  function majExemples() {
    remplir(zExemples, PROGRAMS.map((p) => h('button', { type: 'button', class: 'exemple ' + (st.progId === p.id ? 'actif' : ''), id: 'ex-' + p.id, 'aria-pressed': String(st.progId === p.id), onclick: () => charger(p) },
      h('strong', {}, p.titre), h('span', {}, p.resume))));
  }
  editeur.addEventListener('input', majExemples);

  remplir(root, 
    h('header', { class: 'vue-tete' }, h('h1', {}, 'Simulateur de processeur'),
      h('p', { class: 'chapo' }, 'Un sous-ensemble de RISC-V 32 bits, exécuté pour de bon, une instruction à la fois. Modèle fonctionnel : ni un cœur complet, ni un modèle certifié, ni une simulation au cycle près.')),
    zExemples,
    h('div', { class: 'sim' },
      h('section', { class: 'sim-col', 'aria-labelledby': 'sim-t1' },
        h('h2', { id: 'sim-t1' }, 'Assembleur'),
        h('label', { for: 'sim-editeur', class: 'sr' }, 'Texte du programme'),
        editeur,
        h('p', { class: 'aide', id: 'sim-editeur-aide' }, 'Modifiez librement. Une instruction par ligne, commentaires après #, étiquettes suivies de deux-points.'),
        zErreurs,
        h('div', { class: 'commandes', role: 'toolbar', 'aria-label': 'Exécution' }, bPas, bAuto, bReset, bAsm,
          h('label', { for: 'sim-vitesse' }, 'Vitesse '),
          h('select', { id: 'sim-vitesse', onchange: (e) => { vitesse = Number(e.target.value); st.vitesse = vitesse; if (timer) { stop(); lecture(); } } },
            [[1200, 'Lente'], [600, 'Normale'], [150, 'Rapide']].map(([v, t]) => h('option', { value: v, selected: v === vitesse }, t)))),
        zEtat,
        h('h2', {}, 'Programme assemblé'), zListing),
      h('section', { class: 'sim-col', 'aria-labelledby': 'sim-t2' },
        zExplication,
        h('h2', { id: 'sim-t2' }, 'Registres'),
        h('div', { class: 'commandes' }, h('label', { for: 'sim-base' }, 'Affichage '),
          h('select', { id: 'sim-base', onchange: (e) => { base = e.target.value; st.base = base; rendre(); } }, [['dec', 'Décimal signé'], ['hex', 'Hexadécimal'], ['bin', 'Binaire']].map(([v, t]) => h('option', { value: v, selected: v === base }, t)))),
        zRegs,
        h('h2', {}, 'Mémoire'),
        h('div', { class: 'commandes' }, h('label', { for: 'sim-membase' }, 'Zone affichée '),
          h('select', { id: 'sim-membase', onchange: (e) => { memBase = Number(e.target.value); rendre(); } },
            [[DATA_BASE, 'Données (à partir de 0x100)'], [0x140, 'Suite des données (0x140)'], [0x3c0, 'Fin de la mémoire (0x3c0)'], [0, 'Début (0x000)']].map(([v, t]) => h('option', { value: v }, t)))),
        zMem,
        h('h2', {}, 'Derniers pas'), zJournal)),

    h('section', { class: 'doc', 'aria-labelledby': 'sim-doc' },
      h('h2', { id: 'sim-doc' }, 'Ce que ce simulateur exécute, exactement'),
      h('div', { class: 'doc-grille' },
        h('div', {}, h('h3', {}, '38 instructions sur les 40 de RV32I'),
          h('dl', { class: 'instrs' }, Object.entries(SUPPORTED).flatMap(([k, v]) => [h('dt', {}, k), h('dd', { class: 'mono' }, v.join(' '))])),
          h('p', {}, h('strong', {}, 'Non supportées : '), h('span', { class: 'mono' }, UNSUPPORTED.join(', ')), '. L\'assembleur les refuse avec un message.'),
          h('p', {}, h('strong', {}, 'Pseudo-instructions : '), h('span', { class: 'mono' }, PSEUDO.join(' ')), '. Elles sont traduites en instructions réelles, visibles dans le programme assemblé.'),
          h('p', {}, h('strong', {}, 'Directives : '), h('span', { class: 'mono' }, '.text .data .word'), '.')),
        h('div', {}, h('h3', {}, 'Sémantique respectée'),
          h('ul', {}, [
            'x0 se lit toujours à 0 ; une écriture dans x0 est sans effet.',
            'Registres et calculs sur 32 bits ; un dépassement est tronqué sans exception.',
            'Immédiats de 12 bits étendus en signe, y compris pour sltiu.',
            'Décalages limités aux 5 bits bas de la quantité.',
            'jalr force le bit 0 de l\'adresse à 0 ; une cible non multiple de 4 déclenche une erreur.',
            'lb et lh étendent le signe, lbu et lhu complètent par des zéros.',
          ].map((t) => h('li', {}, t))),
          h('details', { class: 'preuve bloc' }, h('summary', {}, 'Source de la sémantique'), h('ul', { class: 'srcs' }, sourceItem('riscv-isa')))),
        h('div', {}, h('h3', {}, 'Limites du modèle'),
          h('ul', {}, [
            'Assembleur simplifié : les instructions ne sont pas encodées en binaire et ne sont pas rangées en mémoire. Lire l\'adresse d\'une instruction ne renvoie pas son code machine.',
            `Mémoire de ${MEM_SIZE} octets, petit-boutiste. Code à partir de ${hexAddr(TEXT_BASE)}, données à partir de ${hexAddr(DATA_BASE)}.`,
            'Les accès non alignés sont refusés. Le standard laisse ce choix à l\'environnement d\'exécution.',
            'ebreak arrête le simulateur. Pas d\'appels système, d\'interruptions, de modes privilégiés ni de registres de contrôle.',
            'Pas de pipeline, de cache ni de notion de temps : une instruction, un pas.',
            `La lecture automatique s'arrête après ${LIMITE_AUTO} instructions.`,
          ].map((t) => h('li', {}, t)))))),
    pubsBloc('simulateur'));

  majExemples();
  assembler();
  return () => stop();
}
