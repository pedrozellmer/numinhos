// Bootstrap do app. Mantém o ponto de entrada pequeno e legível;
// toda a lógica vive nos módulos importados aqui.

import './styles/globals.css';
import './styles/game.css';
import './styles/screens.css';

import { state } from './state';
import { byId, hideAllScreens, setDisplay } from './dom';
import { LEVELS } from './content/levels';
import { resizeCanvas } from './canvas';
import { installGlobalDragListeners } from './input';
import { renderMenu, backToMenu } from './ui';
import { startLevel, gameLoop, exitToMenu } from './game';
import { saveProgress } from './persistence';
import { flashMsg } from './effects';

function nextLevelOrMenu(): void {
  const cur = state.currentLevel;
  if (!cur) {
    backToMenu(startLevel);
    return;
  }
  const idx = LEVELS.findIndex((l) => l.id === cur.id);
  if (idx >= 0 && idx < LEVELS.length - 1) {
    byId('winScreen').classList.remove('show');
    startLevel(LEVELS[idx + 1]!);
  } else {
    byId('winScreen').classList.remove('show');
    backToMenu(startLevel);
  }
}

function bindMenuNavigation(): void {
  byId('backBtn').onclick = () => {
    exitToMenu();
    backToMenu(startLevel);
  };

  byId('winNextBtn').onclick = () => nextLevelOrMenu();
  byId('winMenuBtn').onclick = () => {
    byId('winScreen').classList.remove('show');
    backToMenu(startLevel);
  };
  byId('winDoubleBtn').onclick = () => {
    state.score *= 2;
    byId('winScore').textContent = String(state.score);
    const lvl = state.currentLevel;
    if (lvl) {
      const entry = state.progress[lvl.id];
      if (entry) {
        entry.score = Math.max(entry.score, state.score);
        saveProgress(state.progress);
      }
    }
    flashMsg('×2!', '#43d177');
  };

  byId('loseRetryBtn').onclick = () => {
    byId('loseScreen').classList.remove('show');
    if (state.currentLevel) startLevel(state.currentLevel);
  };
  byId('loseMenuBtn').onclick = () => {
    byId('loseScreen').classList.remove('show');
    backToMenu(startLevel);
  };
  byId('loseReviveBtn').onclick = () => {
    byId('loseScreen').classList.remove('show');
    state.lives = 2;
    state.gameRunning = true;
    setDisplay('gameHud', 'flex');
    setDisplay('wrap', 'flex');
    setDisplay('hand', 'flex');
  };
}

function init(): void {
  installGlobalDragListeners();
  bindMenuNavigation();

  window.addEventListener('resize', () => {
    if (state.gameRunning) resizeCanvas();
  });

  hideAllScreens();
  byId('menuScreen').classList.add('show');
  renderMenu(startLevel);

  requestAnimationFrame(gameLoop);
}

init();
