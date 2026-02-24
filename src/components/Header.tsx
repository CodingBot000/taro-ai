'use client';

import { getTranslations, type Locale } from '@/lib/i18n';

interface HeaderProps {
  locale?: Locale;
}

export default function Header({ locale = 'ko' }: HeaderProps) {
  const t = getTranslations(locale);

  return (
    <header className="relative z-10 pt-8 pb-4 text-center">
      {/* 로고 영역 */}
      <div className="inline-block mb-3">
        <div className="text-4xl mb-1" aria-hidden="true">✧</div>
      </div>

      <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-gold-400 tracking-wider mb-2">
        {t.siteName}
      </h1>

      <p className="font-body text-sm sm:text-base text-[var(--color-text-secondary)] tracking-wide">
        {t.siteSubtitle}
      </p>

      <div className="golden-divider max-w-xs mx-auto mt-6" />
    </header>
  );
}
