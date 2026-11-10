// Vulkan Spirit Quiz – browser app (no build step, no dependencies)
import { MISSIONS, THEME_COLORS, AVATARS, AVATAR_GROUPS, DEFAULT_PRIZE, QUESTION_SECONDS } from './shared.mjs';
import { qrSvg } from './qr.mjs';
import { detectMode, serverTransport, localTransport, peerTransport, claimHost, warmUp } from './net.mjs';

const $app = document.getElementById('app');
const BASE = new URL('.', location.href).href.replace(/[?#].*$/, ''); // works at / and at /repo-name/
const params = new URLSearchParams(location.search);
const ROOM = (params.get('room') || '').toUpperCase().replace(/[^A-Z2-9]/g, '').slice(0, 6);
const SCREEN = params.get('screen') === '1';
const FORCE_TEAM = params.get('team') === '1';
const LETTERS = ['A', 'B', 'C', 'D'];
const AV = Object.fromEntries(AVATARS.map(a => [a.id, a]));
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
// Android TV app (its WebView adds "VulkanSpiritTV" to the user agent) or ?tv=1: remote-control mode
const TV = (() => {
  try { if (params.get('tv') === '1') sessionStorage.setItem('vs-tv', '1'); } catch { /* */ }
  try { if (sessionStorage.getItem('vs-tv') === '1') return true; } catch { /* */ }
  return /VulkanSpiritTV/.test(navigator.userAgent);
})();
if (TV) document.documentElement.classList.add('tv');

const store = {
  get(k) { try { return localStorage.getItem(k) || ''; } catch { return ''; } },
  set(k, v) { try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch { /* private mode */ } }
};
// Host link: /?room=CODE#host=TOKEN  → remember the token on this device and clean the URL.
{
  const h = new URLSearchParams(location.hash.slice(1)).get('host');
  if (h && /^[a-f0-9-]{72}$/.test(h) && ROOM) { store.set('warp-host-' + ROOM, h); store.set('warp-last-host', ROOM); }
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
}

const S = {
  data: null, offset: 0, online: true, error: '', busy: false, toast: '',
  hostToken: ROOM && !FORCE_TEAM ? store.get('warp-host-' + ROOM) : '',
  teamToken: ROOM ? store.get('warp-team-' + ROOM) : '',
  avatars: {}, avatarFetch: 0,
  join: { name: '', avatar: '', group: 'crew', upload: '' },
  home: { pack: 0, prize: DEFAULT_PRIZE, code: '', solo: '' },
  restartPack: null, lastHtml: '', kicked: false, confirmEnd: false,
  settingsOpen: false, lobbyPack: null, lobbyPrize: null
};
const now = () => Date.now() + S.offset;
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = n => Number(n || 0).toLocaleString('de-AT');
const role = () => (SCREEN ? 'screen' : S.data?.solo ? 'team' : S.data?.isHost ? 'host' : 'team');

// ---------- network ----------
let NET = null; // transport from net.mjs: server (Netlify), local (this browser hosts) or peer (team device)
let MODE = 'p2p';
function headers() {
  const h = {};
  if (S.teamToken) h['x-team-token'] = S.teamToken;
  if (S.hostToken) h['x-host-token'] = S.hostToken;
  return h;
}
let polling = false;
async function poll() {
  if (!ROOM || polling || !NET) return;
  polling = true;
  const t0 = Date.now(), sent = headers();
  try {
    const d = await NET.request('GET', { room: ROOM }, null, sent);
    const t1 = Date.now();
    S.offset = d.serverNow - (t0 + t1) / 2;
    if ((sent['x-team-token'] || '') !== S.teamToken || (sent['x-host-token'] || '') !== S.hostToken) { setTimeout(poll); return; } // tokens changed meanwhile
    if (S.teamToken && !d.me && !d.isHost) { // team was removed by the host
      S.teamToken = ''; store.set('warp-team-' + ROOM, ''); S.kicked = true;
    }
    if (S.hostToken && !d.isHost) { S.hostToken = ''; store.set('warp-host-' + ROOM, ''); }
    if (d.isHost) store.set('warp-last-host', ROOM);
    S.data = d; S.online = true; if (S.pollError) { S.error = ''; S.pollError = false; }
    if (d.solo && d.isHost && d.phase === 'lobby' && !S.busy) setTimeout(() => act('start'));
    const missing = d.teams.filter(t => t.avatar === 'upload' && !S.avatars[t.id]);
    if (missing.length && Date.now() - S.avatarFetch > 4000) loadAvatars();
  } catch (e) {
    S.online = false;
    if (e.status === 404) { S.error = e.message; S.pollError = true; S.data = null; }
    else if (NET.kind === 'peer' && NET.hostMissing() && !S.data) { S.pollError = true; S.error = `Unter dem Code ${ROOM} antwortet gerade keine Spielleitung. Bitte den Code prüfen – und das Quiz muss auf dem Gerät der Spielleitung geöffnet sein. Wir versuchen es weiter …`; }
  } finally { polling = false; render(); }
}
async function loadAvatars() {
  S.avatarFetch = Date.now();
  try { const r = await NET.request('GET', { room: ROOM, avatars: '1' }, null, {}); Object.assign(S.avatars, r.avatars); render(true); } catch { /* retry later */ }
}
async function act(action, extra = {}) {
  if (S.busy) return null;
  S.busy = true; S.error = ''; render(true);
  try {
    const body = { action, room: ROOM, q: S.data?.q, phase: S.data?.phase, ...extra };
    return await NET.request('POST', {}, body, headers());
  } catch (e) { const m = S.error = e.message; setTimeout(() => { if (S.error === m) { S.error = ''; render(true); } }, 7000); return null; } finally { S.busy = false; await poll(); }
}

// ---------- helpers ----------
function avatarHtml(ref, teamId, size = 'm') {
  if (ref === 'upload') {
    const src = S.avatars[teamId];
    return `<span class="av av-${size}">${src ? `<img src="${esc(src)}" alt="">` : '<span class="av-emoji">🖖</span>'}</span>`;
  }
  const a = AV[ref] || AV.spock;
  if (a.image) return `<span class="av av-${size}"><img src="${a.image}" alt="" loading="lazy"></span>`;
  return `<span class="av av-${size}" style="background:${a.bg}"><span class="av-emoji">${a.emoji}</span></span>`;
}
const joinUrl = () => `${BASE}?room=${ROOM}`;
const hostUrl = () => `${BASE}?room=${ROOM}#host=${S.hostToken}`;
async function copy(text, okMsg) {
  try { await navigator.clipboard.writeText(text); toast(okMsg); }
  catch { window.prompt('Bitte kopieren:', text); }
}
let toastTimer;
function toast(msg) { S.toast = msg; render(true); clearTimeout(toastTimer); toastTimer = setTimeout(() => { S.toast = ''; render(true); }, 2600); }
function download(name, blob) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.append(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
async function saveQr() {
  const svg = qrSvg(joinUrl(), { margin: 4 });
  const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); await img.decode();
  const c = document.createElement('canvas'); c.width = c.height = 1024; const g = c.getContext('2d');
  g.imageSmoothingEnabled = false; g.drawImage(img, 0, 0, 1024, 1024);
  c.toBlob(b => download(`Vulkan-Spirit-Quiz-${ROOM}.png`, b), 'image/png');
}
function ranked(teams) { // shared places for equal scores
  let place = 0, prev = null;
  return teams.map((t, i) => { if (t.score !== prev) { place = i + 1; prev = t.score; } return { ...t, place }; });
}
function winners(teams) { return teams.length && teams[0].score > 0 ? teams.filter(t => t.score === teams[0].score) : []; }
function csv() {
  const d = S.data, rows = [['Platz', 'Team', 'Punkte']].concat(ranked(d.teams).map(t => [t.place, t.name, t.score]));
  const text = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\r\n');
  download(`Vulkan-Spirit-Quiz-${ROOM}-Ergebnis.csv`, new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8' }));
}
function diploma(team) {
  const d = S.data, w = window.open('', '_blank');
  if (!w) { toast('Bitte Pop-ups für das Diplom erlauben.'); return; }
  const date = new Date().toLocaleDateString('de-AT', { day: 'numeric', month: 'long', year: 'numeric' });
  w.document.write(`<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Siegerdiplom – ${esc(team.name)}</title>
<style>@font-face{font-family:Antonio;src:url(${BASE}fonts/antonio.woff2)}@page{size:A4 landscape;margin:0}
body{margin:0;font-family:Georgia,serif;background:#fff;color:#1b1b2b}.d{box-sizing:border-box;width:297mm;height:210mm;padding:18mm;border:6mm solid #c9a227;outline:2mm solid #1b2a4a;outline-offset:-10mm;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
h1{font-family:Antonio,'Arial Narrow',sans-serif;letter-spacing:.14em;font-size:42pt;margin:4mm 0 2mm;color:#1b2a4a}.t{font-size:34pt;font-weight:bold;margin:6mm 0;color:#8a5a00}.s{font-size:15pt;line-height:1.6}img{height:40mm}
.f{margin-top:10mm;font-size:11pt;color:#555}</style></head><body><div class="d"><img src="${BASE}logo.png" alt="">
<h1>SIEGERDIPLOM</h1><div class="s">Das Team</div><div class="t">${esc(team.name)}</div>
<div class="s">gewinnt die Mission <b>${esc(d.mission)}</b> des Vulkan Spirit Quiz<br>mit <b>${fmt(team.score)} Punkten</b>.<br>Preis: <b>${esc(d.prize)}</b></div>
<div class="f">${date} · Live long and quiz. 🖖</div></div><script>onload=()=>setTimeout(()=>print(),300)<\/script></body></html>`);
  w.document.close();
}
async function onUpload(file) {
  if (!file) return;
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 10 * 1024 * 1024) { S.error = 'Bitte JPG, PNG oder WebP mit maximal 10 MB wählen.'; render(true); return; }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image(); img.src = url; await img.decode();
    const c = document.createElement('canvas'); c.width = c.height = 160; const g = c.getContext('2d');
    g.fillStyle = '#10182a'; g.fillRect(0, 0, 160, 160);
    const s = Math.max(160 / img.width, 160 / img.height); // cover: fill the circle
    g.drawImage(img, (160 - img.width * s) / 2, (160 - img.height * s) / 2, img.width * s, img.height * s);
    let q = .85, data = c.toDataURL('image/jpeg', q);
    while (data.length > 32000 && q > .3) { q -= .1; data = c.toDataURL('image/jpeg', q); }
    if (data.length > 32000) throw new Error();
    S.join.upload = data; S.join.avatar = 'upload'; S.error = '';
  } catch { S.error = 'Das Bild konnte nicht gelesen werden. Bitte ein anderes wählen.'; }
  finally { URL.revokeObjectURL(url); render(true); }
}
const GOOD = ['Spock hebt eine Augenbraue. Mehr Lob geht kaum.', 'Euer Wissen hat gerade Warp 9 erreicht.', 'Data rechnet nach: ziemlich brillant.', 'Scotty: Für diese Antwort ist genug Energie da.', 'Make it so – und ihr habt es so gemacht.'];
const BAD = ['Picard braucht kurz einen Moment. Dann geht’s weiter.', 'Die Antwort ist im Transporterpuffer verschwunden.', 'Der Universalübersetzer war heute wohl im Urlaub.', 'Keine Sorge: Auch die Enterprise verfliegt sich mal.', 'Das war kein Fehler. Das war eine alternative Zeitlinie.'];

// ---------- view parts ----------
// LCARS frame: header with elbow + logo, and a side column with live status blocks (hidden on phones)
function header(extra = '') {
  const offline = ROOM && S.data && !S.online ? '<span class="pill warn">Verbinde …</span>' : '';
  return `<header class="lc-head"><div class="lc-elbow"><a class="lc-logo" href="./" aria-label="Startseite"><img src="logo.webp" alt="Vulkan Spirit" width="74" height="67"></a></div>
   <div class="lc-headbody"><div class="lc-titlerow">${extra}${offline}<a class="lc-title" href="./">Vulkan Spirit Quiz</a></div>
   <div class="lc-bar" aria-hidden="true"><i>${stardate()}</i><i></i><i>VS-1701</i><i></i><i></i></div></div></header>${side()}`;
}
// Decorative stardate: 1000 units per year (changes every ~50 minutes, so it doesn't force re-renders)
function stardate() { const d = new Date(), y0 = Date.UTC(d.getUTCFullYear(), 0, 1); return 'SD ' + ((d.getUTCFullYear() - 2000) * 1000 + (Date.now() - y0) / 31557600).toFixed(1); }
function side() { // in a game: live status; on the start page: plain colour blocks
  const d = S.data;
  const phase = !d ? '' : d.phase === 'lobby' ? 'Wartet auf Start' : d.phase === 'question' ? `Frage ${d.q + 1}/${d.total}` : d.phase === 'reveal' ? 'Auflösung' : 'Endstand';
  const blocks = d
    ? [['c2', 'Code ' + d.code], ['c4', d.mission], ['c3', `${d.teams.length} ${d.teams.length === 1 ? 'Team' : 'Teams'}`], ['c5', phase]]
    : [['c2', ''], ['c4', ''], ['c3', ''], ['c5', '']];
  const nums = ['02-4719', '47-0815', '03-1966', '74-6560'];
  return `<aside class="lc-side" aria-hidden="true"><div class="lc-elbow2"></div>${blocks.map(([c, t], i) => `<div class="lc-block ${c}" data-n="${nums[i]}">${esc(t)}</div>`).join('')}<div class="lc-block c1 grow"></div></aside>`;
}
function missionCard(i, selected, name = 'pack') {
  const m = MISSIONS[i];
  return `<label class="mission ${selected ? 'sel' : ''}"><input type="radio" name="${name}" value="${i}" ${selected ? 'checked' : ''}>
  <img src="${m.image}" alt="" loading="lazy"><span class="mname">${esc(m.name)}</span>
  <span class="minfo">${m.finale ? '5 Bonusfragen · inkl. Musikfrage' : '9 Fragen + 1 Knackfrage mit 2,5×'}</span></label>`;
}
function timerHtml(d) {
  return `<div class="timer" data-timer><span data-sec>${Math.round((d.deadline - d.started) / 1000)}</span><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17"/><circle data-ring cx="20" cy="20" r="17"/></svg></div>`;
}
function questionHead(d) {
  const Q = d.question, col = THEME_COLORS[Q.theme] || ['#9fd', '#a8f'];
  return `<div class="qhead" style="--c1:${col[0]};--c2:${col[1]}"><span class="theme">${esc(Q.theme)}</span>
   <span class="qnum">Frage ${d.q + 1} von ${d.total}</span>${Q.hard ? '<span class="hard">KNACKFRAGE · 2,5× PUNKTE</span>' : ''}
   ${Q.audio ? `<span class="hard music-tag">♫ MUSIKFRAGE · ${Q.seconds || QUESTION_SECONDS} SEKUNDEN</span>` : ''}</div>${musicControls(d)}`;
}

// ---------- music question ----------
// The theme plays where the quiz is shown (host, projector screen, solo) – never on the team phones.
const music = { el: null, src: '', blocked: false, muted: false };
const musicHere = d => !!d?.question?.audio && (d.phase === 'question' || d.phase === 'reveal') && (role() === 'host' || role() === 'screen' || d.solo);
function syncMusic() {
  const d = S.data;
  if (!musicHere(d)) {
    if (music.el) { music.el.pause(); music.el = null; music.src = ''; music.blocked = false; render(true); }
    return;
  }
  const src = d.question.audio;
  if (music.src !== src) {
    music.el = new Audio(src); music.src = src; music.el.preload = 'auto'; music.muted = false;
    music.el.onplay = music.el.onpause = music.el.onended = () => render(true);
  }
  if (now() >= d.started && music.el.paused && !music.el.ended && !music.muted && !music.blocked) {
    music.el.play().catch(() => { music.blocked = true; render(true); }); // browser wants a click first
  }
}
function musicControls(d) {
  if (!musicHere(d)) return '';
  const playing = music.el && !music.el.paused;
  const label = playing ? '⏸ Musik pausieren' : music.el?.ended ? '↺ Musik nochmal' : '▶ Musik abspielen';
  return `<div class="row music-bar"><button class="btn${playing ? '' : ' primary'}" data-act="music">${label}</button>
    ${music.blocked && !playing ? '<span class="muted small">Der Browser hat die Musik angehalten – bitte einmal tippen.</span>' : ''}</div>`;
}
function toggleMusic() {
  if (!music.el) return;
  if (!music.el.paused) { music.muted = true; music.el.pause(); return; }
  music.muted = false; music.blocked = false;
  if (music.el.ended) music.el.currentTime = 0;
  music.el.play().catch(() => { music.blocked = true; render(true); });
}
function progress(d) {
  const p = Math.max(0, d.q + (d.phase === 'reveal' ? 1 : 0)) / d.total * 100;
  return `<div class="progress" aria-label="Missionsfortschritt"><span style="width:${p}%"></span></div>`;
}
function optionsHtml(d, interactive) {
  const Q = d.question, reveal = d.phase === 'reveal', mine = d.answer?.choice;
  return `<div class="options">${Q.options.map((o, i) => {
    const cls = ['opt', 'o' + i];
    if (reveal && i === Q.correct) cls.push('right'); else if (reveal) cls.push('dim');
    if (mine === i) cls.push('mine');
    if (reveal && mine === i && i !== Q.correct) cls.push('wrong');
    const stat = reveal && d.stats && !d.solo ? `<span class="stat">${d.stats[i]} ${d.stats[i] === 1 ? 'Team' : 'Teams'}</span>` : '';
    const dis = !interactive || mine != null ? 'disabled' : '';
    return `<button class="${cls.join(' ')}" data-choice="${i}" ${dis}><b>${LETTERS[i]}</b><span>${esc(o)}</span>${stat}</button>`;
  }).join('')}</div>`;
}
function picture(Q) { return Q.image ? `<button class="qimg" data-zoom><img src="${Q.image}" alt="Fragenbild"><span>🔍</span></button>` : ''; }
function scoreList(d, max = 99, showLast = false) {
  const list = ranked(d.teams).slice(0, max);
  if (!list.length) return '<p class="muted">Noch keine Teams.</p>';
  return `<ol class="scores">${list.map(t => `<li class="${d.me?.id === t.id ? 'me' : ''}"><span class="place">${t.place}</span>${avatarHtml(t.avatar, t.id, 's')}<span class="tname">${esc(t.name)}</span>
   ${showLast && t.last != null ? `<span class="last ${t.last > 0 ? 'plus' : ''}">${t.last > 0 ? '+' + fmt(t.last) : '±0'}</span>` : ''}<span class="pts">${fmt(t.score)}</span></li>`).join('')}</ol>`;
}
function countdownBlock(d) {
  const pre = now() < d.started;
  return pre ? `<div class="getready"><span>Achtung, Brücke …</span><b data-pre>3</b></div>` : '';
}

// HOME ---------------------------------------------------
function viewHome() {
  const last = store.get('warp-last-host'), H = S.home;
  return `${header()}<main class="home">
  <section class="hero"><img src="logo.webp" alt="Vulkan Spirit Wappen" width="230" height="207" fetchpriority="high"><div><h1><span>Wissen · die letzte Grenze</span>Vulkan Spirit Quiz</h1>
    <p>Das Star-Trek-Quiz der Vulkan Spirit Crew für Conventions und Fan-Abende: Crews treten gegeneinander an, sammeln Punkte und holen sich die Belohnung. QR-Code scannen, Teamname eingeben, los geht’s – ohne Anmeldung, ohne App.</p></div></section>
  <section class="card join-card tv-hide"><h2>An Bord kommen</h2>
    <form data-form="code"><input name="code" data-code inputmode="text" autocomplete="off" autocapitalize="characters" maxlength="6" placeholder="SPIELCODE" value="${esc(H.code)}" aria-label="Sechsstelliger Spielcode">
    <button class="btn primary">Beitreten →</button></form>${S.error ? `<p class="err">${esc(S.error)}</p>` : ''}</section>
  <section class="card"><h2>Brücke übernehmen</h2><p class="muted">Schiff wählen – jede Mission enthält Fragen aus allen zehn Themenbereichen.</p>
    <div class="missions" data-group="home-pack">${MISSIONS.map((_, i) => missionCard(i, i === H.pack)).join('')}</div>
    <label class="field">Belohnung für die Siegercrew<input data-prize maxlength="80" value="${esc(H.prize)}"></label>
    <button class="btn primary big" data-act="create" ${S.busy ? 'disabled' : ''}>Mission eröffnen →</button>
    ${last ? `<p><a class="btn ghost" href="./?room=${esc(last)}">Zurück zur Mission ${esc(last)}</a></p>` : ''}</section>
  <section class="card solo-card"><h2>Holodeck-Training</h2><p class="muted">Gerade keine Crews da? Spiel die oben gewählte Mission allein auf diesem Gerät – mit Countdown, Punkten und Auflösung.</p>
    <label class="field">Dein Name<input data-soloname maxlength="24" autocomplete="off" placeholder="z. B. Kadett Kirk" value="${esc(H.solo)}"></label>
    <button class="btn big" data-act="solo" ${S.busy ? 'disabled' : ''}>Training starten →</button></section>
  ${footer()}</main>`;
}
function footer() {
  return `<footer><div class="lc-foot" aria-hidden="true"><i></i><i></i><i></i></div><a href="fragenquellen.html">Fragen &amp; Quellen</a> · <a href="bildquellen.html">Bild- &amp; Schriftquellen</a><br>
  Inoffizielles Fanprojekt von Vulkan Spirit. Star Trek ist eine Marke von Paramount/CBS.</footer>`;
}

// HOST + SCREEN --------------------------------------------
function viewLobbyShared(d, host) {
  const qr = qrSvg(joinUrl());
  return `<section class="lobby ${host ? '' : 'screen-lobby'}">
   <div class="qrbox"><div class="qr">${qr}</div><div class="code"><small>SPIELCODE</small><b>${esc(d.code)}</b></div><div class="url">${esc(joinUrl().replace(/^https?:\/\//, ''))}</div></div>
   <div class="lobby-side"><div class="mission-banner"><img src="${MISSIONS[d.pack].image}" alt=""><div><small>MISSIONSZIEL</small><b>${esc(d.mission)}</b>
     <span>${d.total} Fragen · ${QUESTION_SECONDS} Sekunden pro Frage · 500–1.000 Punkte${d.total === 10 ? ' · Frage 10: 2,5×' : ''}</span></div></div>
    <div class="prize"><small>BELOHNUNG FÜR DIE SIEGERCREW</small><b>🏆 ${esc(d.prize)}</b></div>
    <h3>${d.teams.length} ${d.teams.length === 1 ? 'Crew' : 'Crews'} an Bord</h3>
    <ul class="teamgrid">${d.teams.map(t => `<li>${avatarHtml(t.avatar, t.id)}<span>${esc(t.name)}</span>${host ? `<button class="x" data-kick="${esc(t.id)}" title="Team entfernen" aria-label="${esc(t.name)} entfernen">×</button>` : ''}</li>`).join('') || '<li class="muted wait">Warte auf Crews – QR-Code scannen …</li>'}</ul>
   </div></section>`;
}
function viewHost() {
  const d = S.data;
  let body = '';
  if (d.phase === 'lobby') {
    body = `${viewLobbyShared(d, true)}
    <section class="card controls"><div class="row">
      <button class="btn tv-hide" data-copy="team">Link für Teams kopieren</button><button class="btn tv-hide" data-act="saveqr">QR-Code speichern ↓</button>
      <a class="btn tv-hide" href="./?room=${esc(d.code)}&screen=1" target="_blank" rel="noopener">Bildschirm öffnen ↗</a><button class="btn tv-hide" data-copy="host">Leitungslink sichern</button></div>
      <details class="settings" data-settings ${S.settingsOpen ? 'open' : ''}><summary>Mission oder Preis ändern</summary>
        <div class="missions small" data-group="lobby-pack">${MISSIONS.map((_, i) => missionCard(i, i === (S.lobbyPack ?? d.pack), 'lpack')).join('')}</div>
        <label class="field">Preis<input data-lobbyprize maxlength="80" value="${esc(S.lobbyPrize ?? d.prize)}"></label>
        <button class="btn" data-act="settings">Übernehmen</button></details>
      <button class="btn primary big" data-act="start" ${d.teams.length && !S.busy ? '' : 'disabled'}>Mission beginnen →</button>
      ${d.teams.length ? '' : '<p class="muted">Sobald die erste Crew an Bord ist, kann es losgehen.</p>'}${hostHint()}
      <p class="muted small tv-hide">Tipp: Leertaste oder Enter = Weiter / Auflösen.</p><p class="muted small tv-only">Fernbedienung: Pfeiltasten zum Auswählen, OK zum Bestätigen. Die Teams scannen den QR-Code mit dem Handy.</p></section>`;
  } else if (d.phase === 'question' || d.phase === 'reveal') {
    const Q = d.question, reveal = d.phase === 'reveal', last = d.q + 1 >= d.total;
    body = `<section class="stage">${progress(d)}${questionHead(d)}
      ${reveal ? '' : `<div class="statusline">${timerHtml(d)}<span>${d.answeredCount} von ${d.teams.length} Teams haben geantwortet.</span></div>${countdownBlock(d)}`}
      <h2 class="qtext">${esc(Q.text)}</h2>${picture(Q)}${optionsHtml(d, false)}
      ${reveal ? `<div class="explain"><small>LOGBUCHEINTRAG</small><p>${esc(Q.explanation)}</p></div>` : ''}
      <div class="row hostbar">${reveal ? `<button class="btn primary big" data-act="next" ${S.busy ? 'disabled' : ''}>${last ? 'Endstand zeigen →' : 'Nächste Frage →'}</button>` : `<button class="btn primary" data-act="reveal" ${S.busy ? 'disabled' : ''}>Lösung zeigen</button>`}
        <button class="btn ghost small" data-act="end">${S.confirmEnd ? 'Wirklich beenden?' : 'Quiz beenden'}</button></div></section>
      ${reveal ? `<section class="card"><h3>RANGLISTE · LIVE</h3>${scoreList(d, 99, true)}</section>` : ''}`;
  } else body = viewFinished(d, 'host');
  return `${header(`<span class="pill">Spielleitung · ${esc(d.code)}</span>${relayPill()}`)}<main class="host">${err()}${body}</main>`;
}
// On GitHub Pages the game runs in the host's browser; teams connect to it directly.
function relayPill() {
  if (NET?.kind !== 'local') return '';
  const st = NET.status(), n = NET.teamsOnline();
  if (st === 'ok') return `<span class="pill ok" title="Geräte, die gerade mit diesem Browser verbunden sind">📡 ${n} ${n === 1 ? 'Gerät' : 'Geräte'} verbunden</span>`;
  return `<span class="pill warn">📡 ${st === 'error' ? 'Funkmodul fehlt – Internet prüfen' : 'Funkkanal wird geöffnet …'}</span>`;
}
function hostHint() {
  return NET?.kind === 'local' ? '<p class="notice small">📡 Das Quiz läuft in <b>diesem Browserfenster</b>. Bitte geöffnet lassen, bis das Spiel vorbei ist – die Teams sind direkt mit diesem Gerät verbunden. Neu laden ist kein Problem, der Spielstand bleibt erhalten.</p>' : '';
}
function viewScreen() {
  const d = S.data;
  let body;
  if (d.phase === 'lobby') body = `<h1 class="screen-title">JETZT AN BORD KOMMEN</h1>${viewLobbyShared(d, false)}`;
  else if (d.phase === 'question' || d.phase === 'reveal') {
    const Q = d.question, reveal = d.phase === 'reveal';
    if (!Q.text) body = `<section class="stage">${progress(d)}${questionHead(d)}${countdownBlock(d)}</section>`;
    else body = `<section class="stage big">${progress(d)}${questionHead(d)}
      ${reveal ? '' : `<div class="statusline">${timerHtml(d)}<span>${d.answeredCount} von ${d.teams.length} Teams haben geantwortet.</span></div>${countdownBlock(d)}`}
      <h2 class="qtext">${esc(Q.text)}</h2>${picture(Q)}${optionsHtml(d, false)}
      ${reveal ? `<div class="explain"><small>LOGBUCHEINTRAG</small><p>${esc(Q.explanation)}</p></div><section class="card"><h3>RANGLISTE · LIVE</h3>${scoreList(d, 8, true)}</section>` : ''}</section>`;
  } else body = viewFinished(d, 'screen');
  return `${header(`<span class="pill">Beamer · ${esc(d.code)}</span>`)}<main class="screen">${body}</main>`;
}
// short looping clip instead of a large GIF (about 30 KB instead of 750 KB)
function reaction(won) {
  const f = won ? 'win' : 'lose', alt = won ? 'Picard applaudiert' : 'Picard mit einer Facepalm-Reaktion';
  return `<video class="gif" src="media/${f}.mp4" poster="media/${f}.jpg" autoplay muted loop playsinline aria-label="${alt}"></video>`;
}
function viewFinished(d, who) {
  const list = ranked(d.teams), win = winners(d.teams), me = d.me && list.find(t => t.id === d.me.id);
  const iWon = me && win.some(w => w.id === me.id);
  let top = '';
  if (d.solo && me) {
    const max = d.total === 10 ? 9 * 1000 + 2500 : d.total * 1000, share = me.score / max;
    const rank = share >= .75 ? ['Captain-Niveau', 'Picard wäre stolz.'] : share >= .5 ? ['Erster Offizier', 'Nummer Eins – fast ganz oben.'] : share >= .25 ? ['Fähnrich', 'Solide. Die Akademie ruft trotzdem.'] : me.score > 0 ? ['Kadett', 'Jeder Captain hat mal so angefangen.'] : ['Rotes Hemd', 'Landurlaub abgesagt. Nächster Versuch?'];
    const pick = S.restartPack ?? Math.min(d.pack + 1, MISSIONS.length - 1);
    return `<section class="result ${share >= .5 ? 'won' : ''}">${reaction(share >= .5)}
      <small>MISSION ${esc(d.mission)} ABGESCHLOSSEN</small><h2>${rank[0].toUpperCase()}</h2>
      <p class="big">${fmt(me.score)} von ${fmt(max)} möglichen Punkten</p><p class="muted">${rank[1]}</p>
      ${me.score > 0 ? `<button class="btn tv-hide" data-diploma="${esc(me.id)}">Diplom herunterladen ↓</button>` : ''}</section>
      <section class="card"><h3>Nächste Mission</h3><div class="missions small" data-group="restart-pack">${MISSIONS.map((_, i) => missionCard(i, i === pick, 'rpack')).join('')}</div>
      <button class="btn primary big" data-act="restart">Mission starten →</button></section>`;
  }
  if (who === 'team' && me) {
    top = `<section class="result ${iWon ? 'won' : ''}">${reaction(iWon)}
      <h2>${iWon ? 'SIEG AUF DER BRÜCKE' : 'HELDEN DER NÄCHSTEN RUNDE'}</h2>
      <p class="big">Platz ${me.place} · ${fmt(me.score)} Punkte</p>${iWon ? `<p>Preis: <b>${esc(d.prize)}</b></p><button class="btn primary tv-hide" data-diploma="${esc(me.id)}">Siegerdiplom herunterladen ↓</button>` : '<p class="muted">Heute kein Pokal. Dafür eine hervorragende Origin-Story.</p>'}</section>`;
  } else {
    top = `<section class="result won"><small>SIEGERTEAM${win.length > 1 ? 'S' : ''}</small>
      ${win.length ? win.map(w => `<div class="winner">${avatarHtml(w.avatar, w.id, 'l')}<h2>${esc(w.name)}</h2></div>`).join('') : '<h2>Kein Siegerteam – alle Antworten sind im Transporterpuffer verschwunden.</h2>'}
      ${win.length ? `<p class="big">${fmt(win[0].score)} Punkte · 🏆 ${esc(d.prize)}</p>` : ''}
      ${who === 'screen' ? reaction(true) : ''}</section>`;
  }
  const hostTools = who === 'host' ? `<section class="card"><div class="row">${win.map(w => `<button class="btn primary tv-hide" data-diploma="${esc(w.id)}">Diplom für ${esc(w.name)} ↓</button>`).join('')}
     <button class="btn tv-hide" data-act="csv">Ergebnis als CSV speichern ↓</button></div>
     <h3>Nächste Mission – gleiche Teams</h3><div class="missions small" data-group="restart-pack">${MISSIONS.map((_, i) => missionCard(i, i === (S.restartPack ?? Math.min(d.pack + 1, MISSIONS.length - 1)), 'rpack')).join('')}</div>
     <button class="btn primary big" data-act="restart">Neue Mission starten →</button></section>` : '';
  return `${top}<section class="card"><h3>ENDSTAND · ${esc(d.mission)}</h3>${scoreList(d)}</section>${hostTools}`;
}

// TEAM ----------------------------------------------------
function viewJoin(d) {
  const J = S.join, groups = AVATAR_GROUPS.map(([id, label]) => `<button type="button" class="tab ${J.group === id ? 'on' : ''}" data-group-tab="${id}">${label}</button>`).join('');
  const list = AVATARS.filter(a => a.group === J.group).map(a => `<button type="button" class="pick ${J.avatar === a.id ? 'on' : ''}" data-avatar="${a.id}" title="${esc(a.tag || a.name)}">${avatarHtml(a.id, '', 'm')}<span>${esc(a.name)}</span></button>`).join('');
  return `<section class="card joinform"><small class="kicker">AN BORD KOMMEN · ${esc(d.code)}</small>
   <h2>${esc(d.mission)}</h2><p class="muted">🏆 ${esc(d.prize)} · ${d.teams.length} ${d.teams.length === 1 ? 'Crew' : 'Crews'} an Bord</p>
   ${S.kicked ? '<p class="err">Euer Team wurde von der Spielleitung entfernt. Ihr könnt mit einem neuen Namen beitreten.</p>' : ''}
   <label class="field">Teamname<input data-teamname maxlength="24" autocomplete="off" placeholder="z. B. Die Tribble-Bande" value="${esc(J.name)}"></label>
   <div class="field">Teambild<div class="tabs">${groups}<button type="button" class="tab ${J.group === 'upload' ? 'on' : ''}" data-group-tab="upload">Eigenes Bild</button></div>
   ${J.group === 'upload' ? `<div class="upload">${J.upload ? `<span class="av av-l"><img src="${J.upload}" alt=""></span>` : ''}
     <label class="btn">Eigenes Teambild hochladen<input type="file" accept="image/jpeg,image/png,image/webp" data-upload hidden></label>
     <p class="muted small">JPG, PNG oder WebP · maximal 10 MB. Das Bild wird verkleinert und für alle Teams sichtbar.</p></div>` : `<div class="picks">${list}</div>`}</div>
   <button class="btn primary big" data-act="join" ${S.busy ? 'disabled' : ''}>Crew anmelden →</button>${err()}</section>`;
}
function viewTeam() {
  const d = S.data;
  if (!d.me) {
    if (d.phase === 'lobby') return `${header()}<main class="team">${viewJoin(d)}</main>`;
    return `${header()}<main class="team"><p class="notice">Diese Runde läuft bereits. Ihr könnt zuschauen und bei der nächsten Runde als Team beitreten.</p>${viewSpectator(d)}</main>`;
  }
  let body;
  if (d.phase === 'lobby') {
    body = `<section class="card center"><small class="kicker">CREW AN BORD</small>${avatarHtml(d.me.avatar, d.me.id, 'l')}<h2>${esc(d.me.name)}</h2>
     <p>Mission <b>${esc(d.mission)}</b> · ${d.total} Fragen · ${QUESTION_SECONDS} Sekunden pro Frage</p><p class="muted">🏆 ${esc(d.prize)}</p>
     <p class="pulse">Warten auf den Befehl der Brücke …</p><p class="muted">${d.teams.length} ${d.teams.length === 1 ? 'Team' : 'Teams'} dabei</p></section>`;
  } else if (d.phase === 'question') {
    const Q = d.question;
    if (!Q.text) body = `<section class="stage">${progress(d)}${questionHead(d)}${countdownBlock(d)}</section>`;
    else {
      const answered = d.answer != null, over = now() >= d.deadline;
      const msg = answered ? '✓ Antwort gespeichert. Gemeinsam auf die Auflösung warten.' : over ? 'Zeit abgelaufen. Die Lösung kommt gleich.' : d.solo ? 'Die erste Antwort zählt – je schneller, desto mehr Punkte.' : 'Kurz beraten – nur die erste Antwort zählt.';
      body = `<section class="stage">${progress(d)}${questionHead(d)}<div class="statusline">${timerHtml(d)}<span>${esc(msg)}</span></div>
       <h2 class="qtext">${esc(Q.text)}</h2>${picture(Q)}${optionsHtml(d, !answered && !over)}</section>`;
    }
  } else if (d.phase === 'reveal') {
    const Q = d.question, a = d.answer, ok = a && a.choice === Q.correct, k = d.q % 5;
    body = `<section class="feedback ${ok ? 'good' : 'bad'}"><h2>${ok ? 'VOLLTREFFER!' : a ? 'DANEBEN – ANDERE ZEITLINIE.' : 'FUNKSTILLE – KEINE ANTWORT'}</h2>
      ${ok ? `<p class="big">+${fmt(a.points)} Punkte</p>` : ''}<p>${esc(ok ? GOOD[k] : BAD[k])}</p></section>
      <section class="stage">${questionHead(d)}<h2 class="qtext">${esc(Q.text)}</h2>${optionsHtml(d, false)}
      <div class="explain"><small>LOGBUCHEINTRAG</small><p>${esc(Q.explanation)}</p></div></section>
      ${d.solo ? `<section class="card mine-score"><b>${esc(d.me.name)}</b> · ${fmt(d.me.score)} Punkte · Frage ${d.q + 1} von ${d.total}
        <button class="btn primary big" data-act="next" ${S.busy ? 'disabled' : ''}>${d.q + 1 >= d.total ? 'Ergebnis zeigen →' : 'Nächste Frage →'}</button></section>`
      : `<section class="card mine-score">Euer Team: <b>${esc(d.me.name)}</b> · Platz ${ranked(d.teams).find(t => t.id === d.me.id)?.place ?? '–'} · ${fmt(d.me.score)} Punkte
      ${d.q + 1 >= d.total - 2 && d.q + 1 < d.total ? '<p class="muted">Letzte Sektoren! Die ganze Flotte drückt die Daumen.</p>' : ''}</section>`}`;
  } else body = viewFinished(d, 'team');
  return `${header(`<span class="pill">${avatarHtml(d.me.avatar, d.me.id, 's')} ${esc(d.me.name)}</span>`)}<main class="team">${body}</main>`;
}
function viewSpectator(d) {
  if (d.phase === 'finished') return viewFinished(d, 'spectator');
  const Q = d.question;
  if (!Q?.text) return `<section class="stage">${progress(d)}${countdownBlock(d)}</section>`;
  return `<section class="stage">${progress(d)}${questionHead(d)}<h2 class="qtext">${esc(Q.text)}</h2>${picture(Q)}${optionsHtml(d, false)}
   ${d.phase === 'reveal' ? `<div class="explain"><small>LOGBUCHEINTRAG</small><p>${esc(Q.explanation)}</p></div>` : ''}</section>
   <section class="card"><h3>RANGLISTE · LIVE</h3>${scoreList(d, 10)}</section>`;
}
// Loading screen for team / projector devices: shows which step is running, and help if it takes long.
const BOOT_T0 = Date.now();
function bootView() {
  const steps = [['lib', 'Funkmodul laden'], ['broker', 'Subraum-Relais anfunken'], ['host', `Brücke ${ROOM} rufen`]];
  const cur = NET?.stage ? NET.stage() : 'lib', at = Math.max(0, steps.findIndex(s => s[0] === cur));
  const secs = Math.floor((Date.now() - BOOT_T0) / 1000);
  const slow = secs >= 12 ? `<div class="boot-help"><p>Das dauert länger als üblich. Meist hilft eines davon:</p>
    <ul><li>WLAN aus- und mobile Daten einschalten (manche WLANs blockieren die Direktverbindung).</li>
    <li>Prüfen, ob der Spielcode <b>${esc(ROOM)}</b> stimmt und die Spielleitung das Quiz geöffnet hat.</li></ul>
    <div class="row"><button class="btn primary" onclick="location.reload()">Neu laden</button><a class="btn ghost" href="./">Anderen Code eingeben</a></div></div>` : '';
  return `<div class="boot"><div class="boot-panel"><div class="boot-sweep" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>
    <small>Verbindungsaufbau · Code ${esc(ROOM)}</small><h2>Kanal wird geöffnet</h2>
    <ol class="boot-steps">${steps.map(([, t], i) => `<li class="${i < at ? 'done' : i === at ? 'now' : ''}">${t}</li>`).join('')}</ol>${slow}</div></div>`;
}
const err = () => (S.error ? `<p class="err" role="alert">${esc(S.error)}</p>` : '');

// ---------- render ----------
let zoomSrc = '';
function focusSelector(el) {
  const q = v => CSS.escape(String(v));
  const k = Object.keys(el.dataset)[0];
  if (k) return `[data-${k.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}="${q(el.dataset[k])}"]`;
  if (el.name) return `[name="${q(el.name)}"][value="${q(el.value)}"]`;
  if (el.getAttribute('href')) return `a[href="${q(el.getAttribute('href'))}"]`;
  return '';
}
function render(force = false) {
  let html;
  if (!ROOM) html = viewHome();
  else if (!S.data) html = S.error
    ? `${header()}<main class="team"><section class="card center"><h2>Spiel nicht gefunden</h2><p>${esc(S.error)}</p><a class="btn primary" href="./">Zur Startseite</a></section></main>`
    : bootView();
  else html = role() === 'screen' ? viewScreen() : role() === 'host' ? viewHost() : viewTeam();
  if (S.toast) html += `<div class="toast" role="status">${esc(S.toast)}</div>`;
  if (zoomSrc) html += `<div class="zoom" data-unzoom><img src="${zoomSrc}" alt="Vergrößertes Fragenbild"><button class="btn" data-unzoom>Schließen</button></div>`;
  if (!force && html === S.lastHtml) { tick(); return; }
  // keep focus / typing state across re-renders (the exact same control, e.g. the 3rd mission card)
  const active = document.activeElement, sel = active && 'selectionStart' in active ? [active.selectionStart, active.selectionEnd] : null;
  const focusSel = active && active !== document.body && $app.contains(active) ? focusSelector(active) : '';
  if (html !== S.lastHtml) { $app.innerHTML = html; S.lastHtml = html; }
  document.body.className = ROOM ? (role() === 'screen' ? 'is-screen' : '') : 'is-home';
  const el = focusSel && $app.querySelector(focusSel);
  if (el && el !== document.activeElement) { el.focus({ preventScroll: true }); if (sel && el.setSelectionRange) try { el.setSelectionRange(...sel); } catch { /* */ } }
  if (TV) tvAutofocus();
  tick();
}
// timer + get-ready countdown without re-rendering the page
function tick() {
  const d = S.data; if (!d) return;
  const total = Math.max(1000, d.deadline - d.started), left = Math.max(0, d.deadline - now()), sec = Math.ceil(left / 1000);
  for (const el of $app.querySelectorAll('[data-sec]')) el.textContent = now() < d.started ? Math.round(total / 1000) : sec;
  for (const el of $app.querySelectorAll('[data-ring]')) el.style.strokeDashoffset = String(106.8 * (1 - Math.min(1, left / total)));
  for (const el of $app.querySelectorAll('[data-timer]')) el.classList.toggle('low', sec <= 5 && now() >= d.started);
  for (const el of $app.querySelectorAll('[data-pre]')) el.textContent = Math.max(1, Math.ceil((d.started - now()) / 1000));
  syncMusic();
}

// ---------- events ----------
$app.addEventListener('click', async e => {
  const t = e.target.closest('button, [data-unzoom], [data-zoom]'); if (!t) return;
  if (t.matches('[data-unzoom]')) { zoomSrc = ''; render(true); return; }
  if (t.matches('[data-zoom]')) { zoomSrc = t.querySelector('img').src; render(true); return; }
  if (t.dataset.choice != null && !t.disabled) {
    const choice = Number(t.dataset.choice);
    S.data.answer = { choice }; render(true); navigator.vibrate?.(35);
    const r = await act('answer', { choice });
    if (!r) { S.data.answer = null; render(true); }
    return;
  }
  if (t.dataset.kick) { if (confirm('Dieses Team entfernen?')) act('kick', { team: t.dataset.kick }); return; }
  if (t.dataset.diploma) { const team = S.data.teams.find(x => x.id === t.dataset.diploma); if (team) diploma(team); return; }
  if (t.dataset.copy) { copy(t.dataset.copy === 'host' ? hostUrl() : joinUrl(), t.dataset.copy === 'host' ? (NET?.kind === 'local' ? 'Leitungslink kopiert – damit steuert ihr das Quiz auch vom Handy, solange dieses Fenster offen ist.' : 'Leitungslink kopiert – gut aufheben, er öffnet die Spielleitung.') : 'Link für Teams kopiert.'); return; }
  if (t.dataset.groupTab) { S.join.group = t.dataset.groupTab; render(true); return; }
  if (t.dataset.avatar) { S.join.avatar = t.dataset.avatar; render(true); return; }
  switch (t.dataset.act) {
    case 'create': {
      S.busy = true; S.error = ''; render(true);
      try {
        const r = (await detectMode()) === 'server'
          ? await serverTransport().request('POST', {}, { action: 'create', pack: S.home.pack, prize: S.home.prize }, {})
          : (await import('./engine.mjs')).createRoom({ pack: S.home.pack, prize: S.home.prize });
        store.set('warp-host-' + r.code, r.hostToken); store.set('warp-last-host', r.code);
        location.href = './?room=' + r.code;
      } catch (err2) { S.error = err2.message; S.busy = false; render(true); }
      return;
    }
    case 'solo': { // a private room in this browser: one team, the player is also the host
      S.busy = true; S.error = ''; render(true);
      try {
        const { createRoom, Engine } = await import('./engine.mjs');
        const name = S.home.solo.trim().length >= 2 ? S.home.solo : 'Kadett';
        const r = createRoom({ pack: S.home.pack, prize: 'Ruhm und Ehre', solo: true });
        const j = new Engine(r.code).request({ method: 'POST', body: { action: 'join', name, avatar: 'vulkanier' } });
        if (j.status !== 200) throw new Error(j.body.error);
        store.set('warp-host-' + r.code, r.hostToken); store.set('warp-team-' + r.code, j.body.token);
        location.href = './?room=' + r.code;
      } catch (err2) { S.error = err2.message; S.busy = false; render(true); }
      return;
    }
    case 'join': {
      const J = S.join, avatar = J.avatar === 'upload' ? J.upload : J.avatar;
      if (J.name.trim().length < 2) { S.error = 'Bitte einen Teamnamen mit mindestens 2 Zeichen eingeben.'; render(true); return; }
      if (!avatar) { S.error = 'Bitte ein Teambild auswählen.'; render(true); return; }
      const r = await act('join', { name: J.name, avatar });
      if (r?.token) { S.teamToken = r.token; S.kicked = false; store.set('warp-team-' + ROOM, r.token); await poll(); }
      return;
    }
    case 'start': case 'reveal': case 'next': act(t.dataset.act); return;
    case 'end': if (!S.confirmEnd) { S.confirmEnd = true; render(true); setTimeout(() => { S.confirmEnd = false; render(true); }, 4000); return; } S.confirmEnd = false; act('end'); return;
    case 'settings': {
      const pack = S.lobbyPack ?? S.data.pack, prize = S.lobbyPrize ?? S.data.prize;
      const r = await act('settings', { pack, prize });
      if (r) { S.lobbyPack = null; S.lobbyPrize = null; S.settingsOpen = false; toast('Gespeichert.'); render(true); } return;
    }
    case 'restart': { const pack = S.restartPack ?? Math.min(S.data.pack + 1, MISSIONS.length - 1); S.restartPack = null; act('restart', { pack }); return; }
    case 'music': toggleMusic(); return;
    case 'saveqr': saveQr(); return;
    case 'csv': csv(); return;
  }
});
$app.addEventListener('input', e => {
  const t = e.target;
  if (t.matches('[data-teamname]')) S.join.name = t.value;
  else if (t.matches('[data-prize]')) S.home.prize = t.value;
  else if (t.matches('[data-soloname]')) S.home.solo = t.value;
  else if (t.matches('[data-lobbyprize]')) S.lobbyPrize = t.value;
  else if (t.name === 'code') { t.value = t.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); S.home.code = t.value; }
});
$app.addEventListener('change', e => {
  const t = e.target;
  if (t.name === 'pack') { S.home.pack = Number(t.value); render(true); }
  if (t.name === 'rpack') { S.restartPack = Number(t.value); render(true); }
  if (t.name === 'lpack') { S.lobbyPack = Number(t.value); render(true); }
  if (t.matches('[data-upload]')) onUpload(t.files?.[0]);
});
$app.addEventListener('submit', e => {
  e.preventDefault();
  const code = (S.home.code || '').toUpperCase();
  if (!/^[A-Z2-9]{6}$/.test(code)) { S.error = 'Bitte den sechsstelligen Spielcode eingeben.'; render(true); return; }
  location.href = './?room=' + code;
});
$app.addEventListener('toggle', e => { if (e.target.matches?.('[data-settings]')) S.settingsOpen = e.target.open; }, true);

