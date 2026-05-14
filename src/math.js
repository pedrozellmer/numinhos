// Funções puras de matemática do jogo.
// Sem dependências, sem estado, fácil de testar.

/**
 * Regra fundamental: newValue deve estar ENTRE value e target (inclusive).
 *
 * Se value < target: newValue tem que estar em [value, target]
 * Se value > target: newValue tem que estar em [target, value]
 *
 * Bloqueia overshoot (passar do alvo) E retrocesso (afastar do alvo).
 * Pedagogicamente correto pra crianças aprendendo operações básicas.
 */
export function isValidStep(value, newValue, target) {
  if (value === target) return true;
  if (value < target) return newValue >= value && newValue <= target;
  return newValue >= target && newValue <= value;
}

/**
 * Aplica operação "a seco" — retorna o novo valor ou null se inválida.
 * Inválida quando:
 *   - operação intrínseca (÷0, ÷ não-exata, op desconhecida)
 *   - target fornecido E aplicação afasta/passa do target (isValidStep falha)
 *
 * @param {{op: '+'|'-'|'×'|'÷', val: number}} card
 * @param {number} value valor atual
 * @param {number|null} target alvo (opcional — se null, não checa isValidStep)
 * @returns {number|null} novo valor ou null
 */
export function applyOpDry(card, value, target) {
  let nv;
  if (card.op === '+') nv = value + card.val;
  else if (card.op === '-') nv = value - card.val;
  else if (card.op === '×') nv = value * card.val;
  else if (card.op === '÷') {
    if (card.val === 0 || value === 0 || value % card.val !== 0) return null;
    nv = value / card.val;
  } else {
    return null;
  }
  if (target != null && !isValidStep(value, nv, target)) return null;
  return nv;
}
