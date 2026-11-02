// Local test server: serves /docs and runs lib/game.mjs against a local Postgres (via psql + \bind).
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { extname, join, normalize } from 'node:path';
import { handleGame } from '../lib/game.mjs';

const ROOT = new URL('../docs/', import.meta.url).pathname;
const PORT = Number(process.env.PORT || 8899);
let clock = 0; // test hook: shift server time
const TYPES = { '.html': 'text/html; charset=utf-8', '.mjs': 'text/javascript', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.ttf': 'font/ttf', '.png': 'image/png', '.json': 'application/json' };

function parseCsv(text) {
  const rows = []; let row = [], cur = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) { if (ch === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += ch; }
    else if (ch === '"') q = true; else if (ch === ',') { row.push(cur); cur = ''; }
    else if (ch === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; } else if (ch !== '\r') cur += ch;
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  return rows;
}
export function query(text, params = []) {
  const lit = v => "'" + String(v).replace(/\\/g, '\\\\').replace(/'/g, "''") + "'";
  const sql = text.replace(/\s+/g, ' ') + (params.length ? ' \\bind ' + params.map(lit).join(' ') : ' \\bind') + ' \\g\n';
  const r = spawnSync('psql', ['-h', '/tmp/pg', '-p', '5544', '-U', 'quiz', '-d', 'quiz', '-X', '-q', '--csv', '-P', 'null=__NULL__', '-v', 'ON_ERROR_STOP=1'], { input: sql, encoding: 'utf8' });
  if (r.status !== 0) throw new Error('SQL error: ' + r.stderr + '\n' + text);
  const rows = parseCsv(r.stdout.trim());
  if (!rows.length || !rows[0].length || rows[0][0] === '') return [];
  const [head, ...data] = rows;
  return data.map(cols => Object.fromEntries(head.map((h, i) => [h, cols[i] === '__NULL__' ? null : cols[i]])));
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname === '/__clock') { clock += Number(url.searchParams.get('add') || 0); res.end(String(clock)); return; }
    if (url.pathname === '/api/game') {
      const chunks = []; for await (const c of req) chunks.push(c);
      const request = new Request(url, { method: req.method, headers: req.headers, body: req.method === 'POST' ? Buffer.concat(chunks) : undefined });
      const response = await handleGame(request, { query: async (t, p) => query(t, p), ip: req.headers['x-test-ip'] || '127.0.0.1', now: Date.now() + clock });
      res.writeHead(response.status, Object.fromEntries(response.headers)); res.end(await response.text()); return;
    }
    let path = normalize(decodeURIComponent(url.pathname)); if (path === '/' || !extname(path)) path = '/index.html';
    const file = join(ROOT, path); if (!file.startsWith(ROOT)) throw Object.assign(new Error('bad'), { code: 'ENOENT' });
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' }); res.end(body);
  } catch (e) {
    res.writeHead(e.code === 'ENOENT' ? 404 : 500); res.end(e.code === 'ENOENT' ? 'not found' : String(e.stack));
  }
}).listen(PORT, () => console.log('test server on', PORT));