// ---------- TV remote: arrow keys move between controls, OK presses them ----------
const FOCUSABLE = 'button:not(:disabled), a[href], input:not([type=file]):not(:disabled), summary';
function tvItems() {
  return [...$app.querySelectorAll(FOCUSABLE)].filter(el => {
    const box = (el.matches('input[type=radio]') ? el.closest('label') : el)?.getBoundingClientRect();
    return box && box.width > 0 && box.height > 0 && !el.closest('.tv-hide');
  });
}
function tvBox(el) { return (el.matches('input[type=radio]') ? el.closest('label') : el).getBoundingClientRect(); }
function tvFocus(el) { el.focus({ preventScroll: true }); tvBox(el) && (el.matches('input[type=radio]') ? el.closest('label') : el).scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' }); }
// After each screen change, put the remote's focus on the obvious next action – without scrolling,
// so the QR code and question stay in view. Focus that was placed automatically may move on later
// (e.g. to "Spiel starten" once the first team has joined); focus the user moved stays put.
let tvAutoSel = ""; // selector of the control focused automatically (nodes are replaced on re-render)
function tvAutofocus() {
  const a = document.activeElement;
  const userFocus = a && a !== document.body && $app.contains(a) && focusSelector(a) !== tvAutoSel;
  if (userFocus) return;
  const el = $app.querySelector((ROOM ? '' : 'input[name=pack]:checked, ') + '[data-unzoom].btn, [data-act="next"]:not(:disabled), [data-act="start"]:not(:disabled), .opt:not(:disabled), [data-act="reveal"]:not(:disabled), [data-act="restart"], [data-act="create"]');
  if (el && el !== a) {
    el.focus({ preventScroll: true }); tvAutoSel = focusSelector(el);
    if (el.matches('[data-act="next"], [data-act="reveal"]')) el.scrollIntoView({ block: 'nearest' });
  }
  else if (!el) tvAutoSel = "";
}
if (TV) document.addEventListener('keydown', e => {
  const cur = document.activeElement;
  if (e.key === 'Enter' && cur?.matches('input[type=radio]')) { e.preventDefault(); cur.click(); return; }
  const dir = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[e.key];
  if (!dir) return;
  if (cur?.matches('input:not([type=radio])') && dir[1] === 0) return; // left/right moves the text cursor
  const items = tvItems();
  e.preventDefault();
  tvAutoSel = ""; // the user is steering now
  if (!items.includes(cur)) { const first = items.find(x => x.closest('main')); if (first) tvFocus(first); return; }
  const r = tvBox(cur), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  let best = null, bestScore = Infinity;
  for (const el of items) {
    if (el === cur) continue;
    const b = tvBox(el), dx = b.left + b.width / 2 - cx, dy = b.top + b.height / 2 - cy;
    const along = dx * dir[0] + dy * dir[1];
    if (along <= 2) continue;
    const score = along + 2.5 * Math.abs(dx * dir[1] + dy * dir[0]);
    if (score < bestScore) { bestScore = score; best = el; }
  }
  if (best) tvFocus(best);
  else window.scrollBy({ top: dir[1] * 240, behavior: 'smooth' }); // nothing further that way: scroll the page
}, true);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && zoomSrc) { zoomSrc = ''; render(true); return; }
  const d = S.data, el = document.activeElement;
  if (!d || e.ctrlKey || e.metaKey || e.altKey || (el && el !== document.body && el.matches('input, textarea, select, button, a, summary'))) return;
  // A–D / 1–4 answer, Space / Enter / → move the host (or solo player) on
  const k = e.key.toLowerCase(), choice = 'abcd'.indexOf(k) >= 0 ? 'abcd'.indexOf(k) : '1234'.indexOf(k);
  if (choice >= 0 && role() === 'team') { $app.querySelector(`[data-choice="${choice}"]:not(:disabled)`)?.click(); return; }
  if ([' ', 'enter', ...(TV ? [] : ['arrowright'])].includes(k) && (role() === 'host' || d.solo)) {
    const btn = $app.querySelector('[data-act="start"], [data-act="next"], [data-act="reveal"]');
    if (btn && !btn.disabled) { e.preventDefault(); btn.click(); }
  }
});

