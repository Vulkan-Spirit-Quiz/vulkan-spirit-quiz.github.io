// Minimal QR code encoder (byte mode, error correction M, versions 1–15). No dependencies.
const EC_M = { // version: [ecCodewordsPerBlock, [blocks, dataCodewords], [blocks, dataCodewords]]
  1: [10, [1, 16]], 2: [16, [1, 28]], 3: [26, [1, 44]], 4: [18, [2, 32]], 5: [24, [2, 43]],
  6: [16, [4, 27]], 7: [18, [4, 31]], 8: [22, [2, 38], [2, 39]], 9: [22, [3, 36], [2, 37]],
  10: [26, [4, 43], [1, 44]], 11: [30, [1, 50], [4, 51]], 12: [22, [6, 36], [2, 37]],
  13: [22, [8, 37], [1, 38]], 14: [24, [4, 40], [5, 41]], 15: [24, [5, 41], [5, 42]]
};
const ALIGN = { 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30], 6: [6, 34], 7: [6, 22, 38], 8: [6, 24, 42], 9: [6, 26, 46], 10: [6, 28, 50],
  11: [6, 30, 54], 12: [6, 32, 58], 13: [6, 34, 62], 14: [6, 26, 46, 66], 15: [6, 26, 48, 70] };

// GF(256) arithmetic
const EXP = new Uint8Array(512), LOG = new Uint8Array(256);
{ let x = 1; for (let i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 256) x ^= 0x11d; } for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255]; }
const gmul = (a, b) => (a && b ? EXP[LOG[a] + LOG[b]] : 0);
function rsGenerator(deg) { let p = [1]; for (let i = 0; i < deg; i++) { const n = new Array(p.length + 1).fill(0); for (let j = 0; j < p.length; j++) { n[j] ^= p[j]; n[j + 1] ^= gmul(p[j], EXP[i]); } p = n; } return p; }
function rsRemainder(data, deg) {
  const gen = rsGenerator(deg), res = new Array(deg).fill(0);
  for (const b of data) { const f = b ^ res.shift(); res.push(0); if (f) for (let i = 0; i < deg; i++) res[i] ^= gmul(gen[i + 1], f); }
  return res;
}

function encodeData(bytes, version) {
  const [ec, ...groups] = EC_M[version];
  const dataCount = groups.reduce((n, [b, d]) => n + b * d, 0);
  const bits = [];
  const put = (v, n) => { for (let i = n - 1; i >= 0; i--) bits.push((v >>> i) & 1); };
  put(0b0100, 4); put(bytes.length, version < 10 ? 8 : 16); for (const b of bytes) put(b, 8);
  put(0, Math.min(4, dataCount * 8 - bits.length));
  while (bits.length % 8) bits.push(0);
  const data = []; for (let i = 0; i < bits.length; i += 8) data.push(parseInt(bits.slice(i, i + 8).join(''), 2));
  for (let pad = 0; data.length < dataCount; pad++) data.push(pad % 2 ? 0x11 : 0xec);
  const blocks = [], ecBlocks = []; let k = 0;
  for (const [b, d] of groups) for (let i = 0; i < b; i++) { const blk = data.slice(k, k + d); k += d; blocks.push(blk); ecBlocks.push(rsRemainder(blk, ec)); }
  const out = [], maxD = Math.max(...blocks.map(b => b.length));
  for (let i = 0; i < maxD; i++) for (const b of blocks) if (i < b.length) out.push(b[i]);
  for (let i = 0; i < ec; i++) for (const b of ecBlocks) out.push(b[i]);
  return out;
}

function capacity(version) { const [, ...g] = EC_M[version]; return g.reduce((n, [b, d]) => n + b * d, 0) - (version < 10 ? 2 : 3); }

