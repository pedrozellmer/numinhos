// Desenho do canvas: linha de defesa, inimigos, partículas, textos flutuantes.

import { canvas, ctx, view, defenseLineY } from './canvas';
import { state } from './core/state';
import { colorFor } from './content/mascots';
import type { Enemy } from './core/types';

export function draw(): void {
  ctx.clearRect(0, 0, view.W, view.H);
  ctx.save();

  if (state.shake > 0) {
    ctx.translate((Math.random() - 0.5) * state.shake, (Math.random() - 0.5) * state.shake);
  }

  drawDefenseLine();
  for (const e of state.enemies) drawEnemy(e);
  drawParticles();
  drawFloatingTexts();

  ctx.restore();
}

function drawDefenseLine(): void {
  const y = defenseLineY();
  ctx.strokeStyle = 'rgba(255, 100, 100, 0.4)';
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(10, y);
  ctx.lineTo(view.W - 10, y);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.font = '24px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🏰', view.W / 2, y + 22);
}

function drawEnemy(e: Enemy): void {
  const radius = 30 + Math.min(8, Math.log2(Math.abs(e.value) + 1) * 2);
  const flash = e.flashTime > 0 ? Math.sin(e.flashTime * 30) * 0.5 + 0.5 : 0;

  if (e.dying) {
    const t = e.deathT;
    const scale = 1 + t * 0.5;
    ctx.save();
    ctx.globalAlpha = 1 - t;
    ctx.translate(e.x, e.y);
    ctx.scale(scale, scale);
    drawEnemyBody(0, 0, radius, e.value, flash);
    ctx.restore();
    return;
  }
  drawEnemyBody(e.x, e.y, radius, e.value, flash);
}

function drawEnemyBody(x: number, y: number, radius: number, value: number, flash: number): void {
  const color = colorFor(value);
  ctx.save();
  ctx.translate(x, y);

  // Sombra
  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  ctx.beginPath();
  ctx.ellipse(0, radius + 6, radius * 0.6, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Corpo
  ctx.fillStyle = color;
  ctx.shadowColor = 'rgba(0,0,0,0.15)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // Highlight superior
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.ellipse(-radius * 0.3, -radius * 0.4, radius * 0.4, radius * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();

  // Borda
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Flash
  if (flash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${flash * 0.6})`;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Número
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 3;
  const fontSize = String(value).length > 2 ? radius * 0.8 : radius * 1.0;
  ctx.font = `800 ${fontSize}px 'Baloo 2', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeText(String(value), 0, 2);
  ctx.fillText(String(value), 0, 2);

  ctx.restore();
}

function drawParticles(): void {
  for (const p of state.particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.4);
    ctx.restore();
  }
}

function drawFloatingTexts(): void {
  for (const f of state.floatingTexts) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, f.life);
    ctx.font = "800 22px 'Baloo 2', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillStyle = f.color;
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 4;
    ctx.strokeText(f.text, f.x, f.y);
    ctx.fillText(f.text, f.x, f.y);
    ctx.restore();
  }
}

// Achar inimigo mais próximo de um ponto da arena (em coords do canvas).
export function findEnemyNear(cx: number, cy: number, radius: number): Enemy | null {
  if (cx < 0 || cx > view.W || cy < 0 || cy > view.H) return null;
  let target: Enemy | null = null;
  let bestDist = radius;
  for (const e of state.enemies) {
    if (e.dying) continue;
    const dx = e.x - cx;
    const dy = e.y - cy;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < bestDist) {
      bestDist = d;
      target = e;
    }
  }
  return target;
}

export function pointToCanvas(clientX: number, clientY: number): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  return { x: clientX - rect.left, y: clientY - rect.top };
}
