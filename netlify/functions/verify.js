// netlify/functions/verify.js
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const clues = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../clues/clues.json'), 'utf8')
);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body = {};
  try { body = JSON.parse(event.body || '{}'); } catch(e) {}
  const { clue, password } = body || {};

  if (!clue || !password) {
    return { statusCode: 200, body: JSON.stringify({ ok:false, err:'missing' }) };
  }

  // hash parola primită
  const incomingHash = crypto.createHash('sha256').update(String(password)).digest('hex');
  const expectedHash = process.env['CLUE_COMMON'];

  if (!expectedHash || incomingHash !== expectedHash) {
    return { statusCode: 200, body: JSON.stringify({ ok:false, err:'wrong' }) };
  }

  const nextText = clues[clue.toLowerCase()] || 'No clue text found.';

  return { statusCode: 200, body: JSON.stringify({ ok:true, nextText }) };
};
