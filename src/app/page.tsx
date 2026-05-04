'use client';

import CardSelectionScreen from '@/components/CardSelectionScreen';
import EnergyAnimation from '@/components/EnergyAnimation';
import ErrorDisplay from '@/components/ErrorDisplay';
import Header from '@/components/Header';
import ReadingForm from '@/components/ReadingForm';
import ReadingResult from '@/components/ReadingResult';
import Starfield from '@/components/Starfield';
import { useBackendVersion } from '@/hooks/useBackendVersion';
import { useQuestionCategoryManifest } from '@/hooks/useQuestionCategoryManifest';
import { useTarotReadingFlow } from '@/hooks/useTarotReadingFlow';
import { getTranslations } from '@/lib/i18n';
import { useAuth } from '@/providers/AuthProvider';

export default function Home() {
  const t = getTranslations('ko');
  const auth = useAuth();
  const { backendVersion, setBackendVersion } = useBackendVersion(auth.accessToken);
  const {
    isQuestionCategoryLoading,
    questionCategoryError,
    questionCategoryManifest,
    retryQuestionCategoryManifest,
  } = useQuestionCategoryManifest();
  const readingFlow = useTarotReadingFlow({
    accessToken: auth.accessToken,
    onBackendVersion: setBackendVersion,
    questionCategoryManifest,
  });

  return (
    <main className="relative min-h-screen">
      <Starfield />
      <Header />

      <div className="relative z-10 pb-12">
        {readingFlow.appState === 'idle' && (
          <div className="animate-fade-in">
            {questionCategoryManifest ? (
              <ReadingForm
                key={questionCategoryManifest.version}
                categories={questionCategoryManifest.categories}
                onSubmit={readingFlow.handleQuestionSubmit}
                isLoading={false}
              />
            ) : questionCategoryError ? (
              <ErrorDisplay message={questionCategoryError} onRetry={retryQuestionCategoryManifest} />
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

        {readingFlow.appState === 'selecting' && (
          <div className="animate-fade-in">
            <CardSelectionScreen
              readingType={readingFlow.readingType}
              onConfirm={readingFlow.handleCardConfirm}
              onBack={readingFlow.handleBack}
            />
          </div>
        )}

        {readingFlow.appState === 'result' && readingFlow.result && (
          <ReadingResult
            cards={readingFlow.result.cards}
            interpretation={readingFlow.result.interpretation}
            question={readingFlow.question}
            onReset={readingFlow.handleReset}
          />
        )}

        {readingFlow.appState === 'error' && (
          <ErrorDisplay message={readingFlow.error} onRetry={readingFlow.handleReset} />
        )}
      </div>

      <EnergyAnimation
        selectedCards={readingFlow.selectedCards}
        readingType={readingFlow.readingType}
        isVisible={readingFlow.appState === 'loading'}
      />

      <footer className="relative z-10 text-center pb-6 px-4">
        <p className="text-xs text-[var(--color-text-muted)] font-body max-w-md mx-auto">
          {t.footerText}
          {backendVersion ? ` · version ${backendVersion}` : ''}
        </p>
      </footer>
    </main>
  );
}
