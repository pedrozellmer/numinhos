// Testes dos solvers: canSolveEnemy (com reuso) e canSolveWithCards (sem reuso).
// Verifica que respeitam a regra isValidStep.

import { describe, it, expect } from './test-runner.js';
import { canSolveEnemy, canSolveWithCards, validateAllModes } from '../src/solver.js';
import { MODES, MODE_ORDER } from '../src/levels.js';

describe('canSolveEnemy (pool com reuso)', () => {
  it('caminho direto: 3→10 com +7', () => {
    expect(canSolveEnemy(3, 10, [{op:'+',val:7}])).toBe(true);
  });

  it('caminho com reuso: 8→1 com ÷2 reusado', () => {
    expect(canSolveEnemy(8, 1, [{op:'÷',val:2}])).toBe(true);
  });

  it('caminho impossível: 7→1 só com ÷2', () => {
    expect(canSolveEnemy(7, 1, [{op:'÷',val:2}])).toBe(false);
  });

  it('respeita overshoot: 3→10 com +12 sozinho falha', () => {
    expect(canSolveEnemy(3, 10, [{op:'+',val:12}])).toBe(false);
  });

  it('tabuada do 4: 3→12 com ×4', () => {
    expect(canSolveEnemy(3, 12, [{op:'×',val:4}])).toBe(true);
  });

  it('mix +/−: 5→10 com pool variado', () => {
    expect(canSolveEnemy(5, 10, [{op:'+',val:2},{op:'+',val:5},{op:'-',val:3}])).toBe(true);
  });
});

describe('canSolveWithCards (sem reuso)', () => {
  it('uma carta basta', () => {
    expect(canSolveWithCards(3, 10, [{op:'+',val:7}])).toBe(true);
  });

  it('combina cartas: 4+1+5=10', () => {
    expect(canSolveWithCards(4, 10, [{op:'+',val:1},{op:'+',val:5}])).toBe(true);
  });

  it('cartas insuficientes: 8→1 com só uma ÷2', () => {
    expect(canSolveWithCards(8, 1, [{op:'÷',val:2}])).toBe(false);
  });

  it('cartas suficientes: 8→1 com três ÷2', () => {
    expect(canSolveWithCards(8, 1, [{op:'÷',val:2},{op:'÷',val:2},{op:'÷',val:2}])).toBe(true);
  });

  it('cards vazia → false (a não ser que start === target)', () => {
    expect(canSolveWithCards(5, 0, [])).toBe(false);
    expect(canSolveWithCards(5, 5, [])).toBe(true);
  });
});

describe('validateAllModes — solver runtime', () => {
  it('todas as 40 fases são solucionáveis', () => {
    const problems = validateAllModes(MODES, MODE_ORDER);
    expect(problems).toBe(0);
  });
});
