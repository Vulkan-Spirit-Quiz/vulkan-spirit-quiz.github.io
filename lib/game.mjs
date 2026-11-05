// Vulkan Spirit Teamquiz – game logic (storage: Postgres via a query(text, params) → rows function).
import { createHash, randomUUID, randomInt, timingSafeEqual } from 'node:crypto';
import { PACKS, MISSIONS, GET_READY_MS, pointsFor, timeFor } from './questions.mjs';
import { AVATAR_IDS, isUploadAvatar, DEFAULT_PRIZE } from '../docs/js/shared.mjs';

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const MAX_TEAMS = 40;
const ROOM_TTL_MS = 48 * 3600 * 1000;
const ROOMS_PER_HOUR = 20;
const REVEAL_GRACE_MS = 600;
const ANSWER_GRACE_MS = 800; // network latency after the clock hits zero

class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
const fail = (status, message) => { throw new HttpError(status, message); };
const sha = v => createHash('sha256').update(String(v)).digest('hex');
const sameHash = (a, b) => typeof a === 'string' && typeof b === 'string' && a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
const newToken = () => randomUUID() + randomUUID(); // 72 chars, [a-f0-9-]
const TOKEN_RE = /^[a-f0-9-]{72}$/;
const CODE_RE = /^[A-Z2-9]{6}$/;

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });
}

