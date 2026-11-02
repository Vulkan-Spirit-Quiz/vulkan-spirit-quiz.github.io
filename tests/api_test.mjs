// End-to-end API test against tests/server.mjs (real Postgres).
import assert from 'node:assert/strict';
import { PACKS } from '../lib/questions.mjs';
const B = 'http://localhost:' + (process.env.PORT || 8899);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const clock = ms => fetch(B + '/__clock?add=' + ms).then(r => r.text());
async function call(method, body, h = {}, qs = '') {
  const r = await fetch(B + '/api/game' + qs, { method, headers: { 'content-type': 'application/json', ...h }, body: method === 'POST' ? JSON.stringify(body) : undefined });
  return { status: r.status, body: await r.json() };
}
const get = (room, h) => call('GET', null, h, '?room=' + room);
const post = (body, h) => call('POST', body, h);
let passed = 0; const ok = (c, m) => { assert.ok(c, m); passed++; };

// create
let r = await post({ action: 'create', pack: 3, prize: '  Eine  Runde\u0000 Raktajino  ' }, { 'x-test-ip': '10.0.0.1' });
ok(r.status === 200 && /^[A-Z2-9]{6}$/.test(r.body.code) && /^[a-f0-9-]{72}$/.test(r.body.hostToken), 'create');
const code = r.body.code, H = { 'x-host-token': r.body.hostToken };
r = await get(code, H); ok(r.body.isHost && r.body.phase === 'lobby' && r.body.pack === 3 && r.body.total === 10 && r.body.prize === 'Eine Runde Raktajino', 'host state + prize cleaned');
ok((await get(code, {})).body.isHost === false, 'anonymous is not host');
ok((await get('ABCDEF', {})).status === 404, 'unknown room 404');
ok((await post({ action: 'create', pack: 11 })).status === 400, 'invalid pack rejected');
ok((await post({ action: 'start', room: code })).status === 403, 'start needs host');
ok((await post({ action: 'start', room: code }, H)).status === 409, 'cannot start without teams');

// join
const teams = [];
for (const [name, avatar] of [['Die Tribble-Bande', 'tribbles'], ['Q-Kontinuum', 'kirk'], ['Borg Kollektiv', 'borg']]) {
  r = await post({ action: 'join', room: code, name, avatar }); ok(r.status === 200 && r.body.token, 'join ' + name);
  teams.push({ name, T: { 'x-team-token': r.body.token }, id: r.body.id });
}
ok((await post({ action: 'join', room: code, name: 'die tribble bande!', avatar: 'spock' })).status === 409, 'duplicate name (normalized) rejected');
ok((await post({ action: 'join', room: code, name: 'X', avatar: 'spock' })).status === 400, 'short name rejected');
ok((await post({ action: 'join', room: code, name: 'Hacker', avatar: 'javascript:alert(1)' })).status === 400, 'bad avatar rejected');
const jpeg = 'data:image/jpeg;base64,/9j/' + 'A'.repeat(400);
r = await post({ action: 'join', room: code, name: 'Upload-Team', avatar: jpeg }); ok(r.status === 200, 'upload avatar accepted');
const upl = { T: { 'x-team-token': r.body.token }, id: r.body.id };
r = await get(code, upl.T); ok(r.body.me.name === 'Upload-Team' && r.body.me.avatar === 'upload', 'upload avatar is referenced, not inlined');
ok(!JSON.stringify(r.body).includes('/9j/'), 'state does not contain image data');
r = await call('GET', null, {}, '?room=' + code + '&avatars=1'); ok(r.body.avatars[upl.id] === jpeg, 'avatar map');
// kick
ok((await post({ action: 'kick', room: code, team: upl.id }, H)).status === 200, 'kick');
r = await get(code, upl.T); ok(r.body.me === null && r.body.teams.length === 3, 'kicked team gone');

// start
ok((await post({ action: 'start', room: code }, H)).status === 200, 'start');
r = await get(code, teams[0].T);
ok(r.body.phase === 'question' && r.body.q === 0 && !r.body.question.text, 'question hidden during get-ready');
ok((await post({ action: 'join', room: code, name: 'Zu spät', avatar: 'spock' })).status === 409, 'join blocked while running');
r = await post({ action: 'answer', room: code, q: 0, choice: 0 }, teams[0].T); ok(r.status === 409, 'answer before start rejected');
await clock(3100);

