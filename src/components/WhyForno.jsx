import { useLang } from '../context/LanguageContext';
import { useReveal } from '../hooks/useReveal';

const ICONS = {
  flame: 'M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z',
  check: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  shield: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751A11.959 11.959 0 0112 2.714z',
  smile: 'M12 21a9 9 0 100-18 9 9 0 000 18zM8.25 10.5h.008M15.75 10.5h.008M8.5 15a5 5 0 007 0',
};

const CARDS = [
  { icon: 'flame', title: 'why.1t', body: 'why.1d', delay: null },
  { icon: 'check', title: 'why.2t', body: 'why.2d', delay: '100ms' },
  { icon: 'shield', title: 'why.3t', body: 'why.3d', delay: '200ms' },
  { icon: 'smile', title: 'why.4t', body: 'why.4d', delay: '300ms' },
];

function Card({ icon, title, body, delay }) {
  const { t } = useLang();
  const ref = useReveal();

  return (
    <div
      ref={ref}
      className="reveal glass-card group rounded-3xl p-8 transition-all duration-500 hover:border-amber/40 hover:-translate-y-1.5"
      style={delay ? { '--d': delay } : undefined}
    >
      <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber/12 text-amber transition group-hover:bg-amber group-hover:text-ink">
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d={ICONS[icon]} />
        </svg>
      </div>
      <h3 className="font-display text-2xl">{t(title)}</h3>
      <p className="mt-3 text-sm leading-relaxed text-cream/60">{t(body)}</p>
    </div>
  );
}

export default function WhyForno() {
  const { t } = useLang();
  const headRef = useReveal();

  return (
    <section
      id="why"
      className="relative border-t border-cream/[.06] bg-gradient-to-b from-ink via-char to-ink py-24 lg:py-32"
    >
      <div className="mx-auto max-w-shell px-5 lg:px-8">
        <div ref={headRef} className="reveal mx-auto max-w-2xl text-center">
          <p className="eyebrow">{t('why.eyebrow')}</p>
          <h2 className="mt-5 font-display text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.1]">{t('why.h')}</h2>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((c) => (
            <Card key={c.title} {...c} />
          ))}
        </div>
      </div>
    </section>
  );
}
