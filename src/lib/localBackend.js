/* ═══════════════════════════════════════════════════════════════════════
 * LOCAL DEMO BACKEND — development only.
 *
 * A browser-storage stand-in for Supabase so the CMS is usable before the
 * real database exists. It implements just enough of the data layer for
 * /admin to work end to end: sign in, CRUD, image upload, stock toggle.
 *
 * ⚠ THIS IS NOT A DATABASE.
 *   • Data lives in this browser's localStorage. Nobody else can see it.
 *   • Clearing site data wipes it. It does not sync between devices.
 *   • Everything entered here is LOST when you switch to Supabase —
 *     the real menu comes from supabase/03_seed.sql.
 *   • The demo password below is public knowledge. That is safe only
 *     because this module is disabled outside `npm run dev` — see
 *     `isDemoBackend` in ./supabase.js, which requires import.meta.env.DEV.
 *
 * To remove once you are live: delete this file, delete demoData.js, and
 * drop the `isDemoBackend` branches from api/menu.js and AuthContext.jsx.
 * ═══════════════════════════════════════════════════════════════════════ */

import { DEMO_CATEGORIES, DEMO_ITEMS } from './demoData';

export const DEMO_EMAIL = 'admin@forno.local';
export const DEMO_PASSWORD = 'forno-demo';

const K = {
  cats: 'forno.demo.categories',
  items: 'forno.demo.items',
  session: 'forno.demo.session',
};

const FULL_STORAGE =
  'Browser storage is full. Delete some uploaded photos, or use "Reset demo data" in the dashboard.';

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    throw new Error(FULL_STORAGE);
  }
}

function seed() {
  if (!localStorage.getItem(K.cats)) write(K.cats, DEMO_CATEGORIES);
  if (!localStorage.getItem(K.items)) write(K.items, DEMO_ITEMS);
}

const uid = () =>
  globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

/* ───────────────────────────── reads ───────────────────────────── */

export function listCategories({ onlyActive = true } = {}) {
  seed();
  const rows = read(K.cats, []).slice().sort((a, b) => a.sort_order - b.sort_order);
  return onlyActive ? rows.filter((c) => c.is_active) : rows;
}

export function listItems({ categoryId = null } = {}) {
  seed();
  const rows = read(K.items, [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order || a.name_en.localeCompare(b.name_en));
  return categoryId ? rows.filter((i) => i.category_id === categoryId) : rows;
}

/* ───────────────────────────── writes ──────────────────────────── */

export function createItem(payload) {
  seed();
  const rows = read(K.items, []);
  const row = { ...payload, id: uid() };
  write(K.items, [...rows, row]);
  return row;
}

export function updateItem(id, payload) {
  seed();
  const rows = read(K.items, []);
  const next = rows.map((r) => (r.id === id ? { ...r, ...payload } : r));
  if (!rows.some((r) => r.id === id)) throw new Error('That dish no longer exists.');
  write(K.items, next);
  return next.find((r) => r.id === id);
}

export function deleteItem(item) {
  seed();
  write(K.items, read(K.items, []).filter((r) => r.id !== item.id));
}

export function createCategory(payload) {
  seed();
  const rows = read(K.cats, []);
  if (rows.some((c) => c.slug === payload.slug)) {
    throw new Error(`A category with the slug "${payload.slug}" already exists.`);
  }
  const row = { ...payload, id: uid() };
  write(K.cats, [...rows, row]);
  return row;
}

export function updateCategory(id, payload) {
  seed();
  const rows = read(K.cats, []);
  const next = rows.map((c) => (c.id === id ? { ...c, ...payload } : c));
  write(K.cats, next);
  return next.find((c) => c.id === id);
}

export function deleteCategory(id) {
  seed();
  // Mirrors ON DELETE CASCADE in the real schema.
  write(K.cats, read(K.cats, []).filter((c) => c.id !== id));
  write(K.items, read(K.items, []).filter((i) => i.category_id !== id));
}

export function resetAll() {
  localStorage.removeItem(K.cats);
  localStorage.removeItem(K.items);
  seed();
}

/* ───────────────────────────── images ──────────────────────────── */

/**
 * There is no object store here, so the photo is downscaled and inlined as
 * a data URL. localStorage caps out around 5 MB, hence the aggressive resize.
 */
export function storeImage(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const maxW = 900;
      const scale = Math.min(1, maxW / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve({ url: canvas.toDataURL('image/jpeg', 0.82), path: null });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('That file could not be read as an image.'));
    };

    img.src = objectUrl;
  });
}

/* ────────────────────────────── auth ───────────────────────────── */

export function getSession() {
  return read(K.session, null);
}

export function signIn(email, password) {
  if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
    throw new Error(`Demo login is ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  }
  const session = { user: { id: 'demo-user', email: DEMO_EMAIL }, demo: true };
  write(K.session, session);
  return session;
}

export function signOut() {
  localStorage.removeItem(K.session);
}
