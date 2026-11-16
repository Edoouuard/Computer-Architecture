// Trois programmes d'exemple commentés. `attendu` sert aux tests automatiques.
export const PROGRAMS = [
  {
    id: 'addition',
    titre: 'Addition',
    resume: 'Deux constantes chargées dans des registres, puis additionnées.',
    source: `# Addition : 7 + 35
# addi charge une constante en l'ajoutant à x0, qui vaut toujours 0.
    addi x5, x0, 7      # x5 ← 7
    addi x6, x0, 35     # x6 ← 35
    add  x7, x5, x6     # x7 ← x5 + x6
    addi x0, x7, 1      # écriture dans x0 : sans effet
    ebreak              # arrêt
`,
    attendu: { regs: { 5: 7, 6: 35, 7: 42, 0: 0 }, steps: 5 },
  },
  {
    id: 'boucle',
    titre: 'Boucle',
    resume: 'Somme des entiers de 1 à 10 avec un branchement conditionnel.',
    source: `# Boucle : somme des entiers de 1 à 10
    addi t0, zero, 0     # t0 = somme
    addi t1, zero, 1     # t1 = i
    addi t2, zero, 10    # t2 = borne
boucle:
    add  t0, t0, t1      # somme ← somme + i
    addi t1, t1, 1       # i ← i + 1
    bge  t2, t1, boucle  # tant que 10 >= i, recommencer
    ebreak               # t0 contient 55
`,
    attendu: { regs: { 5: 55, 6: 11, 7: 10 } },
  },
  {
    id: 'memoire',
    titre: 'Somme en mémoire',
    resume: 'Parcours d\'un tableau de 5 mots, puis écriture du total en mémoire.',
    source: `# Somme de 5 valeurs rangées en mémoire
.data
tableau:  .word 12, -5, 30, 8, 100
resultat: .word 0

.text
    la   a0, tableau     # a0 = adresse du premier mot (0x100)
    addi a1, zero, 5     # a1 = nombre de mots restants
    addi a2, zero, 0     # a2 = somme
suite:
    beq  a1, zero, fin   # plus rien à lire ?
    lw   t0, 0(a0)       # t0 ← mot à l'adresse a0
    add  a2, a2, t0      # somme ← somme + t0
    addi a0, a0, 4       # mot suivant : +4 octets
    addi a1, a1, -1      # un mot de moins
    jal  zero, suite     # saut sans adresse de retour
fin:
    la   t1, resultat    # t1 = adresse du résultat (0x114)
    sw   a2, 0(t1)       # mémoire[0x114] ← somme
    ebreak
`,
    attendu: { regs: { 12: 145, 11: 0, 10: 0x114 }, mem: { 0x114: 145 } },
  },
];
