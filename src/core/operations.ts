// Lógica pura das operações matemáticas. Sem DOM, sem canvas — testável
// isoladamente. Aqui é onde o solver da Fase 5 (gerador procedural) vai
// se apoiar pra validar se uma fase é solucionável.

import type { Card, Op } from './types';

export function applyOp(value: number, op: Op, operand: number): number {
  switch (op) {
    case '+':
      return value + operand;
    case '-':
      return value - operand;
    case '×':
      return value * operand;
    case '÷':
      return operand === 0 ? value : Math.round(value / operand);
  }
}

export function applyCard(value: number, card: Card): number {
  return applyOp(value, card.op, card.val);
}

// Texto curto da operação aplicada, pra mostrar como floating text.
export function operationLabel(card: Card): string {
  return `${card.op}${card.val}`;
}

// Cor associada a cada operação (consistente entre carta e feedback visual).
export function colorForOp(op: Op): string {
  switch (op) {
    case '+': return '#43d177';
    case '-': return '#ff6b6b';
    case '×': return '#ffa600';
    case '÷': return '#6c8dff';
  }
}

export function cssClassForOp(op: Op): string {
  switch (op) {
    case '+': return 'add';
    case '-': return 'sub';
    case '×': return 'mul';
    case '÷': return 'div';
  }
}
