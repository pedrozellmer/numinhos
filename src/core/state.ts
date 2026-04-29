// Estado global do jogo. Módulo único pra que todos os outros leiam/escrevam
// na mesma estrutura. Em produção isso vira store por perfil de criança.

import type { Card, Enemy, FloatingText, Level, Particle, Progress, DragState } from './types';
import { loadProgress } from './persistence';
import type { BnccProgress } from './bncc';
import { loadBnccProgress } from './bncc';

export interface GameState {
  progress: Progress;
  bnccProgress: BnccProgress;
  currentLevel: Level | null;
  enemies: Enemy[];
  cards: Card[];
  cardSlots: number;
  score: number;
  lives: number;
  enemiesSpawned: number;
  enemiesKilled: number;
  levelStartTime: number;
  gameRunning: boolean;
  particles: Particle[];
  floatingTexts: FloatingText[];
  shake: number;
  dragging: DragState | null;
  nextCardId: number;
  nextEnemyId: number;
}

export const state: GameState = {
  progress: loadProgress(),
  bnccProgress: loadBnccProgress(),
  currentLevel: null,
  enemies: [],
  cards: [],
  cardSlots: 4,
  score: 0,
  lives: 3,
  enemiesSpawned: 0,
  enemiesKilled: 0,
  levelStartTime: 0,
  gameRunning: false,
  particles: [],
  floatingTexts: [],
  shake: 0,
  dragging: null,
  nextCardId: 1,
  nextEnemyId: 1,
};
