import { useLang } from '../context/LanguageContext';
import { useReveal } from '../hooks/useReveal';
import BookingForm from './BookingForm';
import {
  ADDRESS, MAP_EMBED, PHONE_PRIMARY, PHONE_SECONDARY, SOCIAL, WA_HOST_LINK,
} from '../lib/constants';

export default function Contact() {
  const { t } = useLang();
  const leftRef = useReveal();
  const mapRef = useReveal();
  const rightRef = useReveal();

  return (
    <section
      id="contact"
      className="relative border-t border-cream/[.06] bg-gradient-to-b from-char to-ink py-24 lg:py-32"
    >
      <div className="mx-auto max-w-shell px-5 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">

          {/* left: details + map */}
          <div ref={leftRef} className="reveal">
            <p className="eyebrow">{t('ct.eyebrow')}</p>
            <h2 className="mt-5 font-display text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.1]">
              <span>{t('ct.h1')}</span><br /><span className="italic text-amber">{t('ct.h2')}</span>
            </h2>

            <dl className="mt-10 space-y-6">
              <div className="flex gap-4">
                <span className="mt-0.5 text-amber">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7.5-6.3 7.5-11.25a7.5 7.5 0 10-15 0C4.5 14.7 12 21 12 21z" /><circle cx="12" cy="9.75" r="2.25" /></svg>
                </span>
                <div>
                  <dt className="text-xs uppercase tracking-[.18em] text-cream/45">{t('ct.addr')}</dt>
                  <dd className="mt-1 text-cream/85">{ADDRESS}</dd>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="mt-0.5 text-amber">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106a1.125 1.125 0 00-1.173.417l-.97 1.293a.75.75 0 01-.92.266 12.043 12.043 0 01-6.16-6.16.75.75 0 01.266-.92l1.293-.97c.375-.281.53-.769.417-1.173L6.963 3.102A1.125 1.125 0 005.872 2.25H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                </span>
                <div>
                  <dt className="text-xs uppercase tracking-[.18em] text-cream/45">{t('ct.phone')}</dt>
                  <dd className="mt-1 flex flex-wrap gap-x-5 text-cream/85" dir="ltr">
                    <a href={PHONE_PRIMARY.href} className="hover:text-amber transition">{PHONE_PRIMARY.display}</a>
                    <a href={PHONE_SECONDARY.href} className="hover:text-amber transition">{PHONE_SECONDARY.display}</a>
                  </dd>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="mt-0.5 text-amber">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path strokeLinecap="round" d="M12 7.5V12l3 1.75" /></svg>
                </span>
                <div>
                  <dt className="text-xs uppercase tracking-[.18em] text-cream/45">{t('ct.hours')}</dt>
                  <dd className="mt-1 text-cream/85">{t('ct.hoursv')}</dd>
                </div>
              </div>
            </dl>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href={SOCIAL.instagram} target="_blank" rel="noopener" aria-label="Instagram"
                 className="glass-card flex h-11 w-11 items-center justify-center rounded-full transition hover:border-amber/50 hover:text-amber">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.64-.07-4.85s.01-3.58.07-4.85C2.38 3.92 3.89 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zm0 5.68a4.16 4.16 0 100 8.32 4.16 4.16 0 000-8.32zm0 6.86a2.7 2.7 0 110-5.4 2.7 2.7 0 010 5.4zm4.33-7.03a.97.97 0 100-1.95.97.97 0 000 1.95z" /></svg>
              </a>
              <a href={SOCIAL.facebook} target="_blank" rel="noopener" aria-label="Facebook"
                 className="glass-card flex h-11 w-11 items-center justify-center rounded-full transition hover:border-amber/50 hover:text-amber">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.63c-.29-.04-1.27-.13-2.4-.13-2.38 0-4 1.45-4 4.11V9.9H7.5V13h2.8v8h3.2z" /></svg>
              </a>
              <a href={WA_HOST_LINK} target="_blank" rel="noopener" aria-label="WhatsApp"
                 className="glass-card flex h-11 w-11 items-center justify-center rounded-full transition hover:border-amber/50 hover:text-amber">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.85c0 1.74.46 3.44 1.32 4.93L2.1 22l5.36-1.4a9.8 9.8 0 004.58 1.14h.01c5.43 0 9.84-4.4 9.84-9.85C21.89 6.4 17.48 2 12.04 2zm5.73 14.02c-.24.68-1.4 1.3-1.94 1.34-.5.05-1.13.07-1.83-.11-.42-.13-.96-.31-1.66-.61-2.92-1.26-4.82-4.2-4.97-4.4-.14-.2-1.19-1.58-1.19-3.02 0-1.43.75-2.13 1.02-2.42.27-.29.58-.36.78-.36h.56c.18 0 .42-.07.66.5.24.59.82 2.02.9 2.16.07.15.12.32.02.51-.1.2-.15.32-.29.49-.15.17-.31.38-.44.51-.15.15-.3.3-.13.59.17.29.76 1.25 1.62 2.02 1.11.99 2.05 1.3 2.34 1.44.29.15.46.12.63-.07.17-.2.73-.85.92-1.14.2-.29.39-.24.66-.15.27.1 1.7.8 1.99.95.29.15.48.22.55.34.07.12.07.68-.17 1.36z" /></svg>
              </a>
              <a href={SOCIAL.maps} target="_blank" rel="noopener"
                 className="glass-card flex h-11 items-center rounded-full px-5 text-sm font-medium transition hover:border-amber/50 hover:text-amber">
                {t('ct.dir')}
              </a>
            </div>

            <div ref={mapRef} className="reveal mt-10 overflow-hidden rounded-3xl border border-cream/10">
              <iframe
                title="Forno location"
                src={MAP_EMBED}
                className="h-[300px] w-full grayscale-[.35] contrast-[1.05]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>

          {/* right: booking form */}
          <div ref={rightRef} className="reveal" style={{ '--d': '120ms' }}>
            <BookingForm />
          </div>

        </div>
      </div>
    </section>
  );
}
