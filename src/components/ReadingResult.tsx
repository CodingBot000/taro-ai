'use client';

import { getTranslations, type Locale } from '@/lib/i18n';
import TarotCard from './TarotCard';

interface ReadingResultProps {
  cards: string;
  interpretation: string;
  onReset: () => void;
  locale?: Locale;
}

interface ParsedCard {
  name: string;
  isReversed: boolean;
  position?: string; // 과거/현재/미래 (쓰리카드용)
}

export default function ReadingResult({
  cards,
  interpretation,
  onReset,
  locale = 'ko',
}: ReadingResultProps) {
  const t = getTranslations(locale);
  const parsedCards = parseCards(cards);

  return (
    <div className="relative z-10 max-w-2xl mx-auto px-4 animate-fade-in">
      {/* 카드 섹션 */}
      <div className="mb-8">
        <h2 className="font-heading text-lg text-gold-400 text-center mb-6 tracking-wider">
          {t.drawnCards}
        </h2>

        <div className="flex justify-center items-end gap-4 sm:gap-6 mb-4 flex-wrap">
          {parsedCards.map((card, index) => (
            <div key={index} className="flex flex-col items-center animate-slide-up"
              style={{ animationDelay: `${index * 300}ms` }}
            >
              {/* 포지션 라벨 (과거/현재/미래) */}
              {card.position && (
                <div className="text-xs text-[var(--color-text-muted)] mb-2 font-body tracking-wider">
                  {card.position}
                </div>
              )}

              <TarotCard
                cardName={card.name}
                isReversed={card.isReversed}
                flipDelay={500 + index * 600}
                size={parsedCards.length === 1 ? 'lg' : 'md'}
              />

              {/* 카드 이름 */}
              <div className="mt-3 text-center">
                <div className="text-sm font-heading text-[var(--color-text-primary)]">
                  {card.name}
                </div>
                {card.isReversed && (
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

/**
 * Gradio API에서 반환된 카드 텍스트를 파싱
 *
 * 가능한 포맷들:
 * - "마법사 (정방향)"
 * - "과거: 마법사 (정방향)\n현재: 달 (역방향)\n미래: 태양 (정방향)"
 * - "The Fool (Upright)"
 * - 또는 기타 자유 형식
 */
function parseCards(cardsText: string): ParsedCard[] {
  const lines = cardsText.split('\n').filter((l) => l.trim());
  const parsed: ParsedCard[] = [];

  for (const line of lines) {
    const isReversed =
      line.includes('역방향') ||
      line.includes('Reversed') ||
      line.includes('reversed');

    // "과거:" / "현재:" / "미래:" 같은 포지션 추출
    let position: string | undefined;
    const posMatch = line.match(/^(과거|현재|미래|Past|Present|Future)\s*[:：]/i);
    if (posMatch) {
      position = posMatch[1];
    }

    // 카드 이름 추출 (포지션, 방향 텍스트 제거)
    let name = line;
    if (posMatch) {
      name = name.replace(posMatch[0], '');
    }
    name = name
      .replace(/\(정방향\)|\(역방향\)|\(Upright\)|\(Reversed\)/gi, '')
      .replace(/정방향|역방향|Upright|Reversed/gi, '')
      .replace(/[-–—]/g, '')
      .trim();

    if (name) {
      parsed.push({ name, isReversed, position });
    }
  }

  // 파싱 실패 시 전체 텍스트를 하나의 카드로 표시
  if (parsed.length === 0 && cardsText.trim()) {
    parsed.push({
      name: cardsText.trim(),
      isReversed: cardsText.includes('역방향') || cardsText.includes('Reversed'),
    });
  }

  return parsed;
}
