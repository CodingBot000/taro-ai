'use client';

import AuthHeaderActions from '@/components/auth/AuthHeaderActions';
import { getTranslations, type Locale } from '@/lib/i18n';

interface HeaderProps {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
}

export default function Header({ locale, onLocaleChange }: HeaderProps) {
  const t = getTranslations(locale);

  return (
    <header className="relative z-10 px-4 pt-5 pb-2">
      <div className="mx-auto max-w-6xl">
        <div className="relative flex min-h-[72px] items-start justify-center">
          <div className="text-center">
            <div className="inline-block mb-1">
              <div className="text-4xl mb-1" aria-hidden="true">✧</div>
            </div>
          </div>

          <div className="absolute left-0 top-0 flex rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(15,10,30,0.72)] p-1 text-xs shadow-[0_12px_32px_rgba(5,2,16,0.22)] backdrop-blur-xl">
            {(['ko', 'en'] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onLocaleChange(item)}
                aria-pressed={locale === item}
                className={`rounded-full px-3 py-1.5 transition-colors ${
                  locale === item
                    ? 'bg-[rgba(212,160,23,0.18)] text-gold-300'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                }`}
              >
                {item === 'ko' ? t.localeKo : t.localeEn}
              </button>
            ))}
          </div>

          <div className="absolute right-0 top-0">
            <AuthHeaderActions />
          </div>
        </div>

        <div className="golden-divider mx-auto mt-2 max-w-xs" />
      </div>
    </header>
  );
}
