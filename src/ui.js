import { SOURCES, STATUTS, DATE_VERIF } from './data/sources.js';
import { PUBLICATIONS, ACCES, TYPES_PUB } from './data/publications.js';

// Petit constructeur d'éléments DOM : h('div', { class: 'x', onclick }, enfants…)
export function h(tag, attrs, ...kids) {
  const el = tag === 'svg' || SVG_TAGS.has(tag)
    ? document.createElementNS('http://www.w3.org/2000/svg', tag)
    : document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === false || v === null || v === undefined) continue;
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'class') el.setAttribute('class', v);
    else if (k === 'html') el.innerHTML = v;
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, v);
  }
  for (const kid of kids.flat(Infinity)) {
    if (kid === null || kid === undefined || kid === false) continue;
    el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  return el;
}
const SVG_TAGS = new Set(['g', 'rect', 'line', 'circle', 'path', 'text', 'polyline', 'polygon', 'title', 'tspan']);

export const fmtDate = (d) => {
  if (!d) return 'non datée';
  const m = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/.exec(d);
  if (!m) return d;
  const mois = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  if (m[3]) return `${Number(m[3])} ${mois[Number(m[2]) - 1]} ${m[1]}`;
  if (m[2]) return `${mois[Number(m[2]) - 1]} ${m[1]}`;
  return m[1];
};

// ---- Navigation entre espaces, avec un état transmis (acteur, brique, publication…) ----
export const etat = { explorateur: {}, simulateur: {}, carte: {}, comparateur: {}, 'dossier-arm': {}, bibliotheque: {} };
export function aller(vue, patch) {
  if (patch) Object.assign(etat[vue], patch);
  if (location.hash === '#' + vue) window.dispatchEvent(new HashChangeEvent('hashchange'));
  else location.hash = vue;
}
export const lien = (texte, vue, patch, cls = 'lien') => h('button', { type: 'button', class: cls, onclick: () => aller(vue, patch) }, texte);

// ---- Statuts et sources ----
export function pastille(s) {
  const st = STATUTS[s];
  return h('span', { class: `statut statut-${s}`, title: st.aide }, st.court);
}

export function sourceItem(id) {
  const s = SOURCES[id];
  if (!s) return h('li', {}, `Source manquante : ${id}`);
  return h('li', { class: 'src' },
    h('a', { href: s.url, target: '_blank', rel: 'noopener noreferrer' }, s.titre),
    h('span', { class: 'src-meta' }, ` ${s.editeur}${s.date ? ', ' + fmtDate(s.date) : ''}. Source ${s.nature}. `,
      s.audit ? `Rouverte le ${fmtDate(DATE_VERIF)}.` : 'Reprise du rapport initial, non rouverte lors de l\'audit.'));
}

// Une affirmation : texte, statut, sources dépliables.
export function fait(x, tag = 'li') {
  const n = x.src ? x.src.length : 0;
  return h(tag, { class: 'fait' },
    h('span', { class: 'fait-texte' }, x.t), ' ',
    h('details', { class: 'preuve' },
      h('summary', {}, pastille(x.s), h('span', { class: 'preuve-n' }, n ? `${n} source${n > 1 ? 's' : ''}` : 'sans source')),
      h('div', { class: 'preuve-corps' },
        h('p', { class: 'aide' }, STATUTS[x.s].label + '. ' + STATUTS[x.s].aide),
        n ? h('ul', { class: 'srcs' }, x.src.map(sourceItem))
          : h('p', { class: 'aide' }, x.s === 'hypothese' ? 'Raisonnement de ce laboratoire, sans source dédiée.' : 'Aucune source rouverte : à vérifier avant toute décision.'))));
}
export const faits = (list) => h('ul', { class: 'faits' }, list.map((x) => fait(x)));

export function legendeStatuts() {
  return h('dl', { class: 'legende' }, Object.entries(STATUTS).flatMap(([k, v]) => [h('dt', {}, pastille(k)), h('dd', {}, v.aide)]));
}

// ---- Publications pertinentes affichées dans les modules ----
export function pubsBloc(module, titre = 'Publications à l\'appui') {
  const list = PUBLICATIONS.filter((p) => p.modules.includes(module));
  if (!list.length) return null;
  return h('aside', { class: 'pubs-bloc' },
    h('h3', {}, titre),
    h('ul', {}, list.map((p) => h('li', {},
      lien(p.titre, 'bibliotheque', { pub: p.id }),
      h('span', { class: 'src-meta' }, ` ${p.auteurs}, ${fmtDate(p.date)}. ${TYPES_PUB[p.type]}. ${ACCES[p.acces]}.`),
      h('span', { class: 'pub-these' }, ' ' + p.these)))));
}

export function onglets(items, actif, onpick, label) {
  return h('div', { class: 'onglets', role: 'tablist', 'aria-label': label },
    items.map((it) => h('button', {
      type: 'button', role: 'tab', class: 'onglet', 'aria-selected': String(it.id === actif), onclick: () => onpick(it.id),
    }, it.nom)));
}

export const animOk = () => !document.documentElement.hasAttribute('data-sans-anim')
  && !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches && !document.documentElement.hasAttribute('data-anim-forcee'));

// Remplace le contenu d'un élément en acceptant tableaux imbriqués, null et false.
export function remplir(el, ...kids) {
  el.replaceChildren(...kids.flat(Infinity).filter((k) => k !== null && k !== undefined && k !== false).map((k) => (k.nodeType ? k : document.createTextNode(String(k)))));
}
