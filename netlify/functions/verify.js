// netlify/functions/verify.js
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

// load clues.json
let clues = {};
try {
  const filePath = path.join(__dirname, '../../clues/clues.json');
  const raw = fs.readFileSync(filePath, 'utf8');
  clues = JSON.parse(raw);
  console.log('[DEBUG] Loaded clues.json with keys:', Object.keys(clues));
} catch (err) {
  console.error('[ERROR] Failed to load clues.json:', err);
}

exports.handler = async (event) => {
  console.log('[DEBUG] Event method:', event.httpMethod);

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body = {};
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    console.error('[ERROR] Failed to parse body:', e);
  }
  const { clue, password } = body || {};

  console.log('[DEBUG] Incoming body:', body);

  if (!clue || !password) {
    console.warn('[WARN] Missing clue or password');
    return { statusCode: 200, body: JSON.stringify({ ok:false, err:'missing' }) };
  }

  // calculate hash
  const incomingHash = crypto.createHash('sha256').update(String(password)).digest('hex');
  const expectedHash = process.env['CLUE_COMMON'];

  console.log('[DEBUG] Password provided:', `"${password}"`);
  console.log('[DEBUG] Incoming hash:', incomingHash);
  console.log('[DEBUG] Expected hash:', expectedHash);

  if (!expectedHash) {
    console.error('[ERROR] Missing env var CLUE_COMMON');
    return { statusCode: 500, body: JSON.stringify({ ok:false, err:'server-misconfig' }) };
  }

  if (incomingHash !== expectedHash) {
    console.warn('[WARN] Hash mismatch');
    return { statusCode: 200, body: JSON.stringify({ ok:false, err:'wrong', incomingHash, expectedHash }) };
  }

  const clueKey = clue.toLowerCase();
  const nextText = clues[clueKey] || 'No clue text found.';

  console.log('[DEBUG] Returning text for clue:', clueKey);

  return { statusCode: 200, body: JSON.stringify({ ok:true, nextText }) };
};
