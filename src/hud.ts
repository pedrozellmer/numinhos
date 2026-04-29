// HUD (vidas, pontos, fase). Pequeno, isolado, importável de qualquer lugar
// sem criar dependência circular.

import { state } from './core/state';
import { byId } from './dom';

export function updateHUD(): void {
  byId('livesLabel').textContent = String(state.lives);
  byId('scoreLabel').textContent = String(state.score);
}

export function setLevelLabel(label: string | number): void {
  byId('levelLabel').textContent = String(label);
}
