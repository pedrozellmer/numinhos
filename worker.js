// Cloudflare Worker — serve os assets estáticos do jogo + telemetria.
//
// Rotas:
//   POST /api/event      — grava um evento de telemetria no D1
//   GET  /api/stats?key= — retorna estatísticas agregadas (JSON)
//   resto                — serve os arquivos estáticos do jogo
//
// Telemetria 100% anônima: client_id é UUID aleatório, sem PII.

// Chave simples pra estatísticas não ficarem 100% abertas (não é segredo
// crítico — são números agregados anônimos).
const STATS_KEY = 'num-stats-2026';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ===== POST /api/event =====
    if (url.pathname === '/api/event' && request.method === 'POST') {
      try {
        const body = await request.json();
        const country = request.headers.get('CF-IPCountry') || null;
        await env.DB.prepare(
          `INSERT INTO events
             (client_id, session_id, event_type, mode, level, stars, score,
              duration_ms, country, is_new_client, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          String(body.client_id || 'unknown').slice(0, 64),
          String(body.session_id || 'unknown').slice(0, 64),
          String(body.event_type || 'unknown').slice(0, 32),
          body.mode != null ? String(body.mode).slice(0, 16) : null,
          Number.isFinite(body.level) ? body.level : null,
          Number.isFinite(body.stars) ? body.stars : null,
          Number.isFinite(body.score) ? body.score : null,
          Number.isFinite(body.duration_ms) ? body.duration_ms : null,
          country,
          body.is_new_client ? 1 : 0,
          Date.now()
        ).run();
        return new Response('ok', { status: 202, headers: cors() });
      } catch (e) {
        return new Response('bad request', { status: 400, headers: cors() });
      }
    }

    // CORS preflight (pra dev local)
    if (url.pathname === '/api/event' && request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors() });
    }

    // ===== GET /api/stats =====
    if (url.pathname === '/api/stats') {
      if (url.searchParams.get('key') !== STATS_KEY) {
        return new Response('forbidden', { status: 403 });
      }
      try {
        const stats = await computeStats(env.DB);
        return new Response(JSON.stringify(stats, null, 2), {
          headers: { 'content-type': 'application/json', ...cors() },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500, headers: { 'content-type': 'application/json' },
        });
      }
    }

    // ===== resto: arquivos estáticos do jogo =====
    return env.ASSETS.fetch(request);
  },
};

function cors() {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'POST, GET, OPTIONS',
    'access-control-allow-headers': 'content-type',
  };
}

async function computeStats(db) {
  const q = (sql, ...params) => db.prepare(sql).bind(...params).all();
  const one = async (sql, ...params) => {
    const r = await db.prepare(sql).bind(...params).first();
    return r ? Object.values(r)[0] : 0;
  };

  const now = Date.now();
  const dayMs = 86400000;
  const since7d = now - 7 * dayMs;
  const since1d = now - dayMs;

  // Totais de pessoas e sessões
  const totalPeople = await one(`SELECT COUNT(DISTINCT client_id) FROM events`);
  const totalSessions = await one(`SELECT COUNT(DISTINCT session_id) FROM events`);
  // Pessoas que JOGARAM de fato (começaram ao menos 1 fase)
  const peoplePlayed = await one(
    `SELECT COUNT(DISTINCT client_id) FROM events WHERE event_type = 'level_started'`
  );
  // Novos clientes (primeira visita)
  const newClients = await one(
    `SELECT COUNT(*) FROM events WHERE event_type = 'session_start' AND is_new_client = 1`
  );

  // Atividade recente
  const sessions7d = await one(
    `SELECT COUNT(DISTINCT session_id) FROM events WHERE created_at >= ?`, since7d
  );
  const sessions1d = await one(
    `SELECT COUNT(DISTINCT session_id) FROM events WHERE created_at >= ?`, since1d
  );

  // Fases: iniciadas, vencidas, perdidas, abandonadas
  const levelsStarted = await one(`SELECT COUNT(*) FROM events WHERE event_type = 'level_started'`);
  const levelsWon = await one(`SELECT COUNT(*) FROM events WHERE event_type = 'level_won'`);
  const levelsLost = await one(`SELECT COUNT(*) FROM events WHERE event_type = 'level_lost'`);
  const levelsQuit = await one(`SELECT COUNT(*) FROM events WHERE event_type = 'level_quit'`);

  // Tempo médio de sessão (do 1º ao último evento, em segundos)
  const avgSessionSec = await one(`
    SELECT AVG(dur) FROM (
      SELECT (MAX(created_at) - MIN(created_at)) / 1000.0 AS dur
      FROM events GROUP BY session_id
    )
  `);

  // Modo mais popular
  const byMode = (await q(`
    SELECT mode, COUNT(*) AS n FROM events
    WHERE event_type = 'mode_selected' AND mode IS NOT NULL
    GROUP BY mode ORDER BY n DESC
  `)).results;

  // Onde a criança desiste: fases com mais perda+abandono
  const dropoffs = (await q(`
    SELECT mode, level,
           SUM(CASE WHEN event_type = 'level_lost' THEN 1 ELSE 0 END) AS lost,
           SUM(CASE WHEN event_type = 'level_quit' THEN 1 ELSE 0 END) AS quit,
           SUM(CASE WHEN event_type = 'level_won'  THEN 1 ELSE 0 END) AS won
    FROM events
    WHERE event_type IN ('level_lost','level_quit','level_won') AND mode IS NOT NULL
    GROUP BY mode, level
    ORDER BY (lost + quit) DESC
    LIMIT 10
  `)).results;

  // Retenção: clientes que tiveram sessões em 2+ dias distintos
  const returningClients = await one(`
    SELECT COUNT(*) FROM (
      SELECT client_id, COUNT(DISTINCT created_at / 86400000) AS days
      FROM events GROUP BY client_id HAVING days >= 2
    )
  `);

  // Países
  const byCountry = (await q(`
    SELECT country, COUNT(DISTINCT client_id) AS n FROM events
    WHERE country IS NOT NULL
    GROUP BY country ORDER BY n DESC LIMIT 8
  `)).results;

  return {
    geradoEm: new Date(now).toISOString(),
    pessoas: {
      total: totalPeople,
      jogaramDeFato: peoplePlayed,
      novas: newClients,
      retornaram: returningClients,
    },
    sessoes: {
      total: totalSessions,
      ultimos7dias: sessions7d,
      ultimas24h: sessions1d,
      tempoMedioSegundos: Math.round(avgSessionSec || 0),
    },
    fases: {
      iniciadas: levelsStarted,
      vencidas: levelsWon,
      perdidas: levelsLost,
      abandonadas: levelsQuit,
      taxaVitoria: levelsStarted > 0
        ? Math.round((levelsWon / levelsStarted) * 100) + '%' : '—',
    },
    modoMaisJogado: byMode,
    ondeDesiste: dropoffs,
    paises: byCountry,
  };
}