function cleanName(raw) {
  const name = String(raw ?? '').normalize('NFC').replace(/[\u0000-\u001f\u007f-\u009f​-‏‪-‮]/g, '').replace(/\s+/g, ' ').trim();
  if (name.length < 2) fail(400, 'Bitte einen Teamnamen mit mindestens 2 Zeichen eingeben.');
  if (name.length > 24) fail(400, 'Der Teamname darf höchstens 24 Zeichen lang sein.');
  return name;
}
const nameKey = n => n.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
function cleanPrize(raw) {
  const p = String(raw ?? '').replace(/[\u0000-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim().slice(0, 80);
  return p || DEFAULT_PRIZE;
}
function packOf(room) { const p = Number(room.quiz_version); return Number.isInteger(p) && PACKS[p] ? p : 0; }

async function loadRoom(query, code) {
  if (!CODE_RE.test(code || '')) fail(404, 'Dieses Spiel gibt es nicht. Bitte den Code prüfen.');
  const [room] = await query('SELECT * FROM rooms WHERE code=$1', [code]);
  if (!room) fail(404, 'Dieses Spiel gibt es nicht (mehr). Bitte den Code prüfen.');
  room.q = Number(room.q); room.started = Number(room.started); room.created = Number(room.created);
  return room;
}
function isHost(room, headers) {
  const t = headers.get('x-host-token') || '';
  return TOKEN_RE.test(t) && sameHash(sha(t), room.host_secret);
}
async function loadTeam(query, room, headers) {
  const t = headers.get('x-team-token') || '';
  if (!TOKEN_RE.test(t)) return null;
  const [team] = await query('SELECT id,name,avatar,created FROM teams WHERE room=$1 AND secret=$2', [room.code, sha(t)]);
  return team || null;
}
const avatarRef = a => (AVATAR_IDS.has(a) ? a : isUploadAvatar(a) ? 'upload' : 'spock');

// --- automatic reveal: time is up or every team has answered ---
async function autoReveal(query, room, now, teamCount, answered) {
  if (room.phase !== 'question') return;
  const deadline = room.started + timeFor(packOf(room), room.q);
  if (now >= deadline + REVEAL_GRACE_MS || (teamCount > 0 && answered >= teamCount && now >= room.started)) {
    await query("UPDATE rooms SET phase='reveal' WHERE code=$1 AND phase='question' AND q=$2", [room.code, room.q]);
    room.phase = 'reveal';
  }
}

async function state(query, room, headers, now) {
  const host = isHost(room, headers);
  const me = await loadTeam(query, room, headers);
  const pack = packOf(room), questions = PACKS[pack];
  const teams = await query(
    `SELECT t.id, t.name, t.avatar, t.created,
            COALESCE(SUM(a.points),0)::int AS score,
            COALESCE(MAX(CASE WHEN a.q=$2 THEN 1 ELSE 0 END),0)::int AS answered,
            MAX(CASE WHEN a.q=$2 THEN a.points END) AS last
       FROM teams t LEFT JOIN answers a ON a.team=t.id
      WHERE t.room=$1 GROUP BY t.id ORDER BY score DESC, t.created ASC`, [room.code, room.q]);
  const answered = teams.reduce((n, t) => n + Number(t.answered), 0);
  await autoReveal(query, room, now, teams.length, answered);

  const out = {
    code: room.code, phase: room.phase, q: room.q, total: questions.length, pack,
    mission: MISSIONS[pack].name, prize: room.prize || DEFAULT_PRIZE,
    started: room.started, deadline: room.started + timeFor(packOf(room), room.q), serverNow: now,
    isHost: host, answeredCount: answered,
    teams: teams.map(t => ({ id: t.id, name: t.name, avatar: avatarRef(t.avatar), score: Number(t.score), answered: !!Number(t.answered), last: t.last == null ? null : Number(t.last) })),
    me: null, answer: null, question: null, stats: null
  };
  if (me) {
    const idx = out.teams.findIndex(t => t.id === me.id);
    out.me = { id: me.id, name: me.name, avatar: avatarRef(me.avatar), score: idx >= 0 ? out.teams[idx].score : 0, rank: idx + 1 };
  }
  const live = (room.phase === 'question' || room.phase === 'reveal') && room.q >= 0 && questions[room.q];
  if (live) {
    const Q = questions[room.q];
    const visible = room.phase === 'reveal' || host || now >= room.started - 250;
    out.question = { number: room.q + 1, theme: Q.theme, hard: Q.hard, multiplier: Q.hard ? 2.5 : 1 };
    if (visible) Object.assign(out.question, { text: Q.text, options: Q.options, image: Q.image, audio: Q.audio || null, seconds: Q.seconds });
    if (room.phase === 'reveal') {
      Object.assign(out.question, { correct: Q.correct, explanation: Q.explanation });
      const rows = await query('SELECT choice, COUNT(*)::int AS n FROM answers WHERE room=$1 AND q=$2 GROUP BY choice', [room.code, room.q]);
      out.stats = [0, 0, 0, 0]; for (const r of rows) out.stats[Number(r.choice)] = Number(r.n);
    }
    if (me) {
      const [a] = await query('SELECT choice, points FROM answers WHERE team=$1 AND q=$2', [me.id, room.q]);
      if (a) out.answer = room.phase === 'reveal' ? { choice: Number(a.choice), points: Number(a.points) } : { choice: Number(a.choice) };
    }
  }
  return out;
}

// --- actions ---
async function create(query, body, ip, now) {
  const pack = Number(body.pack);
  if (!Number.isInteger(pack) || !PACKS[pack]) fail(400, 'Bitte eine Mission auswählen.');
  const owner = sha('vulkan-spirit:' + (ip || 'unknown')).slice(0, 40);
  await query('DELETE FROM rooms WHERE created < $1', [now - ROOM_TTL_MS]);
  const [{ n }] = await query('SELECT COUNT(*)::int AS n FROM rooms WHERE owner=$1 AND created > $2', [owner, now - 3600 * 1000]);
  if (Number(n) >= ROOMS_PER_HOUR) fail(429, 'Zu viele neue Spiele in kurzer Zeit. Bitte etwas später erneut versuchen.');
  const token = newToken();
  for (let attempt = 0; attempt < 8; attempt++) {
    let code = ''; for (let i = 0; i < 6; i++) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
    const rows = await query(
      `INSERT INTO rooms (code, owner, host_secret, phase, q, started, created, quiz_version, prize)
       VALUES ($1,$2,$3,'lobby',-1,0,$4,$5,$6) ON CONFLICT (code) DO NOTHING RETURNING code`,
      [code, owner, sha(token), now, pack, cleanPrize(body.prize)]);
    if (rows.length) return { code, hostToken: token };
  }
  fail(503, 'Gerade ist kein freier Spielcode verfügbar. Bitte erneut versuchen.');
}

async function join(query, room, body, now) {
  if (room.phase !== 'lobby') fail(409, 'Diese Runde läuft bereits. Ihr könnt zuschauen und bei der nächsten Runde als Team beitreten.');
  const name = cleanName(body.name), key = nameKey(name);
  if (!key) fail(400, 'Der Teamname braucht mindestens einen Buchstaben oder eine Zahl.');
  const avatar = body.avatar;
  if (!(AVATAR_IDS.has(avatar) || isUploadAvatar(avatar))) fail(400, 'Bitte ein Teambild auswählen.');
  const [{ n }] = await query('SELECT COUNT(*)::int AS n FROM teams WHERE room=$1', [room.code]);
  if (Number(n) >= MAX_TEAMS) fail(409, `Dieses Spiel ist voll (maximal ${MAX_TEAMS} Teams).`);
  const token = newToken(), id = randomUUID();
  const rows = await query(
    `INSERT INTO teams (id, room, name, name_key, secret, created, avatar) VALUES ($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT (room, name_key) DO NOTHING RETURNING id`, [id, room.code, name, key, sha(token), now, avatar]);
  if (!rows.length) fail(409, 'Diesen Teamnamen gibt es schon. Bitte einen anderen wählen.');
  return { token, id };
}

async function answer(query, room, team, body, now) {
  if (!team) fail(403, 'Bitte zuerst als Team beitreten.');
  if (room.phase !== 'question') fail(409, 'Für diese Frage werden keine Antworten mehr angenommen.');
  if (Number(body.q) !== room.q) fail(409, 'Diese Frage ist schon vorbei.');
  const choice = Number(body.choice);
  if (!Number.isInteger(choice) || choice < 0 || choice > 3) fail(400, 'Ungültige Antwort.');
  if (now < room.started) fail(409, 'Noch einen Moment – die Frage startet gleich.');
  if (now > room.started + timeFor(packOf(room), room.q) + ANSWER_GRACE_MS) fail(409, 'Die Zeit ist abgelaufen.');
  const pack = packOf(room), Q = PACKS[pack][room.q];
  const elapsed = Math.min(timeFor(packOf(room), room.q) - 1, Math.max(0, now - room.started));
  const points = choice === Q.correct ? pointsFor(pack, room.q, elapsed) : 0;
  const rows = await query(
    `INSERT INTO answers (id, room, team, q, choice, points, elapsed) VALUES ($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT (team, q) DO NOTHING RETURNING id`, [randomUUID(), room.code, team.id, room.q, choice, points, elapsed]);
  return { ok: true, saved: rows.length > 0 };
}

async function hostAction(query, room, action, body, now) {
  const expectQ = body.q === undefined ? room.q : Number(body.q);
  const expectPhase = body.phase || room.phase;
  // Double clicks / two host devices: only act on the state the host was looking at.
  const stale = expectQ !== room.q || expectPhase !== room.phase;
  switch (action) {
    case 'start': {
      if (room.phase !== 'lobby') return { ok: true };
      const [{ n }] = await query('SELECT COUNT(*)::int AS n FROM teams WHERE room=$1', [room.code]);
      if (!Number(n)) fail(409, 'Es ist noch kein Team beigetreten.');
      await query("UPDATE rooms SET phase='question', q=0, started=$2 WHERE code=$1 AND phase='lobby'", [room.code, now + GET_READY_MS]);
      return { ok: true };
    }
    case 'reveal':
      if (stale || room.phase !== 'question') return { ok: true };
      await query("UPDATE rooms SET phase='reveal' WHERE code=$1 AND phase='question' AND q=$2", [room.code, room.q]);
      return { ok: true };
    case 'next': {
      if (stale || room.phase !== 'reveal') return { ok: true };
      const total = PACKS[packOf(room)].length;
      if (room.q + 1 >= total) await query("UPDATE rooms SET phase='finished' WHERE code=$1 AND phase='reveal' AND q=$2", [room.code, room.q]);
      else await query("UPDATE rooms SET phase='question', q=q+1, started=$3 WHERE code=$1 AND phase='reveal' AND q=$2", [room.code, room.q, now + GET_READY_MS]);
      return { ok: true };
    }
    case 'restart': {
      const pack = body.pack === undefined ? packOf(room) : Number(body.pack);
      if (!Number.isInteger(pack) || !PACKS[pack]) fail(400, 'Bitte eine Mission auswählen.');
      await query('DELETE FROM answers WHERE room=$1', [room.code]);
      await query("UPDATE rooms SET phase='lobby', q=-1, started=0, quiz_version=$2, prize=$3 WHERE code=$1",
        [room.code, pack, body.prize === undefined ? room.prize : cleanPrize(body.prize)]);
      return { ok: true };
    }
    case 'settings': {
      if (room.phase !== 'lobby') fail(409, 'Mission und Preis lassen sich nur vor dem Start ändern.');
      const pack = body.pack === undefined ? packOf(room) : Number(body.pack);
      if (!Number.isInteger(pack) || !PACKS[pack]) fail(400, 'Bitte eine Mission auswählen.');
      await query('UPDATE rooms SET quiz_version=$2, prize=$3 WHERE code=$1', [room.code, pack, body.prize === undefined ? room.prize : cleanPrize(body.prize)]);
      return { ok: true };
    }
    case 'kick': {
      if (typeof body.team !== 'string') fail(400, 'Team fehlt.');
      await query('DELETE FROM teams WHERE room=$1 AND id=$2', [room.code, body.team]);
      return { ok: true };
    }
    case 'end':
      await query("UPDATE rooms SET phase='finished' WHERE code=$1", [room.code]);
      return { ok: true };
    default: fail(400, 'Unbekannte Aktion.');
  }
}

export async function handleGame(req, { query, ip, now = Date.now() }) {
  try {
    const url = new URL(req.url);
    if (req.method === 'GET') {
      const room = await loadRoom(query, (url.searchParams.get('room') || '').toUpperCase());
      if (url.searchParams.get('avatars') === '1') {
        const rows = await query("SELECT id, avatar FROM teams WHERE room=$1 AND avatar LIKE 'data:%'", [room.code]);
        const map = {}; for (const r of rows) if (isUploadAvatar(r.avatar)) map[r.id] = r.avatar;
        return json(200, { avatars: map });
      }
      return json(200, await state(query, room, req.headers, now));
    }
    if (req.method !== 'POST') return json(405, { error: 'Nicht erlaubt.' });
    const text = await req.text();
    if (text.length > 64000) fail(413, 'Die Anfrage ist zu groß.');
    let body; try { body = JSON.parse(text || '{}'); } catch { fail(400, 'Ungültige Anfrage.'); }
    if (!body || typeof body !== 'object') fail(400, 'Ungültige Anfrage.');
    const action = String(body.action || '');
    if (action === 'create') return json(200, await create(query, body, ip, now));
    const room = await loadRoom(query, String(body.room || '').toUpperCase());
    if (action === 'join') return json(200, await join(query, room, body, now));
    if (action === 'answer') return json(200, await answer(query, room, await loadTeam(query, room, req.headers), body, now));
    if (!isHost(room, req.headers)) fail(403, 'Nur die Spielleitung darf das.');
    return json(200, await hostAction(query, room, action, body, now));
  } catch (e) {
    if (e instanceof HttpError) return json(e.status, { error: e.message });
    console.error('game error', e);
    return json(500, { error: 'Die Verbindung zur Flotte ist gestört. Bitte gleich noch einmal versuchen.' });
  }
}
