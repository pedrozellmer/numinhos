// Singleton de estado do jogo. Importado por engine, render, ui, main.

export const state = {
  progress: {},               // { [modeId]: { [levelId]: {stars, score} } }
  currentMode: null,          // 'add' | 'sub' | 'mul' | 'div' | 'mixed'
  currentLevel: null,
  enemies: [],
  cards: [],
  cardSlots: 4,
  score: 0,
  lives: 3,
  lossOfLevel: false,
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

// Configuração global — calibrado pra jogo desafiador mas justo pra criança.
// Velocidade 5.0: fase 1 ~13s até a linha, boss ~6s. Ritmo bem mais dinâmico.
export const SPEED_MULTIPLIER = 5.0;

// Tamanho da mão de cartas em qualquer momento.
export const HAND_SIZE = 4;

// LEVELS aponta pro array do modo atual. Trocado em enterMode().
export let LEVELS = [];
export function setLevels(arr) { LEVELS = arr; }
export function getLevels() { return LEVELS; }
