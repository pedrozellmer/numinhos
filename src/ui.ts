// UI fora da arena: menu/mapa, tutorial, modais de vitória/derrota.

import { state } from './state';
import { byId, showScreen, hideAllScreens } from './dom';
import { LEVELS } from './content/levels';
import type { Level } from './types';

const DIFF_EMOJIS = ['🟢', '🟡', '🟠', '🔴'];

export function renderStarsHtml(n: number): string {
  return [1, 2, 3]
    .map((i) => (i <= n ? '⭐' : '<span style="opacity:0.2">⭐</span>'))
    .join('');
}

export function renderMenu(onStart: (lvl: Level) => void): void {
  const grid = byId('levelGrid');
  grid.innerHTML = '';

  LEVELS.forEach((lvl, i) => {
    const btn = document.createElement('button');
    const prevId = i === 0 ? null : LEVELS[i - 1]!.id;
    const isUnlocked = i === 0 || (prevId !== null && (state.progress[prevId]?.stars ?? 0) > 0);
    const completed = state.progress[lvl.id];

    btn.className =
      'level-btn' + (isUnlocked ? '' : ' locked') + (completed ? ' completed' : '');

    if (isUnlocked) {
      btn.innerHTML = `
        <span class="difficulty-badge">${DIFF_EMOJIS[lvl.diff]}</span>
        <div>${lvl.id}</div>
        <div class="stars">${renderStarsHtml(completed ? completed.stars : 0)}</div>
      `;
      btn.onclick = () => onStart(lvl);
    } else {
      btn.innerHTML = `<span class="lock-icon">🔒</span>`;
    }
    grid.appendChild(btn);
  });
}

export function showTutorial(text: string): void {
  const el = document.createElement('div');
  el.className = 'tutorial';
  el.textContent = text;
  el.style.top = '50%';
  el.style.left = '50%';
  el.style.transform = 'translate(-50%, -50%)';
  document.body.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity 0.4s';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 400);
  }, 3500);
}

export function showWinScreen(level: Level, stars: number): void {
  byId('winSub').textContent = level.title;
  byId('winStars').innerHTML = renderStarsHtml(stars);
  byId('winScore').textContent = String(state.score);
  byId('winLives').textContent = String(state.lives);
  showScreen('winScreen');
}

export function showLoseScreen(): void {
  showScreen('loseScreen');
}

export function backToMenu(onStart: (lvl: Level) => void): void {
  hideAllScreens();
  renderMenu(onStart);
  showScreen('menuScreen');
}