export function qrMatrix(text) {
  const bytes = Array.from(new TextEncoder().encode(text));
  let version = 1; while (version <= 15 && capacity(version) < bytes.length) version++;
  if (version > 15) throw new Error('Text zu lang für den QR-Code');
  const size = version * 4 + 17, M = [], F = [];
  for (let i = 0; i < size; i++) { M.push(new Array(size).fill(0)); F.push(new Array(size).fill(false)); }
  const set = (r, c, v) => { M[r][c] = v ? 1 : 0; F[r][c] = true; };
  const finder = (r, c) => { for (let y = -1; y <= 7; y++) for (let x = -1; x <= 7; x++) { const rr = r + y, cc = c + x; if (rr < 0 || cc < 0 || rr >= size || cc >= size) continue;
    const on = y >= 0 && y <= 6 && x >= 0 && x <= 6 && (y === 0 || y === 6 || x === 0 || x === 6 || (y >= 2 && y <= 4 && x >= 2 && x <= 4)); set(rr, cc, on); } };
  finder(0, 0); finder(0, size - 7); finder(size - 7, 0);
  for (let i = 8; i < size - 8; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
  const al = ALIGN[version] || [];
  al.forEach((r, i) => al.forEach((c, j) => { const last = al.length - 1; if ((i === 0 && j === 0) || (i === 0 && j === last) || (i === last && j === 0)) return; for (let y = -2; y <= 2; y++) for (let x = -2; x <= 2; x++) set(r + y, c + x, Math.max(Math.abs(x), Math.abs(y)) !== 1); }));
  // reserve format + version areas
  for (let i = 0; i < 9; i++) { if (!F[8][i]) F[8][i] = true; if (!F[i][8]) F[i][8] = true; }
  for (let i = 0; i < 8; i++) { F[8][size - 1 - i] = true; F[size - 1 - i][8] = true; }
  set(size - 8, 8, 1); // dark module
  if (version >= 7) {
    let rem = version; for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const bits = (version << 12) | rem;
    for (let i = 0; i < 18; i++) { const b = (bits >>> i) & 1, a = size - 11 + (i % 3), c = Math.floor(i / 3); set(c, a, b); set(a, c, b); }
  }
  // data placement
  const cw = encodeData(bytes, version), dataBits = [];
  for (const b of cw) for (let i = 7; i >= 0; i--) dataBits.push((b >>> i) & 1);
  let bi = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) for (let j = 0; j < 2; j++) {
      const c = right - j, upward = ((right + 1) & 2) === 0, r = upward ? size - 1 - vert : vert;
      if (!F[r][c]) { M[r][c] = bi < dataBits.length ? dataBits[bi] : 0; bi++; }
    }
  }
  const MASKS = [(r, c) => (r + c) % 2 === 0, r => r % 2 === 0, (r, c) => c % 3 === 0, (r, c) => (r + c) % 3 === 0,
    (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0, (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
    (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0, (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0];
  const formatBits = mask => { const data = (0b00 << 3) | mask; let rem = data; for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537); return ((data << 10) | rem) ^ 0x5412; };
  const apply = mask => {
    const G = M.map(r => r.slice());
    for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (!F[r][c] && MASKS[mask](r, c)) G[r][c] ^= 1;
    const bits = formatBits(mask);
    for (let i = 0; i <= 5; i++) G[i][8] = (bits >>> i) & 1;
    G[7][8] = (bits >>> 6) & 1; G[8][8] = (bits >>> 7) & 1; G[8][7] = (bits >>> 8) & 1;
    for (let i = 9; i < 15; i++) G[8][14 - i] = (bits >>> i) & 1;
    for (let i = 0; i < 8; i++) G[8][size - 1 - i] = (bits >>> i) & 1;
    for (let i = 8; i < 15; i++) G[size - 15 + i][8] = (bits >>> i) & 1;
    G[size - 8][8] = 1;
    return G;
  };
  const penalty = G => {
    let p = 0;
    for (let pass = 0; pass < 2; pass++) for (let a = 0; a < size; a++) { let run = 1;
      for (let b = 1; b < size; b++) { const v = pass ? G[b][a] : G[a][b], u = pass ? G[b - 1][a] : G[a][b - 1]; if (v === u) { run++; if (run === 5) p += 3; else if (run > 5) p++; } else run = 1; } }
    for (let r = 0; r < size - 1; r++) for (let c = 0; c < size - 1; c++) { const v = G[r][c]; if (v === G[r][c + 1] && v === G[r + 1][c] && v === G[r + 1][c + 1]) p += 3; }
    const pat = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0], pat2 = pat.slice().reverse();
    for (let r = 0; r < size; r++) for (let c = 0; c <= size - 11; c++) for (const P of [pat, pat2]) {
      if (P.every((v, i) => G[r][c + i] === v)) p += 40; if (P.every((v, i) => G[c + i][r] === v)) p += 40; }
    let dark = 0; for (const row of G) for (const v of row) dark += v;
    p += Math.floor(Math.abs(dark * 20 / (size * size) - 10)) * 10;
    return p;
  };
  let best = null, bestScore = Infinity;
  for (let m = 0; m < 8; m++) { const G = apply(m), s = penalty(G); if (s < bestScore) { bestScore = s; best = G; } }
  return best;
}

export function qrSvg(text, { margin = 4, dark = '#000', light = '#fff' } = {}) {
  const m = qrMatrix(text), n = m.length + margin * 2;
  let d = '';
  m.forEach((row, r) => row.forEach((v, c) => { if (v) d += `M${c + margin} ${r + margin}h1v1h-1z`; }));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges"><rect width="${n}" height="${n}" fill="${light}"/><path d="${d}" fill="${dark}"/></svg>`;
}
