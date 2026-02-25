'use client';

import { useState } from 'react';
import Starfield from '@/components/Starfield';
import Header from '@/components/Header';
import ReadingForm from '@/components/ReadingForm';
import LoadingOverlay from '@/components/LoadingOverlay';
import ReadingResult from '@/components/ReadingResult';
import ErrorDisplay from '@/components/ErrorDisplay';
import type { ReadingType, TarotResponse, TarotError } from '@/types';

type AppState = 'idle' | 'loading' | 'result' | 'error';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [result, setResult] = useState<TarotResponse | null>(null);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (question: string, readingType: ReadingType) => {
    setAppState('loading');
    setError('');

    try {
      const response = await fetch('/api/tarot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, readingType }),
      });

      if (!response.ok) {
        const errorData: TarotError = await response.json().catch(() => ({
          error: '서버 오류가 발생했습니다.',
        }));
        throw new Error(errorData.error);
      }

      const data: TarotResponse = await response.json();
      setResult(data);
      setAppState('result');
    } catch (err: any) {
      console.error('Reading error:', err);
      setError(err.message || '예상치 못한 오류가 발생했습니다.');
      setAppState('error');
    }
  };

  const handleReset = () => {
    setAppState('idle');
    setResult(null);
    setError('');
  };

  return (
    <main className="relative min-h-screen">
      {/* 배경 */}
      <Starfield />

      {/* 헤더 (항상 표시) */}
      <Header />

      {/* 메인 콘텐츠 영역 */}
      <div className="relative z-10 pb-12">
        {/* 입력 폼 */}
        {appState === 'idle' && (
          <div className="animate-fade-in">
            <ReadingForm onSubmit={handleSubmit} isLoading={false} />
          </div>
        )}

        {/* 로딩 상태 */}
        {appState === 'loading' && (
          <div className="animate-fade-in">
            <ReadingForm onSubmit={handleSubmit} isLoading={true} />
          </div>
        )}

        {/* 결과 */}
        {appState === 'result' && result && (
          <ReadingResult
            cards={result.cards}
            cardData={result.cardData}
            interpretation={result.interpretation}
            onReset={handleReset}
          />
        )}

        {/* 에러 */}
        {appState === 'error' && (
          <ErrorDisplay message={error} onRetry={handleReset} />
        )}
      </div>

      {/* 로딩 오버레이 (전체화면) */}
      <LoadingOverlay isVisible={appState === 'loading'} />

      {/* 푸터 */}
      <footer className="relative z-10 text-center pb-6 px-4">
        <p className="text-xs text-[var(--color-text-muted)] font-body max-w-md mx-auto">
          본 타로는 AI 기반 엔터테인먼트 서비스입니다.
          중요한 결정에 대해서는 전문가와 상담하세요.
        </p>
      </footer>
    </main>
  );
}
