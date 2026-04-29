// Mão de cartas: cria/refilla, cria DOM das cartas, conecta drag.

import type { Card } from './types';
import { state } from './state';
import { byId } from './dom';
import { cssClassForOp } from './operations';
import { bindCardDrag } from './input';

export function refillHand(initial = false): void {
  const lvl = state.currentLevel;
  if (!lvl) return;
  const handDiv = byId('hand');
  if (initial) handDiv.innerHTML = '';
  while (state.cards.length < state.cardSlots) {
    const proto = lvl.handPool[Math.floor(Math.random() * lvl.handPool.length)]!;
    const card: Card = { id: state.nextCardId++, op: proto.op, val: proto.val };
    state.cards.push(card);
    addCardToDOM(card);
  }
}

export function removeCard(card: Card): void {
  state.cards = state.cards.filter((c) => c.id !== card.id);
  const el = document.querySelector<HTMLElement>(`.card[data-id="${card.id}"]`);
  if (el) el.remove();
}

function addCardToDOM(card: Card): void {
  const el = document.createElement('div');
  el.className = `card ${cssClassForOp(card.op)}`;
  el.dataset.id = String(card.id);
  el.innerHTML = `<div class="card-op">${card.op}</div><div class="card-val">${card.val}</div>`;
  bindCardDrag(el, card);
  byId('hand').appendChild(el);

  // Animação de entrada
  el.style.transform = 'scale(0.5) translateY(20px)';
  el.style.opacity = '0';
  requestAnimationFrame(() => {
    el.style.transition =
      'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s';
    el.style.transform = 'scale(1) translateY(0)';
    el.style.opacity = '1';
    setTimeout(() => {
      el.style.transition = 'transform 0.1s';
    }, 300);
  });
}
