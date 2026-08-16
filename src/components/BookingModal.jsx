import { useLang } from '../context/LanguageContext';
import { useBooking } from '../context/BookingContext';
import { WA_HOST_LINK, PHONE_PRIMARY } from '../lib/constants';

export default function BookingModal() {
  const { t } = useLang();
  const { isOpen, close, goToForm } = useBooking();

  return (
    <div
      id="modal"
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
      className={`fixed inset-0 z-[60] ${isOpen ? 'flex' : 'hidden'} items-center justify-center bg-ink/85 p-5 backdrop-blur-md`}
    >
      <div className="glass-card w-full max-w-md rounded-3xl p-8 text-center">
        <p className="eyebrow">{t('modal.eyebrow')}</p>
        <h3 className="mt-4 font-display text-3xl">{t('modal.h')}</h3>
        <p className="mt-3 text-sm text-cream/55">{t('modal.sub')}</p>
        <div className="mt-8 space-y-3">
          <a
            href={WA_HOST_LINK} target="_blank" rel="noopener"
            className="btn-amber flex w-full items-center justify-center gap-2 rounded-full py-4 text-sm font-bold transition-all duration-300"
          >
            {t('modal.wa')}
          </a>
          <a
            href={PHONE_PRIMARY.href}
            className="btn-ghost flex w-full items-center justify-center rounded-full py-4 text-sm font-semibold transition-all duration-300"
          >
            {t('modal.call')}
          </a>
          <button
            id="toForm" onClick={goToForm}
            className="w-full py-2 text-sm text-cream/50 underline underline-offset-4 hover:text-amber transition"
          >
            {t('modal.form')}
          </button>
        </div>
      </div>
    </div>
  );
}
