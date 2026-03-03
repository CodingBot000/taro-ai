export type ReadingType = 'one-card' | 'three-card';

// Gradio API에 보내는 reading_type 값 매핑
export const READING_TYPE_MAP: Record<ReadingType, string> = {
  'one-card': '원카드',
  'three-card': '쓰리카드',
};

// 카드 선택 그리드에서 사용하는 슬롯
export interface CardSlot {
  id: string;
  direction: '정방향' | '역방향';
  isSelected: boolean;
  selectionOrder: number | null;
}

// API 전송용 선택된 카드
export interface SelectedCardPayload {
  id: string;
  direction: '정방향' | '역방향';
}

// 서버 응답의 카드 데이터
export interface CardData {
  id: string;
  name: string;
  direction: string;
}

export interface TarotRequest {
  question: string;
  readingType: ReadingType;
  selectedCardsJson: string;
}

export interface TarotResponse {
  cards: CardData[];
  interpretation: string;
}

export interface TarotError {
  error: string;
  code?: string;
}
