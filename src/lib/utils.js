/** Pick the Arabic value when we're in Arabic and one was entered, else English. */
export function pick(row, base, lang) {
  const ar = row?.[`${base}_ar`];
  if (lang === 'ar' && ar) return ar;
  return row?.[`${base}_en`] ?? '';
}

/** 30.00 → "30", 12.50 → "12.50" — matches how prices read on the original page. */
export function formatPrice(value) {
  const n = Number(value ?? 0);
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}
