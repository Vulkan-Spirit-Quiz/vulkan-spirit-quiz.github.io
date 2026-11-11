// Vulkan Spirit Quiz – game engine for the browser of the Spielleitung (GitHub Pages / no server).
// Same rules and answers as lib/game.mjs, but the room lives in this browser (localStorage) and teams
// talk to it peer-to-peer. request() mirrors the /api/game endpoint: { status, body }.
import { PACKS, MISSIONS, GET_READY_MS, pointsFor, timeFor } from './questions.mjs';
import { AVATAR_IDS, isUploadAvatar, DEFAULT_PRIZE } from './shared.mjs';

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const MAX_TEAMS = 40;
const ROOM_TTL_MS = 48 * 3600 * 1000;
const REVEAL_GRACE_MS = 600;
const ANSWER_GRACE_MS = 800;
const KEY = 'vs-room-';
const TOKEN_RE = /^[a-f0-9-]{72}$/;
const CODE_RE = /^[A-Z2-9]{6}$/;

class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
const fail = (status, message) => { throw new HttpError(status, message); };
const uuid = () => crypto.randomUUID();
const newToken = () => uuid() + uuid();
const randomInt = n => crypto.getRandomValues(new Uint32Array(1))[0] % n;

const storage = {
  get(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* full or private mode: game still runs in memory */ } },
  del(k) { try { localStorage.removeItem(k); } catch { /* */ } }
};

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
const validPack = p => Number.isInteger(p) && !!PACKS[p];
const avatarRef = a => (AVATAR_IDS.has(a) ? a : isUploadAvatar(a) ? 'upload' : 'spock');

/** Rooms hosted by this browser. */
export function hostedRoom(code) { return CODE_RE.test(code || '') ? storage.get(KEY + code) : null; }

export function createRoom({ pack, prize, solo = false }, now = Date.now()) {
  pack = Number(pack);
  if (!validPack(pack)) fail(400, 'Bitte eine Mission auswählen.');
  try { // forget rooms older than 48 h
    for (const k of Object.keys(localStorage)) if (k.startsWith(KEY) && (storage.get(k)?.created || 0) < now - ROOM_TTL_MS) storage.del(k);
  } catch { /* */ }
  let code;
  do { code = ''; for (let i = 0; i < 6; i++) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]; } while (hostedRoom(code));
  const hostToken = newToken();
  storage.set(KEY + code, { code, hostToken, phase: 'lobby', q: -1, started: 0, created: now, pack, prize: cleanPrize(prize), solo: !!solo, teams: [], answers: [] });
  return { code, hostToken };
}

export class Engine {
  constructor(code) {
    this.room = hostedRoom(code);
    if (!this.room) fail(404, 'Dieses Spiel gibt es nicht (mehr). Bitte den Code prüfen.');
  }
  save() { storage.set(KEY + this.room.code, this.room); }
  isHost(h) { return TOKEN_RE.test(h['x-host-token'] || '') && h['x-host-token'] === this.room.hostToken; }
  team(h) { const t = h['x-team-token'] || ''; return TOKEN_RE.test(t) ? this.room.teams.find(x => x.secret === t) || null : null; }

  autoReveal(now, answered) {
    const R = this.room;
    if (R.phase !== 'question') return;
    if (now >= R.started + timeFor(R.pack, R.q) + REVEAL_GRACE_MS || (R.teams.length > 0 && answered >= R.teams.length && now >= R.started)) {
      R.phase = 'reveal'; this.save();
    }
  }

  state(h, now) {
    const R = this.room, host = this.isHost(h), me = this.team(h), questions = PACKS[R.pack];
    const teams = R.teams.map(t => {
      const mine = R.answers.filter(a => a.team === t.id), cur = mine.find(a => a.q === R.q);
      return { id: t.id, name: t.name, avatar: avatarRef(t.avatar), created: t.created, score: mine.reduce((n, a) => n + a.points, 0), answered: !!cur, last: cur ? cur.points : null };
    }).sort((a, b) => b.score - a.score || a.created - b.created);
    const answered = teams.filter(t => t.answered).length;
    this.autoReveal(now, answered);
    const out = {
      code: R.code, phase: R.phase, q: R.q, total: questions.length, pack: R.pack,
      mission: MISSIONS[R.pack].name, prize: R.prize || DEFAULT_PRIZE, solo: !!R.solo,
      started: R.started, deadline: R.started + timeFor(R.pack, R.q), serverNow: now,
      isHost: host, answeredCount: answered,
      teams: teams.map(({ created, ...t }) => t),
      me: null, answer: null, question: null, stats: null
    };
    if (me) {
      const idx = out.teams.findIndex(t => t.id === me.id);
      out.me = { id: me.id, name: me.name, avatar: avatarRef(me.avatar), score: idx >= 0 ? out.teams[idx].score : 0, rank: idx + 1 };
    }
    if ((R.phase === 'question' || R.phase === 'reveal') && R.q >= 0 && questions[R.q]) {
      const Q = questions[R.q];
      const visible = R.phase === 'reveal' || host || now >= R.started - 250;
      out.question = { number: R.q + 1, theme: Q.theme, themeEn: Q.themeEn, hard: Q.hard, multiplier: Q.hard ? 2.5 : 1 };
      if (visible) Object.assign(out.question, { text: Q.text, options: Q.options, image: Q.image, audio: Q.audio || null, seconds: Q.seconds, en: { text: Q.en.text, options: Q.en.options } });
      if (R.phase === 'reveal') {
        Object.assign(out.question, { correct: Q.correct, explanation: Q.explanation });
        out.question.en.explanation = Q.en.explanation;
        out.stats = [0, 0, 0, 0]; for (const a of R.answers) if (a.q === R.q) out.stats[a.choice]++;
      }
      if (me) {
        const a = R.answers.find(x => x.team === me.id && x.q === R.q);
        if (a) out.answer = R.phase === 'reveal' ? { choice: a.choice, points: a.points } : { choice: a.choice };
      }
    }
    return out;
  }

