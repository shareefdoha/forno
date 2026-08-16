import { q, one } from './db.js';
import { DEMO_CATEGORIES, DEMO_ITEMS } from '../src/lib/demoData.js';

/**
 * Loads the 15 categories and 67 dishes from the original static site.
 * Idempotent: existing rows are left alone, so it is safe on every boot.
 */
export async function seedMenu() {
  const existing = await one('select count(*)::int as n from categories');
  if (existing.n > 0) return { skipped: true, categories: existing.n };

  const slugToId = new Map();

  for (const c of DEMO_CATEGORIES) {
    const row = await one(
      `insert into categories (slug, name_en, name_ar, sort_order, is_active)
       values ($1, $2, $3, $4, $5) returning id`,
      [c.slug, c.name_en, c.name_ar, c.sort_order, c.is_active],
    );
    slugToId.set(c.slug, row.id);
  }

  for (const i of DEMO_ITEMS) {
    const categoryId = slugToId.get(i.category_id);
    if (!categoryId) continue;
    await q(
      `insert into menu_items
         (category_id, name_en, name_ar, description_en, description_ar,
          price, image_url, image_path, is_enabled, sort_order)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        categoryId, i.name_en, i.name_ar, i.description_en, i.description_ar,
        i.price, i.image_url, null, i.is_enabled, i.sort_order,
      ],
    );
  }

  const cats = await one('select count(*)::int as n from categories');
  const items = await one('select count(*)::int as n from menu_items');
  return { skipped: false, categories: cats.n, items: items.n };
}
