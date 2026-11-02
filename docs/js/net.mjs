// Vulkan Spirit Quiz – transport. Three ways to reach the game:
//  server: Netlify function at api/game (original setup)
//  local:  this browser hosts the room (engine.mjs) – on GitHub Pages, and for solo games
//  peer:   a team device talks to the host browser peer-to-peer (WebRTC via PeerJS)
const PEER_PREFIX = 'vulkan-spirit-quiz-v2-';
const TIMEOUT = 8000;

class NetError extends Error { constructor(status, message) { super(message); this.status = status; } }
const OFFLINE = 'Die Verbindung zur Flotte ist gestört.';

/** 'server' when a Netlify backend answers at api/game, otherwise 'p2p' (static hosting like GitHub Pages). */
export async function detectMode() {
  try { const m = sessionStorage.getItem('vs-mode'); if (m) return m; } catch { /* */ }
  let mode = 'p2p';
  if (location.hostname.endsWith('.github.io')) return mode; // static hosting, no server to ask
  try {
    const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 4000);
    const r = await fetch('api/game?room=AAAAAA', { cache: 'no-store', signal: ctl.signal });
    clearTimeout(timer);
    if ((r.headers.get('content-type') || '').includes('application/json')) mode = 'server';
  } catch { /* offline or static host */ }
  try { sessionStorage.setItem('vs-mode', mode); } catch { /* */ }
  return mode;
}

let peerLib;
function loadPeer() {
  peerLib ||= new Promise((resolve, reject) => {
    if (window.peerjs) return resolve(window.peerjs.Peer);
    const s = document.createElement('script');
    s.src = new URL('../vendor/peerjs.min.js', import.meta.url).href;
    s.onload = () => resolve(window.peerjs.Peer);
    s.onerror = () => { peerLib = null; reject(new NetError(0, 'Das Funkmodul konnte nicht geladen werden.')); };
    document.head.append(s);
  });
  return peerLib;
}

// --- server (Netlify) ---
export function serverTransport() {
  async function call(method, params, body, headers) {
    const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), TIMEOUT);
    try {
      const qs = new URLSearchParams(params).toString();
      const r = await fetch('api/game' + (qs ? '?' + qs : ''), {
        method, cache: 'no-store', signal: ctl.signal,
        headers: method === 'POST' ? { 'content-type': 'application/json', ...headers } : headers,
        body: method === 'POST' ? JSON.stringify(body) : undefined
      });
      let out = {}; try { out = await r.json(); } catch { /* empty */ }
      if (!r.ok) throw new NetError(r.status, out.error || OFFLINE);
      return out;
    } finally { clearTimeout(timer); }
  }
  return { kind: 'server', request: call, status: () => 'ok' };
}

// --- local engine (+ peer host for teams on other devices) ---
export function localTransport(engine, { serve = true, onChange } = {}) {
  let status = serve ? 'connecting' : 'ok', peer = null, retry = 0, stopped = false, teamsOnline = 0;
  const conns = new Set();
  const setStatus = s => { status = s; onChange?.(); };
  async function open() {
    if (stopped) return;
    let Peer;
    try { Peer = await loadPeer(); } catch { setStatus('error'); setTimeout(open, 5000); return; }
    peer = new Peer(PEER_PREFIX + engine.room.code, { debug: 0 });
    peer.on('open', () => { retry = 0; setStatus('ok'); });
    peer.on('connection', conn => {
      conn.on('open', () => { conns.add(conn); teamsOnline = conns.size; onChange?.(); });
      conn.on('data', msg => {
        if (!msg || typeof msg !== 'object' || msg.id == null) return;
        const res = engine.request({ method: msg.method === 'POST' ? 'POST' : 'GET', params: msg.params || {}, body: msg.body || {}, headers: msg.headers || {} });
        try { conn.send({ id: msg.id, res }); } catch { /* closed */ }
      });
      const drop = () => { conns.delete(conn); teamsOnline = conns.size; onChange?.(); };
      conn.on('close', drop); conn.on('error', drop);
    });
    peer.on('disconnected', () => { setStatus('connecting'); if (!peer.destroyed) setTimeout(() => peer.reconnect(), 1500); });
    peer.on('error', e => {
      // unavailable-id: the old tab's registration is still alive on the broker – try again shortly.
      if (['unavailable-id', 'network', 'server-error', 'socket-error', 'socket-closed'].includes(e.type)) {
        setStatus('connecting'); try { peer.destroy(); } catch { /* */ }
        setTimeout(open, Math.min(15000, 2000 * ++retry));
      }
    });
  }
  if (serve) open();
  return {
    kind: 'local',
    async request(method, params, body, headers) {
      const r = engine.request({ method, params, body, headers });
      if (r.status !== 200) throw new NetError(r.status, r.body.error);
      return r.body;
    },
    status: () => status,
    teamsOnline: () => teamsOnline,
    stop() { stopped = true; peer?.destroy(); }
  };
}

