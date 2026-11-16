import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assemble, Machine, splitHiLo, parseReg, SUPPORTED, DATA_BASE, MEM_SIZE } from '../src/sim/rv32i.js';
import { PROGRAMS } from '../src/sim/programs.js';

function run(src, max = 10000) {
  const p = assemble(src);
  assert.deepEqual(p.errors, [], 'assemblage sans erreur');
  const m = new Machine(p);
  const r = m.run(max);
  return { m, r, p };
}
const reg = (src, n) => run(src + '\nebreak').m.regs[n];
const ureg = (src, n) => reg(src, n) >>> 0;

test('x0 vaut toujours 0, même après une écriture', () => {
  assert.equal(reg('addi x0, x0, 5\naddi x1, x0, 3', 0), 0);
  assert.equal(reg('addi x0, x0, 5\naddi x1, x0, 3', 1), 3);
  const { m } = run('.data\nv: .word 77\n.text\nla x5, v\nlw x0, 0(x5)\njal x0, 4\nebreak');
  assert.equal(m.regs[0], 0);
});

test('add et sub : arithmétique modulo 2^32, sans exception', () => {
  assert.equal(reg('li x1, 0x7fffffff\naddi x2, x0, 1\nadd x3, x1, x2', 3), -2147483648);
  assert.equal(reg('addi x1, x0, 0\naddi x2, x0, 1\nsub x3, x1, x2', 3), -1);
  assert.equal(ureg('li x1, 0xffffffff\naddi x2, x0, 2\nadd x3, x1, x2', 3), 1);
});

test('and, or, xor et leurs variantes immédiates', () => {
  const pre = 'addi x1, x0, 0b1100\naddi x2, x0, 0b1010\n';
  assert.equal(reg(pre + 'and x3, x1, x2', 3), 0b1000);
  assert.equal(reg(pre + 'or x3, x1, x2', 3), 0b1110);
  assert.equal(reg(pre + 'xor x3, x1, x2', 3), 0b0110);
  assert.equal(reg(pre + 'andi x3, x1, 0b0100', 3), 0b0100);
  assert.equal(reg(pre + 'ori x3, x1, 1', 3), 0b1101);
  assert.equal(reg(pre + 'xori x3, x1, -1', 3), ~0b1100);
});

test('addi : immédiat 12 bits signé', () => {
  assert.equal(reg('addi x1, x0, -2048', 1), -2048);
  assert.equal(reg('addi x1, x0, 2047', 1), 2047);
  assert.equal(assemble('addi x1, x0, 2048').ok, false);
  assert.equal(assemble('addi x1, x0, -2049').ok, false);
});

test('slt / sltu / slti / sltiu : signé contre non signé', () => {
  const pre = 'addi x1, x0, -1\naddi x2, x0, 1\n';
  assert.equal(reg(pre + 'slt x3, x1, x2', 3), 1);
  assert.equal(reg(pre + 'sltu x3, x1, x2', 3), 0); // 0xffffffff n'est pas < 1
  assert.equal(reg(pre + 'slti x3, x1, 0', 3), 1);
  assert.equal(reg(pre + 'sltiu x3, x2, -1', 3), 1); // immédiat étendu en 0xffffffff
  assert.equal(reg('sltiu x3, x0, 1', 3), 1); // idiome « égal à zéro »
  assert.equal(reg(pre + 'sltiu x3, x2, 1', 3), 0);
});

test('décalages : 5 bits bas, logique contre arithmétique', () => {
  const pre = 'li x1, 0x80000000\naddi x2, x0, 4\naddi x4, x0, 36\n';
  assert.equal(ureg(pre + 'srl x3, x1, x2', 3), 0x08000000);
  assert.equal(ureg(pre + 'sra x3, x1, x2', 3), 0xf8000000);
  assert.equal(ureg(pre + 'srl x3, x1, x4', 3), 0x08000000); // 36 & 31 = 4
  assert.equal(ureg('addi x1, x0, 1\nslli x3, x1, 31', 3), 0x80000000);
  assert.equal(ureg(pre + 'srai x3, x1, 31', 3), 0xffffffff);
  assert.equal(ureg(pre + 'srli x3, x1, 31', 3), 1);
  assert.equal(reg('addi x1, x0, 3\naddi x2, x0, 2\nsll x3, x1, x2', 3), 12);
  assert.equal(assemble('slli x1, x1, 32').ok, false);
});