// ---------- start ----------
async function connect() {
  // only the host browser loads the engine (and with it the answers)
  const engine = !SCREEN && !FORCE_TEAM && store.get('vs-room-' + ROOM) ? await import('./engine.mjs') : null;
  const room = engine?.hostedRoom(ROOM);
  if (room && await claimHost(ROOM)) {
    // This browser created the room: run the game here and let team devices connect (unless solo).
    return localTransport(new engine.Engine(ROOM), { serve: !room.solo, onChange: () => render() });
  }
  if (room?.solo) throw Object.assign(new Error('Diese Solo-Mission ist schon in einem anderen Tab geöffnet.'), { status: 404 });
  MODE = await detectMode();
  return MODE === 'server' ? serverTransport() : peerTransport(ROOM, { onChange: () => render() });
}
if (ROOM && (SCREEN || FORCE_TEAM || !store.get('vs-room-' + ROOM))) warmUp(); // team/screen device: fetch PeerJS right away
render(true);
if (ROOM) {
  try { NET = await connect(); } catch (e) { S.error = e.message; S.pollError = true; render(true); }
  poll();
  let timer;
  const loop = () => { clearTimeout(timer); timer = setTimeout(async () => { await poll(); loop(); }, document.hidden ? 4000 : 1000); };
  loop();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { poll(); loop(); } });
  setInterval(tick, 200);
  // when the clock runs out, ask the server straight away (it reveals automatically)
  setInterval(() => { const d = S.data; if (d?.phase === 'question' && now() > d.deadline + 700 && now() < d.deadline + 1500) poll(); }, 250);
}
if (!reduceMotion) document.documentElement.classList.add('motion');
