// Simulateur pédagogique d'un sous-ensemble de RV32I.
// - Assembleur SIMPLIFIÉ : le texte est analysé en instructions structurées,
//   il n'est PAS encodé en binaire et le code n'est pas placé en mémoire.
// - Modèle fonctionnel instruction par instruction : pas de pipeline, pas de
//   cycles, pas d'interruptions, pas de modes privilégiés.
// Référence de sémantique : RISC-V Unprivileged ISA, chapitre RV32I.

export const TEXT_BASE = 0x000;
export const DATA_BASE = 0x100;
export const MEM_SIZE = 0x400; // 1024 octets, petit-boutiste

export const ABI = [
  'zero', 'ra', 'sp', 'gp', 'tp', 't0', 't1', 't2', 's0', 's1',
  'a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7',
  's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11',
  't3', 't4', 't5', 't6',
];

// Instructions réellement exécutées (38 des 40 instructions de RV32I).
export const SUPPORTED = {
  'Registre-registre': ['add', 'sub', 'and', 'or', 'xor', 'slt', 'sltu', 'sll', 'srl', 'sra'],
  'Registre-immédiat': ['addi', 'andi', 'ori', 'xori', 'slti', 'sltiu', 'slli', 'srli', 'srai'],
  'Constantes hautes': ['lui', 'auipc'],
  'Lectures mémoire': ['lw', 'lh', 'lhu', 'lb', 'lbu'],
  'Écritures mémoire': ['sw', 'sh', 'sb'],
  'Branchements': ['beq', 'bne', 'blt', 'bge', 'bltu', 'bgeu'],
  'Sauts': ['jal', 'jalr'],
  'Arrêt': ['ebreak'],
};
export const PSEUDO = ['nop', 'li', 'mv', 'la', 'j', 'beqz', 'bnez', 'ret'];
export const UNSUPPORTED = ['ecall', 'fence'];

const R_OPS = new Set(SUPPORTED['Registre-registre']);
const I_OPS = new Set(['addi', 'andi', 'ori', 'xori', 'slti', 'sltiu']);
const SH_OPS = new Set(['slli', 'srli', 'srai']);
const LOAD_OPS = new Set(SUPPORTED['Lectures mémoire']);
const STORE_OPS = new Set(SUPPORTED['Écritures mémoire']);
const BR_OPS = new Set(SUPPORTED['Branchements']);

export const hex32 = (v) => '0x' + (v >>> 0).toString(16).padStart(8, '0');
export const hexAddr = (v) => '0x' + (v >>> 0).toString(16).padStart(3, '0');
export const regName = (i) => `x${i}`;

class AsmError extends Error {}

export function parseReg(tok) {
  const t = String(tok).trim().toLowerCase();
  const m = /^x(\d{1,2})$/.exec(t);
  if (m) {
    const n = Number(m[1]);
    if (n <= 31) return n;
  }
  if (t === 'fp') return 8;
  const i = ABI.indexOf(t);
  if (i >= 0) return i;
  throw new AsmError(`registre inconnu « ${tok} » (attendu x0 à x31 ou un nom ABI comme t0, a0)`);
}

export function parseImm(tok) {
  const t = String(tok).trim().toLowerCase().replace(/_/g, '');
  if (!/^[-+]?(0x[0-9a-f]+|0b[01]+|\d+)$/.test(t)) {
    throw new AsmError(`valeur immédiate invalide « ${tok} »`);
  }
  const neg = t.startsWith('-');
  const body = t.replace(/^[-+]/, '');
  const n = Number(body);
  if (!Number.isFinite(n) || n > 0xffffffff) throw new AsmError(`valeur hors plage « ${tok} »`);
  return neg ? -n : n;
}

function checkRange(v, lo, hi, what) {
  if (v < lo || v > hi) throw new AsmError(`${what} hors plage : ${v} (autorisé ${lo} à ${hi})`);
  return v;
}

function splitOperands(s) {
  return s.trim() === '' ? [] : s.split(',').map((x) => x.trim());
}

function expect(ops, n, mn, form) {
  if (ops.length !== n) throw new AsmError(`« ${mn} » attend ${n} opérande(s) : ${form}`);
}

