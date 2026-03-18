'use client';

import { useEffect, useState } from 'react';
import Starfield from '@/components/Starfield';
import Header from '@/components/Header';
import ReadingForm from '@/components/ReadingForm';
import CardSelectionScreen from '@/components/CardSelectionScreen';
import EnergyAnimation from '@/components/EnergyAnimation';
import ReadingResult from '@/components/ReadingResult';
import ErrorDisplay from '@/components/ErrorDisplay';
import { buildApiUrl } from '@/lib/api';
import { getTranslations } from '@/lib/i18n';
import type { QuestionCategoryManifest } from '@/lib/questionCategories';
import {
  fetchQuestionCategoryManifest,
  readCachedQuestionCategoryManifest,
  writeCachedQuestionCategoryManifest,
} from '@/lib/questionCategoryManifest';
import { useAuth } from '@/providers/AuthProvider';
import type {
  BackendVersionResponse,
  CategorySelection,
  ReadingType,
  SelectedCardPayload,
  TarotError,
  TarotRequest,
  TarotResponse,
} from '@/types';

type AppState = 'idle' | 'selecting' | 'loading' | 'result' | 'error';

export default function Home() {
  const t = getTranslations('ko');
  const auth = useAuth();
  const [appState, setAppState] = useState<AppState>('idle');
  const [question, setQuestion] = useState('');
  const [readingType, setReadingType] = useState<ReadingType>('one-card');
  const [categorySelection, setCategorySelection] = useState<CategorySelection | null>(null);
  const [selectedCards, setSelectedCards] = useState<SelectedCardPayload[]>([]);
  const [result, setResult] = useState<TarotResponse | null>(null);
  const [error, setError] = useState('');
  const [backendVersion, setBackendVersion] = useState<string | null>(null);
  const [questionCategoryManifest, setQuestionCategoryManifest] = useState<QuestionCategoryManifest | null>(null);
  const [questionCategoryError, setQuestionCategoryError] = useState('');
  const [isQuestionCategoryLoading, setIsQuestionCategoryLoading] = useState(true);
  const [questionCategoryReloadKey, setQuestionCategoryReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadBackendVersion = async () => {
      try {
        const response = await fetch(buildApiUrl('/api/version'), {
          headers: auth.accessToken
            ? {
                Authorization: `Bearer ${auth.accessToken}`,
              }
            : undefined,
          credentials: 'include',
          cache: 'no-store',
        });
        if (!response.ok) {
          return;
        }

        const data: BackendVersionResponse = await response.json();
        if (isMounted && data.version) {
          setBackendVersion(data.version);
        }
      } catch {
        if (isMounted) {
          setBackendVersion(null);
        }
      }
    };

    void loadBackendVersion();

    return () => {
      isMounted = false;
    };
  }, [auth.accessToken]);

  useEffect(() => {
    let isMounted = true;
    const cachedManifest = readCachedQuestionCategoryManifest();

    if (cachedManifest) {
      setQuestionCategoryManifest(cachedManifest);
      setQuestionCategoryError('');
      setIsQuestionCategoryLoading(false);
    } else {
      setIsQuestionCategoryLoading(true);
    }

    const loadQuestionCategoryManifest = async () => {
      try {
        const manifest = await fetchQuestionCategoryManifest();
        if (!isMounted) {
          return;
        }

        writeCachedQuestionCategoryManifest(manifest);
        setQuestionCategoryManifest(manifest);
        setQuestionCategoryError('');
      } catch (manifestError: unknown) {
        if (!isMounted || cachedManifest) {
          return;
        }

        setQuestionCategoryError(
          manifestError instanceof Error
            ? manifestError.message
            : '질문 카테고리 정보를 불러오는 중 오류가 발생했습니다.'
        );
      } finally {
        if (isMounted) {
          setIsQuestionCategoryLoading(false);
        }
      }
    };

    void loadQuestionCategoryManifest();

    return () => {
      isMounted = false;
    };
  }, [questionCategoryReloadKey]);

  // 1단계 → 2단계: 질문 입력 후 카드 선택 화면으로
  const handleQuestionSubmit = (
    q: string,
    rt: ReadingType,
    nextCategorySelection: CategorySelection
  ) => {
    setQuestion(q);
    setReadingType(rt);
    setCategorySelection(nextCategorySelection);
    setAppState('selecting');
  };

  // 2단계 → 3단계: 카드 선택 확인 → API 호출
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
      };

      const response = await fetch(buildApiUrl('/api/tarot'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(auth.accessToken
            ? {
                Authorization: `Bearer ${auth.accessToken}`,
              }
            : {}),
        },
        body: JSON.stringify(requestBody),
        credentials: 'include',
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorData: TarotError = await response.json().catch(() => ({
          error: '서버 오류가 발생했습니다.',
        }));
        throw new Error(errorData.error);
      }

      const data: TarotResponse = await response.json();
      if (data.backendVersion) {
        setBackendVersion(data.backendVersion);
      }
      setResult(data);
      setAppState('result');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '예상치 못한 오류가 발생했습니다.');
      setAppState('error');
    }
  };

  // 카드 선택 → 질문 입력으로 돌아가기
  const handleBack = () => {
    setAppState('idle');
  };

  // 전체 초기화
  const handleReset = () => {
    setAppState('idle');
    setQuestion('');
    setCategorySelection(null);
    setSelectedCards([]);
    setResult(null);
    setError('');
  };

  const handleQuestionCategoryRetry = () => {
    setQuestionCategoryError('');
    setIsQuestionCategoryLoading(true);
    setQuestionCategoryReloadKey((current) => current + 1);
  };

  return (
    <main className="relative min-h-screen">
      {/* 배경 */}
      <Starfield />

      {/* 헤더 (항상 표시) */}
      <Header />

      {/* 메인 콘텐츠 영역 */}
      <div className="relative z-10 pb-12">
        {/* 1단계: 질문 입력 */}
        {appState === 'idle' && (
          <div className="animate-fade-in">
            {questionCategoryManifest ? (
              <ReadingForm
                key={questionCategoryManifest.version}
                categories={questionCategoryManifest.categories}
                onSubmit={handleQuestionSubmit}
                isLoading={false}
              />
            ) : questionCategoryError ? (
              <ErrorDisplay message={questionCategoryError} onRetry={handleQuestionCategoryRetry} />
            ) : (
              <div className="mx-auto max-w-3xl px-4 pt-12">
                <div className="glass-panel rounded-3xl px-6 py-12 text-center">
                  <p className="font-body text-sm text-[var(--color-text-secondary)]">
                    {isQuestionCategoryLoading ? '질문 카테고리 정보를 불러오는 중입니다.' : '질문 카테고리를 준비하고 있습니다.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2단계: 카드 선택 */}
        {appState === 'selecting' && (
          <div className="animate-fade-in">
            <CardSelectionScreen
              readingType={readingType}
              onConfirm={handleCardConfirm}
              onBack={handleBack}
            />
          </div>
        )}

        {/* 4단계: 결과 */}
        {appState === 'result' && result && (
          <ReadingResult
            cards={result.cards}
            interpretation={result.interpretation}
            question={question}
            onReset={handleReset}
          />
        )}

        {/* 에러 */}
        {appState === 'error' && (
          <ErrorDisplay message={error} onRetry={handleReset} />
        )}
      </div>

      {/* 3단계: 에너지 애니메이션 (전체화면 오버레이) */}
      <EnergyAnimation
        selectedCards={selectedCards}
        readingType={readingType}
        isVisible={appState === 'loading'}
      />

      {/* 푸터 */}
      <footer className="relative z-10 text-center pb-6 px-4">
        <p className="text-xs text-[var(--color-text-muted)] font-body max-w-md mx-auto">
          {t.footerText}
          {backendVersion ? ` · version ${backendVersion}` : ''}
        </p>
      </footer>
    </main>
  );
}
