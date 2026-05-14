// Motor do jogo: applyOp, refill inteligente, spawn de inimigos, partículas.
// Mantém isolamento de matemática (math.js) e renderização (render.js).

import { state, SPEED_MULTIPLIER } from './state.js';
import { isValidStep, applyOpDry } from './math.js';
import { canSolveWithCards } from './solver.js';
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
  state.floatingTexts.push({
    x: enemy.x, y: enemy.y - 20,
    vy: -1.2, life: 1.2,
    text: reason === 'overshoot' ? 'passa do alvo!' : 'não dá!',
    color: '#888',
  });
  enemy.flashTime = 0.2;
  if (navigator.vibrate) navigator.vibrate([20, 30, 20]);
  soundInvalid();
}

// =========== HAND — refill inteligente v3 ===========
// Bug grave detectado por Pedro: mão inicial sorteia random sem considerar
// inimigos PRÓXIMOS a spawnar — criança começava a fase travada com cartas
// inúteis (ex: pool [+1,+2,+3,+4] sorteava [+3,+3,+3,+4] e inimigos eram
// 4→5 e 3→5, nenhuma carta resolvia).
//
// Versão v3:
//   - Considera TANTO inimigos vivos QUANTO próximos a spawnar
//   - Penaliza cartas duplicadas na mão (favorece diversidade)
//   - Mão inicial não é mais random — é otimizada pros 4 primeiros alvos
export function pickSmartCard(lvl) {
  const alive = state.enemies.filter(e => !e.dying);
  const handCards = state.cards.map(c => ({ op: c.op, val: c.val }));

  // Top inimigos vivos por urgência (mais próximos da linha)
  const sorted = [...alive].sort((a, b) => b.y - a.y);
  const aliveTargets = sorted.slice(0, 3).map(e => ({
    value: e.value, target: e.target, weight: 100,
  }));

  // Próximos inimigos a spawnar (preencher até 3 alvos no total)
  const remainingSlots = 3 - aliveTargets.length;
  const upcoming = lvl.enemies
    .slice(state.enemiesSpawned, state.enemiesSpawned + remainingSlots)
    .map(spec => ({
      value: spec.value,
      target: spec.target != null ? spec.target : 0,
      weight: 70, // alvo futuro vale menos que vivo
    }));

  const targets = [...aliveTargets, ...upcoming];

  // Sem nenhum alvo (fim de fase): random é OK
  if (targets.length === 0) return randomFromPool(lvl.handPool);

  // Score por carta considerando TODOS os alvos relevantes
  const scored = lvl.handPool.map(proto => {
    let bestScore = -1;
    for (const t of targets) {
      // 1 carta sozinha zera esse alvo? score alto (modulado pelo peso)
      const after = applyOpDry(proto, t.value, t.target);
      if (after === t.target) {
        bestScore = Math.max(bestScore, t.weight);
        continue;
      }
      // Mão + nova carta resolve esse alvo? score médio
      if (canSolveWithCards(t.value, t.target, [...handCards, proto])) {
        bestScore = Math.max(bestScore, Math.round(t.weight * 0.5));
        continue;
      }
      // Aproxima do target? heurística baixa
      if (after !== null) {
        const distBefore = Math.abs(t.value - t.target);
        const distAfter = Math.abs(after - t.target);
        if (distAfter < distBefore) {
          bestScore = Math.max(bestScore, 5 + (distBefore - distAfter));
        }
      }
    }

    // PENALIDADE DE DUPLICAÇÃO — favorece diversidade na mão.
    // Se a mão já tem N cópias dessa carta, diminui score.
    const dupCount = handCards.filter(c => c.op === proto.op && c.val === proto.val).length;
    if (dupCount > 0) bestScore -= dupCount * 12;

    return { proto, score: bestScore };
  });

  // Pega o maior score, tiebreak aleatório pra variedade
  scored.sort((a, b) => b.score - a.score || Math.random() - 0.5);
  const top = scored[0];

  if (top.score < 0) {
    console.warn('[Numinhos] refill fallback — nenhuma carta útil pra alvos', {
      targets, hand: handCards, pool: lvl.handPool,
    });
  }
  return top.proto;
}

function randomFromPool(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
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
