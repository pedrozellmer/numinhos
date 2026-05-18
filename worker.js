// Cloudflare Worker — serve os assets do jogo + telemetria + painel.
//
// Rotas:
//   POST /api/event             grava um evento no D1
//   GET  /api/stats?key=&period= retorna estatísticas agregadas
//   GET  /api/live?key=          últimos 20 eventos (live tail)
//   GET  /api/stats.csv?key=     export bruto em CSV
//   resto                        serve assets estáticos
//
// Telemetria 100% anônima: client_id é UUID aleatório, sem PII.

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
              duration_ms, country, is_new_client, device_type, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
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
          body.device_type ? String(body.device_type).slice(0, 16) : null,
          Date.now()
        ).run();
        return new Response('ok', { status: 202, headers: cors() });
      } catch (e) {
        return new Response('bad request', { status: 400, headers: cors() });
      }
    }
    if (url.pathname === '/api/event' && request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors() });
    }

    // ===== GET /api/stats =====
    if (url.pathname === '/api/stats') {
      if (url.searchParams.get('key') !== STATS_KEY) {
        return new Response('forbidden', { status: 403 });
      }
      try {
        const period = url.searchParams.get('period') || 'all';
        const stats = await computeStats(env.DB, period);
        return jsonResponse(stats);
      } catch (e) {
        return jsonResponse({ error: e.message }, 500);
      }
    }

    // ===== GET /api/live =====  (últimos 20 eventos)
    if (url.pathname === '/api/live') {
      if (url.searchParams.get('key') !== STATS_KEY) {
        return new Response('forbidden', { status: 403 });
      }
      const r = await env.DB.prepare(
        `SELECT event_type, mode, level, country, device_type, created_at
         FROM events ORDER BY created_at DESC LIMIT 20`
      ).all();
      return jsonResponse({ events: r.results });
    }

    // ===== GET /api/stats.csv =====
    if (url.pathname === '/api/stats.csv') {
      if (url.searchParams.get('key') !== STATS_KEY) {
        return new Response('forbidden', { status: 403 });
      }
      const r = await env.DB.prepare(
        `SELECT client_id, session_id, event_type, mode, level, stars, score,
                duration_ms, country, device_type, is_new_client, created_at
         FROM events ORDER BY created_at DESC LIMIT 10000`
      ).all();
      const header = 'client_id,session_id,event_type,mode,level,stars,score,duration_ms,country,device_type,is_new_client,created_at\n';
      const rows = r.results.map(e => [
        e.client_id, e.session_id, e.event_type, e.mode ?? '', e.level ?? '',
        e.stars ?? '', e.score ?? '', e.duration_ms ?? '', e.country ?? '',
        e.device_type ?? '', e.is_new_client ?? '', e.created_at,
      ].join(',')).join('\n');
      return new Response(header + rows, {
        headers: { 'content-type': 'text/csv', 'content-disposition': 'attachment; filename=numinhos-events.csv' },
      });
    }

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
function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj, null, 2), {
    status, headers: { 'content-type': 'application/json', ...cors() },
  });
}

// Converte período em filtro SQL (created_at >= since)
function periodToSince(period) {
  const now = Date.now();
  const day = 86400000;
  if (period === '24h') return now - day;
  if (period === '7d')  return now - 7 * day;
  if (period === '30d') return now - 30 * day;
  return 0;
}