  join(body, now) {
    const R = this.room;
    if (R.phase !== 'lobby') fail(409, 'Diese Runde läuft bereits. Ihr könnt zuschauen und bei der nächsten Runde als Team beitreten.');
    const name = cleanName(body.name), key = nameKey(name);
    if (!key) fail(400, 'Der Teamname braucht mindestens einen Buchstaben oder eine Zahl.');
    if (!(AVATAR_IDS.has(body.avatar) || isUploadAvatar(body.avatar))) fail(400, 'Bitte ein Teambild auswählen.');
    if (R.teams.length >= MAX_TEAMS) fail(409, `Dieses Spiel ist voll (maximal ${MAX_TEAMS} Teams).`);
    if (R.teams.some(t => t.nameKey === key)) fail(409, 'Diesen Teamnamen gibt es schon. Bitte einen anderen wählen.');
    const token = newToken(), id = uuid();
    R.teams.push({ id, name, nameKey: key, secret: token, created: now, avatar: body.avatar });
    this.save();
    return { token, id };
  }

  answer(team, body, now) {
    const R = this.room;
    if (!team) fail(403, 'Bitte zuerst als Team beitreten.');
    if (R.phase !== 'question') fail(409, 'Für diese Frage werden keine Antworten mehr angenommen.');
    if (Number(body.q) !== R.q) fail(409, 'Diese Frage ist schon vorbei.');
    const choice = Number(body.choice);
    if (!Number.isInteger(choice) || choice < 0 || choice > 3) fail(400, 'Ungültige Antwort.');
    if (now < R.started) fail(409, 'Noch einen Moment – die Frage startet gleich.');
    if (now > R.started + timeFor(R.pack, R.q) + ANSWER_GRACE_MS) fail(409, 'Die Zeit ist abgelaufen.');
    if (R.answers.some(a => a.team === team.id && a.q === R.q)) return { ok: true, saved: false };
    const elapsed = Math.min(timeFor(R.pack, R.q) - 1, Math.max(0, now - R.started));
    const points = choice === PACKS[R.pack][R.q].correct ? pointsFor(R.pack, R.q, elapsed) : 0;
    R.answers.push({ team: team.id, q: R.q, choice, points, elapsed });
    this.save();
    return { ok: true, saved: true };
  }

  hostAction(action, body, now) {
    const R = this.room;
    const expectQ = body.q === undefined ? R.q : Number(body.q);
    const stale = expectQ !== R.q || (body.phase || R.phase) !== R.phase;
    const packArg = () => { const p = body.pack === undefined ? R.pack : Number(body.pack); if (!validPack(p)) fail(400, 'Bitte eine Mission auswählen.'); return p; };
    switch (action) {
      case 'start':
        if (R.phase !== 'lobby') break;
        if (!R.teams.length) fail(409, 'Es ist noch kein Team beigetreten.');
        Object.assign(R, { phase: 'question', q: 0, started: now + GET_READY_MS });
        break;
      case 'reveal':
        if (!stale && R.phase === 'question') R.phase = 'reveal';
        break;
      case 'next':
        if (stale || R.phase !== 'reveal') break;
        if (R.q + 1 >= PACKS[R.pack].length) R.phase = 'finished';
        else Object.assign(R, { phase: 'question', q: R.q + 1, started: now + GET_READY_MS });
        break;
      case 'restart': {
        const pack = packArg();
        Object.assign(R, { answers: [], phase: 'lobby', q: -1, started: 0, pack, prize: body.prize === undefined ? R.prize : cleanPrize(body.prize) });
        break;
      }
      case 'settings': {
        if (R.phase !== 'lobby') fail(409, 'Mission und Preis lassen sich nur vor dem Start ändern.');
        Object.assign(R, { pack: packArg(), prize: body.prize === undefined ? R.prize : cleanPrize(body.prize) });
        break;
      }
      case 'kick':
        if (typeof body.team !== 'string') fail(400, 'Team fehlt.');
        R.teams = R.teams.filter(t => t.id !== body.team);
        R.answers = R.answers.filter(a => a.team !== body.team);
        break;
      case 'end':
        R.phase = 'finished';
        break;
      default: fail(400, 'Unbekannte Aktion.');
    }
    this.save();
    return { ok: true };
  }

  /** { method: 'GET'|'POST', params: {avatars}, body, headers } → { status, body } */
  request({ method, params = {}, body = {}, headers = {} }, now = Date.now()) {
    try {
      if (method === 'GET') {
        if (params.avatars) {
          const avatars = {}; for (const t of this.room.teams) if (isUploadAvatar(t.avatar)) avatars[t.id] = t.avatar;
          return { status: 200, body: { avatars } };
        }
        return { status: 200, body: this.state(headers, now) };
      }
      if (!body || typeof body !== 'object') fail(400, 'Ungültige Anfrage.');
      const action = String(body.action || '');
      if (action === 'join') return { status: 200, body: this.join(body, now) };
      if (action === 'answer') return { status: 200, body: this.answer(this.team(headers), body, now) };
      if (!this.isHost(headers)) fail(403, 'Nur die Spielleitung darf das.');
      return { status: 200, body: this.hostAction(action, body, now) };
    } catch (e) {
      if (e instanceof HttpError) return { status: e.status, body: { error: e.message } };
      console.error('engine error', e);
      return { status: 500, body: { error: 'Die Verbindung zur Flotte ist gestört. Bitte gleich noch einmal versuchen.' } };
    }
  }
}
