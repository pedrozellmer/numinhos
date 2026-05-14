// Motor do jogo: applyOp, refill inteligente, spawn de inimigos, partículas.
// Mantém isolamento de matemática (math.js) e renderização (render.js).

import { state, SPEED_MULTIPLIER } from './state.js';
import { isValidStep, applyOpDry } from './math.js';
import { canSolveWithCards, findShortestSolution, canSolveEnemy } from './solver.js';
import { colorFor } from './levels.js';
import { soundCardApplied, soundEnemyDestroyed, soundInvalid, soundLifeLost } from './audio.js';

// Mascote por valor — pool de emojis brasileiros (placeholder até IP final)
const MASCOTS = ['🦜','🐢','🐊','🦒','🦋','🐠','🦥','🐝','🐬','🐯','🦛','🦎'];
export function mascotFor(v) {
  return MASCOTS[Math.abs(v) % MASCOTS.length];
}
export { colorFor };

// =========== APPLY OP — engine real ===========
// Retorna 'ok' | 'invalid' (÷ não-exata) | 'overshoot' (passa/afasta do alvo)
export function applyOp(card, enemy) {
  const v = enemy.value;
  let nv;
  if (card.op === '+') nv = v + card.val;
  else if (card.op === '-') nv = v - card.val;
  else if (card.op === '×') nv = v * card.val;
  else if (card.op === '÷') {
    if (card.val === 0) return 'invalid';
    if (v === 0) return 'invalid';
    if (v % card.val !== 0) return 'invalid';
    nv = v / card.val;
  } else {
    return 'invalid';
  }
  if (!isValidStep(v, nv, enemy.target)) return 'overshoot';

  // REGRA COMPLETA: o resultado precisa AINDA ter caminho até o alvo.
  // Sem isso, o jogador pode fazer uma jogada "válida" (não-overshoot) que
  // trava o Numinho num beco sem saída (ex: 7+7=14 quando o pool não tem +1
  // pra fechar em 15). Bloqueia a jogada e mantém a carta na mão.
  if (nv !== enemy.target &&
      !canSolveEnemy(nv, enemy.target, state.currentLevel.handPool)) {
    return 'deadend';
  }

  enemy.value = nv;
  enemy.flashTime = 0.4;
  state.floatingTexts.push({
    x: enemy.x, y: enemy.y - 20,
    vy: -1.5, life: 1,
    text: card.op + card.val,
    color: card.op === '+' ? '#43d177' : card.op === '-' ? '#ff6b6b'
         : card.op === '×' ? '#ffa600' : '#6c8dff',
  });
  if (navigator.vibrate) navigator.vibrate(20);
  soundCardApplied();

  if (nv === enemy.target) destroyEnemy(enemy);
  return 'ok';
}

export function destroyEnemy(enemy) {
  enemy.dying = true;
  state.enemiesKilled++;
  state.score += 100 + Math.floor(state.lives * 25);
  spawnConfetti(enemy.x, enemy.y);
  state.shake = Math.min(state.shake + 8, 16);
  if (navigator.vibrate) navigator.vibrate(40);
  soundEnemyDestroyed();
}

// Feedback de carta inválida — não consome, balança o inimigo
export function showInvalidFeedback(enemy, reason) {
  let text;
  if (reason === 'overshoot') text = 'passa do alvo!';
  else if (reason === 'deadend') text = 'não chega no alvo!';
  else text = 'não dá!';
  state.floatingTexts.push({
    x: enemy.x, y: enemy.y - 20,
    vy: -1.2, life: 1.2,
    text,
    color: '#888',
  });
  enemy.flashTime = 0.2;
  if (navigator.vibrate) navigator.vibrate([20, 30, 20]);
  soundInvalid();
}

// =========== HAND — refill v4 com GARANTIA INVIOLÁVEL ===========
//
// INVARIANTE: TODO inimigo vivo deve ter ao menos uma combinação na mão
// (atual + nova carta) que o resolva. Sempre. Em qualquer modo, fase
// ou dificuldade. Sem exceção.
//
// Algoritmo em 4 passos prioritários:
//   1. CONSERTA: se algum inimigo vivo está irresolvível com a mão atual,
//      a próxima carta DEVE consertar pelo menos um deles
//   2. PREPARA: se mão atual cobre vivos, considera próximos spawns
//   3. DIVERSIFICA: se tudo coberto, escolhe carta menos repetida no pool
//   4. FALLBACK: heurística "aproxima target" (não deveria chegar aqui)

