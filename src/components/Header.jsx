import { useEffect, useState } from 'react';
import { useLang } from '../context/LanguageContext';
import { useBooking } from '../context/BookingContext';
import { PHONE_PRIMARY } from '../lib/constants';

const NAV = [
  { href: '#top', key: 'nav.home' },
  { href: '#story', key: 'nav.story' },
  { href: '#menu', key: 'nav.menu' },
  { href: '#why', key: 'nav.why' },
  { href: '#contact', key: 'nav.contact' },
];

export default function Header() {
  const { t, lang, toggle } = useLang();
  const { open } = useBooking();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const book = () => {
    setDrawerOpen(false);
    open();
  };

  return (
    <header
      id="nav"
      className={`fixed inset-x-0 top-0 z-50 glass transition-all duration-500 ${
        scrolled ? 'shadow-[0_18px_50px_-24px_rgba(0,0,0,.9)]' : ''
      }`}
    >
      <div className="mx-auto max-w-shell px-5 lg:px-8">
        <div className="flex h-[76px] items-center justify-between gap-6">

          <a href="#top" className="flex items-center gap-3 shrink-0">
            <img src="/img/logo.png" alt="Forno" className="h-15 w-auto" />
            <span className="font-display text-3xl tracking-[.16em] text-cream">FORNO</span>
          </a>

          <nav className="hidden lg:flex items-center gap-9 text-[.92rem] font-medium text-cream/75">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="hover:text-amber transition">
                {t(n.key)}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={PHONE_PRIMARY.href}
              className="hidden xl:flex items-center gap-2 text-sm text-cream/70 hover:text-amber transition"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106a1.125 1.125 0 00-1.173.417l-.97 1.293a.75.75 0 01-.92.266 12.043 12.043 0 01-6.16-6.16.75.75 0 01.266-.92l1.293-.97c.375-.281.53-.769.417-1.173L6.963 3.102A1.125 1.125 0 005.872 2.25H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
              <span dir="ltr">{PHONE_PRIMARY.display}</span>
            </a>

            <button
              id="langBtn"
              onClick={toggle}
              className="rounded-full border border-cream/20 px-3 py-1.5 text-xs font-semibold tracking-widest text-cream/70 hover:border-amber hover:text-amber transition"
            >
              {lang === 'ar' ? 'EN' : 'AR'}
            </button>

            <button
              onClick={book}
              className="btn-amber hidden sm:inline-flex rounded-full px-5 py-2.5 text-sm font-bold tracking-wide transition-all duration-300"
            >
              {t('cta.book')}
            </button>

            <button
              id="burger"
              aria-label="Open menu"
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen((v) => !v)}
              className="lg:hidden rounded-full border border-cream/20 p-2.5"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* mobile drawer */}
      <div
        id="drawer"
        className={`lg:hidden ${drawerOpen ? '' : 'hidden'} border-t border-cream/10 bg-ink/95 backdrop-blur-xl`}
      >
        <div className="mx-auto max-w-shell px-5 py-6 flex flex-col gap-1">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              onClick={() => setDrawerOpen(false)}
              className="rounded-xl px-3 py-3 text-cream/80 hover:bg-cream/5"
            >
              {t(n.key)}
            </a>
          ))}
          <button onClick={book} className="btn-amber mt-3 rounded-full px-5 py-3 text-sm font-bold">
            {t('cta.book')}
          </button>
        </div>
      </div>
    </header>
  );
}
