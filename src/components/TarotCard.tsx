'use client';

import { useState, useEffect } from 'react';
import { getCardImagePath, CARD_BACK_IMAGE } from '@/lib/cardImageMap';

interface TarotCardProps {
  cardId: string;
  cardName: string;
  isReversed: boolean;
  /** 카드가 뒤집히기 전 대기 시간 (ms) */
  flipDelay?: number;
  /** 카드 크기 */
  size?: 'sm' | 'md' | 'lg';
}

export default function TarotCard({
  cardId,
  cardName,
  isReversed,
  flipDelay = 0,
  size = 'md',
}: TarotCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFlipped(true);
    }, flipDelay);
    return () => clearTimeout(timer);
  }, [flipDelay]);

  const sizeClasses = {
    sm: 'w-24 h-36',
    md: 'w-32 h-48',
    lg: 'w-40 h-60',
  };

  const imageSrc = getCardImagePath(cardId);

  return (
    <div className={`card-container ${sizeClasses[size]}`}>
      <div className={`card-inner ${isFlipped ? 'flipped' : ''}`}>
        {/* 뒷면 (처음 보이는 면) */}
        <div className="card-front tarot-card-back">
          <img
            src={CARD_BACK_IMAGE}
            alt="카드 뒷면"
            className="w-full h-full object-cover rounded-xl"
            draggable={false}
          />
        </div>

        {/* 앞면 (뒤집힌 후 보이는 면) */}
        <div className={`card-back tarot-card-front ${isReversed ? 'card-reversed' : ''}`}>
          <img
            src={imageSrc}
            alt={cardName}
            className="w-full h-full object-cover rounded-xl"
            draggable={false}
          />
          {/* 역방향 뱃지 */}
          {isReversed && (
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-red-900/80 text-red-200 text-[10px] px-2 py-0.5 rounded-full font-body">
              역방향
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
