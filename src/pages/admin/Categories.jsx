import { useState } from 'react';
import AdminShell from '../../components/admin/AdminShell';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import {
  useCategories, useMenuItems, useCreateCategory, useUpdateCategory, useDeleteCategory,
} from '../../hooks/useMenu';

const FIELD =
  'w-full rounded-xl border border-cream/12 bg-ink/50 px-4 py-3 text-sm text-cream placeholder:text-cream/25 focus:border-amber focus:outline-none transition';

const slugify = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export default function Categories() {
  const categories = useCategories({ onlyActive: false });
  const items = useMenuItems();
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const del = useDeleteCategory();

  const [draft, setDraft] = useState({ name_en: '', name_ar: '', slug: '' });
  const [editingId, setEditingId] = useState(null);
  const [edit, setEdit] = useState({});
  const [confirming, setConfirming] = useState(null);
  const [error, setError] = useState('');

  const countFor = (id) => (items.data ?? []).filter((i) => i.category_id === id).length;

  const add = async (e) => {
    e.preventDefault();
    setError('');
    const name_en = draft.name_en.trim();
    if (!name_en) return setError('Enter an English name.');
    try {
      await create.mutateAsync({
        name_en,
        name_ar: draft.name_ar.trim(),
        slug: (draft.slug.trim() && slugify(draft.slug)) || slugify(name_en),
        sort_order: ((categories.data ?? []).at(-1)?.sort_order ?? 0) + 10,
        is_active: true,
      });
      setDraft({ name_en: '', name_ar: '', slug: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setEdit({ name_en: c.name_en, name_ar: c.name_ar ?? '', slug: c.slug, sort_order: c.sort_order });
  };

  const saveEdit = async (id) => {
    setError('');
    try {
      await update.mutateAsync({
        id,
        payload: {
          name_en: edit.name_en.trim(),
          name_ar: (edit.name_ar ?? '').trim(),
          slug: slugify(edit.slug),
          sort_order: Number(edit.sort_order) || 0,
        },
      });
      setEditingId(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AdminShell title="Categories">
      <form onSubmit={add} className="glass-card grid gap-3 rounded-3xl p-6 sm:grid-cols-[1fr_1fr_1fr_auto]">
        <input className={FIELD} placeholder="Name (English)" value={draft.name_en}
               onChange={(e) => setDraft({ ...draft, name_en: e.target.value })} />
        <input className={FIELD} dir="rtl" placeholder="الاسم بالعربية" value={draft.name_ar}
               onChange={(e) => setDraft({ ...draft, name_ar: e.target.value })} />
        <input className={FIELD} placeholder="slug (optional)" value={draft.slug}
               onChange={(e) => setDraft({ ...draft, slug: e.target.value })} />
        <button
          type="submit" disabled={create.isPending}
          className="btn-amber rounded-full px-6 py-3 text-sm font-bold tracking-wide transition-all duration-300 disabled:opacity-60"
        >
          Add
        </button>
      </form>

      {error && (
        <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>
      )}

      <div className="mt-6 overflow-hidden rounded-3xl border border-cream/[.09]">
        {(categories.data ?? []).map((c) => (
          <div key={c.id} className="flex flex-wrap items-center gap-4 border-b border-cream/[.07] p-4 last:border-b-0">
            {editingId === c.id ? (
              <>
                <input className={`${FIELD} max-w-[200px]`} value={edit.name_en}
                       onChange={(e) => setEdit({ ...edit, name_en: e.target.value })} />
                <input className={`${FIELD} max-w-[200px]`} dir="rtl" value={edit.name_ar}
                       onChange={(e) => setEdit({ ...edit, name_ar: e.target.value })} />
                <input className={`${FIELD} max-w-[140px]`} value={edit.slug}
                       onChange={(e) => setEdit({ ...edit, slug: e.target.value })} />
                <input className={`${FIELD} max-w-[90px]`} type="number" value={edit.sort_order}
                       onChange={(e) => setEdit({ ...edit, sort_order: e.target.value })} />
                <div className="ms-auto flex gap-2">
                  <button onClick={() => saveEdit(c.id)}
                          className="btn-amber rounded-full px-5 py-2 text-xs font-bold">Save</button>
                  <button onClick={() => setEditingId(null)}
                          className="btn-ghost rounded-full px-5 py-2 text-xs font-semibold">Cancel</button>
                </div>
              </>
            ) : (
              <>
                <div className="min-w-[180px] flex-1">
                  <p className="font-display text-xl leading-tight">{c.name_en}</p>
                  <p className="mt-1 text-xs text-cream/40">
                    {c.slug} · {countFor(c.id)} dishes{c.name_ar ? ` · ${c.name_ar}` : ''}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setError('');
                    update.mutate(
                      { id: c.id, payload: { is_active: !c.is_active } },
                      { onError: (err) => setError(err.message) },
                    );
                  }}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                    c.is_active
                      ? 'border-amber/40 text-amber'
                      : 'border-cream/15 text-cream/40 hover:border-amber/60 hover:text-amber'
                  }`}
                >
                  {c.is_active ? 'Shown' : 'Hidden'}
                </button>

                <div className="flex gap-2">
                  <button onClick={() => startEdit(c)}
                          className="rounded-full border border-cream/15 px-4 py-2 text-xs font-semibold text-cream/70 transition hover:border-amber hover:text-amber">
                    Edit
                  </button>
                  <button onClick={() => setConfirming(c)}
                          className="rounded-full border border-red-500/25 px-4 py-2 text-xs font-semibold text-red-300/80 transition hover:border-red-400 hover:text-red-200">
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {confirming && (
        <ConfirmDialog
          title="Delete this category?"
          body={`“${confirming.name_en}” and its ${countFor(confirming.id)} dish(es) will be permanently deleted.`}
          busy={del.isPending}
          onCancel={() => setConfirming(null)}
          onConfirm={async () => {
            setError('');
            try {
              await del.mutateAsync(confirming.id);
            } catch (err) {
              setError(err.message);
            }
            setConfirming(null);
          }}
        />
      )}
    </AdminShell>
  );
}