test('lui, auipc et la pseudo-instruction li', () => {
  assert.equal(ureg('lui x1, 0xfffff', 1), 0xfffff000);
  assert.equal(ureg('lui x1, 1', 1), 0x1000);
  assert.equal(ureg('nop\nauipc x1, 1', 1), 0x1004);
  for (const v of [0, 1, -1, 2047, 2048, -2048, -2049, 0x12345678, 0x7ffff800, 0xdeadbeef, 0x80000000, 0xfffff800]) {
    assert.equal(ureg(`li x1, ${v}`, 1), v >>> 0, `li ${v}`);
  }
  assert.deepEqual(splitHiLo(0x12345678), { hi: 0x12345, lo: 0x678 });
  assert.deepEqual(splitHiLo(0x00000800), { hi: 1, lo: -2048 });
});

test('lw / sw : mots de 32 bits petit-boutistes', () => {
  const { m } = run(`li x1, 0x11223344\naddi x2, x0, ${DATA_BASE}\nsw x1, 8(x2)\nlw x3, 8(x2)\nebreak`);
  assert.equal(m.regs[3], 0x11223344);
  assert.deepEqual([...m.mem.slice(DATA_BASE + 8, DATA_BASE + 12)], [0x44, 0x33, 0x22, 0x11]);
});

test('lb / lbu / lh / lhu / sb / sh : extension de signe ou de zéros', () => {
  const pre = `addi x2, x0, ${DATA_BASE}\nli x1, 0x000080f1\nsw x1, 0(x2)\n`;
  assert.equal(reg(pre + 'lb x3, 0(x2)', 3), -15);
  assert.equal(reg(pre + 'lbu x3, 0(x2)', 3), 0xf1);
  assert.equal(reg(pre + 'lh x3, 0(x2)', 3), -32527);
  assert.equal(reg(pre + 'lhu x3, 0(x2)', 3), 0x80f1);
  assert.equal(ureg(pre + 'addi x4, x0, -1\nsb x4, 3(x2)\nlw x3, 0(x2)', 3), 0xff0080f1);
  assert.equal(ureg(pre + 'addi x4, x0, -1\nsh x4, 2(x2)\nlw x3, 0(x2)', 3), 0xffff80f1);
});

test('accès mémoire invalides : arrêt avec message', () => {
  let m = run('lw x1, 2(x0)\nebreak').m;
  assert.match(m.error, /non aligné/);
  m = run(`addi x1, x0, 1024\nsw x1, 0(x1)\nebreak`).m;
  assert.match(m.error, /hors mémoire/);
  m = run('addi x1, x0, -4\nlw x2, 0(x1)\nebreak').m;
  assert.match(m.error, /hors mémoire/);
  assert.equal(MEM_SIZE, 1024);
});

test('branchements : pris et non pris, signés et non signés', () => {
  const t = (cond, a, b) => reg(`addi x1, x0, ${a}\naddi x2, x0, ${b}\n${cond} x1, x2, oui\naddi x3, x0, 1\noui:\naddi x4, x0, 1`, 3);
  // x3 = 1 si le branchement n'est PAS pris
  assert.equal(t('beq', 5, 5), 0); assert.equal(t('beq', 5, 6), 1);
  assert.equal(t('bne', 5, 6), 0); assert.equal(t('bne', 5, 5), 1);
  assert.equal(t('blt', -1, 1), 0); assert.equal(t('blt', 1, -1), 1);
  assert.equal(t('bge', 1, 1), 0); assert.equal(t('bge', -1, 1), 1);
  assert.equal(t('bltu', 1, -1), 0); assert.equal(t('bltu', -1, 1), 1);
  assert.equal(t('bgeu', -1, 1), 0); assert.equal(t('bgeu', 1, -1), 1);
});

test('branchement arrière : le compteur ordinal recule', () => {
  const { m } = run('addi x1, x0, 3\nb:\naddi x1, x1, -1\nbne x1, x0, b\nebreak');
  assert.equal(m.regs[1], 0);
  assert.equal(m.steps, 1 + 3 * 2 + 1);
});

test('jal : saut et adresse de retour', () => {
  const { m } = run('jal x1, cible\naddi x2, x0, 99\ncible:\naddi x3, x0, 7\nebreak');
  assert.equal(m.regs[1], 4);
  assert.equal(m.regs[2], 0);
  assert.equal(m.regs[3], 7);
});

test('jalr : bit 0 effacé, retour de sous-programme', () => {
  const { m } = run('jal ra, f\naddi x5, x0, 1\nebreak\nf:\naddi x6, x0, 2\nret');
  assert.equal(m.regs[5], 1); assert.equal(m.regs[6], 2); assert.equal(m.regs[1], 4);
  const m2 = run('addi x1, x0, 13\njalr x2, 0(x1)\nnop\naddi x3, x0, 5\nebreak').m; // 13 & ~1 = 12
  assert.equal(m2.regs[3], 5); assert.equal(m2.regs[2], 8);
  const m3 = run('addi x1, x0, 10\njalr x0, 0(x1)\nebreak').m;
  assert.match(m3.error, /mal alignée/);
});

