import { useLang } from '../context/LanguageContext';
import { useReveal } from '../hooks/useReveal';
import { useCounter } from '../hooks/useCounter';
import { PHOTOS } from '../lib/constants';

function Stat({ end, suffix, label }) {
  const [ref, text] = useCounter(end, suffix);
  return (
    <div>
      <p ref={ref} className="font-display text-4xl text-amber">{text}</p>
      <p className="mt-1 text-xs uppercase tracking-[.18em] text-cream/50">{label}</p>
    </div>
  );
}

export default function Story() {
  const { t } = useLang();
  const leftRef = useReveal();
  const rightRef = useReveal();

  return (
    <section
      id="story"
      className="relative border-t border-cream/[.06] bg-gradient-to-b from-ink via-char to-ink py-24 lg:py-32"
    >
      <div className="mx-auto max-w-shell px-5 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">

          <div ref={leftRef} className="reveal order-2 lg:order-1">
            <p className="eyebrow">{t('story.eyebrow')}</p>
            <h2 className="mt-5 font-display text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.1]">
              <span>{t('story.h1')}</span>{' '}
              <span className="italic text-amber">{t('story.h2')}</span>
            </h2>
            <div className="rule my-8 max-w-[220px]"></div>
            <p className="text-cream/70 leading-relaxed">{t('story.p1')}</p>
            <p className="mt-5 text-cream/70 leading-relaxed">{t('story.p2')}</p>

            <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-4">
              <Stat end={10} suffix="+" label={t('stat.years')} />
              <Stat end={50} suffix="k+" label={t('stat.guests')} />
              <Stat end={15} suffix="" label={t('stat.cats')} />
              <Stat end={80} suffix="+" label={t('stat.dishes')} />
            </div>
          </div>

          <div ref={rightRef} className="reveal order-1 lg:order-2" style={{ '--d': '150ms' }}>
            <div className="relative">
              <div className="arch-wide overflow-hidden border border-cream/10">
                <img
                  src={PHOTOS.storyMain}
                  alt="Grilled chicken with mushroom sauce"
                  className="h-[420px] w-full object-cover sm:h-[520px]"
                />
              </div>
              <div className="absolute -bottom-8 right-4 hidden w-44 overflow-hidden rounded-2xl border border-amber/30 shadow-2xl sm:block lg:-right-8">
                <img src={PHOTOS.storyInset} alt="Forno catering carts" className="h-32 w-full object-cover" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
