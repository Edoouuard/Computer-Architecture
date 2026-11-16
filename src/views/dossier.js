import { h, remplir, etat, lien, fait, faits, pastille, sourceItem, fmtDate, onglets, aller } from '../ui.js';
import { DOSSIER_ARM as D } from '../data/dossier.js';
import { acteur } from '../data/actors.js';
import { pub, ACCES, TYPES_PUB } from '../data/publications.js';
import { NOTIONS } from '../data/bricks.js';
import { DATE_VERIF } from '../data/sources.js';

export function vueDossier(root) {
  const st = etat['dossier-arm'];
  if (!st.moment) st.moment = 'apres';
  if (st.filtre === undefined) st.filtre = '';

  const draw = (focus) => {
    const ch = D.chaine; const etatChaine = ch[st.moment];
    const events = D.chronologie.filter((e) => !st.filtre || e.s === st.filtre);
    const sections = [['bref', 'En bref'], ['chrono', 'Chronologie'], ['chaine', 'Chaîne de valeur'], ['tensions', 'Relations'], ['implications', 'Implications'], ['debat', 'Arguments'], ['incertain', 'Incertitudes'], ['preuves', 'Publications']];

    remplir(root, 
      h('header', { class: 'vue-tete' }, h('p', { class: 'surtitre' }, 'Dossier stratégique'), h('h1', {}, D.titre), h('p', { class: 'chapo' }, D.chapo),
        h('p', { class: 'aide' }, `État des faits au ${fmtDate(DATE_VERIF)}. Chaque affirmation porte son statut ; dépliez-la pour voir ses sources.`)),
      h('nav', { class: 'sommaire', 'aria-label': 'Sections du dossier' }, sections.map(([id, nom]) => h('button', { type: 'button', class: 'puce-btn', onclick: () => { const el = document.getElementById('d-' + id); el.scrollIntoView({ block: 'start' }); el.focus(); } }, nom))),

      h('section', { id: 'd-bref', tabindex: '-1' }, h('h2', {}, 'En bref'), faits(D.enBref)),

      h('section', { id: 'd-chrono', tabindex: '-1' }, h('h2', {}, 'Chronologie sourcée'),
        h('div', { class: 'commandes' }, h('label', { for: 'd-filtre' }, 'Afficher '),
          h('select', { id: 'd-filtre', onchange: (e) => { st.filtre = e.target.value; draw('d-filtre'); } },
            [['', 'Tous les événements'], ['confirme', 'Faits confirmés seulement'], ['declaration', 'Déclarations d\'Arm'], ['estimation', 'Estimations'], ['hypothese', 'Hypothèses']].map(([v, t]) => h('option', { value: v, selected: st.filtre === v }, t))),
          h('span', { class: 'aide', 'aria-live': 'polite' }, `${events.length} événement${events.length > 1 ? 's' : ''}`)),
        h('ol', { class: 'frise' }, events.map((e) => h('li', { class: 'frise-item statut-bord-' + e.s },
          h('time', { datetime: e.date }, fmtDate(e.date)),
          h('div', { class: 'frise-corps' }, h('h3', {}, e.titre),
            fait({ t: e.texte, s: e.s, src: e.src }, 'div'),
            h('p', { class: 'frise-liens' }, e.liens.map((l) => l.acteur ? lien(acteur(l.acteur).nom, 'carte', { sel: l.acteur }, 'puce-lien') : lien('Publication', 'bibliotheque', { pub: l.pub }, 'puce-lien'))))))),
        events.length ? null : h('p', { class: 'aide' }, 'Aucun événement de ce statut.')),

      h('section', { id: 'd-chaine', tabindex: '-1' }, h('h2', {}, 'La chaîne de valeur, avant et après'),
        h('p', {}, 'Qui occupe chaque étage, du jeu d\'instructions au centre de données. Les cases d\'Arm sont marquées ; ce qui apparaît avec l\'AGI CPU est signalé comme nouveau.'),
        onglets([{ id: 'avant', nom: 'Avant mars 2026' }, { id: 'apres', nom: 'Depuis mars 2026' }], st.moment, (id) => { st.moment = id; draw(); const t = root.querySelector('#d-chaine [aria-selected="true"]'); if (t) t.focus(); }, 'Moment'),
        h('div', { class: 'table-scroll' }, h('table', { class: 'chaine-valeur', id: 'chaine-table' },
          h('thead', {}, h('tr', {}, h('th', {}, 'Étage'), h('th', {}, 'Qui l\'occupe'))),
          h('tbody', {}, ch.etages.map((e) => h('tr', {},
            h('th', { scope: 'row' }, e.nom, e.notion ? h('span', { class: 'bloc-lien' }, lien('notion : ' + e.notion, 'explorateur', { notion: e.notion, brique: NOTIONS.find((n) => n.id === e.notion).brique })) : null),
            h('td', {}, etatChaine[e.id].map((o) => h('span', { class: 'occupant ' + (o.arm ? 'arm ' : '') + (o.nouveau ? 'nouveau' : '') }, o.qui, o.nouveau ? h('span', { class: 'tag-nouveau' }, 'nouveau') : null)))))))),
        h('div', { class: 'deux-col' },
          h('div', {}, h('h3', {}, 'Ce qui est établi'), faits(ch.etabli)),
          h('div', {}, h('h3', {}, 'Ce qui reste une hypothèse ou n\'est pas vérifié'), faits(ch.hypotheses)))),

      h('section', { id: 'd-tensions', tabindex: '-1' }, h('h2', {}, 'Des relations commerciales qui deviennent aussi concurrentielles'),
        h('div', { class: 'tensions' }, D.tensions.map((t) => h('article', { class: 'tension' }, h('h3', {}, t.titre),
          fait({ t: t.texte, s: t.s, src: t.src }, 'div'),
          h('p', { class: 'frise-liens' }, lien('Fiche ' + acteur(t.a).nom, 'carte', { sel: t.a }, 'puce-lien'), lien('Fiche ' + acteur(t.b).nom, 'carte', { sel: t.b }, 'puce-lien')))))),

      h('section', { id: 'd-implications', tabindex: '-1' }, h('h2', {}, 'Implications possibles'),
        h('div', { class: 'trois-col' }, D.implications.map((i) => h('div', {}, h('h3', {}, i.pour), faits(i.points))))),

      h('section', { id: 'd-debat', tabindex: '-1' }, h('h2', {}, 'Deux lectures qui s\'opposent'),
        h('div', { class: 'deux-col' }, D.contradictoire.map((c) => h('div', { class: 'these' }, h('h3', {}, c.these), faits(c.arguments))))),

      h('section', { id: 'd-incertain', tabindex: '-1' }, h('h2', {}, 'Ce qui reste incertain'), faits(D.incertitudes)),

      h('section', { id: 'd-preuves', tabindex: '-1' }, h('h2', {}, 'Publications et notions à l\'appui'),
        h('ul', { class: 'pubs-liste' }, D.pubs.map((id) => { const p = pub(id); return h('li', {}, lien(p.titre, 'bibliotheque', { pub: p.id }), h('span', { class: 'src-meta' }, ` ${p.auteurs}, ${fmtDate(p.date)}. ${TYPES_PUB[p.type]}. ${ACCES[p.acces]}.`)); })),
        h('p', {}, 'Notions utiles : ', D.notions.map((n) => lien(n, 'explorateur', { notion: n, brique: NOTIONS.find((x) => x.id === n).brique }, 'puce-lien')))));
    if (focus) { const el = document.getElementById(focus); if (el) el.focus(); }
  };
  draw();
}
