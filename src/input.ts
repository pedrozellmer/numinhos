// Drag and drop das cartas. Correção do bug original: os listeners de
// touchmove/touchend ficavam attachados ao `document` por carta — vazavam
// memória ao longo da partida. Agora há listeners globais únicos e cada
// carta só registra os handlers de início (touchstart/mousedown).

import type { Card } from './core/types';
import { state } from './core/state';
import { byId } from './dom';
import { applyCard, operationLabel, colorForOp } from './core/operations';
import { findEnemyNear, pointToCanvas } from './render';
import { spawnConfetti, spawnFloatingText, vibrate } from './effects';
import { refillHand, removeCard } from './hand';
import { updateHUD } from './hud';
import type { Enemy } from './core/types';

const HIT_RADIUS = 50;

export function bindCardDrag(el: HTMLElement, card: Card): void {
  const startTouch = (e: TouchEvent): void => {
    if (!state.gameRunning) return;
    e.preventDefault();
    const t = e.touches[0]!;
    onStart(el, card, t.clientX, t.clientY);
  };
  const startMouse = (e: MouseEvent): void => {
    if (!state.gameRunning) return;
    onStart(el, card, e.clientX, e.clientY);
  };

  el.addEventListener('touchstart', startTouch, { passive: false });
  el.addEventListener('mousedown', startMouse);
}

function onStart(el: HTMLElement, card: Card, x: number, y: number): void {
  el.classList.add('dragging');

  const preview = byId('dragPreview');
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
  preview.style.left = `${x}px`;
  preview.style.top = `${y}px`;

  const op = preview.querySelector<HTMLElement>('.card-op');
  const val = preview.querySelector<HTMLElement>('.card-val');
  if (op) op.style.fontSize = '24px';
  if (val) val.style.fontSize = '20px';

  state.dragging = { card, cardEl: el, x, y };
}

function onMove(x: number, y: number): void {
  if (!state.dragging) return;
  const preview = byId('dragPreview');
  preview.style.left = `${x}px`;
  preview.style.top = `${y}px`;
  state.dragging.x = x;
  state.dragging.y = y;
}

function onEnd(x: number, y: number): void {
  const drag = state.dragging;
  if (!drag) return;
  drag.cardEl.classList.remove('dragging');
  byId('dragPreview').style.display = 'none';
  state.dragging = null;
  tryApplyCard(drag.card, x, y);
}

function tryApplyCard(card: Card, clientX: number, clientY: number): void {
  const { x, y } = pointToCanvas(clientX, clientY);
  const target = findEnemyNear(x, y, HIT_RADIUS);
  if (!target) return;
  performCardOnEnemy(card, target);
  removeCard(card);
  refillHand();
}

function performCardOnEnemy(card: Card, enemy: Enemy): void {
  const newValue = applyCard(enemy.value, card);
  enemy.value = newValue;
  enemy.flashTime = 0.4;

  spawnFloatingText(enemy.x, enemy.y, operationLabel(card), colorForOp(card.op));
  vibrate(20);

  if (newValue === 0) destroyEnemy(enemy);
}

function destroyEnemy(enemy: Enemy): void {
  enemy.dying = true;
  state.enemiesKilled++;
  state.score += 100 + Math.floor(state.lives * 25);
  updateHUD();
  spawnConfetti(enemy.x, enemy.y);
  state.shake = Math.min(state.shake + 8, 16);
  vibrate(40);
}

// Listeners globais únicos — não vazam memória.
export function installGlobalDragListeners(): void {
  document.addEventListener(
    'touchmove',
    (e) => {
      if (!state.dragging) return;
      e.preventDefault();
      const t = e.touches[0]!;
      onMove(t.clientX, t.clientY);
    },
    { passive: false }
  );

  document.addEventListener(
    'touchend',
    (e) => {
      if (!state.dragging) return;
      e.preventDefault();
      const t = e.changedTouches[0]!;
      onEnd(t.clientX, t.clientY);
    },
    { passive: false }
  );

  document.addEventListener('mousemove', (e) => {
    if (state.dragging) onMove(e.clientX, e.clientY);
  });

  document.addEventListener('mouseup', (e) => {
    if (state.dragging) onEnd(e.clientX, e.clientY);
  });
}