// --- team / screen device: talk to the host browser ---
export function peerTransport(code, { onChange } = {}) {
  let peer = null, conn = null, ready = null, seq = 0, status = 'connecting', everConnected = false, hostMissing = false;
  const pending = new Map();
  const setStatus = s => { if (s !== status) { status = s; onChange?.(); } };
  async function ensurePeer() {
    if (peer && !peer.destroyed && !peer.disconnected) return peer;
    const Peer = await loadPeer();
    try { peer?.destroy(); } catch { /* */ }
    peer = new Peer({ debug: 0 });
    await new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new NetError(0, OFFLINE)), TIMEOUT);
      peer.once('open', () => { clearTimeout(t); resolve(); });
      peer.once('error', e => { clearTimeout(t); reject(new NetError(0, OFFLINE)); });
    });
    peer.on('error', e => {
      if (e.type === 'peer-unavailable') { hostMissing = true; setStatus('nohost'); }
      ready = null;
    });
    peer.on('disconnected', () => { ready = null; });
    return peer;
  }
  function connect() {
    ready ||= (async () => {
      const p = await ensurePeer();
      const c = p.connect(PEER_PREFIX + code, { reliable: true });
      await new Promise((resolve, reject) => {
        const t = setTimeout(() => { try { c.close(); } catch { /* */ } reject(new NetError(0, OFFLINE)); }, TIMEOUT);
        c.once('open', () => { clearTimeout(t); resolve(); });
        c.once('error', () => { clearTimeout(t); reject(new NetError(0, OFFLINE)); });
      });
      c.on('data', msg => { const w = pending.get(msg?.id); if (w) { pending.delete(msg.id); w(msg.res); } });
      const lost = () => { if (conn === c) { conn = null; ready = null; setStatus('connecting'); } };
      c.on('close', lost); c.on('error', lost);
      conn = c; everConnected = true; hostMissing = false; setStatus('ok');
      return c;
    })().catch(e => { ready = null; if (!hostMissing) setStatus('connecting'); throw e; });
    return ready;
  }
  return {
    kind: 'peer',
    async request(method, params, body, headers) {
      const c = await connect();
      const id = ++seq;
      const res = await new Promise((resolve, reject) => {
        const t = setTimeout(() => { pending.delete(id); reject(new NetError(0, OFFLINE)); }, TIMEOUT);
        pending.set(id, r => { clearTimeout(t); resolve(r); });
        try { c.send({ id, method, params, body, headers }); } catch { clearTimeout(t); pending.delete(id); ready = null; reject(new NetError(0, OFFLINE)); }
      });
      if (res.status !== 200) throw new NetError(res.status, res.body?.error || OFFLINE);
      return res.body;
    },
    status: () => status,
    everConnected: () => everConnected,
    hostMissing: () => hostMissing
  };
}

/** Lets only one tab of this browser host a room. Resolves true if this tab got the room. */
export function claimHost(code) {
  if (!navigator.locks) return Promise.resolve(true);
  return new Promise(resolve => {
    navigator.locks.request('vs-host-' + code, { ifAvailable: true }, lock => {
      resolve(!!lock);
      return lock ? new Promise(() => {}) : undefined; // hold the lock while this tab is open
    });
  });
}
