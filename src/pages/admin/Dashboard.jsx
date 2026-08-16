import { useMemo, useState } from 'react';
import AdminShell from '../../components/admin/AdminShell';
import ItemFormModal from '../../components/admin/ItemFormModal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { useCategories, useMenuItems, useToggleAvailability, useDeleteItem } from '../../hooks/useMenu';
import { formatPrice } from '../../lib/utils';
import { isDemoBackend } from '../../lib/supabase';
import { resetAll } from '../../lib/localBackend';
import { useQueryClient } from '@tanstack/react-query';

export default function Dashboard() {
  // Admin sees inactive categories too, so nothing can go missing from the CMS.
  const categories = useCategories({ onlyActive: false });
  const items = useMenuItems();
  const toggle = useToggleAvailability();
  const del = useDeleteItem();
  const qc = useQueryClient();

  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);   // item object, or 'new'
  const [confirming, setConfirming] = useState(null);
  // Writes fail silently otherwise — the optimistic toggle just flips back.
  const [actionError, setActionError] = useState('');

  const catById = useMemo(
    () => Object.fromEntries((categories.data ?? []).map((c) => [c.id, c])),
    [categories.data],
  );

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (items.data ?? [])
      .filter((i) => filter === 'all' || i.category_id === filter)
      .filter((i) => !q || `${i.name_en} ${i.name_ar}`.toLowerCase().includes(q));
  }, [items.data, filter, search]);

  const stats = useMemo(() => {
    const all = items.data ?? [];
    return { total: all.length, out: all.filter((i) => !i.is_available).length };
  }, [items.data]);

  return (
    <AdminShell
      title="Menu items"
      action={
        <button
          onClick={() => setEditing('new')}
          className="btn-amber rounded-full px-6 py-3 text-sm font-bold tracking-wide transition-all duration-300"
        >
          + New dish
        </button>
      }
    >
      {/* summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Dishes" value={stats.total} />
        <Stat label="Categories" value={(categories.data ?? []).length} />
        <Stat label="Out of stock" value={stats.out} />
      </div>

      {isDemoBackend && (
        <div className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl border border-amber/25 bg-amber/[.06] px-5 py-3 text-xs leading-relaxed text-cream/65">
          <p className="flex-1">
            <span className="font-semibold text-amber">Demo backend</span> — changes save to this
            browser only and are lost when you connect Supabase. Photos are downscaled to fit
            browser storage.
          </p>
          <button
            onClick={() => {
              resetAll();
              qc.invalidateQueries();
            }}
            className="rounded-full border border-cream/20 px-4 py-2 font-semibold text-cream/70 transition hover:border-amber hover:text-amber"
          >
            Reset demo data
          </button>
        </div>
      )}

      {actionError && (
        <p className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {actionError}
        </p>
      )}

      {/* controls */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-xl border border-cream/12 bg-ink/50 px-4 py-3 text-sm text-cream focus:border-amber focus:outline-none"
        >
          <option value="all">All categories</option>
          {(categories.data ?? []).map((c) => (
            <option key={c.id} value={c.id}>{c.name_en}</option>
          ))}
        </select>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search dishes…"
          className="min-w-[220px] flex-1 rounded-xl border border-cream/12 bg-ink/50 px-4 py-3 text-sm text-cream placeholder:text-cream/25 focus:border-amber focus:outline-none"
        />
      </div>

      {/* list */}
      <div className="mt-6 overflow-hidden rounded-3xl border border-cream/[.09]">
        {items.isLoading && <p className="p-8 text-center text-sm text-cream/50">Loading…</p>}

        {items.error && (
          <p className="p-8 text-center text-sm text-red-300">{items.error.message}</p>
        )}

        {!items.isLoading && !items.error && rows.length === 0 && (
          <p className="p-8 text-center text-sm text-cream/50">No dishes match this filter.</p>
        )}

        {rows.map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center gap-4 border-b border-cream/[.07] p-4 last:border-b-0 hover:bg-cream/[.02]"
          >
            <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl border border-cream/10 bg-char">
              {item.image_url && (
                <img src={item.image_url} alt="" className="h-full w-full object-cover" loading="lazy" />
              )}
            </div>

            <div className="min-w-[180px] flex-1">
              <p className="font-display text-xl leading-tight">{item.name_en}</p>
              <p className="mt-1 text-xs text-cream/40">
                {catById[item.category_id]?.name_en ?? '—'} · {formatPrice(item.price)} QAR
              </p>
            </div>

            <AvailabilitySwitch
              checked={item.is_available}
              onChange={(v) => {
                setActionError('');
                toggle.mutate(
                  { id: item.id, isAvailable: v },
                  { onError: (err) => setActionError(err.message) },
                );
              }}
            />

            <div className="flex gap-2">
              <button
                onClick={() => setEditing(item)}
                className="rounded-full border border-cream/15 px-4 py-2 text-xs font-semibold text-cream/70 transition hover:border-amber hover:text-amber"
              >
                Edit
              </button>
              <button
                onClick={() => setConfirming(item)}
                className="rounded-full border border-red-500/25 px-4 py-2 text-xs font-semibold text-red-300/80 transition hover:border-red-400 hover:text-red-200"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <ItemFormModal
          item={editing === 'new' ? null : editing}
          categories={categories.data ?? []}
          defaultCategoryId={filter !== 'all' ? filter : (categories.data ?? [])[0]?.id}
          onClose={() => setEditing(null)}
        />
      )}

      {confirming && (
        <ConfirmDialog
          title="Delete this dish?"
          body={`“${confirming.name_en}” will be removed from the website immediately. This cannot be undone.`}
          busy={del.isPending}
          onCancel={() => setConfirming(null)}
          onConfirm={async () => {
            setActionError('');
            try {
              await del.mutateAsync(confirming);
              setConfirming(null);
            } catch (err) {
              setActionError(err.message);
              setConfirming(null);
            }
          }}
        />
      )}
    </AdminShell>
  );
}

function Stat({ label, value }) {
  return (
    <div className="glass-card rounded-2xl px-6 py-5">
      <p className="font-display text-3xl text-amber">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-[.18em] text-cream/45">{label}</p>
    </div>
  );
}

function AvailabilitySwitch({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3"
      title={checked ? 'In stock — click to mark out of stock' : 'Out of stock — click to mark in stock'}
    >
      <span
        className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-amber' : 'bg-cream/20'}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-ink transition-all ${
            checked ? 'left-[1.4rem]' : 'left-0.5'
          }`}
        />
      </span>
      <span className={`w-24 text-left text-xs font-semibold ${checked ? 'text-amber' : 'text-cream/40'}`}>
        {checked ? 'In stock' : 'Out of stock'}
      </span>
    </button>
  );
}
