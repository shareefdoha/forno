import { useEffect, useMemo, useState } from 'react';
import { useLang } from '../context/LanguageContext';
import { useReveal } from '../hooks/useReveal';
import { useCategories, useMenuItems } from '../hooks/useMenu';
import CategoryTabs from './CategoryTabs';
import MenuItem from './MenuItem';
import { isSupabaseConfigured, isDemoBackend } from '../lib/supabase';

/** The category the page opened on in the original build. */
const DEFAULT_SLUG = 'pasta';

export default function MenuSection() {
  const { t } = useLang();
  const headRef = useReveal();

  const categories = useCategories();
  const items = useMenuItems();

  const [activeId, setActiveId] = useState(null);

  // A category with nothing to sell doesn't belong on the website. Once every
  // dish in it is disabled (or it simply has none yet), the tab goes too —
  // otherwise guests click through to an empty grid. The CMS still lists it.
  const tabCategories = useMemo(() => {
    const list = categories.data ?? [];
    const rows = items.data;
    if (!rows) return [];   // first load — the grid shows skeletons instead
    return list.filter((c) => rows.some((i) => i.category_id === c.id && i.is_enabled));
  }, [categories.data, items.data]);

  // Land on "Pasta" (or the first category if the owner renamed/removed it).
  // Re-runs when the selected category leaves the list — after a delete, after
  // its last dish is disabled, or when preview data is replaced by Supabase —
  // which would otherwise leave the grid permanently empty.
  useEffect(() => {
    if (!tabCategories.length) return;
    if (activeId && tabCategories.some((c) => c.id === activeId)) return;
    setActiveId((tabCategories.find((c) => c.slug === DEFAULT_SLUG) ?? tabCategories[0]).id);
  }, [tabCategories, activeId]);

  // Disabled dishes are hidden from the website entirely — that is what the
  // Enabled/Disabled toggle in the CMS means. They stay visible in /admin.
  const visible = useMemo(
    () => (items.data ?? []).filter((i) => i.category_id === activeId && i.is_enabled),
    [items.data, activeId],
  );

  const isLoading = categories.isLoading || items.isLoading;
  const error = categories.error || items.error;

  return (
    <section id="menu" className="relative border-t border-cream/[.06] py-24 lg:py-32">
      <div className="mx-auto max-w-shell px-5 lg:px-8">

        <div ref={headRef} className="reveal mx-auto max-w-2xl text-center">
          <p className="eyebrow">{t('menu.eyebrow')}</p>
          <h2 className="mt-5 font-display text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.1]">
            <span>{t('menu.h1')}</span>{' '}
            <span className="italic text-amber">{t('menu.h2')}</span>
          </h2>
          <p className="mt-5 text-cream/60">{t('menu.sub')}</p>
        </div>

        {/* Reading from the bundled preview data, not a database. Say so
            plainly so nobody mistakes this for a live CMS. */}
        {!isSupabaseConfigured && (
          <p className="mx-auto mt-10 max-w-xl rounded-2xl border border-amber/25 bg-amber/[.06] px-5 py-3 text-center text-xs leading-relaxed text-cream/60">
            {isDemoBackend
              ? 'Demo backend — edits made in /admin show up here, but save to this browser only.'
              : 'Preview data — read-only.'}{' '}
            Connect Supabase in <code className="text-amber">.env</code> to go live. See SETUP.md
          </p>
        )}

        {/* tabs */}
        {tabCategories.length > 0 && (
          <CategoryTabs categories={tabCategories} activeId={activeId} onChange={setActiveId} />
        )}

        {/* grid */}
        <div id="dishes" className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading && <SkeletonCards />}

          {!isLoading &&
            visible.map((item, k) => (
              // Re-keying on the active category replays the stagger animation
              // the same way the old innerHTML swap did.
              <MenuItem key={`${activeId}-${item.id}`} item={item} index={k} />
            ))}
        </div>

        {error && <p className="mt-10 text-center text-sm text-cream/50">{t('menu.error')}</p>}
        {!isLoading && !error && visible.length === 0 && (
          <p className="mt-10 text-center text-sm text-cream/50">
            {tabCategories.length === 0 ? t('menu.none') : t('menu.empty')}
          </p>
        )}
      </div>
    </section>
  );
}

/* Placeholder cards keep the grid from collapsing while the first fetch runs. */
function SkeletonCards() {
  return Array.from({ length: 6 }).map((_, i) => (
    <div key={i} className="glass-card overflow-hidden rounded-3xl">
      <div className="arch h-52 w-full animate-pulse bg-cream/[.04]" />
      <div className="space-y-3 p-6">
        <div className="h-6 w-2/3 animate-pulse rounded bg-cream/[.06]" />
        <div className="h-4 w-full animate-pulse rounded bg-cream/[.04]" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-cream/[.04]" />
      </div>
    </div>
  ));
}