function parseMem(tok) {
  const m = /^(.*)\(\s*([\w]+)\s*\)$/.exec(tok.trim());
  if (!m) throw new AsmError(`opérande mémoire attendu sous la forme décalage(registre), reçu « ${tok} »`);
  const imm = m[1].trim() === '' ? 0 : parseImm(m[1]);
  return { imm: checkRange(imm, -2048, 2047, 'décalage'), rs1: parseReg(m[2]) };
}

// Décompose une constante 32 bits en partie haute (20 bits) et basse (12 bits signés).
export function splitHiLo(value) {
  const v = value | 0;
  const lo = ((v & 0xfff) << 20) >> 20; // extension de signe des 12 bits bas
  const hi = ((v - lo) >>> 12) & 0xfffff;
  return { hi, lo };
}

function isLabelName(t) {
  return /^[A-Za-z_.][\w.]*$/.test(t);
}

// Taille (en instructions réelles) d'une ligne, connue dès la première passe.
function sizeOf(mn, ops) {
  if (mn === 'la') return 2;
  if (mn === 'li') {
    expect(ops, 2, 'li', 'li rd, constante');
    const v = parseImm(ops[1]);
    checkRange(v, -2147483648, 4294967295, 'constante');
    const s = v | 0;
    if (s >= -2048 && s <= 2047) return 1;
    return splitHiLo(s).lo === 0 ? 1 : 2;
  }
  return 1;
}

