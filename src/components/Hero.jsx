import { useLang } from '../context/LanguageContext';
import { useBooking } from '../context/BookingContext';
import { PHOTOS } from '../lib/constants';

export default function Hero() {
  const { t } = useLang();
  const { open } = useBooking();

  return (
    <section id="top" className="relative min-h-[100svh] overflow-hidden pt-[var(--nav-h)]">
      <img src={PHOTOS.heroBg} alt="Inside Forno" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/85 via-ink/70 to-ink"></div>
      <div className="ember pointer-events-none absolute inset-x-0 bottom-0 h-[70%]"></div>

      <div className="relative mx-auto flex max-w-shell flex-col items-center px-5 pb-24 pt-16 text-center lg:pt-24">
        <p className="eyebrow lift" style={{ '--d': '120ms' }}>{t('hero.eyebrow')}</p>

        <h1
          className="lift mt-6 font-display text-[clamp(2.6rem,8vw,5.6rem)] font-medium leading-[1.02] tracking-[-.01em]"
          style={{ '--d': '240ms' }}
        >
          <span>{t('hero.l1')}</span><br />
          <span className="italic text-amber">{t('hero.l2')}</span>
        </h1>

        <p
          className="lift mt-7 max-w-2xl text-base leading-relaxed text-cream/70 sm:text-lg"
          style={{ '--d': '380ms' }}
        >
          {t('hero.sub')}
        </p>

        <div className="lift mt-10 flex flex-col items-center gap-3 sm:flex-row" style={{ '--d': '500ms' }}>
          <button
            onClick={open}
            className="btn-amber w-full rounded-full px-8 py-4 text-sm font-bold tracking-wide transition-all duration-300 sm:w-auto"
          >
            {t('cta.book')}
          </button>
          <a
            href="#menu"
            className="btn-ghost w-full rounded-full px-8 py-4 text-center text-sm font-semibold tracking-wide transition-all duration-300 sm:w-auto"
          >
            {t('cta.menu')}
          </a>
        </div>

        {/* arch strip: three plates framed by the oven mouth */}
        <div className="lift mt-16 grid w-full max-w-3xl grid-cols-3 gap-4 sm:gap-6" style={{ '--d': '640ms' }}>
          <div className="arch-tall overflow-hidden border border-cream/10">
            <img src={PHOTOS.archLeft} alt="Ranch chicken pizza" className="h-32 w-full object-cover sm:h-44" />
          </div>
          <div className="arch-tall overflow-hidden border border-amber/30 sm:-translate-y-6">
            <img src={PHOTOS.archMid} alt="Polo Forno pasta" className="h-32 w-full object-cover sm:h-44" />
          </div>
          <div className="arch-tall overflow-hidden border border-cream/10">
            <img src={PHOTOS.archRight} alt="Seafood risotto" className="h-32 w-full object-cover sm:h-44" />
          </div>
        </div>
      </div>
    </section>
  );
}
