import { h, remplir, etat, lien, faits, onglets, pubsBloc } from '../ui.js';
import { DIMENSIONS, GROUPES, ISA_NE_DECIDE_PAS, LECTURE_BUSINESS } from '../data/compare.js';

export function vueComparateur(root) {
  const st = etat.comparateur;
  if (!st.niveau) st.niveau = 'architectures';
  if (!st.groupe) st.groupe = 'ip';
  if (!st.choix) st.choix = {};
  if (!st.dim) st.dim = 'toutes';

  const draw = (focus) => {
    const groupe = st.niveau === 'architectures' ? GROUPES[0] : GROUPES.find((g) => g.id === st.groupe);
    if (!st.choix[groupe.id]) st.choix[groupe.id] = groupe.items.slice(0, 3).map((i) => i.id);
    const choix = st.choix[groupe.id];
    const items = groupe.items.filter((i) => choix.includes(i.id));
    const dims = st.dim === 'toutes' ? DIMENSIONS : DIMENSIONS.filter((d) => d.id === st.dim);
    const basculer = (id) => {
      const i = choix.indexOf(id);
      if (i >= 0) { if (choix.length > 2) choix.splice(i, 1); } else if (choix.length < 3) choix.push(id);
      draw('cmp-' + id);
    };

    remplir(root, 
      h('header', { class: 'vue-tete' }, h('h1', {}, 'Comparateur'),
        h('p', { class: 'chapo' }, 'Deux niveaux séparés : les jeux d\'instructions d\'un côté, les entreprises et produits de l\'autre. Aucun score ni classement : chaque case porte son statut et ses sources.')),
      onglets([{ id: 'architectures', nom: 'Architectures' }, { id: 'entreprises', nom: 'Entreprises et produits' }], st.niveau, (id) => { st.niveau = id; draw(); }, 'Niveau de comparaison'),

      st.niveau === 'entreprises' ? h('div', { class: 'commandes' }, h('label', { for: 'cmp-groupe' }, 'Famille comparée '),
        h('select', { id: 'cmp-groupe', onchange: (e) => { st.groupe = e.target.value; draw('cmp-groupe'); } }, GROUPES.filter((g) => g.niveau === 'entreprises').map((g) => h('option', { value: g.id, selected: g.id === st.groupe }, g.nom))),
        h('span', { class: 'aide' }, 'On ne compare qu\'à l\'intérieur d\'une même famille.')) : null,

      h('p', { class: 'note' }, groupe.note),
      h('fieldset', { class: 'choix' }, h('legend', {}, `Éléments à comparer (2 ou 3 sur ${groupe.items.length})`),
        groupe.items.map((i) => {
          const on = choix.includes(i.id);
          const bloque = (on && choix.length <= 2) || (!on && choix.length >= 3);
          return h('label', { class: 'case ' + (bloque ? 'bloque' : ''), title: bloque ? (on ? 'Il faut au moins deux éléments.' : 'Trois éléments au maximum : décochez-en un d\'abord.') : '' },
            h('input', { type: 'checkbox', id: 'cmp-' + i.id, checked: on, disabled: bloque, onchange: () => basculer(i.id) }), i.nom);
        }),
        groupe.items.length > 2 ? h('span', { class: 'aide' }, choix.length <= 2 ? 'Minimum atteint : cochez un troisième élément pour pouvoir en retirer un.' : 'Maximum atteint : décochez un élément pour en choisir un autre.') : null),
      h('div', { class: 'commandes' }, h('label', { for: 'cmp-dim' }, 'Angle '),
        h('select', { id: 'cmp-dim', onchange: (e) => { st.dim = e.target.value; draw('cmp-dim'); } }, h('option', { value: 'toutes', selected: st.dim === 'toutes' }, 'Tous les angles'), DIMENSIONS.map((d) => h('option', { value: d.id, selected: d.id === st.dim }, d.nom)))),

      h('div', { class: 'cmp', style: `--cols:${items.length}`, id: 'cmp-table' },
        h('div', { class: 'cmp-ligne cmp-entete' }, h('div', { class: 'cmp-dim' }), items.map((i) => h('div', { class: 'cmp-col-tete' }, h('strong', {}, i.nom), i.acteur ? lien('Voir sur la carte', 'carte', { sel: i.acteur }) : null))),
        dims.map((d) => h('div', { class: 'cmp-ligne', 'data-dim': d.id },
          h('h3', { class: 'cmp-dim' }, d.nom),
          items.map((i) => h('div', { class: 'cmp-case' }, h('span', { class: 'cmp-qui' }, i.nom), faits(i.cells[d.id])))))),

      st.niveau === 'architectures' ? [
        h('section', { class: 'encadre', 'aria-labelledby': 'isa-pas' }, h('h2', { id: 'isa-pas' }, ISA_NE_DECIDE_PAS.titre),
          h('p', {}, 'Performance, consommation et coût se décident en dessous de l\'ISA : dans la microarchitecture, le procédé de fabrication et le packaging.'),
          faits(ISA_NE_DECIDE_PAS.points),
          h('p', {}, lien('Revoir la différence entre ISA et microarchitecture', 'explorateur', { brique: 'coeur', notion: 'Microarchitecture' }))),
        h('section', { 'aria-labelledby': 'biz' }, h('h2', { id: 'biz' }, 'Lecture business'),
          h('div', { class: 'biz' }, LECTURE_BUSINESS.map((b) => h('div', { class: 'biz-q' }, h('h3', {}, b.q), faits(b.r))))),
      ] : null,
      pubsBloc('comparateur'));
    if (focus) { const el = document.getElementById(focus); if (el) el.focus(); }
  };
  draw();
}