// Versão PURA — recebe tudo como argumento, não toca em `state`.
// Testável isoladamente. O wrapper pickSmartCard injeta o state real.
//
//   lvl            — definição da fase (handPool, enemies)
//   handCards      — [{op, val}] cartas atualmente na mão
//   aliveEnemies   — [{value, target, y}] inimigos vivos na tela
//   enemiesSpawned — quantos já spawnaram (índice do próximo)
export function pickSmartCardPure(lvl, handCards, aliveEnemies, enemiesSpawned) {
  const alive = aliveEnemies;

  // === PASSO 1: CONSERTA inimigos vivos sem solução com mão atual ===
  const unsolvableAlive = alive.filter(e =>
    !canSolveWithCards(e.value, e.target, handCards)
  );
  if (unsolvableAlive.length > 0) {
    unsolvableAlive.sort((a, b) => (b.y || 0) - (a.y || 0));
    const fixers = lvl.handPool.map(proto => {
      const fixedCount = unsolvableAlive.filter(e =>
        canSolveWithCards(e.value, e.target, [...handCards, proto])
      ).length;
      const oneStepFix = applyOpDry(proto, unsolvableAlive[0].value, unsolvableAlive[0].target)
                        === unsolvableAlive[0].target ? 10 : 0;
      const dupCount = handCards.filter(c => c.op === proto.op && c.val === proto.val).length;
      return { proto, score: fixedCount * 100 + oneStepFix - dupCount * 5 };
    });
    fixers.sort((a, b) => b.score - a.score || Math.random() - 0.5);
    if (fixers[0].score > 0) return fixers[0].proto;
    console.warn('[Numinhos] INVARIANTE QUEBRADA: nenhuma carta conserta inimigos vivos',
      { unsolvableAlive: unsolvableAlive.map(e => ({v:e.value, t:e.target})),
        hand: handCards, pool: lvl.handPool });
  }

  // === PASSO 2: PREPARA — considera próximos spawns ===
  const upcoming = lvl.enemies
    .slice(enemiesSpawned, enemiesSpawned + 3)
    .map(spec => ({
      value: spec.value,
      target: spec.target != null ? spec.target : 0,
    }));
  const targets = [
    ...alive.slice().sort((a, b) => (b.y || 0) - (a.y || 0)).slice(0, 3),
    ...upcoming
  ];

  if (targets.length === 0) return randomFromPool(lvl.handPool);

  // === PASSO 3: DIVERSIFICA / PREFERE 1-PASSO ===
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

  scored.sort((a, b) => b.score - a.score || Math.random() - 0.5);
  return scored[0].proto;
}

// Wrapper que injeta o state real do jogo.
export function pickSmartCard(lvl) {
  const alive = state.enemies.filter(e => !e.dying);
  const handCards = state.cards.map(c => ({ op: c.op, val: c.val }));
  return pickSmartCardPure(lvl, handCards, alive, state.enemiesSpawned);
}

function randomFromPool(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}

// =========== GARANTIA FINAL: findHandFix ===========
// Em fases complexas o jogador pode gastar cartas "erradas" e ficar com uma
// mão que não resolve NENHUM inimigo vivo. Este é o último escudo.
//
// findHandFix retorna {discardIdx, newProto} — UMA troca que faz PROGRESSO
// em direção à solução do inimigo mais urgente. Chamada iterativamente
// (loop), converge: cada chamada adiciona uma carta da solução BFS e
// descarta uma carta sem utilidade. Pura.
export function findHandFix(lvl, handCards, alive) {
  if (alive.length === 0) return null;
  // Mão já resolve alguém? Tudo certo.
  if (alive.some(e => canSolveWithCards(e.value, e.target, handCards))) return null;

  // Foca no inimigo mais urgente (maior y = mais perto da linha)
  const urgent = alive.slice().sort((a, b) => (b.y || 0) - (a.y || 0))[0];

  // Solução ótima pro urgente — sequência de cartas do pool (BFS)
  const solution = findShortestSolution(urgent.value, urgent.target, lvl.handPool);
  if (solution.length === 0) return null; // fase sem solução (não deveria)

  // Quais cartas da solução AINDA FALTAM na mão (considerando contagem)?
  const handCopy = handCards.slice();
  const missing = [];
  for (const card of solution) {
    const idx = handCopy.findIndex(h => h.op === card.op && h.val === card.val);
    if (idx >= 0) handCopy.splice(idx, 1);
    else missing.push(card);
  }
  if (missing.length === 0) return null; // mão já contém a solução inteira

  // Conta quantas de cada carta a solução precisa
  const need = {};
  for (const c of solution) {
    const k = c.op + c.val;
    need[k] = (need[k] || 0) + 1;
  }
  // Descarta uma carta da mão que tem "sobra" (mais cópias do que a solução usa)
  let discardIdx = 0;
  for (let i = 0; i < handCards.length; i++) {
    const k = handCards[i].op + handCards[i].val;
    const handHas = handCards.filter(h => h.op + h.val === k).length;
    if (handHas > (need[k] || 0)) { discardIdx = i; break; }
  }

  return { discardIdx, newProto: missing[0] };
}

