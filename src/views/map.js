import { h, remplir, etat, lien, fait, faits, pastille, sourceItem, fmtDate, pubsBloc } from '../ui.js';
import { ACTEURS, COUCHES, RELATIONS, TYPES, ARCHIS, SEGMENTS, STADES, TYPES_REL, NIVEAUX, acteur, relationsDe } from '../data/actors.js';
import { pubsActeur, ACCES } from '../data/publications.js';
import { DATE_VERIF } from '../data/sources.js';

// Relation vue depuis l'acteur `id` : libellé orienté et autre extrémité.
function vueRel(r, id) {
  const direct = r.a === id;
  const autre = direct ? r.b : r.a;
  let genre = r.type;
  if (r.type === 'client') genre = direct ? 'client' : 'fournisseur';
  const lib = direct ? TYPES_REL[r.type].label : TYPES_REL[r.type].inverse;
  return { autre, genre, lib };
}
const GENRE_NOM = { client: 'client', fournisseur: 'fournisseur', partenaire: 'partenaire', concurrent: 'concurrent', capital: 'capital' };

export function vueCarte(root) {
  const st = etat.carte;
  st.f = st.f || { couche: '', archi: '', segment: '' };

  const draw = (focus) => {
    const sel = st.sel ? acteur(st.sel) : null;
    const rels = sel ? relationsDe(sel.id) : [];
    const lies = new Map(); // id → Set de genres
    for (const r of rels) {
      const v = vueRel(r, sel.id);
      if (!lies.has(v.autre)) lies.set(v.autre, new Set());
      lies.get(v.autre).add(v.genre);
    }
    const passe = (a) => (!st.f.archi || a.archi.includes(st.f.archi)) && (!st.f.segment || a.segments.includes(st.f.segment));
    const nb = ACTEURS.filter((a) => passe(a) && (!st.f.couche || a.roles.some((r) => r.couche === st.f.couche))).length;

    const select = (id, label, opts, key) => h('span', { class: 'filtre' }, h('label', { for: id }, label),
      h('select', { id, onchange: (e) => { st.f[key] = e.target.value; draw(id); } }, h('option', { value: '' }, 'Tous'), Object.entries(opts).map(([k, v]) => h('option', { value: k, selected: st.f[key] === k }, v))));

    const carte = h('div', { class: 'couches-carte' }, COUCHES.filter((c) => !st.f.couche || c.id === st.f.couche).map((c) => {
      const membres = ACTEURS.filter((a) => a.roles.some((r) => r.couche === c.id) && passe(a));
      return h('section', { class: 'couche', 'aria-labelledby': 'couche-' + c.id },
        h('div', { class: 'couche-tete' }, h('h3', { id: 'couche-' + c.id }, c.nom), h('p', { class: 'aide' }, c.aide)),
        h('div', { class: 'couche-acteurs' }, membres.length ? membres.map((a) => {
          const role = a.roles.find((r) => r.couche === c.id);
          const genres = lies.get(a.id);
          const estSel = sel && sel.id === a.id;
          return h('button', {
            type: 'button', 'data-acteur': a.id, 'aria-pressed': String(!!estSel),
            class: 'acteur type-' + a.type + (estSel ? ' sel' : '') + (sel && !estSel && !genres ? ' estompe' : '') + (genres ? ' lie' : ''),
            onclick: () => { st.sel = estSel ? null : a.id; st.rel = null; draw(); const f = document.getElementById('fiche'); if (f && st.sel) f.focus(); },
          },
          h('span', { class: 'acteur-nom' }, a.nom),
          h('span', { class: 'acteur-role' }, role.label),
          a.type !== 'entreprise' ? h('span', { class: 'acteur-type' }, TYPES[a.type]) : null,
          a.roles.length > 1 ? h('span', { class: 'acteur-multi' }, `${a.roles.length} rôles`) : null,
          genres ? h('span', { class: 'marques' }, [...genres].map((g) => h('span', { class: 'marque marque-' + g }, GENRE_NOM[g]))) : null);
        }) : h('p', { class: 'aide' }, 'Aucun acteur documenté ne correspond aux filtres.')));
    }));

    let fiche;
    if (!sel) {
      fiche = h('aside', { class: 'fiche vide', id: 'fiche', tabindex: '-1' },
        h('h2', {}, 'Sélectionnez un acteur'),
        h('p', {}, 'Sa fiche et ses relations documentées s\'affichent ici. Les acteurs liés sont marqués sur la carte : client, fournisseur, partenaire, concurrent ou lien en capital.'),
        h('p', {}, `${ACTEURS.length} entrées, ${RELATIONS.length} relations. Vérification au ${fmtDate(DATE_VERIF)}.`),
        h('p', { class: 'aide' }, 'Un même acteur apparaît dans chaque couche où il a un rôle. Les standards et l\'organisme de standardisation sont distingués des entreprises par leur bordure et leur mention.'));
    } else {
      const relSel = st.rel ? RELATIONS.find((r) => r.id === st.rel) : null;
      const pubs = pubsActeur(sel.id);
      fiche = h('aside', { class: 'fiche', id: 'fiche', tabindex: '-1', 'aria-label': 'Fiche de ' + sel.nom },
        h('div', { class: 'fiche-tete' }, h('h2', {}, sel.nom),
          h('button', { type: 'button', class: 'btn sec petit', onclick: () => { st.sel = null; st.rel = null; draw(); } }, 'Fermer')),
        h('p', { class: 'etiquettes' }, h('span', { class: 'etiquette' }, TYPES[sel.type]), sel.archi.map((a) => h('span', { class: 'etiquette' }, ARCHIS[a])), sel.fiche === 'courte' ? h('span', { class: 'etiquette' }, 'Fiche courte') : null),
        h('p', { class: 'court' }, sel.resume),
        h('h3', {}, sel.roles.length > 1 ? 'Rôles' : 'Rôle'),
        h('ul', { class: 'roles' }, sel.roles.map((r) => h('li', {}, h('strong', {}, COUCHES.find((c) => c.id === r.couche).nom + ' : '), r.label))),
        h('p', { class: 'aide' }, 'Segments : ' + sel.segments.map((s) => SEGMENTS[s]).join(', ') + '.'),
        Object.entries(sel.faits).map(([titre, list]) => [h('h3', {}, titre), faits(list)]),
        sel.produits ? [h('h3', {}, 'Produits et statut'), h('ul', { class: 'produits' }, sel.produits.map((p) => h('li', {}, h('strong', {}, p.nom), ' ', h('span', { class: 'stade stade-' + p.stade }, STADES[p.stade]), fait({ t: p.detail, s: p.s, src: p.src }, 'div'))))] : null,
        h('h3', {}, `Relations documentées (${rels.length})`),
        rels.length ? h('ul', { class: 'rels' }, rels.map((r) => {
          const v = vueRel(r, sel.id);
          const ouvert = st.rel === r.id;
          return h('li', {},
            h('button', { type: 'button', class: 'rel ' + (ouvert ? 'ouvert' : ''), 'aria-expanded': String(ouvert), 'data-rel': r.id, onclick: () => { st.rel = ouvert ? null : r.id; draw(); const b = root.querySelector(`[data-rel="${r.id}"]`); if (b) b.focus(); } },
              h('span', { class: 'marque marque-' + v.genre }, GENRE_NOM[v.genre]),
              h('span', {}, `${v.lib} `, h('strong', {}, acteur(v.autre).nom)), h('span', { class: 'rel-niv' }, NIVEAUX[r.niveau])),
            ouvert ? h('div', { class: 'rel-detail' },
              h('p', {}, r.texte),
              h('dl', { class: 'rel-meta' }, h('dt', {}, 'Niveau'), h('dd', {}, NIVEAUX[r.niveau]), h('dt', {}, 'Date'), h('dd', {}, /^\d{4}(-\d{2}){0,2}$/.test(r.date) ? fmtDate(r.date) : r.date), h('dt', {}, 'Statut'), h('dd', {}, pastille(r.s))),
              h('ul', { class: 'srcs' }, r.src.map(sourceItem)),
              h('button', { type: 'button', class: 'lien', onclick: () => { st.sel = v.autre; st.rel = null; draw(); document.getElementById('fiche').focus(); } }, `Ouvrir la fiche de ${acteur(v.autre).nom}`)) : null);
        })) : h('p', { class: 'aide' }, 'Aucune relation documentée avec les autres acteurs de la carte.'),
        sel.dossier ? h('p', {}, lien('Lire le dossier : Arm commercialise sa propre puce', 'dossier-arm', null, 'btn')) : null,
        pubs.length ? [h('h3', {}, 'Publications liées'), h('ul', { class: 'pubs-liste' }, pubs.map((p) => h('li', {}, lien(p.titre, 'bibliotheque', { pub: p.id }), h('span', { class: 'src-meta' }, ` ${fmtDate(p.date)}. ${ACCES[p.acces]}.`))))] : null);
    }

    remplir(root, 
      h('header', { class: 'vue-tete' }, h('h1', {}, 'Carte de l\'industrie'),
        h('p', { class: 'chapo' }, 'Six couches, du standard au boîtier. Deux entreprises ne sont pas concurrentes parce qu\'elles sont toutes deux « dans les semi-conducteurs » : la relation dépend de la couche.')),
      h('div', { class: 'filtres', role: 'search', 'aria-label': 'Filtres de la carte' },
        select('f-couche', 'Rôle', Object.fromEntries(COUCHES.map((c) => [c.id, c.nom])), 'couche'),
        select('f-archi', 'Architecture', ARCHIS, 'archi'),
        select('f-segment', 'Segment de marché', SEGMENTS, 'segment'),
        h('span', { class: 'filtre-n', id: 'carte-n', 'aria-live': 'polite' }, `${nb} entrée${nb > 1 ? 's' : ''}`),
        (st.f.couche || st.f.archi || st.f.segment) ? h('button', { type: 'button', class: 'btn sec petit', onclick: () => { st.f = { couche: '', archi: '', segment: '' }; draw('f-couche'); } }, 'Effacer les filtres') : null),
      h('div', { class: 'carte' }, carte, fiche),
      pubsBloc('carte', 'Publications utiles pour lire cette carte'));
    if (focus) { const el = document.getElementById(focus); if (el) el.focus(); }
  };
  draw();
  if (st.sel) { const f = document.getElementById('fiche'); if (f) f.scrollIntoView({ block: 'nearest' }); }
}
