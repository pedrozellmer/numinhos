// UI: telas (mode select, menu, win, lose), navegação, flash, tutorial, HUD, drag.
// Concentra toda manipulação de DOM aqui — engine/render não tocam o DOM.

import { state, HAND_SIZE, getLevels, setLevels } from './state.js';
import { MODES, MODE_ORDER } from './levels.js';
import { applyOp, pickSmartCard, showInvalidFeedback } from './engine.js';
import { getDims, getCanvas, resize } from './render.js';
import { soundMenuClick, soundWinLevel, soundLoseLevel, initAudio } from './audio.js';

// =========== PROGRESS ===========
export function loadProgress() {
  try {
    const raw = JSON.parse(localStorage.getItem('numinhos_progress_v2') || 'null');
    if (raw && typeof raw === 'object') return raw;
    const old = JSON.parse(localStorage.getItem('numinhos_progress') || 'null');
    if (old && typeof old === 'object') return { sub: old };
  } catch {}
  return {};
}
function saveProgress() {
  localStorage.setItem('numinhos_progress_v2', JSON.stringify(state.progress));
}
export function recordProgress(modeId, levelId, stars, score) {
  if (!state.progress[modeId]) state.progress[modeId] = {};
  const prev = state.progress[modeId][levelId] || { stars: 0, score: 0 };
  state.progress[modeId][levelId] = {
    stars: Math.max(prev.stars, stars),
    score: Math.max(prev.score, score),
  };
  saveProgress();
}

// =========== MODE SELECT ===========
export function renderModeSelect() {
  const grid = document.getElementById('modeGrid');
  grid.innerHTML = '';
  MODE_ORDER.forEach(modeId => {
    const mode = MODES[modeId];
    const modeProgress = state.progress[modeId] || {};
    const totalStars = Object.values(modeProgress).reduce((s, p) => s + (p.stars || 0), 0);
    const maxStars = mode.levels.length * 3;
    const btn = document.createElement('button');
    btn.className = 'mode-btn ' + modeId;
    if (modeId === 'mixed') {
      btn.innerHTML = `
        <div class="mode-mentor">${mode.mentor.svg}</div>
        <div class="mode-text">
          <div class="mode-icon">${mode.icon} ${mode.label}</div>
          <div class="mode-sub">${mode.sub}</div>
        </div>
        <div class="mode-progress">${totalStars}/${maxStars}⭐</div>
      `;
    } else {
      btn.innerHTML = `
        <div class="mode-mentor">${mode.mentor.svg}</div>
        <div class="mode-icon">${mode.icon}</div>
        <div class="mode-label">${mode.label} · ${mode.mentor.name}</div>
        <div class="mode-sub">${mode.sub}</div>
        <div class="mode-progress">${totalStars}/${maxStars}⭐</div>
      `;
    }
    btn.onclick = () => { soundMenuClick(); enterMode(modeId); };
    grid.appendChild(btn);
  });
}

function enterMode(modeId) {
  state.currentMode = modeId;
  setLevels(MODES[modeId].levels);
  const mode = MODES[modeId];
  document.getElementById('menuTitle').textContent = `${mode.icon} ${mode.label}`;
  document.getElementById('menuSub').textContent = `${mode.mentor.name} (${mode.mentor.species}) — ${mode.sub}`;
  renderMenu();
  hideAllScreens();
  document.getElementById('menuScreen').classList.add('show');
}

// =========== MENU DE FASES ===========
export function renderMenu() {
  const grid = document.getElementById('levelGrid');
  grid.innerHTML = '';
  const LEVELS = getLevels();
  const modeProgress = state.progress[state.currentMode] || {};
  LEVELS.forEach((lvl, i) => {
    const btn = document.createElement('button');
    const prevId = i === 0 ? null : LEVELS[i-1].id;
    const isUnlocked = i === 0 || (modeProgress[prevId] && modeProgress[prevId].stars > 0);
    const completed = modeProgress[lvl.id];
    btn.className = 'level-btn' + (isUnlocked ? '' : ' locked') + (completed ? ' completed' : '');
    const diffEmojis = ['🟢','🟡','🟠','🔴'];
    if (isUnlocked) {
      btn.innerHTML = `
        <span class="difficulty-badge">${diffEmojis[lvl.diff]}</span>
        <div>${lvl.id}</div>
        <div class="stars">${renderStarsHtml(completed ? completed.stars : 0)}</div>
      `;
      btn.onclick = () => { soundMenuClick(); startLevel(lvl); };
    } else {
      btn.innerHTML = `<span class="lock-icon">🔒</span>`;
    }
    grid.appendChild(btn);
  });
}

