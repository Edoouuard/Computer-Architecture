import { h, remplir, etat, lien, fmtDate, sourceItem } from '../ui.js';
import { PUBLICATIONS, ACCES, TYPES_PUB } from '../data/publications.js';
import { acteur } from '../data/actors.js';
import { NOTIONS } from '../data/bricks.js';
import { DATE_VERIF } from '../data/sources.js';

const MODULES = { explorateur: 'Explorateur', simulateur: 'Simulateur', carte: 'Carte', comparateur: 'Comparateur', 'dossier-arm': 'Dossier Arm' };

export function vueBibliotheque(root) {
  const st = etat.bibliotheque;
  st.f = st.f || { type: '', acces: '', notion: '', q: '' };

  const cibleModule = (m) => (m.startsWith('brique:') ? ['explorateur', { brique: m.slice(7) }, 'Explorateur'] : [m, null, MODULES[m]]);

  const liste = h('div', { id: 'bib-liste' });
  const compteur = h('span', { class: 'filtre-n', id: 'bib-n', 'aria-live': 'polite' });

  const drawListe = () => {
    const q = st.f.q.trim().toLowerCase();
    const res = PUBLICATIONS.filter((p) => (!st.f.type || p.type === st.f.type) && (!st.f.acces || p.acces === st.f.acces) && (!st.f.notion || p.notions.includes(st.f.notion))
      && (!q || [p.titre, p.auteurs, p.these, p.question].join(' ').toLowerCase().includes(q)));
    compteur.textContent = `${res.length} publication${res.length > 1 ? 's' : ''} sur ${PUBLICATIONS.length}`;
    remplir(liste, res.length ? h('ul', { class: 'pubs' }, res.map((p) => {
      const ouvert = st.pub === p.id;
      return h('li', { class: 'pub ' + (ouvert ? 'ouverte' : ''), id: 'pub-' + p.id },
        h('div', { class: 'pub-tete' },
          h('h2', {}, h('button', { type: 'button', class: 'pub-titre', 'aria-expanded': String(ouvert), onclick: () => { st.pub = ouvert ? null : p.id; drawListe(); const b = document.querySelector(`#pub-${p.id} .pub-titre`); if (b) b.focus(); } }, p.titre)),
          h('p', { class: 'pub-meta' }, `${p.auteurs}. ${p.lieu}, ${fmtDate(p.date)}.`),
          h('p', { class: 'etiquettes' }, h('span', { class: 'etiquette' }, TYPES_PUB[p.type]), h('span', { class: 'etiquette acces-' + p.acces }, ACCES[p.acces]))),
        h('p', { class: 'pub-these' }, h('strong', {}, 'Thèse ou résultat. '), p.these),
        ouvert ? h('div', { class: 'pub-corps' },
          h('dl', {},
            h('dt', {}, 'Question étudiée'), h('dd', {}, p.question),
            h('dt', {}, 'Méthode'), h('dd', {}, p.methode),
            h('dt', {}, 'Limites'), h('dd', {}, p.limites),
            h('dt', {}, 'Commanditaire connu'), h('dd', {}, p.commanditaire),
            h('dt', {}, 'Accès'), h('dd', {}, `${ACCES[p.acces]}, le ${fmtDate(DATE_VERIF)}.`),
            h('dt', {}, 'Lien'), h('dd', {}, h('ul', { class: 'srcs' }, sourceItem(p.source))),
            h('dt', {}, 'Notions'), h('dd', {}, p.notions.map((n) => lien(n, 'explorateur', { notion: n, brique: NOTIONS.find((x) => x.id === n).brique }, 'puce-lien'))),
            h('dt', {}, 'Acteurs'), h('dd', {}, p.acteurs.map((a) => lien(acteur(a).nom, 'carte', { sel: a }, 'puce-lien'))),
            h('dt', {}, 'Utilisée dans'), h('dd', {}, p.modules.map((m) => { const [v, patch, nom] = cibleModule(m); return lien(nom, v, patch, 'puce-lien'); })))) : null);
    })) : h('p', { class: 'aide' }, 'Aucune publication ne correspond. Élargissez les filtres.'));
  };

  const sel = (id, label, opts, key) => h('span', { class: 'filtre' }, h('label', { for: id }, label),
    h('select', { id, onchange: (e) => { st.f[key] = e.target.value; drawListe(); } }, h('option', { value: '' }, 'Tous'), Object.entries(opts).map(([k, v]) => h('option', { value: k, selected: st.f[key] === k }, v))));

  remplir(root, 
    h('header', { class: 'vue-tete' }, h('h1', {}, 'Bibliothèque'),
      h('p', { class: 'chapo' }, 'Articles scientifiques, documents techniques, rapports d\'entreprise et analyses cités dans le laboratoire. Pour chacun : ce qui a réellement été lu, la méthode, les limites et le commanditaire.')),
    h('div', { class: 'filtres', role: 'search', 'aria-label': 'Filtres de la bibliothèque' },
      sel('bib-type', 'Type', TYPES_PUB, 'type'), sel('bib-acces', 'Accès', ACCES, 'acces'),
      sel('bib-notion', 'Notion', Object.fromEntries(NOTIONS.map((n) => [n.id, n.id])), 'notion'),
      h('span', { class: 'filtre' }, h('label', { for: 'bib-q' }, 'Recherche'), h('input', { type: 'search', id: 'bib-q', value: st.f.q, placeholder: 'titre, auteur, thèse', oninput: (e) => { st.f.q = e.target.value; drawListe(); } })),
      compteur),
    liste,
    h('p', { class: 'aide' }, 'Statut « inaccessible » : aucune publication retenue n\'est dans ce cas. Les documents que l\'audit n\'a pas pu ouvrir ne figurent pas ici ; ils apparaissent comme sources « non rouvertes » dans les fiches.'));
  drawListe();
  if (st.pub) { const el = document.getElementById('pub-' + st.pub); if (el) el.scrollIntoView({ block: 'start' }); }
}