async function computeStats(db, period) {
  const since = periodToSince(period);
  const where = since > 0 ? ` WHERE created_at >= ${since}` : '';
  const andWhere = since > 0 ? ` AND created_at >= ${since}` : '';

  const q = (sql) => db.prepare(sql).all().then(r => r.results);
  const one = async (sql) => {
    const r = await db.prepare(sql).first();
    return r ? Object.values(r)[0] : 0;
  };

  const now = Date.now();
  const day = 86400000;

  // ===== Pessoas =====
  const totalPeople = await one(`SELECT COUNT(DISTINCT client_id) FROM events${where}`);
  const peoplePlayed = await one(
    `SELECT COUNT(DISTINCT client_id) FROM events WHERE event_type = 'level_started'${andWhere}`
  );
  const newClients = await one(
    `SELECT COUNT(*) FROM events WHERE event_type = 'session_start' AND is_new_client = 1${andWhere}`
  );
  const returningClients = await one(`
    SELECT COUNT(*) FROM (
      SELECT client_id, COUNT(DISTINCT created_at / 86400000) AS days
      FROM events${where} GROUP BY client_id HAVING days >= 2
    )
  `);

  // ===== Sessões =====
  const totalSessions = await one(`SELECT COUNT(DISTINCT session_id) FROM events${where}`);
  const sessions24h = await one(`SELECT COUNT(DISTINCT session_id) FROM events WHERE created_at >= ${now - day}`);
  const sessions7d = await one(`SELECT COUNT(DISTINCT session_id) FROM events WHERE created_at >= ${now - 7 * day}`);
  const avgSessionSec = await one(`
    SELECT AVG(dur) FROM (
      SELECT (MAX(created_at) - MIN(created_at)) / 1000.0 AS dur
      FROM events${where} GROUP BY session_id
    )
  `);

  // ===== Distribuição de duração de sessão (buckets) =====
  const durations = await q(`
    SELECT dur FROM (
      SELECT (MAX(created_at) - MIN(created_at)) / 1000.0 AS dur
      FROM events${where} GROUP BY session_id
    )
  `);
  const buckets = { '<10s': 0, '10-30s': 0, '30s-1min': 0, '1-3min': 0, '>3min': 0 };
  for (const row of durations) {
    const d = row.dur || 0;
    if (d < 10) buckets['<10s']++;
    else if (d < 30) buckets['10-30s']++;
    else if (d < 60) buckets['30s-1min']++;
    else if (d < 180) buckets['1-3min']++;
    else buckets['>3min']++;
  }

  // ===== Funil de conversão =====
  const seenSplash = await one(
    `SELECT COUNT(DISTINCT client_id) FROM events WHERE event_type = 'mode_select_shown'${andWhere}`
  );
  const choseMode = await one(
    `SELECT COUNT(DISTINCT client_id) FROM events WHERE event_type = 'mode_selected'${andWhere}`
  );
  const startedLevel = await one(
    `SELECT COUNT(DISTINCT client_id) FROM events WHERE event_type = 'level_started'${andWhere}`
  );
  const wonLevel = await one(
    `SELECT COUNT(DISTINCT client_id) FROM events WHERE event_type = 'level_won'${andWhere}`
  );

  // ===== Fases =====
  const levelsStarted = await one(`SELECT COUNT(*) FROM events WHERE event_type = 'level_started'${andWhere}`);
  const levelsWon = await one(`SELECT COUNT(*) FROM events WHERE event_type = 'level_won'${andWhere}`);
  const levelsLost = await one(`SELECT COUNT(*) FROM events WHERE event_type = 'level_lost'${andWhere}`);
  const levelsQuit = await one(`SELECT COUNT(*) FROM events WHERE event_type = 'level_quit'${andWhere}`);

  // ===== Modo mais jogado =====
  const byMode = await q(`
    SELECT mode, COUNT(*) AS n FROM events
    WHERE event_type = 'mode_selected' AND mode IS NOT NULL${andWhere}
    GROUP BY mode ORDER BY n DESC
  `);

  // ===== Onde a criança mais perde/abandona =====
  const dropoffs = await q(`
    SELECT mode, level,
           SUM(CASE WHEN event_type = 'level_lost' THEN 1 ELSE 0 END) AS lost,
           SUM(CASE WHEN event_type = 'level_quit' THEN 1 ELSE 0 END) AS quit,
           SUM(CASE WHEN event_type = 'level_won'  THEN 1 ELSE 0 END) AS won
    FROM events
    WHERE event_type IN ('level_lost','level_quit','level_won') AND mode IS NOT NULL${andWhere}
    GROUP BY mode, level
    ORDER BY (lost + quit) DESC, won DESC
    LIMIT 12
  `);

  // ===== Top fases concluídas =====
  const topWon = await q(`
    SELECT mode, level, COUNT(*) AS n FROM events
    WHERE event_type = 'level_won' AND mode IS NOT NULL${andWhere}
    GROUP BY mode, level ORDER BY n DESC LIMIT 10
  `);

  // ===== Profundidade de sessão (quantas fases por sessão) =====
  const depths = await q(`
    SELECT n_fases, COUNT(*) AS sessoes FROM (
      SELECT session_id, SUM(CASE WHEN event_type = 'level_started' THEN 1 ELSE 0 END) AS n_fases
      FROM events${where} GROUP BY session_id
    ) GROUP BY n_fases ORDER BY n_fases
  `);

  // ===== Mobile vs Desktop =====
  const byDevice = await q(`
    SELECT COALESCE(device_type, 'desconhecido') AS device,
           COUNT(DISTINCT client_id) AS n FROM events${where}
    GROUP BY device ORDER BY n DESC
  `);

  // ===== Sessões por hora (últimas 72h) =====
  const since72h = now - 72 * 60 * 60 * 1000;
  const byHourRaw = await q(`
    SELECT (created_at / 3600000) AS hour_bucket, COUNT(DISTINCT session_id) AS n
    FROM events WHERE created_at >= ${since72h}
    GROUP BY hour_bucket ORDER BY hour_bucket
  `);
  // Preenche buckets vazios pra 72 horas
  const nowHour = Math.floor(now / 3600000);
  const startHour = nowHour - 71;
  const hourMap = {};
  for (const r of byHourRaw) hourMap[r.hour_bucket] = r.n;
  const timeline = [];
  for (let h = startHour; h <= nowHour; h++) {
    timeline.push({ hour: h, ts: h * 3600000, n: hourMap[h] || 0 });
  }

  // ===== Hoje vs Ontem =====
  const startToday = new Date(); startToday.setHours(0, 0, 0, 0);
  const startYesterday = startToday.getTime() - day;
  const todayCount = await one(`SELECT COUNT(DISTINCT session_id) FROM events WHERE created_at >= ${startToday.getTime()}`);
  const yesterdayCount = await one(
    `SELECT COUNT(DISTINCT session_id) FROM events WHERE created_at >= ${startYesterday} AND created_at < ${startToday.getTime()}`
  );

  // ===== Países =====
  const byCountry = await q(`
    SELECT country, COUNT(DISTINCT client_id) AS n FROM events
    WHERE country IS NOT NULL${andWhere}
    GROUP BY country ORDER BY n DESC LIMIT 10
  `);

  return {
    geradoEm: new Date(now).toISOString(),
    periodo: period,
    pessoas: {
      total: totalPeople,
      jogaramDeFato: peoplePlayed,
      novas: newClients,
      retornaram: returningClients,
    },
    sessoes: {
      total: totalSessions,
      ultimos7dias: sessions7d,
      ultimas24h: sessions24h,
      tempoMedioSegundos: Math.round(avgSessionSec || 0),
      distribuicao: buckets,
    },
    funil: [
      { etapa: 'Viu a splash', valor: seenSplash },
      { etapa: 'Escolheu modo', valor: choseMode },
      { etapa: 'Começou fase', valor: startedLevel },
      { etapa: 'Venceu fase', valor: wonLevel },
    ],
    fases: {
      iniciadas: levelsStarted,
      vencidas: levelsWon,
      perdidas: levelsLost,
      abandonadas: levelsQuit,
      taxaVitoria: levelsStarted > 0 ? Math.round((levelsWon / levelsStarted) * 100) + '%' : '—',
    },
    modoMaisJogado: byMode,
    topFasesConcluidas: topWon,
    profundidade: depths,
    dispositivos: byDevice,
    ondeDesiste: dropoffs,
    timeline72h: timeline,
    hojeVsOntem: { hoje: todayCount, ontem: yesterdayCount },
    paises: byCountry,
  };
}
