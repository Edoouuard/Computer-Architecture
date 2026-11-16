// Vérification des parcours dans un vrai navigateur (Chrome sans interface).
// Usage : npm run build && npm run check   (nécessite Playwright et Chrome installés)
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/npm-tools/node_modules/playwright')); }

const url = pathToFileURL(path.resolve('dist/index.html')).href;
const browser = await chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
const erreurs = [];
const ok = (m) => console.log('  ✓ ' + m);

async function page(viewport) {
  const p = await browser.newPage({ viewport });
  p.on('pageerror', (e) => erreurs.push(String(e)));
  p.on('console', (m) => { if (m.type() === 'error' && !/fonts\.g|net::ERR/.test(m.text())) erreurs.push(m.text()); });
  await p.goto(url);
  return p;
}
const txt = (p, sel) => p.locator(sel).innerText();
const titre = (p, re) => p.waitForFunction((src) => new RegExp(src).test(document.querySelector('h1') ? document.querySelector('h1').innerText : ''), re.source, { timeout: 5000 });

console.log('Bureau 1280×900');
const p = await page({ width: 1280, height: 900 });

// 1. Explorer une brique
assert.match(await txt(p, 'h1'), /instruction à la puce/);
assert.equal(await p.locator('.maillon').count(), 7);
await p.click('#viz-transistor-bascule');
assert.match(await txt(p, '#viz-zone .lecture'), /Sortie = 0/);
await p.click('#brique-portes'); await p.click('#viz-b');
assert.equal(await txt(p, '#viz-porte-sortie'), '0'); // NON-ET(1,1)
await p.click('#brique-alu'); await p.selectOption('#viz-alu-op', 'Addition');
assert.match(await txt(p, '#viz-alu-res'), /^68 /); // 45 + 23
assert.match(await txt(p, '#viz-alu-reg'), /^0,/);
await p.click('#viz-alu-horloge'); assert.match(await txt(p, '#viz-alu-reg'), /^68,/);
await p.click('#brique-coeur'); for (let i = 0; i < 4; i++) await p.click('#viz-coeur-suivant');
assert.match(await txt(p, '#viz-coeur-texte'), /42 est écrit dans x7/);
await p.click('#brique-cache'); await p.click('#viz-cache-8');
assert.match(await txt(p, '#viz-cache-bilan'), /6 succès sur 8/);
await p.selectOption('#viz-cache-motif', { index: 1 }); await p.click('#viz-cache-8');
assert.match(await txt(p, '#viz-cache-bilan'), /0 succès sur 8/);
await p.click('#brique-soc'); await p.click('#viz-soc-npu'); assert.match(await txt(p, '#viz-zone .lecture'), /Accélérateur/);
await p.click('#brique-package');
assert.equal(await txt(p, '#viz-pkg-mono'), '45 %'); assert.equal(await txt(p, '#viz-pkg-chip'), '82 %'); // e^-0.8, e^-0.2
await p.fill('#viz-pkg-d', '0.5'); assert.equal(await txt(p, '#viz-pkg-mono'), '14 %');
await p.selectOption('#cas-select', 'rhea1'); assert.match(await txt(p, '.couches'), /SiPearl/);
await p.click('.notions >> text=Chiplet'); assert.match(await txt(p, '#notion-def'), /même package/);
ok('explorateur : 7 briques manipulées, vue des distinctions, notions');

