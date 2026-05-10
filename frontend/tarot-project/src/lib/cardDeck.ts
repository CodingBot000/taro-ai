import type { CardSlot } from '@/types';

// 78장 카드 ID 목록
const MAJOR_IDS = Array.from({ length: 22 }, (_, i) =>
  `major_${String(i).padStart(2, '0')}`
);

const SUITS = ['wands', 'cups', 'swords', 'pentacles'] as const;
const MINOR_IDS = SUITS.flatMap(suit =>
  Array.from({ length: 14 }, (_, i) =>
    `${suit}_${String(i + 1).padStart(2, '0')}`)
);

export const ALL_CARD_IDS: string[] = [...MAJOR_IDS, ...MINOR_IDS];

/** Fisher-Yates 셔플 */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 새 덱 생성: 셔플 + 정방향/역방향 랜덤 배정 */
export function generateDeck(): CardSlot[] {
  return shuffle(ALL_CARD_IDS).map(id => ({
    id,
    direction: Math.random() < 0.5 ? '정방향' : '역방향',
    isSelected: false,
    selectionOrder: null,
  }));
}

/** 기존 덱 재셔플: 순서 + 방향 재배정, 선택 초기화 */
export function shuffleDeck(): CardSlot[] {
  return generateDeck();
}
