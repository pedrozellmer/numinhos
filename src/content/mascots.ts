// Mascotes do jogo. Hoje são emoji — placeholder até a Fase 3 do plano,
// quando entram capivara, tucano, onça-pintada, boto cor-de-rosa etc.

const MASCOTS = ['🐸', '🦊', '🐙', '🐰', '🐻', '🦄', '🐳', '🦁', '🐯', '🐨', '🐵', '🦝'] as const;

export function mascotFor(value: number): string {
  return MASCOTS[Math.abs(value) % MASCOTS.length]!;
}

// Cor do corpo do inimigo conforme magnitude do número.
export function colorFor(value: number): string {
  if (value === 0) return '#cccccc';
  if (value < 0) return '#9d4edd';
  if (value <= 5) return '#43d177';
  if (value <= 10) return '#ffd166';
  if (value <= 20) return '#ff8e3c';
  return '#ff6b6b';
}
