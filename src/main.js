import { h, legendeStatuts, fmtDate } from './ui.js';
import { DATE_VERIF } from './data/sources.js';
import { vueExplorateur } from './views/explorer.js';
import { vueSimulateur } from './views/simulator.js';
import { vueCarte } from './views/map.js';
import { vueComparateur } from './views/compare.js';
import { vueDossier } from './views/dossier.js';
import { vueBibliotheque } from './views/library.js';

const VUES = [
  { id: 'explorateur', nom: 'Explorateur', titre: 'De l\'instruction à la puce', rendu: vueExplorateur },
  { id: 'simulateur', nom: 'Simulateur', titre: 'Simulateur de processeur', rendu: vueSimulateur },
  { id: 'carte', nom: 'Carte', titre: 'Carte de l\'industrie', rendu: vueCarte },
  { id: 'comparateur', nom: 'Comparateur', titre: 'Comparateur', rendu: vueComparateur },
  { id: 'dossier-arm', nom: 'Dossier Arm', titre: 'Dossier Arm', rendu: vueDossier },
  { id: 'bibliotheque', nom: 'Bibliothèque', titre: 'Bibliothèque', rendu: vueBibliotheque },
];

const main = document.getElementById('contenu');
const nav = document.getElementById('nav');
let nettoyage = null;

function lire(cle) { try { return localStorage.getItem(cle); } catch { return null; } }
function ecrire(cle, v) { try { localStorage.setItem(cle, v); } catch { /* stockage indisponible : réglage valable pour cette visite */ } }

function route() {
  const id = (location.hash || '').replace('#', '');
  const vue = VUES.find((v) => v.id === id) || VUES[0];
  if (typeof nettoyage === 'function') nettoyage();
  nav.replaceChildren(...VUES.map((v) => h('a', { href: '#' + v.id, class: 'nav-lien', 'aria-current': v.id === vue.id ? 'page' : null }, v.nom)));
  main.replaceChildren();
  try {
    nettoyage = vue.rendu(main) || null;
  } catch (e) {
    nettoyage = null;
    main.replaceChildren(h('div', { class: 'erreurs', role: 'alert' }, h('strong', {}, 'Cet espace n\'a pas pu s\'afficher.'), h('p', {}, String(e && e.message ? e.message : e))));
    console.error(e);
  }
  document.title = 'Labo Puces';
  window.scrollTo(0, 0);
  const actif = nav.querySelector('[aria-current="page"]');
  if (actif && actif.scrollIntoView) actif.scrollIntoView({ block: 'nearest', inline: 'center' });
}

// Réglage des animations : désactivables, et coupées d'office si le système le demande.
const bAnim = document.getElementById('reglage-anim');
function majAnim() {
  const coupe = document.documentElement.hasAttribute('data-sans-anim');
  bAnim.setAttribute('aria-pressed', String(!coupe));
  bAnim.textContent = coupe ? 'Animations : coupées' : 'Animations : actives';
}
if (lire('labo-anim') === 'non' || (lire('labo-anim') === null && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) document.documentElement.setAttribute('data-sans-anim', '');
bAnim.addEventListener('click', () => {
  const coupe = document.documentElement.toggleAttribute('data-sans-anim');
  if (!coupe) document.documentElement.setAttribute('data-anim-forcee', ''); else document.documentElement.removeAttribute('data-anim-forcee');
  ecrire('labo-anim', coupe ? 'non' : 'oui');
  majAnim(); route();
});
majAnim();

document.getElementById('legende').append(legendeStatuts());
document.getElementById('date-verif').textContent = fmtDate(DATE_VERIF);

window.addEventListener('hashchange', route);
route();