export function renderStarsHtml(n) {
  return [1,2,3].map(i => i <= n ? '⭐' : '<span style="opacity:0.2">⭐</span>').join('');
}

// =========== LEVEL START ===========
export function startLevel(lvl) {
  state.currentLevel = lvl;
  state.enemies = [];
  state.cards = [];
  state.cardSlots = HAND_SIZE;
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
  state.lossOfLevel = false;

  hideAllScreens();
  document.getElementById('gameHud').style.display = 'flex';
  document.getElementById('wrap').style.display = 'flex';
  document.getElementById('hand').style.display = 'flex';

  document.getElementById('levelLabel').textContent = lvl.id;
  updateHUD();
  resize();

  refillHand(true);
  if (lvl.tutorial) showTutorial(lvl.tutorial);
}

export function updateHUD() {
  document.getElementById('livesLabel').textContent = state.lives;
  document.getElementById('scoreLabel').textContent = state.score;
}

function showTutorial(text) {
  const el = document.createElement('div');
  el.className = 'tutorial';
  el.textContent = text;
  el.style.top = '40%'; el.style.left = '50%';
  el.style.transform = 'translate(-50%, -50%)';
  document.body.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity 0.4s'; el.style.opacity = '0';
    setTimeout(() => el.remove(), 400);
  }, 3500);
}

// =========== HAND ===========
export function refillHand(initial = false) {
  const lvl = state.currentLevel;
  const handDiv = document.getElementById('hand');
  if (initial) handDiv.innerHTML = '';
  while (state.cards.length < state.cardSlots) {
    const proto = pickSmartCard(lvl);
    const card = { id: state.nextCardId++, op: proto.op, val: proto.val };
    state.cards.push(card);
    addCardToDOM(card);
  }
}

function addCardToDOM(card) {
  const el = document.createElement('div');
  el.className = 'card ' + cardClass(card.op);
  el.dataset.id = card.id;
  el.innerHTML = `<div class="card-op">${card.op}</div><div class="card-val">${card.val}</div>`;
  bindCardDrag(el, card);
  document.getElementById('hand').appendChild(el);
  el.style.transform = 'scale(0.5) translateY(20px)';
  el.style.opacity = '0';
  requestAnimationFrame(() => {
    el.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s';
    el.style.transform = 'scale(1) translateY(0)';
    el.style.opacity = '1';
    setTimeout(() => { el.style.transition = 'transform 0.1s'; }, 300);
  });
}

function cardClass(op) {
  return op === '+' ? 'add' : op === '-' ? 'sub' : op === '×' ? 'mul' : 'div';
}

function removeCard(card) {
  state.cards = state.cards.filter(c => c.id !== card.id);
  const el = document.querySelector(`.card[data-id="${card.id}"]`);
  if (el) el.remove();
}

