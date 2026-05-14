// Entry point — boot do jogo. Conecta todos os módulos e dá start no loop.

import { state } from './state.js';
import { MODES, MODE_ORDER } from './levels.js';
import { validateAllModes } from './solver.js';
import { maybeSpawnEnemies, updateParticles, enemyEscaped } from './engine.js';
import { initCanvas, resize, draw, getDims } from './render.js';
import {
  loadProgress, renderModeSelect, renderSplashMascots,
  bindNavigation, updateHUD, winLevel, loseLevel, flashMsg
} from './ui.js';

// ===== INIT =====
state.progress = loadProgress();
validateAllModes(MODES, MODE_ORDER);
initCanvas();
renderSplashMascots();
renderModeSelect();
bindNavigation();
window.addEventListener('resize', () => { if (state.gameRunning) resize(); });

// ===== MAIN LOOP =====
let last = performance.now();
function loop(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;

  if (state.gameRunning) {
    const { W, H } = getDims();
    const elapsed = (now - state.levelStartTime) / 1000;
    maybeSpawnEnemies(elapsed, W);

    for (let i = state.enemies.length - 1; i >= 0; i--) {
      const e = state.enemies[i];
      if (e.flashTime > 0) e.flashTime -= dt;
      if (e.dying) {
        e.deathT += dt * 2.5;
        if (e.deathT >= 1) state.enemies.splice(i, 1);
        continue;
      }
      e.y += e.speed * dt;
      const lineY = H - 50;
      if (e.y >= lineY) {
        state.enemies.splice(i, 1);
        enemyEscaped();
        updateHUD();
        flashMsg('OPA!', '#e63946');
        if (state.lives <= 0) { loseLevel(); break; }
      }
    }

    updateParticles(dt);
    if (state.shake > 0) state.shake = Math.max(0, state.shake - dt * 30);

    if (
      state.gameRunning &&
      state.enemiesSpawned >= state.currentLevel.enemies.length &&
      state.enemies.length === 0
    ) {
      const total = state.currentLevel.enemies.length;
      if (state.enemiesKilled >= total) winLevel();
      else loseLevel();
    }
  }

  draw();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
