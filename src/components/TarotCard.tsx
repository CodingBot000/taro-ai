'use client';

import { useState, useEffect } from 'react';

interface TarotCardProps {
  cardName: string;
  isReversed: boolean;
  /** 카드가 뒤집히기 전 대기 시간 (ms) */
  flipDelay?: number;
  /** 카드 크기 */
  size?: 'sm' | 'md' | 'lg';
}

export default function TarotCard({
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

  // 카드 정보에서 로마 숫자 추출 (있으면)
  const cardNumber = extractCardNumber(cardName);

  return (
    <div className={`card-container ${sizeClasses[size]}`}>
      <div className={`card-inner ${isFlipped ? 'flipped' : ''}`}>
        {/* 뒷면 */}
        <div className="card-front tarot-card-back" />

        {/* 앞면 */}
        <div className={`card-back tarot-card-front ${isReversed ? 'card-reversed' : ''}`}>
          {/* 카드 번호 */}
          {cardNumber && (
            <div className="text-xs text-gold-400/60 font-heading mb-1 tracking-widest">
              {cardNumber}
            </div>
          )}

          {/* 카드 심볼/이미지 영역 */}
          <div className="text-4xl mb-3 filter drop-shadow-lg">
            {getCardSymbol(cardName)}
          </div>

          {/* 카드 이름 */}
          <div className="text-center px-2">
            <div className="font-heading text-xs text-gold-400 leading-tight tracking-wide">
              {cardName}
            </div>
          </div>

          {/* 역방향 표시 */}
          {isReversed && (
            <div className="absolute bottom-2 text-[10px] text-red-400/70 font-body">
              역방향
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 카드 이름에서 심볼 매칭
function getCardSymbol(name: string): string {
  const symbolMap: Record<string, string> = {
    '바보': '🃏', 'Fool': '🃏',
    '마법사': '✦', 'Magician': '✦',
    '여사제': '☽', 'Priestess': '☽',
    '여황제': '👑', 'Empress': '👑',
    '황제': '🏛', 'Emperor': '🏛',
    '교황': '⛪', 'Hierophant': '⛪',
    '연인': '♡', 'Lovers': '♡',
    '전차': '⚡', 'Chariot': '⚡',
    '힘': '🦁', 'Strength': '🦁',
    '은둔자': '🏔', 'Hermit': '🏔',
    '운명의 수레바퀴': '☸', 'Wheel': '☸',
    '정의': '⚖', 'Justice': '⚖',
    '매달린 사람': '⚓', 'Hanged': '⚓',
    '죽음': '🌑', 'Death': '🌑',
    '절제': '⚗', 'Temperance': '⚗',
    '악마': '🔥', 'Devil': '🔥',
    '탑': '🗼', 'Tower': '🗼',
    '별': '⭐', 'Star': '⭐',
    '달': '🌙', 'Moon': '🌙',
    '태양': '☀', 'Sun': '☀',
    '심판': '📯', 'Judgement': '📯',
    '세계': '🌍', 'World': '🌍',
    // 마이너 아르카나 수트
    '완드': '🪄', 'Wand': '🪄',
    '컵': '🏆', 'Cup': '🏆',
    '소드': '⚔', 'Sword': '⚔',
    '펜타클': '⭐', 'Pentacle': '⭐',
  };

  const lowerName = name.toLowerCase();
  for (const [key, symbol] of Object.entries(symbolMap)) {
    if (lowerName.includes(key.toLowerCase())) {
      return symbol;
    }
  }
  return '✧';
}

// 메이저 아르카나 번호 추출
function extractCardNumber(name: string): string {
  const majorNumbers: Record<string, string> = {
    '바보': '0', 'Fool': '0',
    '마법사': 'I', 'Magician': 'I',
    '여사제': 'II', 'Priestess': 'II',
    '여황제': 'III', 'Empress': 'III',
    '황제': 'IV', 'Emperor': 'IV',
    '교황': 'V', 'Hierophant': 'V',
    '연인': 'VI', 'Lovers': 'VI',
    '전차': 'VII', 'Chariot': 'VII',
    '힘': 'VIII', 'Strength': 'VIII',
    '은둔자': 'IX', 'Hermit': 'IX',
    '운명의 수레바퀴': 'X', 'Wheel': 'X',
    '정의': 'XI', 'Justice': 'XI',
    '매달린 사람': 'XII', 'Hanged': 'XII',
    '죽음': 'XIII', 'Death': 'XIII',
    '절제': 'XIV', 'Temperance': 'XIV',
    '악마': 'XV', 'Devil': 'XV',
    '탑': 'XVI', 'Tower': 'XVI',
    '별': 'XVII', 'Star': 'XVII',
    '달': 'XVIII', 'Moon': 'XVIII',
    '태양': 'XIX', 'Sun': 'XIX',
    '심판': 'XX', 'Judgement': 'XX',
    '세계': 'XXI', 'World': 'XXI',
  };

  for (const [key, num] of Object.entries(majorNumbers)) {
    if (name.includes(key)) return num;
  }
  return '';
}