// =========== DRAG ===========
function bindCardDrag(el, card) {
  let active = false;
  const onStart = (clientX, clientY) => {
    if (!state.gameRunning) return;
    active = true;
    el.classList.add('dragging');
    const preview = document.getElementById('dragPreview');
    preview.innerHTML = el.innerHTML;
    preview.className = '';
    preview.style.background = getComputedStyle(el).background;
    preview.style.borderRadius = '14px';
    preview.style.border = `2px solid ${getComputedStyle(el).borderTopColor}`;
    preview.style.color = getComputedStyle(el).color;
    preview.style.fontFamily = "'Baloo 2', sans-serif";
    preview.style.fontWeight = '800';
    preview.style.display = 'flex';
    preview.style.flexDirection = 'column';
    preview.style.alignItems = 'center';
    preview.style.justifyContent = 'center';
    preview.style.left = clientX + 'px';
    preview.style.top = clientY + 'px';
    const op = preview.querySelector('.card-op');
    const val = preview.querySelector('.card-val');
    if (op) op.style.fontSize = '24px';
    if (val) val.style.fontSize = '20px';
    state.dragging = { card, x: clientX, y: clientY };
  };
  const onMove = (clientX, clientY) => {
    if (!active) return;
    const preview = document.getElementById('dragPreview');
    preview.style.left = clientX + 'px';
    preview.style.top = clientY + 'px';
    state.dragging.x = clientX; state.dragging.y = clientY;
  };
  const onEnd = (clientX, clientY) => {
    if (!active) return;
    active = false;
    el.classList.remove('dragging');
    document.getElementById('dragPreview').style.display = 'none';
    state.dragging = null;
    tryApplyCard(card, clientX, clientY);
  };
  el.addEventListener('touchstart', (e) => { e.preventDefault(); const t=e.touches[0]; onStart(t.clientX,t.clientY); }, { passive: false });
  document.addEventListener('touchmove', (e) => { if (!active) return; e.preventDefault(); const t=e.touches[0]; onMove(t.clientX,t.clientY); }, { passive: false });
  document.addEventListener('touchend', (e) => { if (!active) return; e.preventDefault(); const t=e.changedTouches[0]; onEnd(t.clientX,t.clientY); }, { passive: false });
  el.addEventListener('mousedown', (e) => onStart(e.clientX, e.clientY));
  document.addEventListener('mousemove', (e) => { if (active) onMove(e.clientX, e.clientY); });
  document.addEventListener('mouseup',   (e) => { if (active) onEnd(e.clientX, e.clientY); });
}

function tryApplyCard(card, clientX, clientY) {
  const canvas = getCanvas();
  const { W, H } = getDims();
  const rect = canvas.getBoundingClientRect();
  const cx = clientX - rect.left;
  const cy = clientY - rect.top;
  if (cx < 0 || cx > W || cy < 0 || cy > H) return;
  let target = null;
  let bestDist = 50;
  for (const e of state.enemies) {
    if (e.dying) continue;
    const dx = e.x - cx, dy = e.y - cy;
    const d = Math.sqrt(dx*dx + dy*dy);
    if (d < bestDist) { bestDist = d; target = e; }
  }
  if (!target) return;
  const result = applyOp(card, target);
  if (result === 'ok') {
    updateHUD();
    removeCard(card);
    refillHand();
  } else {
    showInvalidFeedback(target, result);
  }
}

// =========== FLASH MSG ===========
export function flashMsg(text, color = '#ff6b6b') {
  const el = document.getElementById('flashMsg');
  el.textContent = text;
  el.style.color = color;
  el.classList.remove('show');
  void el.offsetWidth;
  el.classList.add('show');
}

// =========== WIN / LOSE ===========
export function winLevel() {
  state.gameRunning = false;
  flashMsg('VITÓRIA!', '#43d177');
  soundWinLevel();
  setTimeout(() => {
    const stars = computeStars();
    const lvl = state.currentLevel;
    recordProgress(state.currentMode, lvl.id, stars, state.score);
    document.getElementById('winSub').textContent = lvl.title;
    document.getElementById('winStars').innerHTML = renderStarsHtml(stars);
    document.getElementById('winScore').textContent = state.score;
    document.getElementById('winLives').textContent = state.lives;
    hideGame();
    document.getElementById('winScreen').classList.add('show');
  }, 1200);
}

// Critério de estrelas — simples e justo:
//   3⭐ = não perdeu nenhuma vida (perfeito)
//   2⭐ = perdeu 1 vida (boa)
//   1⭐ = perdeu 2+ vidas (ok, ainda passou)
function computeStars() {
  const lvl = state.currentLevel;
  const livesLost = lvl.lives - state.lives;
  if (livesLost === 0) return 3;
  if (livesLost === 1) return 2;
  return 1;
}

