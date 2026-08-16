import { requireSupabase, IMAGE_BUCKET } from '../lib/supabase';

/* ══════════════════════════════ READ ══════════════════════════════ */

export async function fetchCategories({ onlyActive = true } = {}) {
  let q = requireSupabase()
    .from('categories')
    .select('id, slug, name_en, name_ar, sort_order, is_active')
    .order('sort_order', { ascending: true });

  if (onlyActive) q = q.eq('is_active', true);

  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

/**
 * The whole menu is ~70 rows, so we fetch it once and filter by category in
 * the browser — exactly how the original static page behaved, minus the
 * network round-trip on every tab click.
 */
export async function fetchMenuItems({ categoryId = null } = {}) {
  let q = requireSupabase()
    .from('menu_items')
    .select(
      'id, category_id, name_en, name_ar, description_en, description_ar, price, image_url, image_path, is_available, sort_order',
    )
    .order('sort_order', { ascending: true })
    .order('name_en', { ascending: true });

  if (categoryId) q = q.eq('category_id', categoryId);

  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

/* ══════════════════════════ IMAGE STORAGE ══════════════════════════ */

const SAFE = (s) => s.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/^-|-$/g, '');

/**
 * Uploads a File to the public `menu-images` bucket and returns both the
 * public URL (stored in menu_items.image_url and rendered by the site) and
 * the object path (stored in image_path so the old file can be removed).
 */
export async function uploadMenuImage(file) {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `items/${Date.now()}-${SAFE(file.name.replace(/\.[^.]+$/, ''))}.${ext}`;

  const { error } = await requireSupabase().storage.from(IMAGE_BUCKET).upload(path, file, {
    cacheControl: '31536000',
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw error;

  const { data } = requireSupabase().storage.from(IMAGE_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

export async function removeMenuImage(path) {
  if (!path) return;
  const { error } = await requireSupabase().storage.from(IMAGE_BUCKET).remove([path]);
  // A missing file should never block deleting the row it belonged to.
  if (error) console.warn('Could not remove image', path, error.message);
}

/* ══════════════════════════════ WRITE ══════════════════════════════ */

export async function createMenuItem(payload) {
  const { data, error } = await requireSupabase().from('menu_items').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateMenuItem(id, payload) {
  const { data, error } = await requireSupabase()
    .from('menu_items')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteMenuItem(item) {
  const { error } = await requireSupabase().from('menu_items').delete().eq('id', item.id);
  if (error) throw error;
  // Only clean up images we uploaded ourselves (image_path is null for
  // the hot-linked forno-qa.site photos that came from the seed).
  await removeMenuImage(item.image_path);
}

export async function setItemAvailability(id, isAvailable) {
  return updateMenuItem(id, { is_available: isAvailable });
}

/* ─────────────────────────── categories ─────────────────────────── */

export async function createCategory(payload) {
  const { data, error } = await requireSupabase().from('categories').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateCategory(id, payload) {
  const { data, error } = await requireSupabase()
    .from('categories')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCategory(id) {
  // ON DELETE CASCADE removes the category's items too.
  const { error } = await requireSupabase().from('categories').delete().eq('id', id);
  if (error) throw error;
}
