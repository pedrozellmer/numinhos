// Tracking de habilidades BNCC.
//
// O jogo registra, por habilidade, quantas vezes a criança fez uma jogada que
// aproximou o inimigo de zero (acerto), quantas fez uma jogada que afastou
// (erro), e quantos inimigos chegaram a ser zerados (resolvido).
//
// O catálogo abaixo cobre apenas as habilidades exercitadas hoje (operações
// básicas do 1º ao 4º ano). Quando entrarem novas mecânicas (frações,
// problemas com texto, geometria), basta adicionar entradas em BNCC_SKILLS
// e referenciá-las em src/content/levels.ts.

import type { Card, Op } from './types';
import { applyCard } from './operations';

export type BnccCode = string;

export interface BnccSkill {
  code: BnccCode;
  description: string;
  year: number; // 1 a 5
}

export const BNCC_SKILLS: Record<BnccCode, BnccSkill> = {
  EF01MA08: {
    code: 'EF01MA08',
    description: 'Adição e subtração até 30, com cálculo mental',
    year: 1,
  },
  EF02MA05: {
    code: 'EF02MA05',
    description: 'Adição e subtração até 1000 (composição/decomposição)',
    year: 2,
  },
  EF03MA07: {
    code: 'EF03MA07',
    description: 'Multiplicação por dobro, triplo, quádruplo',
    year: 3,
  },
  EF04MA03: {
    code: 'EF04MA03',
    description: 'Divisão exata e por estimativa',
    year: 4,
  },
};

export interface BnccStats {
  goodMoves: number;
  badMoves: number;
  enemiesSolved: number;
}

export type BnccProgress = Record<BnccCode, BnccStats>;

const KEY = 'numinhos_bncc';

export function loadBnccProgress(): BnccProgress {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}') as BnccProgress;
  } catch {
    return {};
  }
}

export function saveBnccProgress(progress: BnccProgress): void {
  localStorage.setItem(KEY, JSON.stringify(progress));
}

function ensure(progress: BnccProgress, code: BnccCode): BnccStats {
  let entry = progress[code];
  if (!entry) {
    entry = { goodMoves: 0, badMoves: 0, enemiesSolved: 0 };
    progress[code] = entry;
  }
  return entry;
}

// Mapeia uma carta + dificuldade da fase para a habilidade BNCC mais provável.
// É uma aproximação: a fase declara quais códigos exercita; aqui escolhemos
// dentre eles o que faz mais sentido para a operação da carta.
export function skillForCard(card: Card, levelSkills: BnccCode[]): BnccCode | null {
  const opPriority: Record<Op, BnccCode[]> = {
    '+': ['EF01MA08', 'EF02MA05'],
    '-': ['EF01MA08', 'EF02MA05'],
    '×': ['EF03MA07'],
    '÷': ['EF04MA03'],
  };
  for (const candidate of opPriority[card.op]) {
    if (levelSkills.includes(candidate)) return candidate;
  }
  return levelSkills[0] ?? null;
}

// Registra uma jogada: comparação |novo| vs |antigo| classifica acerto/erro.
// Se o inimigo zerou, conta também como "resolvido".
export function recordCardApplication(
  progress: BnccProgress,
  levelSkills: BnccCode[],
  card: Card,
  oldValue: number,
): BnccCode | null {
  const newValue = applyCard(oldValue, card);
  const skill = skillForCard(card, levelSkills);
  if (!skill) return null;
  const stats = ensure(progress, skill);
  if (Math.abs(newValue) < Math.abs(oldValue)) stats.goodMoves++;
  else if (Math.abs(newValue) > Math.abs(oldValue)) stats.badMoves++;
  if (newValue === 0) stats.enemiesSolved++;
  return skill;
}
