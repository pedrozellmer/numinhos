// Setup do canvas + lógica de resize sensível a DPR (retina).

import { byId } from './dom';

export const canvas = byId<HTMLCanvasElement>('game');
export const ctx = canvas.getContext('2d')!;

const DPR_CAP = 2;

export const view = {
  W: 0,
  H: 0,
  dpr: Math.min(window.devicePixelRatio || 1, DPR_CAP),
};

export function resizeCanvas(): void {
  const wrap = byId('wrap');
  const wrapW = wrap.clientWidth - 24;
  const wrapH = wrap.clientHeight;
  view.W = Math.min(wrapW, 420);
  view.H = wrapH;
  canvas.width = view.W * view.dpr;
  canvas.height = view.H * view.dpr;
  canvas.style.width = `${view.W}px`;
  canvas.style.height = `${view.H}px`;
  ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
}

// Linha de defesa — y onde os inimigos são considerados "passaram".
export function defenseLineY(): number {
  return view.H - 50;
}
