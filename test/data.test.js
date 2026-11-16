import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SOURCES, STATUTS } from '../src/data/sources.js';
import { ACTEURS, RELATIONS, COUCHES, TYPES_REL, NIVEAUX, STADES, acteur } from '../src/data/actors.js';
import { GROUPES, DIMENSIONS, ISA_NE_DECIDE_PAS, LECTURE_BUSINESS } from '../src/data/compare.js';
import { DOSSIER_ARM } from '../src/data/dossier.js';
import { PUBLICATIONS, ACCES, TYPES_PUB, pub } from '../src/data/publications.js';
import { BRIQUES, NOTIONS, CAS } from '../src/data/bricks.js';

const checkFait = (x, ou) => {
  assert.ok(x.t && x.t.length > 5, `texte manquant (${ou})`);
  assert.ok(STATUTS[x.s], `statut inconnu « ${x.s} » (${ou})`);
  for (const id of x.src || []) assert.ok(SOURCES[id], `source inconnue « ${id} » (${ou})`);
  // Un fait « confirmé » exige au moins une source rouverte lors de l'audit.
  if (x.s === 'confirme') assert.ok((x.src || []).some((id) => SOURCES[id].audit), `fait confirmé sans source rouverte : ${x.t}`);
  if (x.s === 'declaration' || x.s === 'experimental' || x.s === 'estimation') assert.ok((x.src || []).length, `sans source : ${x.t}`);
};

test('sources : URL et champs complets', () => {
  for (const s of Object.values(SOURCES)) {
    assert.match(s.url, /^https:\/\//, s.id);
    assert.ok(s.titre && s.editeur && ['primaire', 'secondaire'].includes(s.nature), s.id);
  }
});

test('acteurs : rôles, faits sourcés, les 12 acteurs demandés', () => {
  for (const id of ['arm', 'intel', 'amd', 'sifive', 'andes', 'codasip', 'sipearl', 'tenstorrent', 'tsmc', 'samsung', 'synopsys', 'cadence']) {
    assert.equal(acteur(id).fiche, 'complete', id);
  }
  for (const a of ACTEURS) {
    assert.ok(a.roles.length >= 1, a.id);
    for (const r of a.roles) assert.ok(COUCHES.some((c) => c.id === r.couche), a.id);
    for (const [k, list] of Object.entries(a.faits)) list.forEach((x) => checkFait(x, `${a.id}/${k}`));
    for (const p of a.produits || []) { assert.ok(STADES[p.stade]); checkFait({ t: p.detail, s: p.s, src: p.src }, a.id); }
  }
  for (const c of COUCHES) assert.ok(ACTEURS.some((a) => a.roles.some((r) => r.couche === c.id)), `couche vide : ${c.id}`);
  assert.ok(ACTEURS.some((a) => a.roles.length > 1));
});

test('relations : extrémités connues, pas de doublon, sourcées', () => {
  const ids = new Set();
  for (const r of RELATIONS) {
    assert.ok(acteur(r.a) && acteur(r.b), r.id);
    assert.ok(TYPES_REL[r.type] && NIVEAUX[r.niveau], r.id);
    assert.ok(!ids.has(r.id), 'doublon ' + r.id); ids.add(r.id);
    assert.ok(r.src.length >= 1, r.id);
    checkFait({ t: r.texte, s: r.s, src: r.src }, r.id);
  }
});

test('comparateur : chaque case de chaque élément est remplie', () => {
  for (const g of GROUPES) {
    assert.ok(g.items.length >= 2);
    for (const i of g.items) {
      if (i.acteur) assert.ok(acteur(i.acteur), i.id);
      for (const d of DIMENSIONS) { assert.ok(i.cells[d.id] && i.cells[d.id].length, `${g.id}/${i.id}/${d.id}`); i.cells[d.id].forEach((x) => checkFait(x, `${g.id}/${i.id}/${d.id}`)); }
    }
  }
  ISA_NE_DECIDE_PAS.points.forEach((x) => checkFait(x, 'isa'));
  LECTURE_BUSINESS.forEach((b) => b.r.forEach((x) => checkFait(x, b.q)));
});

test('dossier Arm : chronologie triée, liens valides', () => {
  const D = DOSSIER_ARM;
  const dates = D.chronologie.map((e) => e.date);
  assert.deepEqual(dates, [...dates].sort());
  for (const e of D.chronologie) { checkFait({ t: e.texte, s: e.s, src: e.src }, e.titre); for (const l of e.liens) assert.ok(l.acteur ? acteur(l.acteur) : pub(l.pub), e.titre); }
  [...D.enBref, ...D.chaine.etabli, ...D.chaine.hypotheses, ...D.incertitudes].forEach((x) => checkFait(x, 'dossier'));
  D.tensions.forEach((t) => { assert.ok(acteur(t.a) && acteur(t.b)); checkFait({ t: t.texte, s: t.s, src: t.src }, t.titre); });
  D.implications.forEach((i) => i.points.forEach((x) => checkFait(x, i.pour)));
  D.contradictoire.forEach((c) => c.arguments.forEach((x) => checkFait(x, c.these)));
  D.pubs.forEach((id) => assert.ok(pub(id), id));
  D.notions.forEach((n) => assert.ok(NOTIONS.some((x) => x.id === n), n));
  for (const e of D.chaine.etages) { assert.ok(D.chaine.avant[e.id] && D.chaine.apres[e.id]); if (e.notion) assert.ok(NOTIONS.some((x) => x.id === e.notion), e.notion); }
});

test('publications : champs obligatoires et liens', () => {
  for (const p of PUBLICATIONS) {
    for (const k of ['titre', 'auteurs', 'date', 'question', 'these', 'methode', 'limites', 'commanditaire']) assert.ok(p[k], `${p.id}.${k}`);
    assert.ok(ACCES[p.acces] && TYPES_PUB[p.type] && SOURCES[p.source], p.id);
    assert.ok(SOURCES[p.source].audit, `publication non rouverte : ${p.id}`);
    p.acteurs.forEach((a) => assert.ok(acteur(a), `${p.id} → ${a}`));
    p.notions.forEach((n) => assert.ok(NOTIONS.some((x) => x.id === n), `${p.id} → ${n}`));
    for (const m of p.modules) assert.ok(['simulateur', 'carte', 'comparateur', 'dossier-arm'].includes(m) || BRIQUES.some((b) => 'brique:' + b.id === m), `${p.id} → ${m}`);
  }
});

test('briques et notions', () => {
  assert.equal(BRIQUES.length, 7); assert.equal(NOTIONS.length, 9);
  for (const b of BRIQUES) { b.liens.forEach((l) => assert.ok(BRIQUES.some((x) => x.id === l.vers))); b.sources.forEach((s) => assert.ok(SOURCES[s], s)); assert.ok(b.limites.length); }
  NOTIONS.forEach((n) => assert.ok(BRIQUES.some((b) => b.id === n.brique)));
  for (const c of CAS) { assert.equal(c.couches.length, 5); c.src.forEach((s) => assert.ok(SOURCES[s])); c.couches.forEach((x) => x.acteur && assert.ok(acteur(x.acteur), x.acteur)); }
});