// =========== MÃO INICIAL OTIMIZADA ===========
// Constrói a mão completa de 'slots' cartas que cobre os primeiros spawns.
// Usa findShortestSolution (BFS no pool) — funciona até pra divisões
// encadeadas (ex: 36→1 com pool ÷2-÷6 precisa de ÷6 + ÷6).
export function buildOptimalInitialHand(lvl, slots = 4) {
  const upcoming = lvl.enemies.slice(0, slots).map(spec => ({
    value: spec.value,
    target: spec.target != null ? spec.target : 0,
  }));

  // Pra cada inimigo, descobre a sequência ótima de cartas que zera ele
  const solutions = upcoming.map(e =>
    findShortestSolution(e.value, e.target, lvl.handPool)
  );

  const hand = [];
  // Greedy: pra cada inimigo, garantir cobertura na mão final.
  // A cada rodada, pra cada inimigo não-coberto, adiciona UMA carta da
  // solução dele que ainda FALTA na mão (considerando contagem — soluções
  // podem precisar da mesma carta múltiplas vezes, ex: ÷2÷2÷2).
  for (let iter = 0; iter < 20 && hand.length < slots; iter++) {
    let addedThisRound = false;
    for (let i = 0; i < upcoming.length && hand.length < slots; i++) {
      const enemy = upcoming[i];
      if (canSolveWithCards(enemy.value, enemy.target, hand)) continue;
      const sol = solutions[i];
      // Acha próxima carta cuja quantidade na mão ainda é menor que na solução
      const need = sol.find(c => {
        const inSol = sol.filter(s => s.op === c.op && s.val === c.val).length;
        const inHand = hand.filter(h => h.op === c.op && h.val === c.val).length;
        return inHand < inSol;
      });
      if (!need) continue;
      hand.push(need);
      addedThisRound = true;
    }
    if (!addedThisRound) break;
  }

  // Preenche slots restantes com cartas diversas (não repete o que já tem)
  while (hand.length < slots) {
    const fresh = lvl.handPool.find(p =>
      !hand.some(h => h.op === p.op && h.val === p.val)
    );
    hand.push(fresh || lvl.handPool[0]);
  }

  return hand;
}

// =========== ENEMY SPAWN ===========
export function maybeSpawnEnemies(elapsed, W) {
  const lvl = state.currentLevel;
  while (state.enemiesSpawned < lvl.enemies.length) {
    const next = lvl.enemies[state.enemiesSpawned];
    if (elapsed >= next.delay) {
      spawnEnemy(next, W);
      state.enemiesSpawned++;
    } else break;
  }
}

function spawnEnemy(spec, W) {
  const margin = 40;
  const x = margin + Math.random() * (W - 2 * margin);
  state.enemies.push({
    id: state.nextEnemyId++,
    x, y: -30,
    value: spec.value,
    originalValue: spec.value,
    target: spec.target != null ? spec.target : 0,
    speed: spec.speed * 60 * SPEED_MULTIPLIER,
    mascot: mascotFor(spec.value),
    flashTime: 0,
    dying: false,
    deathT: 0,
  });
}

// Notifica que um inimigo escapou (passou da linha) — perde vida
export function enemyEscaped() {
  state.lives--;
  state.shake = 14;
  if (navigator.vibrate) navigator.vibrate([40, 40, 80]);
  soundLifeLost();
}

// =========== PARTICLES ===========
export function spawnConfetti(x, y) {
  const colors = ['#ff6b6b','#ffd166','#43d177','#6c8dff','#9d4edd','#ff8e3c'];
  for (let i = 0; i < 24; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 4;
    state.particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1,
      life: 1,
      decay: 0.015 + Math.random() * 0.015,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 3 + Math.random() * 4,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.3,
    });
  }
}

export function updateParticles(dt) {
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.x += p.vx * dt * 60;
    p.y += p.vy * dt * 60;
    p.vy += 0.15 * dt * 60;
    p.life -= p.decay * dt * 60;
    p.rot += p.vrot;
    if (p.life <= 0) state.particles.splice(i, 1);
  }
  for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
    const f = state.floatingTexts[i];
    f.y += f.vy;
    f.life -= 0.02;
    if (f.life <= 0) state.floatingTexts.splice(i, 1);
  }
}
