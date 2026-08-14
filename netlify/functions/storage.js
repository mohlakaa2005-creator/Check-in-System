// Simple key-value API backed by Netlify Blobs.
// GET  /.netlify/functions/storage?key=foo        -> { key, value }
// POST /.netlify/functions/storage  { key, value } -> { ok: true }
//
// Netlify usually auto-injects Blobs credentials into Functions, but some
// setups need them supplied explicitly via BLOBS_SITE_ID / BLOBS_TOKEN
// environment variables (Site configuration -> Environment variables).

const { getStore } = require('@netlify/blobs');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

function getBlobStore() {
  const opts = { name: 'checkin-system' };
  if (process.env.BLOBS_SITE_ID && process.env.BLOBS_TOKEN) {
    opts.siteID = process.env.BLOBS_SITE_ID;
    opts.token = process.env.BLOBS_TOKEN;
  }
  return getStore(opts);
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  try {
    const store = getBlobStore();

    if (event.httpMethod === 'GET') {
      const key = event.queryStringParameters && event.queryStringParameters.key;
      if (!key) {
        return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'key is required' }) };
      }
      const value = await store.get(key);
      if (value === null) {
        return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ error: 'not found' }) };
      }
      return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ key, value }) };
    }

    if (event.httpMethod === 'POST') {
      let body;
      try {
        body = JSON.parse(event.body || '{}');
      } catch (e) {
        return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'invalid JSON body' }) };
      }
      if (!body.key) {
        return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'key is required' }) };
      }
      await store.set(body.key, body.value ?? '');
      return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'method not allowed' }) };
  } catch (err) {
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: err.message, type: err.name }) };
  }
};
