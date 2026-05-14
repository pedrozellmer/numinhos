// Sons gerados via Web Audio API — sem arquivos externos.
// Latência baixíssima, peso zero. Tons simples mas musicais.

let audioCtx = null;
let muted = false;

function getCtx() {
  if (audioCtx) return audioCtx;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  } catch {
    return null;
  }
  return audioCtx;
}

// Inicialização perezosa — alguns browsers exigem user gesture pra iniciar áudio.
// Chamada após o primeiro click/touch.
export function initAudio() {
  const ctx = getCtx();
  if (ctx && ctx.state === 'suspended') ctx.resume();
}

export function setMuted(value) { muted = value; }
export function isMuted() { return muted; }

/**
 * Toca uma nota com envelope ADSR simples.
 * @param {object} opts
 * @param {number} opts.freq  frequência em Hz
 * @param {number} opts.dur   duração total em segundos
 * @param {number} opts.vol   volume pico (0–1)
 * @param {'sine'|'square'|'triangle'|'sawtooth'} opts.type
 * @param {number} opts.delay atraso antes de tocar (segundos)
 */
function tone({ freq, dur = 0.18, vol = 0.15, type = 'sine', delay = 0 }) {
  if (muted) return;
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(vol, now + 0.01);     // attack
  gain.gain.exponentialRampToValueAtTime(0.001, now + dur); // decay
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + dur + 0.02);
}

// Pequeno "boop" satisfatório — carta aplicada com sucesso
export function soundCardApplied() {
  tone({ freq: 660, dur: 0.08, vol: 0.12, type: 'triangle' });
  tone({ freq: 880, dur: 0.08, vol: 0.10, type: 'triangle', delay: 0.04 });
}

// Numinho chegou no destino (vitória pequena)
export function soundEnemyDestroyed() {
  tone({ freq: 523, dur: 0.10, vol: 0.18, type: 'triangle' });        // C5
  tone({ freq: 659, dur: 0.10, vol: 0.16, type: 'triangle', delay: 0.06 });  // E5
  tone({ freq: 784, dur: 0.20, vol: 0.18, type: 'triangle', delay: 0.12 });  // G5
}

// Carta inválida (não dá, passa do alvo)
export function soundInvalid() {
  tone({ freq: 200, dur: 0.10, vol: 0.10, type: 'square' });
}

// Numinho passou da linha — perdeu vida
export function soundLifeLost() {
  tone({ freq: 350, dur: 0.12, vol: 0.16, type: 'sawtooth' });
  tone({ freq: 250, dur: 0.18, vol: 0.16, type: 'sawtooth', delay: 0.10 });
}

// Vitória de fase
export function soundWinLevel() {
  const notes = [523, 659, 784, 1047]; // C E G C (oitava)
  notes.forEach((f, i) => tone({ freq: f, dur: 0.18, vol: 0.18, type: 'triangle', delay: i * 0.10 }));
}

// Derrota de fase
export function soundLoseLevel() {
  tone({ freq: 440, dur: 0.30, vol: 0.18, type: 'triangle' });
  tone({ freq: 330, dur: 0.30, vol: 0.18, type: 'triangle', delay: 0.20 });
  tone({ freq: 220, dur: 0.50, vol: 0.18, type: 'triangle', delay: 0.40 });
}

// Click no menu
export function soundMenuClick() {
  tone({ freq: 800, dur: 0.05, vol: 0.08, type: 'sine' });
}
