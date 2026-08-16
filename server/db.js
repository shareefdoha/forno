import { PGlite } from '@electric-sql/pglite';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const here = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.join(here, '..');
export const DATA_DIR = path.join(ROOT, 'server', 'data', 'pgdata');
export const UPLOAD_DIR = path.join(ROOT, 'server', 'data', 'uploads');

fs.mkdirSync(path.dirname(DATA_DIR), { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

/**
 * PGlite is genuine PostgreSQL compiled to WebAssembly, running inside this
 * Node process and persisting to server/data/pgdata. Same SQL, same types,
 * same constraints as a server install — but nothing to install and no
 * administrator rights needed.
 */
export const db = new PGlite(DATA_DIR);

export async function migrate() {
  await db.exec(`
    create table if not exists categories (
      id          serial primary key,
      slug        text not null unique,
      name_en     text not null,
      name_ar     text not null default '',
      sort_order  integer not null default 0,
      is_active   boolean not null default true,
      created_at  timestamptz not null default now()
    );

    create table if not exists menu_items (
      id              serial primary key,
      category_id     integer not null references categories (id) on delete cascade,
      name_en         text not null,
      name_ar         text not null default '',
      description_en  text not null default '',
      description_ar  text not null default '',
      price           numeric(10, 2) not null default 0 check (price >= 0),
      image_url       text,
      image_path      text,
      is_enabled      boolean not null default true,
      sort_order      integer not null default 0,
      created_at      timestamptz not null default now(),
      updated_at      timestamptz not null default now()
    );

    create index if not exists menu_items_category_idx on menu_items (category_id);
    create index if not exists menu_items_sort_idx     on menu_items (category_id, sort_order);
    create index if not exists categories_sort_idx     on categories (sort_order);

    create table if not exists users (
      id            serial primary key,
      email         text not null unique,
      password_hash text not null,
      salt          text not null,
      created_at    timestamptz not null default now()
    );

    create table if not exists sessions (
      token      text primary key,
      user_id    integer not null references users (id) on delete cascade,
      expires_at timestamptz not null
    );

    create index if not exists sessions_expiry_idx on sessions (expires_at);
  `);
}

/** Small helper so route handlers read like plain SQL. */
export async function q(sql, params = []) {
  const res = await db.query(sql, params);
  return res.rows;
}

export async function one(sql, params = []) {
  const rows = await q(sql, params);
  return rows[0] ?? null;
}
