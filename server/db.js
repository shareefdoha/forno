import { ROOT } from './env.js';           // must be first: it populates process.env
import mysql from 'mysql2/promise';
import path from 'node:path';
import fs from 'node:fs';

export { ROOT };

/**
 * Uploaded photos still live on local disk under DATA_DIR (the database no
 * longer does — it lives in MySQL now). Locally that's server/data; on a
 * host it should point at a persistent path outside the deployed/git folder,
 * otherwise uploaded images are wiped on every redeploy.
 */
const BASE = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(ROOT, 'server', 'data');

export const UPLOAD_DIR = path.join(BASE, 'uploads');

fs.mkdirSync(BASE, { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

/**
 * MySQL connection pool. Reads standard DB_* environment variables —
 * these are what you set in the Hostinger hPanel env var UI (or .env locally).
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  decimalNumbers: true,   // DECIMAL columns (price) come back as JS numbers, not strings
});

// Kept for compatibility with server/index.js, which does `await db.waitReady`
// before anything else. mysql2's pool connects lazily per-query, so there is
// nothing to wait for — this just verifies the pool can reach the server.
export const db = {
  waitReady: pool.getConnection().then((c) => c.release()),
};

export async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      slug        VARCHAR(100) NOT NULL UNIQUE,
      name_en     VARCHAR(255) NOT NULL,
      name_ar     VARCHAR(255) NOT NULL DEFAULT '',
      sort_order  INT NOT NULL DEFAULT 0,
      is_active   BOOLEAN NOT NULL DEFAULT TRUE,
      created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX categories_sort_idx (sort_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id              INT AUTO_INCREMENT PRIMARY KEY,
      category_id     INT NOT NULL,
      name_en         VARCHAR(255) NOT NULL,
      name_ar         VARCHAR(255) NOT NULL DEFAULT '',
      description_en  TEXT NOT NULL,
      description_ar  TEXT NOT NULL,
      price           DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
      image_url       VARCHAR(500),
      image_path      VARCHAR(500),
      is_enabled      BOOLEAN NOT NULL DEFAULT TRUE,
      sort_order      INT NOT NULL DEFAULT 0,
      created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_menu_items_category FOREIGN KEY (category_id)
        REFERENCES categories (id) ON DELETE CASCADE,
      INDEX menu_items_category_idx (category_id),
      INDEX menu_items_sort_idx (category_id, sort_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      email         VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      salt          VARCHAR(255) NOT NULL,
      created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      token      VARCHAR(255) PRIMARY KEY,
      user_id    INT NOT NULL,
      expires_at DATETIME NOT NULL,
      CONSTRAINT fk_sessions_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE,
      INDEX sessions_expiry_idx (expires_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

/**
 * Small helper so route handlers still read like plain SQL. Route code
 * throughout this project was written for Postgres-style $1, $2... params —
 * this translates them to MySQL's ? placeholders so those call sites did not
 * all need rewriting by hand.
 */
function toMysql(sql) {
  return sql.replace(/\$\d+/g, '?');
}

/** For SELECT queries — returns an array of rows. */
export async function q(sql, params = []) {
  const [rows] = await pool.query(toMysql(sql), params);
  return rows;
}

/** For SELECT queries — returns the first row, or null. */
export async function one(sql, params = []) {
  const rows = await q(sql, params);
  return rows[0] ?? null;
}

/**
 * For INSERT / UPDATE / DELETE. MySQL has no RETURNING clause, so this
 * returns the raw result header instead (insertId, affectedRows) — call
 * sites that need the written row do a follow-up one() select by id.
 */
export async function exec(sql, params = []) {
  const [result] = await pool.query(toMysql(sql), params);
  return result;
}
