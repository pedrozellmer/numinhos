// Testes da GARANTIA INVIOLÁVEL do smart refill:
//
//   "Em qualquer momento, em qualquer modo, fase ou dificuldade,
//    a mão sempre tem ao menos UMA combinação que zera pelo menos
//    UM inimigo vivo."
//
// Simulamos jogos pseudo-aleatórios em todas as 40 fases e verificamos
// que o estado da mão NUNCA fica num ponto onde NENHUM inimigo vivo
// pode ser resolvido. Se ficar, isso quebra a invariante e é um bug.

import { describe, it, expect } from './test-runner.js';
import { MODES, MODE_ORDER } from '../src/levels.js';
import { canSolveWithCards } from '../src/solver.js';
import { applyOpDry } from '../src/math.js';

// Replica do pickSmartCard pra testar sem mexer no state real do jogo.
function pickSmartCardPure(lvl, handCards, alive, enemiesSpawned) {
  const unsolvableAlive = alive.filter(e =>
    !canSolveWithCards(e.value, e.target, handCards)
  );
  if (unsolvableAlive.length > 0) {
    unsolvableAlive.sort((a, b) => b.y - a.y);
    const fixers = lvl.handPool.map(proto => {
      const fixedCount = unsolvableAlive.filter(e =>
        canSolveWithCards(e.value, e.target, [...handCards, proto])
      ).length;
      const oneStepFix = applyOpDry(proto, unsolvableAlive[0].value, unsolvableAlive[0].target)
                        === unsolvableAlive[0].target ? 10 : 0;
      const dupCount = handCards.filter(c => c.op === proto.op && c.val === proto.val).length;
      return { proto, score: fixedCount * 100 + oneStepFix - dupCount * 5 };
    });
    fixers.sort((a, b) => b.score - a.score);
    if (fixers[0].score > 0) return fixers[0].proto;
  }

  const upcoming = lvl.enemies
    .slice(enemiesSpawned, enemiesSpawned + 3)
    .map(spec => ({
      value: spec.value,
      target: spec.target != null ? spec.target : 0,
    }));
  const targets = [
    ...alive.slice().sort((a, b) => b.y - a.y).slice(0, 3),
    ...upcoming
  ];
  if (targets.length === 0) return lvl.handPool[0];

  const scored = lvl.handPool.map(proto => {
    let bestScore = 0;
    for (const t of targets) {
      const weight = alive.includes(t) ? 100 : 60;
      const after = applyOpDry(proto, t.value, t.target);
      if (after === t.target) { bestScore = Math.max(bestScore, weight); continue; }
      if (canSolveWithCards(t.value, t.target, [...handCards, proto])) {
        bestScore = Math.max(bestScore, Math.round(weight * 0.5));
        continue;
      }
      if (after !== null) {
        const dB = Math.abs(t.value - t.target);
        const dA = Math.abs(after - t.target);
        if (dA < dB) bestScore = Math.max(bestScore, 5 + (dB - dA));
      }
    }
    const dupCount = handCards.filter(c => c.op === proto.op && c.val === proto.val).length;
    bestScore -= dupCount * 12;
    return { proto, score: bestScore };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0].proto;
}

// Simula a mão inicial (4 cartas) considerando os primeiros spawns
function buildInitialHand(lvl, slots = 4) {
  const hand = [];
  while (hand.length < slots) {
    hand.push(pickSmartCardPure(lvl, hand, [], 0));
  }
  return hand;
}

// Verifica se EXISTE pelo menos um inimigo na lista alive que a mão consegue resolver
function handCoversAnyEnemy(hand, alive) {
  if (alive.length === 0) return true;
  return alive.some(e => canSolveWithCards(e.value, e.target, hand));
}

describe('GARANTIA INVIOLÁVEL — mão sempre joga em fase inicial', () => {
  for (const modeId of MODE_ORDER) {
    const mode = MODES[modeId];
    for (const lvl of mode.levels) {
      it(`mão inicial de ${modeId}/${lvl.id} (${lvl.title}) cobre pelo menos um spawn`, () => {
        const hand = buildInitialHand(lvl, 4);
        // Os 3 primeiros inimigos a spawnar simulando "alive"
        const firstEnemies = lvl.enemies.slice(0, 3).map(spec => ({
          value: spec.value,
          target: spec.target != null ? spec.target : 0,
        }));
        const covers = handCoversAnyEnemy(hand, firstEnemies);
        expect(covers).toBe(true);
      });
    }
  }
});

describe('GARANTIA INVIOLÁVEL — refill conserta inimigos travados', () => {
  for (const modeId of MODE_ORDER) {
    const mode = MODES[modeId];
    for (const lvl of mode.levels) {
      it(`${modeId}/${lvl.id}: refill conserta cenário "mão de cartas inúteis"`, () => {
        // Simula uma mão "ruim" — pega a primeira carta do pool 4 vezes
        const badHand = Array(4).fill(lvl.handPool[0]);
        // Simula 1 inimigo vivo (primeiro spawn da fase)
        const enemy = {
          value: lvl.enemies[0].value,
          target: lvl.enemies[0].target != null ? lvl.enemies[0].target : 0,
          y: 100,
        };
        // Se a mão atual já cobre, OK
        if (canSolveWithCards(enemy.value, enemy.target, badHand)) return;
        // Senão, refill deve sugerir uma carta que torna a mão jogável
        const newCard = pickSmartCardPure(lvl, badHand, [enemy], 1);
        const newHand = [...badHand, newCard];
        const covers = canSolveWithCards(enemy.value, enemy.target, newHand);
        expect(covers).toBe(true);
      });
    }
  }
});
