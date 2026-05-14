// Testes da GARANTIA INVIOLÁVEL:
//
//   "Em qualquer momento, em qualquer modo, fase ou dificuldade,
//    a criança SEMPRE tem ao menos uma jogada possível."
//
// Importa as funções REAIS (puras) — não replica lógica, então o teste
// nunca fica desatualizado quando o algoritmo evolui.

import { describe, it, expect } from './test-runner.js';
import { MODES, MODE_ORDER } from '../src/levels.js';
import { canSolveWithCards, findShortestSolution } from '../src/solver.js';
import { applyOpDry } from '../src/math.js';
import { buildOptimalInitialHand, pickSmartCardPure, findHandFix } from '../src/engine.js';

const normEnemy = (spec) => ({
  value: spec.value,
  target: spec.target != null ? spec.target : 0,
});

describe('GARANTIA — mão inicial cobre o 1º spawn', () => {
  for (const modeId of MODE_ORDER) {
    for (const lvl of MODES[modeId].levels) {
      it(`${modeId}/${lvl.id} (${lvl.title})`, () => {
        const hand = buildOptimalInitialHand(lvl, 4);
        const first = lvl.enemies.slice(0, 3).map(normEnemy);
        const covers = first.some(e => canSolveWithCards(e.value, e.target, hand));
        expect(covers).toBe(true);
      });
    }
  }
});

describe('GARANTIA — todo inimigo tem caminho BFS até o target', () => {
  for (const modeId of MODE_ORDER) {
    for (const lvl of MODES[modeId].levels) {
      it(`${modeId}/${lvl.id}`, () => {
        const allSolvable = lvl.enemies.every(spec => {
          const e = normEnemy(spec);
          return e.value === e.target
            || findShortestSolution(e.value, e.target, lvl.handPool).length > 0;
        });
        expect(allSolvable).toBe(true);
      });
    }
  }
});

// ===== SIMULADOR DE PARTIDA COMPLETA =====
// Joga a fase inteira: spawna inimigos, resolve um por vez (usando a melhor
// sequência da mão), refilla com pickSmartCardPure. Se em ALGUM momento
// nenhum inimigo vivo for resolvível com a mão atual → GARANTIA QUEBRADA.
function simulateGame(lvl, slots = 4) {
  let hand = buildOptimalInitialHand(lvl, slots).map(c => ({ op: c.op, val: c.val }));
  const queue = lvl.enemies.map(normEnemy);
  let alive = [];
  let spawned = 0;
  let resolved = 0;
  const maxSteps = 500;

  for (let step = 0; step < maxSteps; step++) {
    // Spawna enquanto houver espaço e fila
    while (spawned < queue.length && alive.length < slots) {
      alive.push({ ...queue[spawned], y: 100 + spawned });
      spawned++;
    }
    if (alive.length === 0) {
      return { ok: resolved === queue.length, resolved, total: queue.length };
    }
    // GARANTIA FINAL — todo step (equivalente a "todo frame" no main loop):
    // conserta a mão se ela não resolve ninguém.
    let fixSafety = 6;
    while (fixSafety-- > 0) {
      const fix = findHandFix(lvl, hand, alive);
      if (!fix) break;
      hand[fix.discardIdx] = { op: fix.newProto.op, val: fix.newProto.val };
    }
    // Encontra um inimigo resolvível com a mão atual
    const target = alive.find(e => canSolveWithCards(e.value, e.target, hand));
    if (!target) {
      return {
        ok: false, reason: 'TRAVOU',
        hand: hand.map(c => c.op + c.val),
        alive: alive.map(e => e.value + '→' + e.target),
        resolved, total: queue.length,
      };
    }
    // "Joga" a sequência mínima que zera esse inimigo usando a mão
    const seq = findSolutionWithinHand(target.value, target.target, hand);
    for (const card of seq) {
      const idx = hand.findIndex(h => h.op === card.op && h.val === card.val);
      if (idx >= 0) hand.splice(idx, 1);
    }
    alive = alive.filter(e => e !== target);
    resolved++;
    // Refilla a mão
    let safety = 20;
    while (hand.length < slots && safety-- > 0) {
      const proto = pickSmartCardPure(lvl, hand, alive, spawned);
      hand.push({ op: proto.op, val: proto.val });
    }
  }
  return { ok: false, reason: 'maxSteps', resolved, total: queue.length };
}

// DFS que retorna a sequência de cartas (subconjunto da mão, sem reuso)
// que vai de value até target. Usado pelo simulador.
function findSolutionWithinHand(value, target, hand) {
  if (value === target) return [];
  for (let i = 0; i < hand.length; i++) {
    const nv = applyOpDry(hand[i], value, target);
    if (nv === null) continue;
    if (nv === target) return [hand[i]];
    const rest = hand.slice(0, i).concat(hand.slice(i + 1));
    const sub = findSolutionWithinHand(nv, target, rest);
    if (sub) return [hand[i], ...sub];
  }
  return null;
}

describe('GARANTIA — partida completa nunca trava (simulação)', () => {
  for (const modeId of MODE_ORDER) {
    for (const lvl of MODES[modeId].levels) {
      it(`${modeId}/${lvl.id} (${lvl.title}): joga do começo ao fim sem travar`, () => {
        // Roda 5 vezes (tiebreak tem aleatoriedade no pickSmartCard)
        for (let run = 0; run < 5; run++) {
          const result = simulateGame(lvl, 4);
          if (!result.ok) {
            throw new Error(`run ${run}: ${result.reason || 'incompleto'} — ` +
              `resolveu ${result.resolved}/${result.total}` +
              (result.hand ? ` | mão=${result.hand} | vivos=${result.alive}` : ''));
          }
        }
        expect(true).toBe(true);
      });
    }
  }
});
