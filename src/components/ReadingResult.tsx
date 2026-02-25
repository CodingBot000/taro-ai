'use client';

import { getTranslations, type Locale } from '@/lib/i18n';
import type { CardData } from '@/types';
import TarotCard from './TarotCard';

interface ReadingResultProps {
  cards: string;
  cardData: CardData[];
  interpretation: string;
  onReset: () => void;
  locale?: Locale;
}

const POSITION_LABELS = ['과거', '현재', '미래'];

export default function ReadingResult({
  cards,
  cardData,
  interpretation,
  onReset,
  locale = 'ko',
}: ReadingResultProps) {
  const t = getTranslations(locale);
  const isThreeCard = cardData.length === 3;

  return (
    <div className="relative z-10 max-w-2xl mx-auto px-4 animate-fade-in">
      {/* 카드 섹션 */}
      <div className="mb-8">
        <h2 className="font-heading text-lg text-gold-400 text-center mb-6 tracking-wider">
          {t.drawnCards}
        </h2>

        <div className="flex justify-center items-end gap-4 sm:gap-6 mb-4 flex-wrap">
          {cardData.map((card, index) => (
            <div key={card.id} className="flex flex-col items-center animate-slide-up"
              style={{ animationDelay: `${index * 300}ms` }}
            >
              {/* 포지션 라벨 (과거/현재/미래) */}
              {isThreeCard && (
                <div className="text-xs text-[var(--color-text-muted)] mb-2 font-body tracking-wider">
                  {POSITION_LABELS[index]}
                </div>
              )}

              <TarotCard
                cardId={card.id}
                cardName={card.name}
                isReversed={card.direction === '역방향'}
                flipDelay={500 + index * 600}
                size={cardData.length === 1 ? 'lg' : 'md'}
              />

              {/* 카드 이름 */}
              <div className="mt-3 text-center">
                <div className="text-sm font-heading text-[var(--color-text-primary)]">
                  {card.name}
                </div>
                {card.direction === '역방향' && (
                  <div className="text-xs text-red-400/70 mt-0.5">역방향</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="golden-divider max-w-sm mx-auto" />

      {/* 해석 섹션 */}
      <div className="mt-8 mb-8">
        <h2 className="font-heading text-lg text-gold-400 text-center mb-6 tracking-wider">
          {t.interpretation}
        </h2>

        <div className="glass-panel p-6 sm:p-8">
          {/* 원본 카드 정보 */}
          <div className="text-sm text-[var(--color-text-muted)] mb-4 p-3 rounded-lg bg-[var(--color-bg-primary)]/50 font-body whitespace-pre-wrap">
            {cards}
          </div>

          <div className="golden-divider max-w-xs mx-auto" />

          {/* AI 해석 */}
          <div className="font-body text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
            {interpretation}
          </div>
        </div>
      </div>

      {/* 다시 뽑기 버튼 */}
      <div className="text-center pb-8">
        <button onClick={onReset} className="glow-button font-body">
          <span className="flex items-center justify-center gap-2">
            <span>✦</span>
            {t.newQuestion}
            <span>✦</span>
          </span>
        </button>
      </div>
    </div>
  );
}