test('ebreak arrête ; sortir du programme est une erreur', () => {
  const a = run('addi x1, x0, 1\nebreak\naddi x1, x0, 2').m;
  assert.equal(a.halted, true); assert.equal(a.error, null); assert.equal(a.regs[1], 1);
  const b = run('addi x1, x0, 1').m;
  assert.match(b.error, /sorti du programme/);
});

test('boucle infinie : la limite de pas arrête l\'exécution automatique', () => {
  const { r } = run('b:\njal x0, b', 500);
  assert.equal(r.limitReached, true); assert.equal(r.steps, 500);
});

test('assembleur : registres, erreurs et numéros de ligne', () => {
  assert.equal(parseReg('a0'), 10); assert.equal(parseReg('X31'), 31); assert.equal(parseReg('fp'), 8);
  assert.throws(() => parseReg('x32'));
  const p = assemble('addi x1, x0, 1\nfoo x1\nbeq x1, x0, nulle_part\necall');
  assert.equal(p.ok, false);
  assert.deepEqual(p.errors.map((e) => e.line), [2, 3, 4]);
  assert.equal(assemble('a:\na:\nebreak').ok, false);
  assert.equal(assemble('.word 3').ok, false);
});

test('chaque instruction documentée est acceptée par l\'assembleur', () => {
  const sample = {
    add: 'add x1, x2, x3', sub: 'sub x1, x2, x3', and: 'and x1, x2, x3', or: 'or x1, x2, x3', xor: 'xor x1, x2, x3',
    slt: 'slt x1, x2, x3', sltu: 'sltu x1, x2, x3', sll: 'sll x1, x2, x3', srl: 'srl x1, x2, x3', sra: 'sra x1, x2, x3',
    addi: 'addi x1, x2, 3', andi: 'andi x1, x2, 3', ori: 'ori x1, x2, 3', xori: 'xori x1, x2, 3', slti: 'slti x1, x2, 3',
    sltiu: 'sltiu x1, x2, 3', slli: 'slli x1, x2, 3', srli: 'srli x1, x2, 3', srai: 'srai x1, x2, 3',
    lui: 'lui x1, 3', auipc: 'auipc x1, 3', lw: 'lw x1, 0(x2)', lh: 'lh x1, 0(x2)', lhu: 'lhu x1, 0(x2)',
    lb: 'lb x1, 0(x2)', lbu: 'lbu x1, 0(x2)', sw: 'sw x1, 0(x2)', sh: 'sh x1, 0(x2)', sb: 'sb x1, 0(x2)',
    beq: 'beq x1, x2, 8', bne: 'bne x1, x2, 8', blt: 'blt x1, x2, 8', bge: 'bge x1, x2, 8', bltu: 'bltu x1, x2, 8',
    bgeu: 'bgeu x1, x2, 8', jal: 'jal x1, 8', jalr: 'jalr x1, 0(x2)', ebreak: 'ebreak',
  };
  const all = Object.values(SUPPORTED).flat();
  assert.equal(all.length, 38);
  for (const op of all) {
    assert.ok(sample[op], `exemple manquant pour ${op}`);
    assert.equal(assemble(sample[op]).ok, true, op);
  }
});

test('le pas à pas décrit ce qui a changé', () => {
  const p = assemble('addi x5, x0, 7\nsw x5, 256(x0)\nebreak');
  const m = new Machine(p);
  const e1 = m.step();
  assert.deepEqual(e1.regWrites, [{ reg: 5, before: 0, after: 7 }]);
  assert.match(e1.text, /x5 ← x0 \+ 7/);
  const e2 = m.step();
  assert.deepEqual(e2.memWrites, [{ addr: 256, size: 4, before: 0, after: 7 }]);
  m.reset();
  assert.equal(m.regs[5], 0); assert.equal(m.pc, 0); assert.equal(m.mem[256], 0);
});

for (const prog of PROGRAMS) {
  test(`programme d'exemple « ${prog.titre} »`, () => {
    const { m } = run(prog.source);
    assert.equal(m.halted, true);
    assert.equal(m.error, null);
    for (const [r, v] of Object.entries(prog.attendu.regs || {})) assert.equal(m.regs[r], v, `x${r}`);
    for (const [a, v] of Object.entries(prog.attendu.mem || {})) assert.equal(m.readMem(Number(a), 4) | 0, v, `mem[${a}]`);
    if (prog.attendu.steps) assert.equal(m.steps, prog.attendu.steps);
  });
}
