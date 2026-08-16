import { useEffect, useMemo, useState } from 'react';
import { useLang } from '../context/LanguageContext';
import { useReveal } from '../hooks/useReveal';
import { useCategories, useMenuItems } from '../hooks/useMenu';
import CategoryTabs from './CategoryTabs';
import MenuItem from './MenuItem';
import { FULL_MENU_URL } from '../lib/constants';
import { isSupabaseConfigured } from '../lib/supabase';

/** The category the page opened on in the original build. */
const DEFAULT_SLUG = 'pasta';

export default function MenuSection() {
  const { t } = useLang();
  const headRef = useReveal();
  const footRef = useReveal();

  const categories = useCategories();
  const items = useMenuItems();

  const [activeId, setActiveId] = useState(null);

  // Once categories arrive, land on "Pasta" (or the first category if the
  // owner renamed/removed it).
  useEffect(() => {
    const list = categories.data;
    if (!list?.length || activeId) return;
    setActiveId((list.find((c) => c.slug === DEFAULT_SLUG) ?? list[0]).id);
  }, [categories.data, activeId]);

  const visible = useMemo(
    () => (items.data ?? []).filter((i) => i.category_id === activeId),
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

        {/* Not connected to Supabase yet — show what to do rather than an
            empty grid or a blank page. */}
        {!isSupabaseConfigured ? (
          <div className="glass-card mx-auto mt-12 max-w-xl rounded-3xl p-8 text-center">
            <p className="eyebrow">Setup needed</p>
            <p className="mt-4 text-sm leading-relaxed text-cream/70">
              The menu loads from Supabase. Copy <code className="text-amber">.env.example</code> to{' '}
              <code className="text-amber">.env</code>, add your project URL and anon key, then
              restart the dev server.
            </p>
            <p className="mt-3 text-xs text-cream/40">Full walkthrough in SETUP.md</p>
          </div>
        ) : (
          <>
            {/* tabs */}
            {categories.data?.length > 0 && (
              <CategoryTabs categories={categories.data} activeId={activeId} onChange={setActiveId} />
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
              <p className="mt-10 text-center text-sm text-cream/50">{t('menu.empty')}</p>
            )}
          </>
        )}

        <div ref={footRef} className="reveal mt-14 text-center">
          <a
            href={FULL_MENU_URL}
            target="_blank"
            rel="noopener"
            className="btn-ghost inline-flex rounded-full px-8 py-4 text-sm font-semibold tracking-wide transition-all duration-300"
          >
            {t('menu.full')}
          </a>
        </div>
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
