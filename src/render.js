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
  // Olhinhos — colados no topo pra liberar espaço pro número grande no centro
  const eyeR = radius * 0.13;
  const eyeY = -radius * 0.35;
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(-radius * 0.28, eyeY, eyeR, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc( radius * 0.28, eyeY, eyeR, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#2d1f3d';
  ctx.beginPath(); ctx.arc(-radius * 0.28, eyeY + 1, eyeR * 0.55, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc( radius * 0.28, eyeY + 1, eyeR * 0.55, 0, Math.PI * 2); ctx.fill();
  // Flash
  if (flash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${flash * 0.6})`;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  // Número (valor atual) — GRANDE e CENTRADO, ocupa o miolo do círculo.
  // Sem sobreposição com a banda amarela porque ela fica pendurada FORA.
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.lineWidth = Math.max(3, radius * 0.06);
  const valStr = String(value);
  const fontSize = valStr.length > 2 ? radius * 0.55 : radius * 0.72;
  ctx.font = `800 ${fontSize}px 'Baloo 2', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const yOffset = radius * 0.12;
  ctx.strokeText(valStr, 0, yOffset);
  ctx.fillText(valStr, 0, yOffset);

  // ALVO — "selo" amarelo PENDURADO na borda inferior, parcialmente FORA
  // do círculo. Separação clara do número branco, contraste alto, fácil de ler.
  const targetStr = '→ ' + target;
  const tFontSize = radius * 0.48;
  ctx.font = `800 ${tFontSize}px 'Baloo 2', sans-serif`;
  const bandH = tFontSize * 1.45;
  const bandY = radius * 1.02;   // pendurado na base do círculo
  const bandW = Math.max(ctx.measureText(targetStr).width + 20, radius * 1.15);
  ctx.fillStyle = '#ffd84d';
  ctx.strokeStyle = '#a87800';
  ctx.lineWidth = 2;
  ctx.shadowColor = 'rgba(0,0,0,0.18)';
  ctx.shadowBlur = 5;
  ctx.shadowOffsetY = 2;
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(-bandW/2, bandY - bandH*0.5, bandW, bandH, 8);
  } else {
    ctx.rect(-bandW/2, bandY - bandH*0.5, bandW, bandH);
  }
  ctx.fill();
  ctx.stroke();
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#3d2700';
  ctx.fillText(targetStr, 0, bandY + 1);
  ctx.restore();
}
