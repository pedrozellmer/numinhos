// Salvamento de progresso. Hoje localStorage; trocar por Supabase é só
// reescrever este módulo, sem mexer no resto do jogo.

import type { Progress } from './types';

const KEY = 'numinhos_progress';

export function loadProgress(): Progress {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}') as Progress;
  } catch {
    return {};
  }
}

export function saveProgress(progress: Progress): void {
  localStorage.setItem(KEY, JSON.stringify(progress));
}
