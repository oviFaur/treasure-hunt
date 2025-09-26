// netlify/functions/verify.js
const crypto = require('crypto');
const clues = require('./clues.json');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body = {};
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ ok:false, err:'invalid-json' }) };
  }

  const { clue, password } = body || {};
  if (!clue || !password) {
    return { statusCode: 200, body: JSON.stringify({ ok:false, err:'missing' }) };
  }

  // calculează hash parola primită
  const incomingHash = crypto.createHash('sha256').update(String(password)).digest('hex');
  const expectedHash = process.env['CLUE_COMMON'];

  if (!expectedHash || incomingHash !== expectedHash) {
    return { statusCode: 200, body: JSON.stringify({ ok:false, err:'wrong' }) };
  }

  // returnează textul indiciului
  const clueKey = clue.toLowerCase();
  const nextText = clues[clueKey] || 'No clue text found.';

  return {
    statusCode: 200,
    body: JSON.stringify({ ok:true, nextText })
  };
};
