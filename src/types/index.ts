export type ReadingType = 'one-card' | 'three-card';

// Gradio API에 보내는 reading_type 값 매핑
export const READING_TYPE_MAP: Record<ReadingType, string> = {
  'one-card': '원카드 (오늘의 운세)',
  'three-card': '쓰리카드 (과거/현재/미래)',
};

export interface CardData {
  id: string;
  name: string;
  direction: string;
}

export interface TarotRequest {
  question: string;
  readingType: ReadingType;
}

export interface TarotResponse {
  cards: string;
  interpretation: string;
  cardData: CardData[];
}

export interface TarotError {
  error: string;
  code?: string;
}

// 78장 타로 카드 - 메이저 아르카나
export const MAJOR_ARCANA = [
  'The Fool', 'The Magician', 'The High Priestess', 'The Empress',
  'The Emperor', 'The Hierophant', 'The Lovers', 'The Chariot',
  'Strength', 'The Hermit', 'Wheel of Fortune', 'Justice',
  'The Hanged Man', 'Death', 'Temperance', 'The Devil',
  'The Tower', 'The Star', 'The Moon', 'The Sun',
  'Judgement', 'The World',
] as const;

// 카드 한글명 (i18n용)
export const CARD_NAMES_KO: Record<string, string> = {
  'The Fool': '바보',
  'The Magician': '마법사',
  'The High Priestess': '여사제',
  'The Empress': '여황제',
  'The Emperor': '황제',
  'The Hierophant': '교황',
  'The Lovers': '연인',
  'The Chariot': '전차',
  'Strength': '힘',
  'The Hermit': '은둔자',
  'Wheel of Fortune': '운명의 수레바퀴',
  'Justice': '정의',
  'The Hanged Man': '매달린 사람',
  'Death': '죽음',
  'Temperance': '절제',
  'The Devil': '악마',
  'The Tower': '탑',
  'The Star': '별',
  'The Moon': '달',
  'The Sun': '태양',
  'Judgement': '심판',
  'The World': '세계',
};

// 메이저 아르카나 심볼 (CSS 카드 디자인용)
export const CARD_SYMBOLS: Record<string, string> = {
  'The Fool': '🃏',
  'The Magician': '✦',
  'The High Priestess': '☽',
  'The Empress': '♛',
  'The Emperor': '♚',
  'The Hierophant': '⛪',
  'The Lovers': '♡',
  'The Chariot': '⚡',
  'Strength': '🦁',
  'The Hermit': '🏔',
  'Wheel of Fortune': '☸',
  'Justice': '⚖',
  'The Hanged Man': '⚓',
  'Death': '🌑',
  'Temperance': '⚗',
  'The Devil': '🔥',
  'The Tower': '⚡',
  'The Star': '⭐',
  'The Moon': '🌙',
  'The Sun': '☀',
  'Judgement': '📯',
  'The World': '🌍',
};

// 마이너 아르카나 수트 심볼
export const SUIT_SYMBOLS: Record<string, string> = {
  'Wands': '🪄',
  'Cups': '🏆',
  'Swords': '⚔',
  'Pentacles': '⭐',
};
