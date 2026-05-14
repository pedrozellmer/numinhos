// Entry point — boot do jogo. Conecta todos os módulos e dá start no loop.

import { state } from './state.js';
import { MODES, MODE_ORDER } from './levels.js';
import { validateAllModes } from './solver.js';
import { maybeSpawnEnemies, updateParticles, enemyEscaped } from './engine.js';
import { initCanvas, resize, draw, getDims } from './render.js';
import {
  loadProgress, renderModeSelect, renderSplashMascots,
  bindNavigation, updateHUD, winLevel, loseLevel, flashMsg, ensureHandPlayable
} from './ui.js';
import { APP_VERSION } from './version.js';

// ===== AUTO-UPDATE =====
// Compara versão do código carregado com última versão vista pelo usuário.
// Se mudou (após cache invalidation/SW ativando), só salva pra próxima.
// O Service Worker faz o "pesado" — refetch sem cache em todas as requests.
(function checkVersion() {
  const stored = localStorage.getItem('numinhos_app_version');
  if (stored && stored !== APP_VERSION) {
    console.log(`[Numinhos] Atualizou: ${stored} → ${APP_VERSION}`);
  }
  localStorage.setItem('numinhos_app_version', APP_VERSION);
  // Exposto pro console em desenvolvimento
  window.__NUMINHOS_VERSION = APP_VERSION;
})();

// Registra Service Worker — controla cache e força refetch de assets
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(reg => {
    // Escuta atualizações enquanto a aba está aberta
    reg.addEventListener('updatefound', () => {
      const newSW = reg.installing;
      if (!newSW) return;
      newSW.addEventListener('statechange', () => {
        if (newSW.state === 'activated' && navigator.serviceWorker.controller) {
          console.log('[Numinhos] Nova versão instalada — recarregando...');
          window.location.reload();
        }
      });
    });
    // Verifica atualização agora (e a cada 1 min enquanto a aba está aberta)
    reg.update();
    setInterval(() => reg.update(), 60_000);
  }).catch(err => console.warn('[Numinhos] SW registration failed', err));

  // Quando o SW assume controle, recarrega pra pegar tudo novo
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
}

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
    const spawnedBefore = state.enemiesSpawned;
    maybeSpawnEnemies(elapsed, W);
    // Garante mão jogável APÓS SPAWN (não todo frame — custo de CPU).
    // Os outros pontos de checagem: após aplicar carta (em tryApplyCard)
    // e após inimigo escapar (abaixo).
    if (state.enemiesSpawned > spawnedBefore) ensureHandPlayable();

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
        // Inimigo escapou — recheca a mão (os vivos restantes mudaram)
        ensureHandPlayable();
      }
    }

    updateParticles(dt);
    if (state.shake > 0) state.shake = Math.max(0, state.shake - dt * 30);

    // Fim de fase: todos os spawns aconteceram E arena está vazia.
    // VITÓRIA se ainda tem ao menos 1 vida (3 vidas = pode errar até 2 vezes).
    // Cada vida perdida já é penalizada nas estrelas (3⭐=perfeito, 2⭐=−1 vida, 1⭐=−2+).
    if (
      state.gameRunning &&
      state.enemiesSpawned >= state.currentLevel.enemies.length &&
      state.enemies.length === 0
    ) {
      if (state.lives > 0) winLevel();
      // (se lives <= 0, loseLevel() já foi disparado na detecção do escape)
    }
  }

  draw();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
