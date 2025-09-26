// netlify/functions/verify.js
const crypto = require('crypto');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode:405, body: 'Method Not Allowed' };
  }

  let body = {};
  try { body = JSON.parse(event.body || '{}'); } catch(e) {}
  const { clue, password } = body || {};

  if (!clue || !password) {
    return { statusCode:200, body: JSON.stringify({ ok:false, err:'missing' }) };
  }

  // 1) hash incoming password
  const incomingHash = crypto.createHash('sha256').update(String(password)).digest('hex');

  // 2) expected global hash (env var CLUE_COMMON) OR per-clue fallback
  const common = process.env['CLUE_COMMON'];
  const perClue = process.env[`CLUE_${String(clue).toUpperCase()}_HASH`]; // optional override
  const expectedHash = perClue || common;

  if (!expectedHash) {
    return { statusCode:200, body: JSON.stringify({ ok:false, err:'nohash' }) };
  }

  if (incomingHash !== expectedHash) {
    return { statusCode:200, body: JSON.stringify({ ok:false, err:'wrong' }) };
  }

  // password OK -> return next text (env var CLUE_<CLUE>_NEXT) or generic
  const nextText = process.env[`CLUE_${String(clue).toUpperCase()}_NEXT`] || '✔️ Corect! Mergi mai departe.';
  const nextUrl  = process.env[`CLUE_${String(clue).toUpperCase()}_NEXT_URL`] || null;

  return { statusCode:200, body: JSON.stringify({ ok:true, nextText, nextUrl }) };
};
