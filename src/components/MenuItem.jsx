import { useLang } from '../context/LanguageContext';
import { WA } from '../lib/constants';
import { pick, formatPrice } from '../lib/utils';

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="#17181A"/></svg>',
  );

export default function MenuItem({ item, index }) {
  const { lang, t } = useLang();

  const name = pick(item, 'name', lang);
  const description = pick(item, 'description', lang);
  const price = formatPrice(item.price);
  const soldOut = !item.is_available;

  const href =
    WA + encodeURIComponent(`Hello Forno — I would like to order: ${name} (${price} QAR)`);

  // The `lift` keyframes end at opacity:1 with fill-mode forwards, so any
  // dimming has to live on an inner element rather than on this wrapper.
  const style = {
    animation: 'lift .6s cubic-bezier(.16,1,.3,1) forwards',
    animationDelay: `${index * 55}ms`,
    opacity: 0,
  };

  const body = (
    <>
      <div className="arch relative overflow-hidden">
        <img
          src={item.image_url || PLACEHOLDER}
          alt={name}
          loading="lazy"
          className={`dish-img h-52 w-full object-cover ${soldOut ? 'grayscale opacity-[.45]' : ''}`}
          onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
        />
        {soldOut && (
          <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center">
            <span className="rounded-full bg-ink/85 px-4 py-1.5 text-xs font-bold uppercase tracking-[.18em] text-amber">
              {t('dish.soldout')}
            </span>
          </span>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className={`font-display text-2xl leading-tight ${soldOut ? 'text-cream/45' : ''}`}>{name}</h3>
          <span className="shrink-0 rounded-full bg-amber/12 px-3 py-1 text-sm font-bold text-amber" dir="ltr">
            {price} <span className="text-[.7rem] font-medium">QAR</span>
          </span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-cream/55">{description}</p>

        {soldOut ? (
          <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[.16em] text-cream/30">
            {t('dish.soldout')}
          </span>
        ) : (
          <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[.16em] text-cream/35 transition group-hover:text-amber">
            {t('dish.order')}
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12l-7.5 7.5M21 12H3" /></svg>
          </span>
        )}
      </div>
    </>
  );

  if (soldOut) {
    return (
      <div
        className="dish glass-card group block overflow-hidden rounded-3xl transition-all duration-500"
        style={style}
        aria-disabled="true"
      >
        {body}
      </div>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className="dish glass-card group block overflow-hidden rounded-3xl transition-all duration-500 hover:border-amber/40 hover:-translate-y-1.5"
      style={style}
    >
      {body}
    </a>
  );
}
