import { useEffect, useRef, useState } from 'react';
import { useLang } from '../context/LanguageContext';
import { useReveal } from '../hooks/useReveal';
import { REVIEWS } from '../lib/constants';

const INTERVAL = 6500;

export default function Reviews() {
  const { t } = useLang();
  const eyebrowRef = useReveal();
  const quoteRef = useReveal();

  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (paused) return;
    timer.current = setInterval(() => setI((n) => (n + 1) % REVIEWS.length), INTERVAL);
    return () => clearInterval(timer.current);
  }, [paused, i]);

  const r = REVIEWS[i];

  return (
    <section className="relative border-t border-cream/[.06] py-24 lg:py-28">
      <div className="mx-auto max-w-4xl px-5 text-center">
        <p ref={eyebrowRef} className="eyebrow reveal">{t('rev.eyebrow')}</p>

        <div
          ref={quoteRef}
          id="reviews"
          className="reveal relative mt-10 min-h-[230px] sm:min-h-[200px]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* keyed on the index so the `lift` animation restarts each rotation */}
          <blockquote key={i} style={{ animation: 'lift .7s cubic-bezier(.16,1,.3,1) forwards', opacity: 0 }}>
            <p className="font-display text-[clamp(1.35rem,3vw,2.1rem)] italic leading-snug text-cream/90">
              “{r.q}”
            </p>
            <footer className="mt-7 text-sm text-cream/45">
              <span className="font-semibold text-amber">{r.a}</span> · {r.m}
            </footer>
          </blockquote>
        </div>

        <div id="dots" className="mt-8 flex justify-center gap-2.5">
          {REVIEWS.map((_, k) => (
            <button
              key={k}
              aria-label={`Review ${k + 1}`}
              onClick={() => setI(k)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                k === i ? 'w-8 bg-amber' : 'w-1.5 bg-cream/25 hover:bg-cream/50'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
