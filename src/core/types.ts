// Tipos compartilhados pelo jogo. Centralizados aqui pra que TypeScript
// possa avisar quando alguma fase ou carta for criada com formato errado.

export type Op = '+' | '-' | '×' | '÷';

export type Difficulty = 0 | 1 | 2 | 3;

export interface CardProto {
  op: Op;
  val: number;
}

export interface Card extends CardProto {
  id: number;
}

export interface EnemySpec {
  value: number;
  delay: number;
  speed: number;
}

export interface Level {
  id: number;
  diff: Difficulty;
  lives: number;
  title: string;
  goal: string;
  ops: Op[];
  handPool: CardProto[];
  enemies: EnemySpec[];
  tutorial?: string;
  // Habilidades BNCC exercitadas pela fase. Ver src/core/bncc.ts.
  bncc?: string[];
}

export interface Enemy {
  id: number;
  x: number;
  y: number;
  value: number;
  originalValue: number;
  speed: number;
  mascot: string;
  flashTime: number;
  dying: boolean;
  deathT: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  color: string;
  size: number;
  rot: number;
  vrot: number;
}

export interface FloatingText {
  x: number;
  y: number;
  vy: number;
  life: number;
  text: string;
  color: string;
}

export interface LevelProgress {
  stars: number;
  score: number;
}

export type Progress = Record<number, LevelProgress>;

export interface DragState {
  card: Card;
  cardEl: HTMLElement;
  x: number;
  y: number;
}
