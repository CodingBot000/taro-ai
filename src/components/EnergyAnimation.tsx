'use client';

import { useState, useEffect } from 'react';
import { getTranslations, type Locale } from '@/lib/i18n';
import { CARD_BACK_IMAGE } from '@/lib/cardImageMap';
import type { ReadingType, SelectedCardPayload } from '@/types';

interface EnergyAnimationProps {
  selectedCards: SelectedCardPayload[];
  readingType: ReadingType;
  isVisible: boolean;
  locale?: Locale;
}

const POSITION_LABELS = ['과거', '현재', '미래'];

export default function EnergyAnimation({
  selectedCards,
  readingType,
  isVisible,
  locale = 'ko',
}: EnergyAnimationProps) {
  const t = getTranslations(locale);
  const [elapsed, setElapsed] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  // 타이머
  useEffect(() => {
    if (!isVisible) {
      setElapsed(0);
      setMessageIndex(0);
      return;
    }

    const timer = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible]);

  // 메시지 순환 (5초마다)
  useEffect(() => {
    if (elapsed === 0) {
      setMessageIndex(0);
      return;
    }

    const idx = Math.floor(elapsed / 5) % t.loadingMessages.length;
    setMessageIndex(idx);
  }, [elapsed, t.loadingMessages.length]);

  if (!isVisible) return null;

  const isThreeCard = readingType === 'three-card';

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--color-bg-primary)]/95 backdrop-blur-sm">
      <div className="w-full max-w-xl px-6 text-center">
        <h2 className="font-heading text-lg text-gold-400 tracking-wider animate-pulse">
          {t.loadingTitle}
        </h2>

        <p className="mt-3 h-6 text-[var(--color-text-secondary)] font-body transition-opacity duration-500">
          {t.loadingMessages[messageIndex]}
        </p>
      </div>

      {/* 선택 카드 표시 (뒷면) */}
      <div className={`mt-8 flex items-center justify-center gap-4 ${isThreeCard ? 'gap-3' : ''}`}>
        {selectedCards.map((card, index) => (
          <div key={card.id} className="flex flex-col items-center">
            {/* 포지션 라벨 (쓰리카드) */}
            {isThreeCard && (
              <div className="text-xs text-[var(--color-text-muted)] mb-2 font-body">
                {POSITION_LABELS[index]}
              </div>
            )}

            {/* 카드 + 에너지 글로우 */}
            <div className="energy-card-container relative">
              {/* 확산 링 */}
              <div className="energy-ring absolute -inset-4 rounded-xl" />
              <div className="energy-ring absolute -inset-4 rounded-xl" />
              <div className="energy-ring absolute -inset-4 rounded-xl" />

              <div className={`${isThreeCard ? 'w-24 h-36' : 'w-32 h-48'} rounded-xl overflow-hidden`}>
                <img
                  src={CARD_BACK_IMAGE}
                  alt="선택된 카드"
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 w-full max-w-sm px-6">
        <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
          <div className="h-full rounded-full loading-shimmer" />
        </div>

        <div className="mt-4 text-center text-xs text-[var(--color-text-muted)] space-y-1">
          <p>{elapsed}초 경과</p>
          {elapsed >= 10 && (
            <p className="animate-fade-in">{t.loadingNote}</p>
          )}
        </div>
      </div>
    </div>
  );
}
