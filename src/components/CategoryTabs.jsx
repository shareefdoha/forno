import { useLang } from '../context/LanguageContext';
import { useReveal } from '../hooks/useReveal';
import { pick } from '../lib/utils';

export default function CategoryTabs({ categories, activeId, onChange }) {
  const { lang } = useLang();
  const ref = useReveal();

  return (
    <div
      ref={ref}
      id="tabs"
      className="reveal noscroll mt-12 flex gap-2 overflow-x-auto pb-2 sm:justify-center sm:flex-wrap"
    >
      {categories.map((c) => (
        <button
          key={c.id}
          onClick={() => onChange(c.id)}
          className={`tab shrink-0 rounded-full border border-cream/15 px-5 py-2.5 text-sm font-semibold tracking-wide text-cream/65 transition-all duration-300 hover:border-amber/60 hover:text-amber ${
            c.id === activeId ? 'tab-active' : ''
          }`}
        >
          {pick(c, 'name', lang)}
        </button>
      ))}
    </div>
  );
}
