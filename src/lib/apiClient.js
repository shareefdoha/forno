/* Thin wrapper around the local API in /server.
   Vite proxies /api and /uploads to it in dev (see vite.config.js), so the
   same relative paths work in the browser and behind any reverse proxy. */

const TOKEN_KEY = 'forno.session';

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* private browsing — the session just won't survive a reload */
  }
}

const OFFLINE =
  'Cannot reach the API server. Start it with `npm run dev` (or `npm run dev:api`).';

export async function api(path, { method = 'GET', body, auth = false } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error(OFFLINE);
  }

  if (res.status === 204) return null;

  let payload = null;
  try {
    payload = await res.json();
  } catch {
    /* non-JSON response — fall through to the status check */
  }

  if (!res.ok) {
    if (res.status === 401) setToken(null);   // stale session; force re-login
    throw new Error(payload?.error || `Request failed (${res.status})`);
  }

  return payload;
}
