const crypto = require('crypto');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  const { team, clue, password } = JSON.parse(event.body || '{}');

  if (!team || !clue || !password) {
    return { statusCode: 200, body: JSON.stringify({ ok:false, err:'missing' }) };
  }

  // Chei de environment:
  //  - CLUE_<CLUe>_<TEAM>           = hash sha256(team + '|' + parola)
  //  - CLUE_<CLUe>_<TEAM>_NEXT      = textul indiciului următor (returnat doar la parolă corectă)
  const keyHash = `CLUE_${clue.toUpperCase()}_${team.toUpperCase()}`;
  const keyNext = `CLUE_${clue.toUpperCase()}_${team.toUpperCase()}_NEXT`;

  const expectedHash = process.env[keyHash];
  if (!expectedHash) {
    return { statusCode: 200, body: JSON.stringify({ ok:false, err:'nohash' }) };
  }

  const hash = crypto.createHash('sha256').update(`${team}|${password}`).digest('hex');

  if (hash === expectedHash) {
    const nextText = process.env[keyNext] || '✔️ Corect.';
    // opțional: nextUrl (dacă vrei să redirecționezi)
    const nextUrl = process.env[`${keyNext}_URL`] || null;
    return { statusCode: 200, body: JSON.stringify({ ok:true, nextText, nextUrl }) };
  } else {
    return { statusCode: 200, body: JSON.stringify({ ok:false, err:'wrong' }) };
  }
};
