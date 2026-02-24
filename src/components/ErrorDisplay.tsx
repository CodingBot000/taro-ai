'use client';

import { getTranslations, type Locale } from '@/lib/i18n';

interface ErrorDisplayProps {
  message: string;
  onRetry: () => void;
  locale?: Locale;
}

export default function ErrorDisplay({ message, onRetry, locale = 'ko' }: ErrorDisplayProps) {
  const t = getTranslations(locale);

  return (
    <div className="relative z-10 max-w-md mx-auto px-4 animate-fade-in">
      <div className="glass-panel p-8 text-center">
        {/* 에러 아이콘 */}
        <div className="text-4xl mb-4">🌑</div>

        <h2 className="font-heading text-lg text-red-400 mb-3">
          {t.errorTitle}
        </h2>

        <p className="font-body text-sm text-[var(--color-text-secondary)] mb-6">
          {message}
        </p>

        <button onClick={onRetry} className="glow-button font-body text-sm">
          다시 시도하기
        </button>
      </div>
    </div>
  );
}