export function loseLevel() {
  state.gameRunning = false;
  state.lossOfLevel = true;
  flashMsg('💔', '#e63946');
  soundLoseLevel();
  setTimeout(() => {
    hideGame();
    document.getElementById('loseScreen').classList.add('show');
  }, 1000);
}

// =========== NAVIGATION ===========
function hideAllScreens() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('show'));
}
function hideGame() {
  document.getElementById('gameHud').style.display = 'none';
  document.getElementById('wrap').style.display = 'none';
  document.getElementById('hand').style.display = 'none';
}
export function goToModeSelect() {
  state.gameRunning = false;
  state.currentMode = null;
  state.currentLevel = null;
  hideGame();
  hideAllScreens();
  renderModeSelect();
  document.getElementById('modeSelectScreen').classList.add('show');
}
export function goToLevelMenu() {
  state.gameRunning = false;
  hideGame();
  hideAllScreens();
  renderMenu();
  document.getElementById('menuScreen').classList.add('show');
}

// =========== EVENT BINDINGS ===========
export function bindNavigation() {
  document.getElementById('backBtn').onclick = () => { soundMenuClick(); goToLevelMenu(); };
  document.getElementById('menuBackBtn').onclick = () => { soundMenuClick(); goToModeSelect(); };
  document.getElementById('winNextBtn').onclick = () => {
    soundMenuClick();
    const LEVELS = getLevels();
    const idx = LEVELS.findIndex(l => l.id === state.currentLevel.id);
    document.getElementById('winScreen').classList.remove('show');
    if (idx < LEVELS.length - 1) startLevel(LEVELS[idx + 1]);
    else goToModeSelect();
  };
  document.getElementById('winMenuBtn').onclick = () => {
    soundMenuClick();
    document.getElementById('winScreen').classList.remove('show');
    goToLevelMenu();
  };
  document.getElementById('winDoubleBtn').onclick = () => {
    state.score *= 2;
    document.getElementById('winScore').textContent = state.score;
    const lvl = state.currentLevel;
    const cur = state.progress[state.currentMode] && state.progress[state.currentMode][lvl.id];
    if (cur) { cur.score = Math.max(cur.score, state.score); saveProgress(); }
    flashMsg('×2!', '#43d177');
  };
  document.getElementById('loseRetryBtn').onclick = () => {
    soundMenuClick();
    document.getElementById('loseScreen').classList.remove('show');
    startLevel(state.currentLevel);
  };
  document.getElementById('loseMenuBtn').onclick = () => {
    soundMenuClick();
    document.getElementById('loseScreen').classList.remove('show');
    goToLevelMenu();
  };
  document.getElementById('loseReviveBtn').onclick = () => {
    document.getElementById('loseScreen').classList.remove('show');
    state.lives = 2;
    state.gameRunning = true;
    document.getElementById('gameHud').style.display = 'flex';
    document.getElementById('wrap').style.display = 'flex';
    document.getElementById('hand').style.display = 'flex';
    updateHUD();
  };

  // Inicializar áudio na primeira interação (requisito de browsers)
  const startAudio = () => { initAudio(); document.removeEventListener('click', startAudio); document.removeEventListener('touchstart', startAudio); };
  document.addEventListener('click', startAudio);
  document.addEventListener('touchstart', startAudio);
}

// =========== SPLASH MASCOTS (4 mentores na splash) ===========
export function renderSplashMascots() {
  const splash = document.querySelector('.splash-mascots');
  if (!splash) return;
  splash.innerHTML = `
    <div title="${MODES.add.mentor.name} (${MODES.add.mentor.species})">${MODES.add.mentor.svg}</div>
    <div title="${MODES.sub.mentor.name} (${MODES.sub.mentor.species})">${MODES.sub.mentor.svg}</div>
    <div title="${MODES.mul.mentor.name} (${MODES.mul.mentor.species})">${MODES.mul.mentor.svg}</div>
    <div title="${MODES.div.mentor.name} (${MODES.div.mentor.species})">${MODES.div.mentor.svg}</div>
  `;
}
