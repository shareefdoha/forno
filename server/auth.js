import crypto from 'node:crypto';
import { q, one, exec } from './db.js';

/* Password hashing uses Node's built-in scrypt — no native modules to compile,
   and it's a memory-hard KDF rather than a bare hash. */

const KEYLEN = 64;

function hash(password, salt) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, KEYLEN, (err, derived) => {
      if (err) reject(err);
      else resolve(derived.toString('hex'));
    });
  });
}

export async function createUser(email, password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const password_hash = await hash(password, salt);
  const normalizedEmail = email.trim().toLowerCase();
  // MySQL has no RETURNING clause, and no ON CONFLICT — the MySQL equivalent
  // for "insert, or update if the email already exists" is ON DUPLICATE KEY
  // UPDATE (relies on the UNIQUE constraint on users.email).
  await exec(
    `insert into users (email, password_hash, salt) values ($1, $2, $3)
     on duplicate key update password_hash = values(password_hash), salt = values(salt)`,
    [normalizedEmail, password_hash, salt],
  );
  return one('select id, email from users where email = $1', [normalizedEmail]);
}

export async function verifyLogin(email, password) {
  const user = await one('select * from users where email = $1', [email.trim().toLowerCase()]);
  if (!user) return null;

  const attempt = await hash(password, user.salt);
  const a = Buffer.from(attempt, 'hex');
  const b = Buffer.from(user.password_hash, 'hex');
  // Constant-time compare so a wrong password can't be narrowed down by timing.
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  return { id: user.id, email: user.email };
}

const SESSION_DAYS = 14;

// MySQL's DATETIME columns want 'YYYY-MM-DD HH:MM:SS', not JS's
// toISOString() ('YYYY-MM-DDTHH:MM:SS.sssZ') — Postgres accepted the ISO
// string directly, MySQL rejects it with "Incorrect datetime value".
function toMysqlDatetime(date) {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

export async function createSession(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5);
  await q('insert into sessions (token, user_id, expires_at) values ($1, $2, $3)', [
    token,
    userId,
    toMysqlDatetime(expires),
  ]);
  return { token, expires_at: expires.toISOString() };
}

export async function destroySession(token) {
  if (token) await q('delete from sessions where token = $1', [token]);
}

export async function userForToken(token) {
  if (!token) return null;
  const row = await one(
    `select u.id, u.email, s.expires_at
       from sessions s join users u on u.id = s.user_id
      where s.token = $1 and s.expires_at > now()`,
    [token],
  );
  return row ? { id: row.id, email: row.email } : null;
}

/** Express middleware: rejects anything without a live session. */
export function requireAuth() {
  return async (req, res, next) => {
    const header = req.get('authorization') || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    const user = await userForToken(token);
    if (!user) return res.status(401).json({ error: 'Not signed in.' });
    req.user = user;
    next();
  };
}

export async function purgeExpiredSessions() {
  await q('delete from sessions where expires_at <= now()');
}