const pack = PACKS[3]; let expected = [0, 0, 0];
for (let q = 0; q < 10; q++) {
  r = await get(code, teams[0].T);
  ok(r.body.phase === 'question' && r.body.q === q && r.body.question.text === pack[q].text, 'question ' + (q + 1) + ' visible');
  ok(r.body.question.correct === undefined && r.body.question.explanation === undefined, 'answer not leaked during question');
  const correct = pack[q].correct, wrong = (correct + 1) % 4;
  // team0 always right quickly, team1 right on even questions, team2 never answers on q=4
  await clock(2000);
  r = await post({ action: 'answer', room: code, q, choice: correct }, teams[0].T); ok(r.body.saved, 'saved');
  r = await post({ action: 'answer', room: code, q, choice: wrong }, teams[0].T); ok(r.status === 200 && !r.body.saved, 'second answer ignored');
  await post({ action: 'answer', room: code, q, choice: q % 2 ? wrong : correct }, teams[1].T);
  ok((await post({ action: 'answer', room: code, q: q + 1, choice: 0 }, teams[1].T)).status === 409, 'answer for wrong question rejected');
  if (q !== 4) {
    await post({ action: 'answer', room: code, q, choice: wrong }, teams[2].T);
    r = await get(code, H); ok(r.body.phase === 'reveal', 'auto reveal when all answered');
  } else {
    r = await get(code, H); ok(r.body.phase === 'question' && r.body.answeredCount === 2, 'still open while a team is missing');
    await clock(24000); r = await post({ action: 'answer', room: code, q, choice: correct }, teams[2].T); ok(r.status === 409, 'late answer rejected');
    r = await get(code, H); ok(r.body.phase === 'reveal', 'auto reveal after timeout');
  }
  const mult = pack[q].hard ? 2.5 : 1, hi = Math.round((500 + 500 * (1 - 2000 / 25000)) * mult), lo = Math.round((500 + 500 * (1 - 4500 / 25000)) * mult);
  r = await get(code, teams[0].T);
  const pts = r.body.answer.points;
  ok(r.body.question.correct === correct && pts <= hi && pts >= lo, `reveal points ${pts} in [${lo},${hi}]`);
  expected[0] += pts;
  if (q % 2 === 0) { const t1 = r.body.teams.find(t => t.name === 'Q-Kontinuum'); ok(t1.last >= lo && t1.last <= hi, 'team1 points'); expected[1] += t1.last; }
  ok(r.body.stats.reduce((a, b) => a + b, 0) === (q === 4 ? 2 : 3), 'answer stats');
  const sc = Object.fromEntries(r.body.teams.map(t => [t.name, t.score]));
  ok(sc['Die Tribble-Bande'] === expected[0] && sc['Q-Kontinuum'] === expected[1] && sc['Borg Kollektiv'] === 0, 'scores ' + JSON.stringify(sc));
  // double "next" from two host tabs must advance only once
  const [a, b] = await Promise.all([post({ action: 'next', room: code, q, phase: 'reveal' }, H), post({ action: 'next', room: code, q, phase: 'reveal' }, H)]);
  ok(a.status === 200 && b.status === 200, 'next');
  r = await get(code, H);
  if (q < 9) { ok(r.body.q === q + 1 && r.body.phase === 'question', 'advanced exactly once'); await clock(3100); }
  else ok(r.body.phase === 'finished', 'finished');
}
r = await get(code, teams[0].T); ok(r.body.me.rank === 1 && r.body.teams[0].score === expected[0], 'final ranking');
ok(expected[0] <= 10 * 2500, 'within limits');
// restart with same teams
ok((await post({ action: 'restart', room: code, pack: 10 }, H)).status === 200, 'restart');
r = await get(code, teams[1].T); ok(r.body.phase === 'lobby' && r.body.total === 5 && r.body.teams.every(t => t.score === 0) && r.body.me.name === 'Q-Kontinuum', 'restart keeps teams, resets scores, pack 10');
// settings in lobby
ok((await post({ action: 'settings', room: code, pack: 7, prize: 'Tribble' }, H)).status === 200, 'settings');
r = await get(code, H); ok(r.body.pack === 7 && r.body.prize === 'Tribble', 'settings applied');
// end
ok((await post({ action: 'end', room: code }, H)).status === 200 && (await get(code, H)).body.phase === 'finished', 'end');
// garbage input
ok((await call('POST', null, {}, '')).status === 400, 'empty body');
r = await fetch(B + '/api/game', { method: 'POST', body: '{bad json' }); ok(r.status === 400, 'bad json');
ok((await post({ action: 'answer', room: code, q: 0, choice: 1 }, { 'x-team-token': 'x'.repeat(72) })).status === 403, 'fake team token');
ok((await post({ action: 'next', room: code }, { 'x-host-token': 'a'.repeat(72) })).status === 403, 'fake host token');
// rate limit
let last; for (let i = 0; i < 21; i++) last = await post({ action: 'create', pack: 0 }, { 'x-test-ip': '10.9.9.9' });
ok(last.status === 429, 'rate limit');
console.log('API test passed:', passed, 'checks');
