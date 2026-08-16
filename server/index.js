import express from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { db, q, one, migrate, UPLOAD_DIR, ROOT } from './db.js';
import { seedMenu } from './seed.js';
import {
  createUser, verifyLogin, createSession, destroySession,
  userForToken, requireAuth, purgeExpiredSessions,
} from './auth.js';

// Hosts usually inject PORT; API_PORT is the local override.
// .env is already loaded by server/env.js, imported via db.js above.
const PORT = Number(process.env.PORT || process.env.API_PORT || 3001);

const app = express();
app.use(cors());
app.use(express.json({ limit: '12mb' }));   // headroom for base64 image uploads

/* Uploaded photos are served straight off disk. */
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '1y' }));

const wrap = (fn) => (req, res) => fn(req, res).catch((err) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Server error' });
});

/* ════════════════════════════ health ════════════════════════════ */

app.get('/api/health', wrap(async (_req, res) => {
  const c = await one('select count(*)::int as n from categories');
  const i = await one('select count(*)::int as n from menu_items');
  res.json({ ok: true, database: 'postgres (pglite)', categories: c.n, items: i.n });
}));

/* ════════════════════════════ auth ════════════════════════════ */

app.post('/api/auth/login', wrap(async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

  const user = await verifyLogin(email, password);
  // Same message either way so the response can't be used to enumerate accounts.
  if (!user) return res.status(401).json({ error: 'Wrong email or password.' });

  const session = await createSession(user.id);
  res.json({ token: session.token, expires_at: session.expires_at, user });
}));

app.post('/api/auth/logout', wrap(async (req, res) => {
  const header = req.get('authorization') || '';
  await destroySession(header.startsWith('Bearer ') ? header.slice(7) : null);
  res.json({ ok: true });
}));

app.get('/api/auth/me', wrap(async (req, res) => {
  const header = req.get('authorization') || '';
  const user = await userForToken(header.startsWith('Bearer ') ? header.slice(7) : null);
  res.json({ user });
}));

/* ════════════════════════════ reads ════════════════════════════ */

app.get('/api/categories', wrap(async (req, res) => {
  const onlyActive = req.query.onlyActive !== 'false';
  const rows = await q(
    `select id, slug, name_en, name_ar, sort_order, is_active
       from categories ${onlyActive ? 'where is_active = true' : ''}
      order by sort_order asc, id asc`,
  );
  res.json(rows);
}));

app.get('/api/menu-items', wrap(async (_req, res) => {
  const rows = await q(
    `select id, category_id, name_en, name_ar, description_en, description_ar,
            price::float8 as price, image_url, image_path, is_enabled, sort_order
       from menu_items
      order by sort_order asc, name_en asc`,
  );
  res.json(rows);
}));

/* ════════════════════════════ writes ════════════════════════════ */

const ITEM_FIELDS = [
  'category_id', 'name_en', 'name_ar', 'description_en', 'description_ar',
  'price', 'image_url', 'image_path', 'is_enabled', 'sort_order',
];

app.post('/api/menu-items', requireAuth(), wrap(async (req, res) => {
  const b = req.body ?? {};
  const row = await one(
    `insert into menu_items (${ITEM_FIELDS.join(', ')})
     values (${ITEM_FIELDS.map((_, k) => `$${k + 1}`).join(', ')})
     returning *, price::float8 as price`,
    ITEM_FIELDS.map((f) => b[f] ?? (f === 'price' || f === 'sort_order' ? 0 : null)),
  );
  res.status(201).json(row);
}));

app.patch('/api/menu-items/:id', requireAuth(), wrap(async (req, res) => {
  const b = req.body ?? {};
  const fields = ITEM_FIELDS.filter((f) => f in b);
  if (!fields.length) return res.status(400).json({ error: 'Nothing to update.' });

  const sets = fields.map((f, k) => `${f} = $${k + 1}`).join(', ');
  const row = await one(
    `update menu_items set ${sets}, updated_at = now()
      where id = $${fields.length + 1}
      returning *, price::float8 as price`,
    [...fields.map((f) => b[f]), req.params.id],
  );
  if (!row) return res.status(404).json({ error: 'That dish no longer exists.' });
  res.json(row);
}));

app.delete('/api/menu-items/:id', requireAuth(), wrap(async (req, res) => {
  const row = await one('delete from menu_items where id = $1 returning image_path', [req.params.id]);
  if (!row) return res.status(404).json({ error: 'That dish no longer exists.' });
  if (row.image_path) {
    const file = path.join(UPLOAD_DIR, path.basename(row.image_path));
    fs.promises.unlink(file).catch(() => {});   // a missing file must not fail the delete
  }
  res.json({ ok: true });
}));

/* ─────────────────────────── categories ─────────────────────────── */

