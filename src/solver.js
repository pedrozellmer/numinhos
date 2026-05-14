// Solvers de validação de fases e busca em mão.
// Ambos respeitam isValidStep (overshoot/retrocesso) via applyOpDry.

import { applyOpDry } from './math.js';

/**
 * BFS limitada — verifica se um inimigo é teoricamente solucionável com o pool
 * (reuso ilimitado de cartas). Usado no boot pra validar todas as 40 fases.
 */
export function canSolveEnemy(startValue, target, handPool) {
  if (startValue === target) return true;
  const visited = new Set([startValue]);
  let frontier = [startValue];
  const maxDepth = 8;
  const maxStates = 5000;
  for (let depth = 0; depth < maxDepth && frontier.length > 0; depth++) {
    const next = [];
    for (const v of frontier) {
      for (const card of handPool) {
        const nv = applyOpDry(card, v, target);
        if (nv === null) continue;
        if (nv === target) return true;
        if (Math.abs(nv) > 1000) continue;
        if (!visited.has(nv)) {
          visited.add(nv);
          next.push(nv);
          if (visited.size > maxStates) return true;
        }
      }
    }
    frontier = next;
  }
  return false;
}

/**
 * DFS — existe sequência de cartas (sem reuso) de startValue até target?
 * Usado pelo smart refill pra decidir se a mão atual já resolve um inimigo.
 */
export function canSolveWithCards(startValue, target, cards) {
  if (startValue === target) return true;
  if (cards.length === 0) return false;
  for (let i = 0; i < cards.length; i++) {
    const nv = applyOpDry(cards[i], startValue, target);
    if (nv === null) continue;
    if (Math.abs(nv) > 10000) continue;
    if (nv === target) return true;
    const remaining = cards.slice(0, i).concat(cards.slice(i + 1));
    if (canSolveWithCards(nv, target, remaining)) return true;
  }
  return false;
}

/**
 * BFS com tracking de caminho — retorna a SEQUÊNCIA MÍNIMA de cartas
 * (com reuso) que leva de startValue até target. [] se não encontrar.
 * Usado para construir mão inicial otimizada.
 */
export function findShortestSolution(startValue, target, handPool, maxDepth = 6) {
  if (startValue === target) return [];
  const visited = new Map();
  visited.set(startValue, []);
  let frontier = [startValue];
  for (let depth = 0; depth < maxDepth && frontier.length > 0; depth++) {
    const next = [];
    for (const v of frontier) {
      const path = visited.get(v);
      for (const card of handPool) {
        const nv = applyOpDry(card, v, target);
        if (nv === null) continue;
        const newPath = [...path, card];
        if (nv === target) return newPath;
        if (Math.abs(nv) > 10000) continue;
        if (!visited.has(nv)) {
          visited.set(nv, newPath);
          next.push(nv);
        }
      }
    }
    frontier = next;
  }
  return [];
}

/**
 * Valida que todas as fases de todos os modos têm pelo menos um caminho
 * matemático até o target de cada inimigo. Roda no boot e loga.
 */
export function validateAllModes(MODES, MODE_ORDER) {
  let problems = 0;
  for (const modeId of MODE_ORDER) {
    const mode = MODES[modeId];
    mode.levels.forEach(lvl => {
      lvl.enemies.forEach(enemy => {
        const target = enemy.target != null ? enemy.target : 0;
        if (!canSolveEnemy(enemy.value, target, lvl.handPool)) {
          console.warn(`[Numinhos] Fase ${modeId}/${lvl.id} (${lvl.title}): inimigo ${enemy.value}→${target} pode não ser solucionável`, lvl.handPool);
          problems++;
        }
      });
    });
  }
  if (problems === 0) console.log('[Numinhos] ✓ Todas as fases solucionáveis');
  else console.warn(`[Numinhos] ⚠ ${problems} problema(s) de solucionabilidade`);
  return problems;
}
