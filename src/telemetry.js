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
    is_new_client: eventType === 'session_start' ? IS_NEW_CLIENT : false,
    ...data,
  });
}

// ===== Helpers semânticos (usados pelo jogo) =====
export function trackSessionStart() {
  track('session_start');
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
