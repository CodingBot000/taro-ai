import type { MainCategoryId, SubCategoryId } from '@/lib/questionCategories';

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

export interface CategorySelection {
  mainCategoryId: MainCategoryId;
  subCategoryId: SubCategoryId;
}

export interface UiContextPayload {
  locale: string;
  categoryVersion: string;
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
  categorySelection: CategorySelection;
  uiContext: UiContextPayload;
}

export interface TarotResponse {
  cards: CardData[];
  interpretation: string;
  backendVersion?: string;
}

export interface TarotError {
  error: string;
  code?: string;
}

export interface BackendVersionResponse {
  version: string;
}

export interface AccessTokenResponse {
  accessToken: string;
  tokenType: string;
  expiresAt: string;
}

export interface AuthUser {
  id: number;
  email: string | null;
  name: string;
  profileImageUrl: string | null;
  role: string;
  status: string;
  lastLoginAt: string | null;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';
