'use client';

import { useState, useEffect } from 'react';
import { getTranslations, type Locale } from '@/lib/i18n';

interface LoadingOverlayProps {
  isVisible: boolean;
  locale?: Locale;
}

export default function LoadingOverlay({ isVisible, locale = 'ko' }: LoadingOverlayProps) {
  const t = getTranslations(locale);
  const [messageIndex, setMessageIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  // 로딩 메시지 순환 (5초마다)
  useEffect(() => {
    if (!isVisible) {
      setMessageIndex(0);
      setElapsed(0);
      return;
    }

    const msgInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % t.loadingMessages.length);
    }, 5000);

    const timeInterval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(msgInterval);
      clearInterval(timeInterval);
    };
  }, [isVisible, t.loadingMessages.length]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-bg-primary)]/80 backdrop-blur-sm animate-fade-in">
      <div className="text-center px-6 max-w-sm">
        {/* 크리스탈 볼 애니메이션 */}
        <div className="flex justify-center mb-8">
          <div className="crystal-ball" />
        </div>

        {/* 제목 */}
        <h2 className="font-heading text-lg text-gold-400 mb-4">
          {t.loadingTitle}
        </h2>

        {/* 순환 메시지 */}
        <p className="text-[var(--color-text-secondary)] font-body mb-6 h-6 transition-opacity duration-500">
          {t.loadingMessages[messageIndex]}
        </p>

        {/* 프로그레스 바 */}
        <div className="w-full h-1 bg-[var(--color-border)] rounded-full overflow-hidden mb-4">
          <div className="h-full loading-shimmer rounded-full" />
        </div>

        {/* 경과 시간 & 안내 */}
        <div className="text-xs text-[var(--color-text-muted)] space-y-1">
          <p>{elapsed}초 경과</p>
          {elapsed > 10 && (
            <p className="animate-fade-in">{t.loadingNote}</p>
          )}
        </div>
      </div>
    </div>
  );
}
