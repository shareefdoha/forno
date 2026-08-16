import { useState } from 'react';
import { useLang } from '../context/LanguageContext';
import { WA } from '../lib/constants';

const FIELD =
  'mt-2 w-full rounded-xl border border-cream/12 bg-ink/50 px-4 py-3.5 text-cream placeholder:text-cream/25 focus:border-amber focus:outline-none transition';
const LABEL = 'block text-xs uppercase tracking-[.16em] text-cream/45';

export default function BookingForm() {
  const { t } = useLang();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', guests: '2', date: '', time: '', note: '',
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    const v = (s) => s.trim() || '—';
    const msg =
      `New reservation request — Forno\n` +
      `Name: ${form.name.trim()}\n` +
      `Phone: ${form.phone.trim()}\n` +
      `Guests: ${form.guests}\n` +
      `Date: ${v(form.date)}\n` +
      `Time: ${v(form.time)}\n` +
      `Notes: ${v(form.note)}`;

    window.open(WA + encodeURIComponent(msg), '_blank');
    setSent(true);
  };

  return (
    <div className="glass-card rounded-3xl p-7 sm:p-9">
      <h3 className="font-display text-3xl">{t('form.h')}</h3>
      <p className="mt-2 text-sm text-cream/55">{t('form.sub')}</p>

      <form id="bookingForm" className="mt-8 space-y-5" onSubmit={onSubmit}>
        <div>
          <label htmlFor="f-name" className={LABEL}>{t('form.name')}</label>
          <input
            id="f-name" required value={form.name} onChange={set('name')}
            className={FIELD} placeholder="Ahmed Al-Sulaiti"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="f-phone" className={LABEL}>{t('form.phone')}</label>
            <input
              id="f-phone" required dir="ltr" value={form.phone} onChange={set('phone')}
              className={FIELD} placeholder="+974 …"
            />
          </div>
          <div>
            <label htmlFor="f-guests" className={LABEL}>{t('form.guests')}</label>
            <select id="f-guests" value={form.guests} onChange={set('guests')} className={FIELD}>
              <option>2</option><option>3</option><option>4</option><option>5</option>
              <option>6</option><option>8</option><option>10+</option>
            </select>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="f-date" className={LABEL}>{t('form.date')}</label>
            <input id="f-date" type="date" value={form.date} onChange={set('date')} className={FIELD} />
          </div>
          <div>
            <label htmlFor="f-time" className={LABEL}>{t('form.time')}</label>
            <input id="f-time" type="time" value={form.time} onChange={set('time')} className={FIELD} />
          </div>
        </div>

        <div>
          <label htmlFor="f-note" className={LABEL}>{t('form.note')}</label>
          <textarea
            id="f-note" rows="3" value={form.note} onChange={set('note')}
            className={`${FIELD} resize-none`} placeholder="Birthday, high chair, allergy…"
          />
        </div>

        <button
          type="submit"
          className="btn-amber w-full rounded-full py-4 text-sm font-bold tracking-wide transition-all duration-300"
        >
          {t('form.send')}
        </button>

        <p id="formMsg" className={`${sent ? '' : 'hidden'} text-center text-sm text-amber`}>
          {t('form.ok')}
        </p>
      </form>
    </div>
  );
}