// 2. Exécuter un programme pas à pas
await p.click('.nav >> text=Simulateur'); await titre(p, /Simulateur/);
assert.match(await txt(p, 'h1'), /Simulateur/);
await p.click('#sim-pas');
assert.match(await txt(p, '#sim-explication'), /x5 ← x0 \+ 7/);
assert.equal(await p.locator('#reg-5.modifie').count(), 1);
assert.equal(await txt(p, '#sim-pc'), '0x004');
assert.equal(await p.locator('#sim-listing tr.courant').getAttribute('data-addr'), '4');
await p.click('#sim-pas'); await p.click('#sim-pas');
assert.match(await txt(p, '#reg-7'), /42/);
await p.click('#sim-reset'); assert.match(await txt(p, '#reg-7'), /x7\s*t2\s*0/);
await p.click('#ex-memoire'); await p.selectOption('#sim-vitesse', '150'); await p.click('#sim-auto');
await p.waitForFunction(() => /terminé/.test(document.querySelector('#sim-etat').innerText), null, { timeout: 20000 });
assert.match(await txt(p, '#reg-12'), /145/);
assert.match(await txt(p, '#mem-276'), /145/); // 0x114
assert.match(await txt(p, '#sim-etat'), /39 instructions/);
// modification du programme par l'utilisateur
await p.fill('#sim-editeur', 'addi x1, x0, 5\nslli x2, x1, 3\nebreak');
await p.click('#sim-pas'); await p.click('#sim-pas'); assert.match(await txt(p, '#reg-2'), /40/);
await p.fill('#sim-editeur', 'addi x1, x0, 99999\nfoo'); await p.click('#sim-assembler');
assert.match(await txt(p, '#sim-erreurs'), /2 erreurs[\s\S]*Ligne 1[\s\S]*Ligne 2/);
assert.equal(await p.locator('#sim-pas').isDisabled(), true);
await p.click('#ex-boucle'); await p.click('#sim-auto'); await p.click('#sim-auto'); // lecture puis pause
assert.equal(await txt(p, '#sim-auto'), 'Lecture');
ok('simulateur : pas à pas, lecture auto, pause, réinitialisation, édition, erreurs');

// 3. Carte : acteur et relations
await p.click('.nav >> text=Carte'); await titre(p, /Carte/);
assert.ok(await p.locator('.acteur').count() > 25);
assert.equal(await p.locator('[data-acteur="arm"]').count(), 3); // trois rôles, trois couches
await p.locator('[data-acteur="arm"]').first().click();
assert.match(await txt(p, '#fiche'), /Vendeur de puces depuis mars 2026/);
assert.ok(await p.locator('.acteur.lie').count() >= 8);
await p.click('[data-rel="arm-client-tsmc-fonderie"]');
assert.match(await txt(p, '.rel-detail'), /3 nm[\s\S]*Fonderie[\s\S]*Confirmé[\s\S]*Arm \(communiqué\)/);
await p.click('.rel-detail >> text=Ouvrir la fiche de TSMC'); assert.match(await txt(p, '#fiche h2'), /TSMC/);
await p.selectOption('#f-archi', 'riscv'); assert.equal(await p.locator('[data-acteur="intel"]').count(), 0);
assert.ok(await p.locator('[data-acteur="sifive"]').count() === 1);
await p.selectOption('#f-couche', 'ip'); await p.selectOption('#f-segment', 'datacenter');
assert.match(await txt(p, '#carte-n'), /^\d+ entrée/);
await p.click('text=Effacer les filtres');
await p.locator('#fiche details.preuve summary').first().click();
assert.ok(await p.locator('#fiche .preuve[open] .src a').count() >= 1);
ok('carte : rôles multiples, fiche, relations, détail sourcé, filtres');

