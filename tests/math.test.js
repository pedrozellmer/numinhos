// Testes da regra matemática central — funções puras.
// Roda em Node (Vitest) e no browser (tests/test.html).

import { describe, it, expect } from './test-runner.js';
import { isValidStep, applyOpDry } from '../src/math.js';

describe('isValidStep', () => {
  it('já está no target → true', () => {
    expect(isValidStep(5, 5, 5)).toBe(true);
    expect(isValidStep(0, 0, 0)).toBe(true);
  });

  it('value < target: aceita estritamente entre value e target', () => {
    expect(isValidStep(3, 7, 10)).toBe(true);   // aproximou
    expect(isValidStep(3, 10, 10)).toBe(true);  // atingiu
    expect(isValidStep(3, 3, 10)).toBe(true);   // ficou igual (ok)
  });

  it('value < target: bloqueia passar do target', () => {
    expect(isValidStep(3, 15, 10)).toBe(false); // 15 > 10
  });

  it('value < target: bloqueia ir pra trás de value', () => {
    expect(isValidStep(3, 0, 10)).toBe(false);  // 0 < 3
    expect(isValidStep(3, -2, 10)).toBe(false); // negativo
  });

  it('value > target: aceita estritamente entre target e value', () => {
    expect(isValidStep(10, 5, 0)).toBe(true);
    expect(isValidStep(10, 0, 0)).toBe(true);  // atingiu
  });

  it('value > target: bloqueia passar do target', () => {
    expect(isValidStep(10, -3, 0)).toBe(false); // ficou negativo
  });

  it('value > target: bloqueia ir além de value', () => {
    expect(isValidStep(10, 15, 0)).toBe(false);
  });
});

describe('applyOpDry — operações básicas', () => {
  it('soma válida', () => {
    expect(applyOpDry({op:'+',val:5}, 3, 10)).toBe(8);
  });

  it('soma que passa do target → null', () => {
    expect(applyOpDry({op:'+',val:12}, 3, 10)).toBe(null);
  });

  it('subtração válida', () => {
    expect(applyOpDry({op:'-',val:3}, 10, 0)).toBe(7);
  });

  it('subtração que passa do zero → null', () => {
    expect(applyOpDry({op:'-',val:15}, 10, 0)).toBe(null);
  });

  it('multiplicação atinge target', () => {
    expect(applyOpDry({op:'×',val:4}, 3, 12)).toBe(12);
  });

  it('multiplicação que passa do target → null', () => {
    expect(applyOpDry({op:'×',val:5}, 3, 12)).toBe(null); // 15 > 12
  });

  it('×0 quando target > 0 → null (destrói progresso)', () => {
    expect(applyOpDry({op:'×',val:0}, 3, 12)).toBe(null); // value 3, ×0=0, target 12 → afasta
  });

  it('divisão exata', () => {
    expect(applyOpDry({op:'÷',val:4}, 12, 1)).toBe(3);
    expect(applyOpDry({op:'÷',val:2}, 8, 1)).toBe(4);
  });

  it('divisão não-exata → null', () => {
    expect(applyOpDry({op:'÷',val:3}, 10, 1)).toBe(null);
  });

  it('divisão por zero → null', () => {
    expect(applyOpDry({op:'÷',val:0}, 10, 1)).toBe(null);
  });

  it('divisão de zero → null', () => {
    expect(applyOpDry({op:'÷',val:5}, 0, 0)).toBe(null);
  });

  it('sem target — só checa validade intrínseca', () => {
    expect(applyOpDry({op:'+',val:100}, 3, null)).toBe(103); // sem target, soma ok
    expect(applyOpDry({op:'÷',val:3}, 10, null)).toBe(null);  // não exata
  });

  it('operação desconhecida → null', () => {
    expect(applyOpDry({op:'?',val:1}, 5, 10)).toBe(null);
  });
});