export function assemble(source) {
  const errors = [];
  const lines = String(source).split(/\r?\n/);
  const items = []; // { mn, ops, line, src }
  const labels = new Map();
  const dataWords = []; // { addr, value, line }
  let section = 'text';
  let pc = TEXT_BASE;
  let dataPtr = DATA_BASE;

  // Passe 1 : étiquettes, tailles, données.
  lines.forEach((raw, idx) => {
    const line = idx + 1;
    let text = raw.replace(/(#|\/\/).*$/, '').trim();
    try {
      for (;;) {
        const m = /^([A-Za-z_.][\w.]*)\s*:\s*/.exec(text);
        if (!m) break;
        const name = m[1];
        if (labels.has(name)) throw new AsmError(`étiquette « ${name} » définie deux fois`);
        labels.set(name, section === 'text' ? pc : dataPtr);
        text = text.slice(m[0].length);
      }
      if (text === '') return;
      const sp = text.search(/\s/);
      const mn = (sp < 0 ? text : text.slice(0, sp)).toLowerCase();
      const rest = sp < 0 ? '' : text.slice(sp + 1);
      if (mn === '.text') { section = 'text'; return; }
      if (mn === '.data') { section = 'data'; return; }
      if (mn === '.word') {
        if (section !== 'data') throw new AsmError('« .word » n\'est accepté que dans la section .data');
        const vals = splitOperands(rest);
        if (!vals.length) throw new AsmError('« .word » attend au moins une valeur');
        for (const v of vals) {
          const n = checkRange(parseImm(v), -2147483648, 4294967295, 'mot');
          if (dataPtr + 4 > MEM_SIZE) throw new AsmError('section .data trop grande pour la mémoire');
          dataWords.push({ addr: dataPtr, value: n | 0, line });
          dataPtr += 4;
        }
        return;
      }
      if (mn.startsWith('.')) throw new AsmError(`directive non supportée « ${mn} » (supportées : .text, .data, .word)`);
      if (section !== 'text') throw new AsmError('instruction placée dans .data : ajoutez « .text » avant le code');
      const ops = splitOperands(rest);
      const n = sizeOf(mn, ops);
      items.push({ mn, ops, line, src: raw.trim(), addr: pc });
      pc += 4 * n;
      if (pc > DATA_BASE) throw new AsmError(`programme trop long : le code dépasse ${hexAddr(DATA_BASE)}`);
    } catch (e) {
      if (!(e instanceof AsmError)) throw e;
      errors.push({ line, message: e.message });
    }
  });

  // Passe 2 : production des instructions.
  const instrs = [];
  const target = (tok, from, lo, hi, what) => {
    let off;
    if (isLabelName(tok) && !/^[-+]?\d/.test(tok)) {
      if (!labels.has(tok)) throw new AsmError(`étiquette inconnue « ${tok} »`);
      off = labels.get(tok) - from;
    } else {
      off = parseImm(tok);
    }
    if (off % 2 !== 0) throw new AsmError(`${what} : décalage impair (${off})`);
    return { off: checkRange(off, lo, hi, what), label: isLabelName(tok) ? tok : null };
  };
  const br = (tok, from) => target(tok, from, -4096, 4094, 'branchement');
  const jmp = (tok, from) => target(tok, from, -1048576, 1048574, 'saut');

  for (const it of items) {
    const { mn, ops, line, src } = it;
    let addr = it.addr;
    const emit = (f) => { instrs.push({ ...f, addr, line, src }); addr += 4; };
    try {
      if (R_OPS.has(mn)) {
        expect(ops, 3, mn, `${mn} rd, rs1, rs2`);
        emit({ op: mn, rd: parseReg(ops[0]), rs1: parseReg(ops[1]), rs2: parseReg(ops[2]) });
      } else if (I_OPS.has(mn)) {
        expect(ops, 3, mn, `${mn} rd, rs1, immédiat`);
        emit({ op: mn, rd: parseReg(ops[0]), rs1: parseReg(ops[1]), imm: checkRange(parseImm(ops[2]), -2048, 2047, 'immédiat (12 bits signés)') });
      } else if (SH_OPS.has(mn)) {
        expect(ops, 3, mn, `${mn} rd, rs1, décalage`);
        emit({ op: mn, rd: parseReg(ops[0]), rs1: parseReg(ops[1]), imm: checkRange(parseImm(ops[2]), 0, 31, 'décalage') });
      } else if (mn === 'lui' || mn === 'auipc') {
        expect(ops, 2, mn, `${mn} rd, immédiat20`);
        emit({ op: mn, rd: parseReg(ops[0]), imm: checkRange(parseImm(ops[1]), 0, 0xfffff, 'immédiat (20 bits)') });
      } else if (LOAD_OPS.has(mn)) {
        expect(ops, 2, mn, `${mn} rd, décalage(rs1)`);
        const m = parseMem(ops[1]);
        emit({ op: mn, rd: parseReg(ops[0]), rs1: m.rs1, imm: m.imm });
      } else if (STORE_OPS.has(mn)) {
        expect(ops, 2, mn, `${mn} rs2, décalage(rs1)`);
        const m = parseMem(ops[1]);
        emit({ op: mn, rs2: parseReg(ops[0]), rs1: m.rs1, imm: m.imm });
      } else if (BR_OPS.has(mn)) {
        expect(ops, 3, mn, `${mn} rs1, rs2, étiquette`);
        const t = br(ops[2], addr);
        emit({ op: mn, rs1: parseReg(ops[0]), rs2: parseReg(ops[1]), imm: t.off, label: t.label });
      } else if (mn === 'jal') {
        if (ops.length === 1) ops.unshift('ra');
        expect(ops, 2, mn, 'jal rd, étiquette');
        const t = jmp(ops[1], addr);
        emit({ op: 'jal', rd: parseReg(ops[0]), imm: t.off, label: t.label });
      } else if (mn === 'jalr') {
        if (ops.length === 3) {
          emit({ op: 'jalr', rd: parseReg(ops[0]), rs1: parseReg(ops[1]), imm: checkRange(parseImm(ops[2]), -2048, 2047, 'immédiat') });
        } else {
          expect(ops, 2, mn, 'jalr rd, décalage(rs1)');
          const m = parseMem(ops[1]);
          emit({ op: 'jalr', rd: parseReg(ops[0]), rs1: m.rs1, imm: m.imm });
        }
      } else if (mn === 'ebreak') {
        expect(ops, 0, mn, 'ebreak');
        emit({ op: 'ebreak' });
      } else if (mn === 'nop') {
        expect(ops, 0, mn, 'nop');
        emit({ op: 'addi', rd: 0, rs1: 0, imm: 0, pseudo: 'nop' });
      } else if (mn === 'mv') {
        expect(ops, 2, mn, 'mv rd, rs');
        emit({ op: 'addi', rd: parseReg(ops[0]), rs1: parseReg(ops[1]), imm: 0, pseudo: 'mv' });
      } else if (mn === 'li') {
        const rd = parseReg(ops[0]);
        const v = parseImm(ops[1]) | 0;
        if (v >= -2048 && v <= 2047) {
          emit({ op: 'addi', rd, rs1: 0, imm: v, pseudo: 'li' });
        } else {
          const { hi, lo } = splitHiLo(v);
          emit({ op: 'lui', rd, imm: hi, pseudo: 'li' });
          if (lo !== 0) emit({ op: 'addi', rd, rs1: rd, imm: lo, pseudo: 'li' });
        }
      } else if (mn === 'la') {
        expect(ops, 2, mn, 'la rd, étiquette');
        const rd = parseReg(ops[0]);
        if (!labels.has(ops[1])) throw new AsmError(`étiquette inconnue « ${ops[1]} »`);
        const { hi, lo } = splitHiLo(labels.get(ops[1]));
        emit({ op: 'lui', rd, imm: hi, pseudo: 'la', label: ops[1] });
        emit({ op: 'addi', rd, rs1: rd, imm: lo, pseudo: 'la', label: ops[1] });
      } else if (mn === 'j') {
        expect(ops, 1, mn, 'j étiquette');
        const t = jmp(ops[0], addr);
        emit({ op: 'jal', rd: 0, imm: t.off, label: t.label, pseudo: 'j' });
      } else if (mn === 'beqz' || mn === 'bnez') {
        expect(ops, 2, mn, `${mn} rs, étiquette`);
        const t = br(ops[1], addr);
        emit({ op: mn === 'beqz' ? 'beq' : 'bne', rs1: parseReg(ops[0]), rs2: 0, imm: t.off, label: t.label, pseudo: mn });
      } else if (mn === 'ret') {
        expect(ops, 0, mn, 'ret');
        emit({ op: 'jalr', rd: 0, rs1: 1, imm: 0, pseudo: 'ret' });
      } else if (UNSUPPORTED.includes(mn)) {
        throw new AsmError(`« ${mn} » fait partie de RV32I mais n'est pas supportée par ce simulateur`);
      } else {
        throw new AsmError(`instruction inconnue ou non supportée « ${mn} »`);
      }
    } catch (e) {
      if (!(e instanceof AsmError)) throw e;
      errors.push({ line, message: e.message });
    }
  }
  errors.sort((a, b) => a.line - b.line);
  return { ok: errors.length === 0, errors, instrs: errors.length ? [] : instrs, labels, dataWords };
}

// Texte canonique d'une instruction réelle (après expansion des pseudo-instructions).
export function disasm(i) {
  const r = regName;
  const tgt = (i.label ? i.label : (i.imm >= 0 ? '+' : '') + i.imm);
  if (R_OPS.has(i.op)) return `${i.op} ${r(i.rd)}, ${r(i.rs1)}, ${r(i.rs2)}`;
  if (I_OPS.has(i.op) || SH_OPS.has(i.op)) return `${i.op} ${r(i.rd)}, ${r(i.rs1)}, ${i.imm}`;
  if (i.op === 'lui' || i.op === 'auipc') return `${i.op} ${r(i.rd)}, 0x${i.imm.toString(16)}`;
  if (LOAD_OPS.has(i.op)) return `${i.op} ${r(i.rd)}, ${i.imm}(${r(i.rs1)})`;
  if (STORE_OPS.has(i.op)) return `${i.op} ${r(i.rs2)}, ${i.imm}(${r(i.rs1)})`;
  if (BR_OPS.has(i.op)) return `${i.op} ${r(i.rs1)}, ${r(i.rs2)}, ${tgt}`;
  if (i.op === 'jal') return `jal ${r(i.rd)}, ${tgt}`;
  if (i.op === 'jalr') return `jalr ${r(i.rd)}, ${i.imm}(${r(i.rs1)})`;
  return i.op;
}

const SYM = { add: '+', sub: '−', and: 'ET', or: 'OU', xor: 'OU-X', addi: '+', andi: 'ET', ori: 'OU', xori: 'OU-X' };
const BR_TXT = { beq: '=', bne: '≠', blt: '< (signé)', bge: '≥ (signé)', bltu: '< (non signé)', bgeu: '≥ (non signé)' };

export class Machine {
  constructor(program) {
    this.program = program;
    this.regs = new Int32Array(32);
    this.mem = new Uint8Array(MEM_SIZE);
    this.reset();
  }

  reset() {
    this.regs.fill(0);
    this.mem.fill(0);
    this.pc = TEXT_BASE;
    this.steps = 0;
    this.halted = false;
    this.error = null;
    for (const w of this.program.dataWords) this.writeMem(w.addr, 4, w.value);
  }

  get current() {
    if (this.halted) return null;
    return this.program.instrs.find((i) => i.addr === this.pc) || null;
  }

  readMem(addr, size) {
    let v = 0;
    for (let k = 0; k < size; k++) v |= this.mem[addr + k] << (8 * k);
    return v >>> 0;
  }

  writeMem(addr, size, value) {
    for (let k = 0; k < size; k++) this.mem[addr + k] = (value >>> (8 * k)) & 0xff;
  }

  checkAccess(addr, size, verb) {
    const a = addr >>> 0;
    if (a + size > MEM_SIZE) {
      throw new Error(`${verb} hors mémoire à l'adresse ${hex32(a)} : ce simulateur n'a que ${MEM_SIZE} octets (0x000 à ${hexAddr(MEM_SIZE - 1)}).`);
    }
    if (a % size !== 0) {
      throw new Error(`${verb} non alignée à l'adresse ${hex32(a)} (${size} octets). RV32I laisse ce cas à l'environnement d'exécution ; ce simulateur le refuse.`);
    }
    return a;
  }

  // Exécute une instruction et renvoie la description de ce qui s'est passé.
  step() {
    if (this.halted) return { halted: true, text: this.error || 'Le programme est arrêté.', regWrites: [], memWrites: [], memReads: [] };
    const pc = this.pc;
    const i = this.program.instrs.find((x) => x.addr === pc);
    const ev = { pc, instr: i, regWrites: [], memWrites: [], memReads: [], nextPc: pc + 4, halted: false, error: null, text: '' };
    const R = this.regs;
    const setReg = (rd, value) => {
      const v = value | 0;
      if (rd === 0) { ev.x0Discarded = true; return v; }
      ev.regWrites.push({ reg: rd, before: R[rd], after: v });
      R[rd] = v;
      return v;
    };
    const fail = (msg) => { ev.error = msg; ev.text = msg; ev.halted = true; this.halted = true; this.error = msg; return ev; };

    if (!i) return fail(`Aucune instruction à l'adresse ${hexAddr(pc)} : le compteur ordinal est sorti du programme. Terminez le programme par « ebreak ».`);

    const x = regName;
    const a = i.rs1 !== undefined ? R[i.rs1] : 0;
    const b = i.rs2 !== undefined ? R[i.rs2] : 0;
    const x0note = () => (i.rd === 0 ? ' Le résultat est écarté : x0 vaut toujours 0.' : '');
    try {
      switch (i.op) {
        case 'add': case 'sub': case 'and': case 'or': case 'xor': {
          const v = i.op === 'add' ? a + b : i.op === 'sub' ? a - b : i.op === 'and' ? a & b : i.op === 'or' ? a | b : a ^ b;
          const w = setReg(i.rd, v);
          const wrap = (i.op === 'add' || i.op === 'sub') && v !== w ? ' Le résultat dépasse 32 bits : seuls les 32 bits de poids faible sont conservés, sans exception.' : '';
          ev.text = `${x(i.rd)} ← ${x(i.rs1)} ${SYM[i.op]} ${x(i.rs2)} = ${a} ${SYM[i.op]} ${b} = ${w}.${wrap}${x0note()}`;
          break;
        }
        case 'slt': case 'sltu': {
          const t = i.op === 'slt' ? a < b : (a >>> 0) < (b >>> 0);
          setReg(i.rd, t ? 1 : 0);
          const sa = i.op === 'slt' ? a : a >>> 0; const sb = i.op === 'slt' ? b : b >>> 0;
          ev.text = `${x(i.rd)} ← 1 si ${x(i.rs1)} < ${x(i.rs2)} (${i.op === 'slt' ? 'signé' : 'non signé'}), sinon 0. Ici ${sa} < ${sb} est ${t ? 'vrai' : 'faux'}, donc ${x(i.rd)} = ${t ? 1 : 0}.${x0note()}`;
          break;
        }
        case 'sll': case 'srl': case 'sra': {
          const sh = b & 31;
          const v = i.op === 'sll' ? a << sh : i.op === 'srl' ? a >>> sh : a >> sh;
          const w = setReg(i.rd, v);
          ev.text = `${x(i.rd)} ← ${x(i.rs1)} décalé de ${sh} bit(s) vers la ${i.op === 'sll' ? 'gauche' : 'droite'}${i.op === 'sra' ? ' en recopiant le bit de signe' : ''} = ${hex32(w)}. Seuls les 5 bits bas de ${x(i.rs2)} comptent.${x0note()}`;
          break;
        }
        case 'addi': case 'andi': case 'ori': case 'xori': {
          const v = i.op === 'addi' ? a + i.imm : i.op === 'andi' ? a & i.imm : i.op === 'ori' ? a | i.imm : a ^ i.imm;
          const w = setReg(i.rd, v);
          if (i.pseudo === 'nop') ev.text = 'nop : aucune modification d\'état (codé « addi x0, x0, 0 »).';
          else ev.text = `${x(i.rd)} ← ${x(i.rs1)} ${SYM[i.op]} ${i.imm} = ${a} ${SYM[i.op]} ${i.imm} = ${w}.${x0note()}`;
          break;
        }
        case 'slti': case 'sltiu': {
          const t = i.op === 'slti' ? a < i.imm : (a >>> 0) < (i.imm >>> 0);
          setReg(i.rd, t ? 1 : 0);
          ev.text = `${x(i.rd)} ← 1 si ${x(i.rs1)} < ${i.imm} (${i.op === 'slti' ? 'signé' : 'non signé, après extension de signe de l\'immédiat'}), sinon 0. Résultat : ${t ? 1 : 0}.${x0note()}`;
          break;
        }
        case 'slli': case 'srli': case 'srai': {
          const v = i.op === 'slli' ? a << i.imm : i.op === 'srli' ? a >>> i.imm : a >> i.imm;
          const w = setReg(i.rd, v);
          ev.text = `${x(i.rd)} ← ${x(i.rs1)} décalé de ${i.imm} bit(s) vers la ${i.op === 'slli' ? 'gauche' : 'droite'}${i.op === 'srai' ? ' en recopiant le bit de signe' : ''} = ${hex32(w)} (${w}).${x0note()}`;
          break;
        }
        case 'lui': {
          const w = setReg(i.rd, i.imm << 12);
          ev.text = `${x(i.rd)} ← 0x${i.imm.toString(16)} placé dans les 20 bits hauts, 12 bits bas à zéro = ${hex32(w)}.${x0note()}`;
          break;
        }
        case 'auipc': {
          const w = setReg(i.rd, pc + (i.imm << 12));
          ev.text = `${x(i.rd)} ← PC + (0x${i.imm.toString(16)} << 12) = ${hex32(w)}.${x0note()}`;
          break;
        }
        case 'lw': case 'lh': case 'lhu': case 'lb': case 'lbu': {
          const size = i.op === 'lw' ? 4 : i.op.startsWith('lh') ? 2 : 1;
          const addr = this.checkAccess(a + i.imm, size, 'Lecture');
          let v = this.readMem(addr, size);
          if (i.op === 'lh') v = (v << 16) >> 16;
          if (i.op === 'lb') v = (v << 24) >> 24;
          ev.memReads.push({ addr, size });
          const w = setReg(i.rd, v);
          const ext = i.op === 'lw' ? '' : i.op.endsWith('u') ? ', complété par des zéros' : ', avec extension de signe';
          ev.text = `Adresse = ${x(i.rs1)} + ${i.imm} = ${hexAddr(addr)}. Lecture de ${size} octet(s)${ext} : ${x(i.rd)} ← ${w}.${x0note()}`;
          break;
        }
        case 'sw': case 'sh': case 'sb': {
          const size = i.op === 'sw' ? 4 : i.op === 'sh' ? 2 : 1;
          const addr = this.checkAccess(a + i.imm, size, 'Écriture');
          const before = this.readMem(addr, size);
          this.writeMem(addr, size, b);
          const after = this.readMem(addr, size);
          ev.memWrites.push({ addr, size, before, after });
          ev.text = `Adresse = ${x(i.rs1)} + ${i.imm} = ${hexAddr(addr)}. Écriture des ${size} octet(s) de poids faible de ${x(i.rs2)} (${b}) en mémoire.`;
          break;
        }
        case 'beq': case 'bne': case 'blt': case 'bge': case 'bltu': case 'bgeu': {
          const ua = a >>> 0; const ub = b >>> 0;
          const t = i.op === 'beq' ? a === b : i.op === 'bne' ? a !== b : i.op === 'blt' ? a < b : i.op === 'bge' ? a >= b : i.op === 'bltu' ? ua < ub : ua >= ub;
          const uns = i.op.endsWith('u');
          ev.taken = t;
          const dest = pc + i.imm;
          if (t) {
            if (dest % 4 !== 0) throw new Error(`Branchement pris vers ${hexAddr(dest)}, adresse non multiple de 4 : exception « adresse d'instruction mal alignée ».`);
            ev.nextPc = dest;
          }
          ev.text = `Test ${x(i.rs1)} ${BR_TXT[i.op]} ${x(i.rs2)} : ${uns ? ua : a} et ${uns ? ub : b} → ${t ? 'vrai' : 'faux'}. ${t ? `Branchement pris : PC ← ${hexAddr(dest)}${i.label ? ` (${i.label})` : ''}.` : `Branchement non pris : PC ← ${hexAddr(pc + 4)}.`}`;
          break;
        }
        case 'jal': {
          const dest = pc + i.imm;
          if (dest % 4 !== 0) throw new Error(`Saut vers ${hexAddr(dest)}, adresse non multiple de 4 : exception « adresse d'instruction mal alignée ».`);
          setReg(i.rd, pc + 4);
          ev.nextPc = dest;
          ev.text = `Saut : PC ← ${hexAddr(dest)}${i.label ? ` (${i.label})` : ''}. ${i.rd === 0 ? 'Adresse de retour écartée (rd = x0).' : `Adresse de retour ${hexAddr(pc + 4)} rangée dans ${x(i.rd)}.`}`;
          break;
        }
        case 'jalr': {
          const dest = ((a + i.imm) & ~1) >>> 0;
          if (dest % 4 !== 0) throw new Error(`Saut indirect vers ${hex32(dest)}, adresse non multiple de 4 : exception « adresse d'instruction mal alignée ».`);
          setReg(i.rd, pc + 4);
          ev.nextPc = dest;
          ev.text = `Saut indirect : PC ← (${x(i.rs1)} + ${i.imm}) avec le bit 0 forcé à 0 = ${hex32(dest)}. ${i.rd === 0 ? 'Adresse de retour écartée (rd = x0).' : `Adresse de retour ${hexAddr(pc + 4)} rangée dans ${x(i.rd)}.`}`;
          break;
        }
        case 'ebreak': {
          ev.halted = true;
          this.halted = true;
          ev.nextPc = pc;
          ev.text = 'ebreak : le programme rend la main à l\'environnement. Ici, le simulateur s\'arrête.';
          break;
        }
        default:
          throw new Error(`Instruction non exécutable : ${i.op}`);
      }
    } catch (e) {
      return fail(e.message);
    }
    this.pc = ev.nextPc;
    this.steps += 1;
    return ev;
  }

  // Exécute jusqu'à l'arrêt ou jusqu'à la limite de pas.
  run(maxSteps = 10000) {
    let last = null;
    while (!this.halted && this.steps < maxSteps) last = this.step();
    return { halted: this.halted, error: this.error, steps: this.steps, last, limitReached: !this.halted };
  }
}
