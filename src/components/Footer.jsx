import { useLang } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLang();

  return (
    <footer className="border-t border-cream/[.08] py-12">
      <div className="mx-auto flex max-w-shell flex-col items-center gap-6 px-5 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-3">
          <img src="/img/logo.png" alt="" className="h-9 w-auto" />
          <div>
            <p className="font-display text-xl tracking-[.16em]">FORNO</p>
            <p className="text-xs text-cream/40">{t('foot.tag')}</p>
          </div>
        </div>
        <p className="text-xs text-cream/35">
          © <span id="yr">{new Date().getFullYear()}</span> Forno Restaurant. {t('foot.rights')}
        </p>
      </div>
    </footer>
  );
}