app.post('/api/categories', requireAuth(), wrap(async (req, res) => {
  const b = req.body ?? {};
  if (!b.slug || !b.name_en) return res.status(400).json({ error: 'Name and slug are required.' });
  const clash = await one('select id from categories where slug = $1', [b.slug]);
  if (clash) return res.status(409).json({ error: `A category with the slug "${b.slug}" already exists.` });

  const row = await one(
    `insert into categories (slug, name_en, name_ar, sort_order, is_active)
     values ($1,$2,$3,$4,$5) returning *`,
    [b.slug, b.name_en, b.name_ar ?? '', b.sort_order ?? 0, b.is_active ?? true],
  );
  res.status(201).json(row);
}));

const CAT_FIELDS = ['slug', 'name_en', 'name_ar', 'sort_order', 'is_active'];

app.patch('/api/categories/:id', requireAuth(), wrap(async (req, res) => {
  const b = req.body ?? {};
  const fields = CAT_FIELDS.filter((f) => f in b);
  if (!fields.length) return res.status(400).json({ error: 'Nothing to update.' });

  const sets = fields.map((f, k) => `${f} = $${k + 1}`).join(', ');
  const row = await one(
    `update categories set ${sets} where id = $${fields.length + 1} returning *`,
    [...fields.map((f) => b[f]), req.params.id],
  );
  if (!row) return res.status(404).json({ error: 'That category no longer exists.' });
  res.json(row);
}));

app.delete('/api/categories/:id', requireAuth(), wrap(async (req, res) => {
  // ON DELETE CASCADE takes the dishes with it.
  const row = await one('delete from categories where id = $1 returning id', [req.params.id]);
  if (!row) return res.status(404).json({ error: 'That category no longer exists.' });
  res.json({ ok: true });
}));

/* ════════════════════════════ uploads ════════════════════════════ */

const EXT_FOR = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif',
};

app.post('/api/upload', requireAuth(), wrap(async (req, res) => {
  const { filename, contentType, dataBase64 } = req.body ?? {};
  if (!dataBase64) return res.status(400).json({ error: 'No file received.' });

  const ext = EXT_FOR[contentType] || (filename || '').split('.').pop()?.toLowerCase() || 'jpg';
  if (!Object.values(EXT_FOR).includes(ext)) {
    return res.status(400).json({ error: 'Only JPG, PNG, WebP or GIF images are allowed.' });
  }

  const buffer = Buffer.from(dataBase64, 'base64');
  if (buffer.length > 8 * 1024 * 1024) {
    return res.status(413).json({ error: 'Image is larger than 8 MB.' });
  }

  const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`;
  await fs.promises.writeFile(path.join(UPLOAD_DIR, name), buffer);

  res.status(201).json({ url: `/uploads/${name}`, path: name });
}));

/* ═══════════════════════ built frontend ═══════════════════════ */

/**
 * In production one process serves both halves: `npm run build` writes dist/,
 * and Express serves it here. Any non-API path falls through to index.html so
 * client-side routes like /admin survive a refresh.
 *
 * In development this block is inert (no dist/ yet) and Vite serves the app
 * on 5173, proxying /api here.
 */
const DIST = path.join(ROOT, 'dist');

if (fs.existsSync(path.join(DIST, 'index.html'))) {
  app.use(express.static(DIST, { index: false }));

  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    res.sendFile(path.join(DIST, 'index.html'));
  });
}

/* ════════════════════════════ boot ════════════════════════════ */

async function start() {
  await db.waitReady;
  await migrate();
  await purgeExpiredSessions();

  const seeded = await seedMenu();

  // First run creates the owner account. Set ADMIN_EMAIL / ADMIN_PASSWORD in
  // .env to choose them; otherwise a random password is generated and printed
  // here once, so it never sits in a file.
  const existingUser = await one('select count(*)::int as n from users');
  let generated = null;
  if (existingUser.n === 0) {
    const email = process.env.ADMIN_EMAIL || 'admin@forno.local';
    const password = process.env.ADMIN_PASSWORD || crypto.randomBytes(9).toString('base64url');
    if (!process.env.ADMIN_PASSWORD) generated = password;
    await createUser(email, password);
    console.log(`\n  Admin account created: ${email}`);
    if (generated) console.log(`  Password: ${generated}    <-- save this now, it is not stored anywhere`);
  }

  const c = await one('select count(*)::int as n from categories');
  const i = await one('select count(*)::int as n from menu_items');

  const servingSite = fs.existsSync(path.join(DIST, 'index.html'));

  // Bind all interfaces, not just loopback. Hosts route traffic in from
  // outside the container, so a localhost-only bind looks like a dead service
  // and the health check fails.
  const HOST = process.env.HOST || '0.0.0.0';

  app.listen(PORT, HOST, () => {
    console.log(`\n  Forno ${servingSite ? 'site + API' : 'API'}  ->  http://${HOST}:${PORT}`);
    console.log(`  Database   ->  PostgreSQL (PGlite), server/data/pgdata`);
    console.log(`  Menu       ->  ${c.n} categories, ${i.n} dishes${seeded.skipped ? ' (already present)' : ' (seeded)'}`);
    if (servingSite) console.log(`  Serving    ->  dist/ (production build)`);
    console.log('');
  });
}

start().catch((err) => {
  console.error('Failed to start API:', err);
  process.exit(1);
});
