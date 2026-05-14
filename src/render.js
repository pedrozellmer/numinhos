// Renderização do canvas: linha de defesa, Numinhos, partículas, textos.

import { state } from './state.js';
import { colorFor } from './levels.js';

let canvas, ctx, W = 0, H = 0;
const dpr = Math.min(window.devicePixelRatio || 1, 2);

export function initCanvas() {
  canvas = document.getElementById('game');
  ctx = canvas.getContext('2d');
  return canvas;
}

export function resize() {
  const wrap = document.getElementById('wrap');
  const wrapW = wrap.clientWidth - 24;
  const wrapH = wrap.clientHeight;
  W = Math.min(wrapW, 420);
  H = wrapH;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

export function getDims() { return { W, H }; }
export function getCanvas() { return canvas; }

export function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.save();
  if (state.shake > 0) {
    ctx.translate((Math.random() - 0.5) * state.shake, (Math.random() - 0.5) * state.shake);
  }

  // Linha de defesa
  const lineY = H - 50;
  ctx.strokeStyle = 'rgba(255, 100, 100, 0.4)';
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(10, lineY);
  ctx.lineTo(W - 10, lineY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.font = '24px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🏰', W / 2, lineY + 22);

  // Numinhos
  for (const e of state.enemies) drawEnemy(e);

  // Partículas
  for (const p of state.particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.4);
    ctx.restore();
  }

  // Texts
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
  ctx.restore();
}

function drawEnemy(e) {
  const radius = 30 + Math.min(8, Math.log2(Math.abs(e.value) + 1) * 2);
  const flash = e.flashTime > 0 ? Math.sin(e.flashTime * 30) * 0.5 + 0.5 : 0;

  if (e.dying) {
    const t = e.deathT;
    const scale = 1 + t * 0.5;
    ctx.save();
    ctx.globalAlpha = 1 - t;
    ctx.translate(e.x, e.y);
    ctx.scale(scale, scale);
    drawEnemyBody(0, 0, radius, e.value, flash, e.target);
    ctx.restore();
    return;
  }
  drawEnemyBody(e.x, e.y, radius, e.value, flash, e.target);
}

function drawEnemyBody(x, y, radius, value, flash, target) {
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
  // Highlight
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
  // Olhinhos do Numinho — dão personalidade
  const eyeR = radius * 0.14;
  const eyeY = -radius * 0.18;
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(-radius * 0.30, eyeY, eyeR, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc( radius * 0.30, eyeY, eyeR, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#2d1f3d';
  ctx.beginPath(); ctx.arc(-radius * 0.30, eyeY + 1, eyeR * 0.55, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc( radius * 0.30, eyeY + 1, eyeR * 0.55, 0, Math.PI * 2); ctx.fill();
  // Flash
  if (flash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${flash * 0.6})`;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  // Número (valor atual do Numinho)
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 3;
  const valStr = String(value);
  const fontSize = valStr.length > 2 ? radius * 0.50 : radius * 0.66;
  ctx.font = `800 ${fontSize}px 'Baloo 2', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const yOffset = radius * 0.08;
  ctx.strokeText(valStr, 0, yOffset);
  ctx.fillText(valStr, 0, yOffset);

  // ALVO sempre visível — incluindo target=0 (modo Subtração).
  // Banda amarela com "→ N" embaixo. Pedagogicamente essencial — a usuária
  // não deve nunca ficar sem saber pra onde está indo o Numinho.
  const targetStr = '→ ' + target;
  const tFontSize = radius * 0.42;
  ctx.font = `800 ${tFontSize}px 'Baloo 2', sans-serif`;
  const bandH = tFontSize * 1.5;
  const bandY = radius * 0.55;
  const bandW = Math.max(ctx.measureText(targetStr).width + 14, radius * 1.1);
  ctx.fillStyle = '#ffd84d';
  ctx.strokeStyle = '#c8941a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(-bandW/2, bandY - bandH*0.5, bandW, bandH, 7);
  } else {
    ctx.rect(-bandW/2, bandY - bandH*0.5, bandW, bandH);
  }
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#5a3d00';
  ctx.fillText(targetStr, 0, bandY + 1);
  ctx.restore();
}
