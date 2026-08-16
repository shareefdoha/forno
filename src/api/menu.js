import { api } from '../lib/apiClient';

/* Every read and write goes to the local API in /server, which stores
   everything in PostgreSQL (see server/db.js). */

/* ══════════════════════════════ READ ══════════════════════════════ */

export async function fetchCategories({ onlyActive = true } = {}) {
  return api(`/categories?onlyActive=${onlyActive ? 'true' : 'false'}`);
}

/**
 * The whole menu is ~70 rows, so it is fetched once and filtered by category
 * in the browser — the same behaviour the original static page had.
 */
export async function fetchMenuItems({ categoryId = null } = {}) {
  const rows = await api('/menu-items');
  return categoryId ? rows.filter((i) => i.category_id === categoryId) : rows;
}

/* ══════════════════════════ IMAGE STORAGE ══════════════════════════ */

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    // result looks like "data:image/jpeg;base64,AAAA…" — strip the prefix.
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads to the API, which writes the file under server/data/uploads and
 * serves it from /uploads. Returns the public URL plus the stored filename
 * so the old file can be removed when it is replaced.
 */
export async function uploadMenuImage(file) {
  const dataBase64 = await toBase64(file);
  const res = await api('/upload', {
    method: 'POST',
    auth: true,
    body: { filename: file.name, contentType: file.type, dataBase64 },
  });
  return { url: res.url, path: res.path };
}

export async function removeMenuImage() {
  // The API deletes the file alongside the row it belonged to, so there is
  // nothing to do here. Kept so callers don't need to special-case it.
}

/* ══════════════════════════════ WRITE ══════════════════════════════ */

export async function createMenuItem(payload) {
  return api('/menu-items', { method: 'POST', auth: true, body: payload });
}

export async function updateMenuItem(id, payload) {
  return api(`/menu-items/${id}`, { method: 'PATCH', auth: true, body: payload });
}

export async function deleteMenuItem(item) {
  return api(`/menu-items/${item.id}`, { method: 'DELETE', auth: true });
}

export async function setItemEnabled(id, isEnabled) {
  return updateMenuItem(id, { is_enabled: isEnabled });
}

/* ─────────────────────────── categories ─────────────────────────── */

export async function createCategory(payload) {
  return api('/categories', { method: 'POST', auth: true, body: payload });
}

export async function updateCategory(id, payload) {
  return api(`/categories/${id}`, { method: 'PATCH', auth: true, body: payload });
}

export async function deleteCategory(id) {
  // The database cascades the delete to the category's dishes.
  return api(`/categories/${id}`, { method: 'DELETE', auth: true });
}