// 4. Comparateur
await p.click('.nav >> text=Comparateur'); await titre(p, /Comparateur/);
assert.equal(await p.locator('.cmp-ligne[data-dim]').count(), 7);
assert.equal(await p.locator('.cmp-col-tete').count(), 3);
assert.equal(await p.locator('#cmp-x86').isDisabled(), false);
await p.uncheck('#cmp-x86'); assert.equal(await p.locator('.cmp-col-tete').count(), 2);
assert.equal(await p.locator('#cmp-arm').isDisabled(), true); // minimum 2
await p.selectOption('#cmp-dim', 'perso'); assert.equal(await p.locator('.cmp-ligne[data-dim]').count(), 1);
assert.match(await txt(p, 'main'), /Ce qu'une ISA ne détermine pas[\s\S]*Lecture business/);
await p.click('.onglets >> text=Entreprises et produits');
await p.selectOption('#cmp-groupe', 'fonderies'); assert.match(await txt(p, '#cmp-table'), /TSMC[\s\S]*Samsung Foundry[\s\S]*Intel Foundry/);
await p.selectOption('#cmp-groupe', 'ip'); assert.equal(await p.locator('#cmp-tenstorrent').isDisabled(), true); // maximum 3
ok('comparateur : deux niveaux, sélection 2 à 3, angles, familles');

// 5. Dossier Arm et preuves
await p.click('.nav >> text=Dossier Arm'); await titre(p, /Arm commercialise/);
assert.equal(await p.locator('.frise-item').count(), 12);
await p.selectOption('#d-filtre', 'confirme'); assert.ok(await p.locator('.frise-item').count() < 12);
await p.selectOption('#d-filtre', '');
assert.equal(await p.locator('#chaine-table .nouveau').count(), 4);
await p.click('#d-chaine >> text=Avant mars 2026'); assert.equal(await p.locator('#chaine-table .nouveau').count(), 0);
await p.locator('#d-bref details.preuve summary').first().click();
assert.match(await txt(p, '#d-bref .preuve[open]'), /newsroom\.arm\.com|Arm expands/);
await p.locator('#d-tensions >> text=Fiche Ampere Computing').click(); await titre(p, /Carte/); assert.match(await txt(p, '#fiche h2'), /Ampere/);
await p.goBack(); await titre(p, /Arm commercialise/); await p.locator('#d-preuves .lien').first().click(); await titre(p, /Bibliothèque/);
assert.match(await txt(p, '.pub.ouverte'), /Commanditaire connu/);
ok('dossier : frise filtrable, chaîne avant/après, preuves, liens vers carte et bibliothèque');

// 6. Bibliothèque
assert.equal(await p.locator('.pub').count(), 15);
await p.selectOption('#bib-acces', 'integral'); const n = await p.locator('.pub').count(); assert.ok(n > 0 && n < 15);
await p.selectOption('#bib-acces', ''); await p.fill('#bib-q', 'Blem'); assert.equal(await p.locator('.pub').count(), 1);
await p.click('.pub-titre'); await p.click('.pub-corps >> text=Comparateur'); await titre(p, /Comparateur/); assert.match(await txt(p, 'h1'), /Comparateur/);
ok('bibliothèque : filtres, recherche, fiche, renvoi vers les modules');

// Animations désactivables
await p.click('#reglage-anim'); assert.match(await txt(p, '#reglage-anim'), /coupées/);
await p.click('.nav >> text=Simulateur'); await titre(p, /Simulateur/); await p.click('#ex-boucle'); await p.click('#sim-auto');
assert.match(await txt(p, '#sim-etat'), /terminé en 34/); assert.match(await txt(p, '#reg-5'), /55/);
ok('animations coupées : la lecture donne directement le résultat');

// Clavier
await p.goto(url + '#carte'); await p.reload();
await p.focus('[data-acteur="sipearl"]'); await p.keyboard.press('Enter'); assert.match(await txt(p, '#fiche h2'), /SiPearl/);
ok('clavier : sélection d\'un acteur à la touche Entrée');
await p.screenshot({ path: 'dist/apercu-carte.png' });
await p.goto(url + '#simulateur'); await p.reload(); await p.click('#sim-pas'); await p.screenshot({ path: 'dist/apercu-simulateur.png' });
await p.goto(url + '#explorateur'); await p.reload(); await p.screenshot({ path: 'dist/apercu-explorateur.png' });
await p.goto(url + '#dossier-arm'); await p.reload(); await p.screenshot({ path: 'dist/apercu-dossier.png', fullPage: false });

console.log('Mobile 390×800');
const m = await page({ width: 390, height: 800 });
for (const v of ['explorateur', 'simulateur', 'carte', 'comparateur', 'dossier-arm', 'bibliotheque']) {
  await m.goto(url + '#' + v); await m.reload();
  if (v === 'carte') await m.locator('[data-acteur="arm"]').first().click();
  const d = await m.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(d <= 1, `${v} : la page déborde de ${d}px en largeur`);
}
await m.goto(url + '#explorateur'); await m.reload(); await m.screenshot({ path: 'dist/apercu-mobile.png' });
ok('mobile : aucun des 6 espaces ne déborde en largeur');

assert.deepEqual(erreurs, [], 'erreurs JavaScript');
ok('aucune erreur JavaScript');
await browser.close();
console.log('Parcours vérifiés.');
