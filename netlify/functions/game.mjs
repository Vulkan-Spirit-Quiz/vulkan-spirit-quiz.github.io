// Netlify Function: /api/game  (Netlify Database / Postgres)
import { getDatabase } from '@netlify/database';
import { handleGame } from '../../lib/game.mjs';

let db;
export default async (req, context) => {
  db ||= getDatabase();
  const query = async (text, params = []) => (await db.pool.query(text, params)).rows;
  return handleGame(req, { query, ip: context?.ip || req.headers.get('x-nf-client-connection-ip') || '' });
};
