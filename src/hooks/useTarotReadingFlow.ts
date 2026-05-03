'use client';

import { useState } from 'react';
import type { QuestionCategoryManifest } from '@/lib/questionCategories';
import { submitTarotReading } from '@/lib/tarotApi';
import type {
  CategorySelection,
  IntakeContextPayload,
  ReadingType,
  SelectedCardPayload,
  TarotRequest,
  TarotResponse,
} from '@/types';

export type AppState = 'idle' | 'selecting' | 'loading' | 'result' | 'error';

interface UseTarotReadingFlowParams {
  accessToken: string | null;
  onBackendVersion: (backendVersion: string) => void;
  questionCategoryManifest: QuestionCategoryManifest | null;
}

export function useTarotReadingFlow({
  accessToken,
  onBackendVersion,
  questionCategoryManifest,
}: UseTarotReadingFlowParams) {
  const [appState, setAppState] = useState<AppState>('idle');
  const [question, setQuestion] = useState('');
  const [readingType, setReadingType] = useState<ReadingType>('one-card');
  const [categorySelection, setCategorySelection] = useState<CategorySelection | null>(null);
  const [intakeContext, setIntakeContext] = useState<IntakeContextPayload | null>(null);
  const [selectedCards, setSelectedCards] = useState<SelectedCardPayload[]>([]);
  const [result, setResult] = useState<TarotResponse | null>(null);
  const [error, setError] = useState('');

  const handleQuestionSubmit = (
    nextQuestion: string,
    nextReadingType: ReadingType,
    nextCategorySelection: CategorySelection,
    nextIntakeContext: IntakeContextPayload | null
  ) => {
    setQuestion(nextQuestion);
    setReadingType(nextReadingType);
    setCategorySelection(nextCategorySelection);
    setIntakeContext(nextIntakeContext);
    setAppState('selecting');
  };

  const handleCardConfirm = async (cards: SelectedCardPayload[]) => {
    if (!categorySelection || !questionCategoryManifest) {
      setError('질문 카테고리를 다시 선택해주세요.');
      setAppState('error');
      return;
    }

    setSelectedCards(cards);
    setAppState('loading');

    try {
      const requestBody: TarotRequest = {
        question,
        readingType,
        selectedCardsJson: JSON.stringify(cards),
        categorySelection,
        uiContext: {
          locale: 'ko',
          categoryVersion: questionCategoryManifest.version,
        },
        intakeContext: intakeContext ?? undefined,
      };

      const data = await submitTarotReading({
        accessToken,
        requestBody,
      });

      if (data.backendVersion) {
        onBackendVersion(data.backendVersion);
      }
      setResult(data);
      setAppState('result');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '예상치 못한 오류가 발생했습니다.');
      setAppState('error');
    }
  };

  const handleBack = () => {
    setAppState('idle');
  };

  const handleReset = () => {
    setAppState('idle');
    setQuestion('');
    setCategorySelection(null);
    setIntakeContext(null);
    setSelectedCards([]);
    setResult(null);
    setError('');
  };

  return {
    appState,
    error,
    handleBack,
    handleCardConfirm,
    handleQuestionSubmit,
    handleReset,
    question,
    readingType,
    result,
    selectedCards,
  };
}
