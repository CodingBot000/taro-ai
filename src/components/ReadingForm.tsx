'use client';

import { useState } from 'react';
import { getTranslations, type Locale } from '@/lib/i18n';
import { validateQuestion } from '@/utils/validateQuestion';
import type { ReadingType } from '@/types';

interface ReadingFormProps {
  onSubmit: (question: string, readingType: ReadingType) => void;
  isLoading: boolean;
  locale?: Locale;
}

export default function ReadingForm({ onSubmit, isLoading, locale = 'ko' }: ReadingFormProps) {
  const t = getTranslations(locale);
  const [question, setQuestion] = useState('');
  const [readingType, setReadingType] = useState<ReadingType>('one-card');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const { isValid, errorMessage } = validateQuestion(question);
    if (!isValid) {
      setValidationError(errorMessage);
      return;
    }

    setValidationError('');
    onSubmit(question.trim(), readingType);
  };

  return (
    <form onSubmit={handleSubmit} className="relative z-10 max-w-lg mx-auto px-4">
      {/* 리딩 타입 선택 */}
      <div className="mb-6">
        <label className="block text-sm text-[var(--color-text-secondary)] mb-3 text-center font-body">
          {t.readingTypeLabel}
        </label>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setReadingType('one-card')}
            className={`glass-panel p-4 text-center transition-all duration-300 cursor-pointer ${
              readingType === 'one-card'
                ? 'border-[var(--color-accent-gold)] shadow-[0_0_30px_rgba(212,160,23,0.5)]'
                : 'hover:border-[var(--color-accent-purple)]'
            }`}
          >
            <div className="text-2xl mb-1">🂡</div>
            <div className="font-heading text-sm text-gold-400">{t.oneCard}</div>
            <div className="text-xs text-[var(--color-text-muted)] mt-1">{t.oneCardDesc}</div>
          </button>

          <button
            type="button"
            onClick={() => setReadingType('three-card')}
            className={`glass-panel p-4 text-center transition-all duration-300 cursor-pointer ${
              readingType === 'three-card'
                ? 'border-[var(--color-accent-gold)] shadow-[0_0_30px_rgba(212,160,23,0.5)]'
                : 'hover:border-[var(--color-accent-purple)]'
            }`}
          >
            <div className="text-2xl mb-1">🂡🂡🂡</div>
            <div className="font-heading text-sm text-gold-400">{t.threeCard}</div>
            <div className="text-xs text-[var(--color-text-muted)] mt-1">{t.threeCardDesc}</div>
          </button>
        </div>
      </div>

      {/* 질문 입력 */}
      <div className="mb-6">
        <textarea
          value={question}
          onChange={(e) => { setQuestion(e.target.value); setValidationError(''); }}
          placeholder={t.questionPlaceholder}
          className="mystic-textarea"
          rows={3}
          maxLength={500}
          disabled={isLoading}
        />
        <div className="flex justify-between text-xs mt-1">
          {validationError ? (
            <span className="text-red-400">{validationError}</span>
          ) : (
            <span />
          )}
          <span className="text-[var(--color-text-muted)]">{question.length}/500</span>
        </div>
      </div>

      {/* 제출 버튼 */}
      <div className="text-center">
        <button
          type="submit"
          disabled={!question.trim() || isLoading}
          className="glow-button font-body"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {t.submitting}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span>✦</span>
              {t.submitButton}
              <span>✦</span>
            </span>
          )}
        </button>
      </div>
    </form>
  );
}
