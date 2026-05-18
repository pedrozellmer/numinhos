// Cliente de telemetria — envia eventos anônimos pro Worker (/api/event).
//
// PRIVACIDADE: client_id é um UUID aleatório gerado no navegador. Não há
// nome, e-mail, idade, localização precisa — nada de PII. Seguro pra
// público infantil (LGPD-friendly). Só medimos comportamento agregado.

const CLIENT_KEY = 'numinhos_client_id';

function genId(prefix) {
  if (crypto && crypto.randomUUID) return crypto.randomUUID();
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function getClient() {
  let id = null;
  let isNew = false;
  try {
    id = localStorage.getItem(CLIENT_KEY);
    if (!id) {
      id = genId('c-');
      localStorage.setItem(CLIENT_KEY, id);
      isNew = true;
    }
  } catch {
    id = genId('c-'); // localStorage bloqueado — id efêmero
    isNew = true;
  }
  return { id, isNew };
}

const { id: CLIENT_ID, isNew: IS_NEW_CLIENT } = getClient();
const SESSION_ID = genId('s-');

// Detecta tipo de dispositivo via User-Agent (mobile / tablet / desktop)
function detectDevice() {
  try {
    const ua = navigator.userAgent || '';
    if (/iPad|Tablet|PlayBook|Silk/i.test(ua) ||
        (/Android/i.test(ua) && !/Mobile/i.test(ua))) return 'tablet';
    if (/Mobile|iPhone|iPod|Android|BlackBerry|Opera Mini|IEMobile/i.test(ua)) return 'mobile';
    return 'desktop';
  } catch { return 'unknown'; }
}
const DEVICE_TYPE = detectDevice();

let levelStartedAt = 0;

// Envio fire-and-forget — nunca trava nem quebra o jogo se falhar.
function send(payload) {
  try {
    const json = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/event', new Blob([json], { type: 'application/json' }));
    } else {
      fetch('/api/event', { method: 'POST', body: json, keepalive: true,
        headers: { 'content-type': 'application/json' } }).catch(() => {});
    }
  } catch {}
}

function track(eventType, data = {}) {
  send({
    client_id: CLIENT_ID,
    session_id: SESSION_ID,
    event_type: eventType,
    device_type: DEVICE_TYPE,
    is_new_client: eventType === 'session_start' ? IS_NEW_CLIENT : false,
    ...data,
  });
}

// ===== Helpers semânticos (usados pelo jogo) =====
export function trackSessionStart() {
  track('session_start');
}
// Quando a tela de seleção de modo é mostrada — útil pra distinguir
// "viu os modos mas não clicou em nenhum" de "viu e escolheu modo X".
// Idempotente por sessão: dispara só uma vez por carregamento.
let modeSelectShownSent = false;
export function trackModeSelectShown() {
  if (modeSelectShownSent) return;
  modeSelectShownSent = true;
  track('mode_select_shown');
}
export function trackModeSelected(mode) {
  track('mode_selected', { mode });
}
export function trackLevelStarted(mode, level) {
  levelStartedAt = Date.now();
  track('level_started', { mode, level });
}
export function trackLevelWon(mode, level, stars, score) {
  track('level_won', {
    mode, level, stars, score,
    duration_ms: levelStartedAt ? Date.now() - levelStartedAt : null,
  });
}
export function trackLevelLost(mode, level) {
  track('level_lost', {
    mode, level,
    duration_ms: levelStartedAt ? Date.now() - levelStartedAt : null,
  });
}
export function trackLevelQuit(mode, level) {
  track('level_quit', {
    mode, level,
    duration_ms: levelStartedAt ? Date.now() - levelStartedAt : null,
  });
}
