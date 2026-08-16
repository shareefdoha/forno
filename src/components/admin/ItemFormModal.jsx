import { useEffect, useRef, useState } from 'react';
import { uploadMenuImage, removeMenuImage } from '../../api/menu';
import { useCreateItem, useUpdateItem } from '../../hooks/useMenu';

const FIELD =
  'mt-2 w-full rounded-xl border border-cream/12 bg-ink/50 px-4 py-3 text-cream placeholder:text-cream/25 focus:border-amber focus:outline-none transition';
const LABEL = 'block text-xs uppercase tracking-[.16em] text-cream/45';

const MAX_MB = 5;

const blank = (categoryId) => ({
  category_id: categoryId ?? '',
  name_en: '',
  name_ar: '',
  description_en: '',
  description_ar: '',
  price: '',
  image_url: '',
  image_path: null,
  is_enabled: true,
  sort_order: 0,
});

export default function ItemFormModal({ item, categories, defaultCategoryId, onClose }) {
  const isEdit = Boolean(item);
  const create = useCreateItem();
  const update = useUpdateItem();
  const fileRef = useRef(null);

  const [form, setForm] = useState(() =>
    item
      ? {
          category_id: item.category_id,
          name_en: item.name_en ?? '',
          name_ar: item.name_ar ?? '',
          description_en: item.description_en ?? '',
          description_ar: item.description_ar ?? '',
          price: String(item.price ?? ''),
          image_url: item.image_url ?? '',
          image_path: item.image_path ?? null,
          is_enabled: item.is_enabled ?? true,
          sort_order: item.sort_order ?? 0,
        }
      : blank(defaultCategoryId),
  );

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  // Storage bookkeeping:
  //   added   — uploaded in this session; delete them if the user cancels
  //   orphans — files the row pointed at before we detached them; delete
  //             them only once the save succeeds, never on cancel
  const staged = useRef({ added: [], orphans: [] });

  /** Record the file we're about to stop pointing at, so save can clean it up. */
  const detach = (path) => {
    if (path) staged.current.orphans.push(path);
  };

  // Escape must go through cancel(), not onClose(), or photos uploaded in
  // this session are left behind in Storage with nothing pointing at them.
  const cancelRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') cancelRef.current?.();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, []);

  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const onPickFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');

    if (!file.type.startsWith('image/')) {
      setError('That file is not an image.');
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Image is larger than ${MAX_MB} MB. Please compress it first.`);
      return;
    }

    setUploading(true);
    try {
      const { url, path } = await uploadMenuImage(file);
      detach(form.image_path);
      staged.current.added.push(path);
      setForm((f) => ({ ...f, image_url: url, image_path: path }));
    } catch (err) {
      setError(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const cancel = async () => {
    // Nothing was saved, so the row still points at its original photo —
    // only remove what we uploaded in this session.
    for (const p of staged.current.added) await removeMenuImage(p);
    onClose();
  };
  cancelRef.current = cancel;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.category_id) return setError('Pick a category.');
    if (!form.name_en.trim()) return setError('An English name is required.');

    // `Number('abc') || 0` used to swallow typos as a free dish, and a
    // negative value would surface as a raw Postgres check-constraint error.
    const price = Number(form.price);
    if (form.price === '' || Number.isNaN(price)) return setError('Enter a price in numbers.');
    if (price < 0) return setError('Price cannot be negative.');

    const payload = {
      category_id: form.category_id,
      name_en: form.name_en.trim(),
      name_ar: form.name_ar.trim(),
      description_en: form.description_en.trim(),
      description_ar: form.description_ar.trim(),
      price,
      image_url: form.image_url.trim() || null,
      image_path: form.image_path,
      is_enabled: form.is_enabled,
      sort_order: Number(form.sort_order) || 0,
    };

    try {
      if (isEdit) await update.mutateAsync({ id: item.id, payload });
      else await create.mutateAsync(payload);

      // Saved: anything the row no longer points at is safe to remove. Guard
      // on `kept` so we never delete the file we just committed to.
      const kept = form.image_path;
      const stale = [...staged.current.added, ...staged.current.orphans];
      for (const p of new Set(stale)) if (p !== kept) await removeMenuImage(p);

      staged.current = { added: [], orphans: [] };
      onClose();
    } catch (err) {
      setError(err.message || 'Could not save.');
    }
  };

  const busy = uploading || create.isPending || update.isPending;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-ink/85 p-5 backdrop-blur-md"
      onClick={(e) => { if (e.target === e.currentTarget) cancel(); }}
    >
      <div className="glass-card my-8 w-full max-w-2xl rounded-3xl p-7 sm:p-9">
        <h2 className="font-display text-3xl">{isEdit ? 'Edit dish' : 'New dish'}</h2>

        <form className="mt-8 space-y-5" onSubmit={onSubmit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={LABEL} htmlFor="i-cat">Category</label>
              <select id="i-cat" value={form.category_id} onChange={set('category_id')} className={FIELD}>
                <option value="">— choose —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name_en}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL} htmlFor="i-price">Price (QAR)</label>
              <input
                id="i-price" type="number" min="0" step="0.5" inputMode="decimal"
                value={form.price} onChange={set('price')} className={FIELD} placeholder="40"
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={LABEL} htmlFor="i-nameen">Name (English)</label>
              <input id="i-nameen" value={form.name_en} onChange={set('name_en')} className={FIELD} placeholder="Margherita Pizza" />
            </div>
            <div>
              <label className={LABEL} htmlFor="i-namear">Name (Arabic)</label>
              <input id="i-namear" dir="rtl" value={form.name_ar} onChange={set('name_ar')} className={FIELD} placeholder="بيتزا مارغريتا" />
            </div>
          </div>

          <div>
            <label className={LABEL} htmlFor="i-descen">Description (English)</label>
            <textarea id="i-descen" rows="3" value={form.description_en} onChange={set('description_en')} className={`${FIELD} resize-none`} />
          </div>

          <div>
            <label className={LABEL} htmlFor="i-descar">Description (Arabic)</label>
            <textarea id="i-descar" rows="3" dir="rtl" value={form.description_ar} onChange={set('description_ar')} className={`${FIELD} resize-none`} />
          </div>

          {/* ── image ── */}
          <div>
            <span className={LABEL}>Photo</span>
            <div className="mt-3 flex flex-wrap items-center gap-5">
              <div className="arch h-28 w-36 shrink-0 overflow-hidden border border-cream/10 bg-char">
                {form.image_url ? (
                  <img src={form.image_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[.65rem] uppercase tracking-widest text-cream/30">
                    No photo
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <input ref={fileRef} type="file" accept="image/*" onChange={onPickFile} className="hidden" id="i-file" />
                <label
                  htmlFor="i-file"
                  className="btn-ghost cursor-pointer rounded-full px-5 py-2.5 text-center text-sm font-semibold transition-all duration-300"
                >
                  {uploading ? 'Uploading…' : form.image_url ? 'Replace photo' : 'Upload photo'}
                </label>
                {form.image_url && (
                  <button
                    type="button"
                    onClick={() => {
                      detach(form.image_path);
                      setForm((f) => ({ ...f, image_url: '', image_path: null }));
                    }}
                    className="text-xs text-cream/40 underline underline-offset-4 hover:text-amber transition"
                  >
                    Remove photo
                  </button>
                )}
                <p className="text-xs text-cream/35">JPG / PNG / WebP · up to {MAX_MB} MB</p>
              </div>
            </div>

            <label className={`${LABEL} mt-5`} htmlFor="i-url">…or paste an image URL</label>
            <input
              id="i-url" value={form.image_url}
              onChange={(e) => {
                // Typing a URL detaches whatever file the row pointed at.
                detach(form.image_path);
                setForm((f) => ({ ...f, image_url: e.target.value, image_path: null }));
              }}
              className={FIELD} placeholder="https://…"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={LABEL} htmlFor="i-sort">Sort order</label>
              <input id="i-sort" type="number" value={form.sort_order} onChange={set('sort_order')} className={FIELD} />
            </div>
            <label className="flex cursor-pointer items-center gap-3 self-end pb-3">
              <input type="checkbox" checked={form.is_enabled} onChange={set('is_enabled')} className="h-5 w-5 accent-[#FFC107]" />
              <span className="text-sm text-cream/75">Enabled (visible on the website)</span>
            </label>
          </div>

          {error && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit" disabled={busy}
              className="btn-amber rounded-full px-8 py-3.5 text-sm font-bold tracking-wide transition-all duration-300 disabled:opacity-60"
            >
              {busy ? 'Saving…' : isEdit ? 'Save changes' : 'Create dish'}
            </button>
            <button
              type="button" onClick={cancel} disabled={busy}
              className="btn-ghost rounded-full px-8 py-3.5 text-sm font-semibold transition-all duration-300 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
