// Helpers para acessar elementos do DOM com type-safety.
// `byId` lança erro claro se o elemento sumir, em vez de propagar `null`
// silenciosamente até virar bug obscuro em produção.

export function byId<T extends HTMLElement = HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Elemento #${id} não encontrado no DOM`);
  return el as T;
}

export function showScreen(id: string): void {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('show'));
  byId(id).classList.add('show');
}

export function hideAllScreens(): void {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('show'));
}

export function setDisplay(id: string, display: string): void {
  byId(id).style.display = display;
}
