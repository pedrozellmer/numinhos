// Partículas, textos flutuantes, shake e mensagens de flash.

import { state } from './state';
import { byId } from './dom';

const CONFETTI_COLORS = ['#ff6b6b', '#ffd166', '#43d177', '#6c8dff', '#9d4edd', '#ff8e3c'];

export function spawnConfetti(x: number, y: number): void {
  for (let i = 0; i < 24; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 4;
    state.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1,
      life: 1,
      decay: 0.015 + Math.random() * 0.015,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]!,
      size: 3 + Math.random() * 4,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.3,
    });
  }
}

export function spawnFloatingText(x: number, y: number, text: string, color: string): void {
  state.floatingTexts.push({ x, y: y - 20, vy: -1.5, life: 1, text, color });
}

export function updateParticles(dt: number): void {
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i]!;
    p.x += p.vx * dt * 60;
    p.y += p.vy * dt * 60;
    p.vy += 0.15 * dt * 60;
    p.life -= p.decay * dt * 60;
    p.rot += p.vrot;
    if (p.life <= 0) state.particles.splice(i, 1);
  }
  for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
    const f = state.floatingTexts[i]!;
    f.y += f.vy;
    f.life -= 0.02;
    if (f.life <= 0) state.floatingTexts.splice(i, 1);
  }
}

export function flashMsg(text: string, color = '#ff6b6b'): void {
  const el = byId('flashMsg');
  el.textContent = text;
  el.style.color = color;
  el.classList.remove('show');
  // Força reflow pra que a animação reinicie.
  void el.offsetWidth;
  el.classList.add('show');
}

export function vibrate(pattern: number | number[]): void {
  if (navigator.vibrate) navigator.vibrate(pattern);
}
