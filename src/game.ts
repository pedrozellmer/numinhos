// Coração do jogo: iniciar fase, spawn de inimigos, loop principal,
// detecção de vitória/derrota.

import type { EnemySpec, Level } from './types';
import { state } from './state';
import { byId, hideAllScreens, setDisplay } from './dom';
import { resizeCanvas, view, defenseLineY } from './canvas';
import { draw } from './render';
import { updateParticles, flashMsg, vibrate } from './effects';
import { mascotFor } from './content/mascots';
import { refillHand } from './hand';
import { updateHUD, setLevelLabel } from './hud';
import { showTutorial, showWinScreen, showLoseScreen } from './ui';
import { saveProgress } from './persistence';

export function startLevel(lvl: Level): void {
  state.currentLevel = lvl;
  state.enemies = [];
  state.cards = [];
  state.score = 0;
  state.lives = lvl.lives;
  state.enemiesSpawned = 0;
  state.enemiesKilled = 0;
  state.particles = [];
  state.floatingTexts = [];
  state.shake = 0;
  state.dragging = null;
  state.gameRunning = true;
  state.levelStartTime = performance.now();

  hideAllScreens();
  setDisplay('gameHud', 'flex');
  setDisplay('wrap', 'flex');
  setDisplay('hand', 'flex');

  setLevelLabel(lvl.id);
  updateHUD();
  resizeCanvas();
  refillHand(true);

  if (lvl.tutorial) showTutorial(lvl.tutorial);
}

function spawnEnemy(spec: EnemySpec): void {
  const margin = 40;
  const x = margin + Math.random() * (view.W - 2 * margin);
  state.enemies.push({
    id: state.nextEnemyId++,
    x,
    y: -30,
    value: spec.value,
    originalValue: spec.value,
    speed: spec.speed * 60, // px/s aproximado (rows ~60px)
    mascot: mascotFor(spec.value),
    flashTime: 0,
    dying: false,
    deathT: 0,
  });
}

function maybeSpawnEnemies(elapsed: number): void {
  const lvl = state.currentLevel;
  if (!lvl) return;
  while (state.enemiesSpawned < lvl.enemies.length) {
    const next = lvl.enemies[state.enemiesSpawned]!;
    if (elapsed >= next.delay) {
      spawnEnemy(next);
      state.enemiesSpawned++;
    } else break;
  }
}

function computeStars(): number {
  const lvl = state.currentLevel;
  if (!lvl) return 0;
  const livesPct = state.lives / lvl.lives;
  if (livesPct >= 1) return 3;
  if (livesPct >= 0.5) return 2;
  return 1;
}

function winLevel(): void {
  state.gameRunning = false;
  flashMsg('VITÓRIA!', '#43d177');
  setTimeout(() => {
    const lvl = state.currentLevel!;
    const stars = computeStars();
    const prev = state.progress[lvl.id] ?? { stars: 0, score: 0 };
    state.progress[lvl.id] = {
      stars: Math.max(prev.stars, stars),
      score: Math.max(prev.score, state.score),
    };
    saveProgress(state.progress);
    setDisplay('gameHud', 'none');
    setDisplay('wrap', 'none');
    setDisplay('hand', 'none');
    showWinScreen(lvl, stars);
  }, 1200);
}

function loseLevel(): void {
  state.gameRunning = false;
  flashMsg('💔', '#e63946');
  setTimeout(() => {
    setDisplay('gameHud', 'none');
    setDisplay('wrap', 'none');
    setDisplay('hand', 'none');
    showLoseScreen();
  }, 1000);
}

let lastFrame = performance.now();

export function gameLoop(now: number): void {
  const dt = Math.min((now - lastFrame) / 1000, 0.05);
  lastFrame = now;

  if (state.gameRunning && state.currentLevel) {
    const elapsed = (now - state.levelStartTime) / 1000;
    maybeSpawnEnemies(elapsed);

    const lineY = defenseLineY();
    for (let i = state.enemies.length - 1; i >= 0; i--) {
      const e = state.enemies[i]!;
      if (e.flashTime > 0) e.flashTime -= dt;

      if (e.dying) {
        e.deathT += dt * 2.5;
        if (e.deathT >= 1) state.enemies.splice(i, 1);
        continue;
      }

      e.y += e.speed * dt;
      if (e.y >= lineY) {
        state.enemies.splice(i, 1);
        state.lives--;
        updateHUD();
        state.shake = 14;
        vibrate([40, 40, 80]);
        flashMsg('OPA!', '#e63946');
        if (state.lives <= 0) {
          loseLevel();
          break;
        }
      }
    }

    updateParticles(dt);
    if (state.shake > 0) state.shake = Math.max(0, state.shake - dt * 30);

    if (
      state.gameRunning &&
      state.enemiesSpawned >= state.currentLevel.enemies.length &&
      state.enemies.length === 0
    ) {
      winLevel();
    }
  }

  draw();
  requestAnimationFrame(gameLoop);
}

export function exitToMenu(): void {
  state.gameRunning = false;
  setDisplay('gameHud', 'none');
  setDisplay('wrap', 'none');
  setDisplay('hand', 'none');
  hideAllScreens();
  byId('menuScreen').classList.add('show');
}
