'use client';

import { useState } from 'react';
import { getTranslations, type Locale } from '@/lib/i18n';
import {
  findMainCategory,
  getDefaultSubCategoryForMain,
  getPlaceholderForSelection,
  type MainCategoryConfig,
  type MainCategoryId,
  type SubCategoryId,
} from '@/lib/questionCategories';
import { validateQuestion } from '@/utils/validateQuestion';
import type { CategorySelection, ReadingType } from '@/types';

interface ReadingFormProps {
  categories: MainCategoryConfig[];
  onSubmit: (
    question: string,
    readingType: ReadingType,
    categorySelection: CategorySelection
  ) => void;
  isLoading: boolean;
  locale?: Locale;
}

export default function ReadingForm({ categories, onSubmit, isLoading, locale = 'ko' }: ReadingFormProps) {
  const t = getTranslations(locale);
  const [question, setQuestion] = useState('');
  const [readingType, setReadingType] = useState<ReadingType>('one-card');
  const [mainCategoryId, setMainCategoryId] = useState<MainCategoryId | null>(null);
  const [subCategoryId, setSubCategoryId] = useState<SubCategoryId | null>(null);
  const [validationError, setValidationError] = useState('');

  const activeMainCategory = findMainCategory(categories, mainCategoryId);
  const placeholder = getPlaceholderForSelection(categories, mainCategoryId, subCategoryId) || t.questionPlaceholder;

  const subCategoryHelpMessage =
    subCategoryId === 'unknown'
      ? t.unknownSubCategoryHint
      : t.subCategoryHint;

  const handleMainCategorySelect = (nextMainCategoryId: MainCategoryId) => {
    const defaultSubCategory = getDefaultSubCategoryForMain(categories, nextMainCategoryId);
    setMainCategoryId(nextMainCategoryId);
    setSubCategoryId(defaultSubCategory?.id ?? null);
    setValidationError('');
  };

  const handleSubCategorySelect = (nextSubCategoryId: SubCategoryId) => {
    setSubCategoryId(nextSubCategoryId);
    setValidationError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (!mainCategoryId) {
      setValidationError('질문 카테고리를 선택해주세요.');
      return;
    }

    if (!subCategoryId) {
      setValidationError('세부 상황을 선택해주세요.');
      return;
    }

    const submittedQuestion = question.trim() || placeholder.trim();
    const { isValid, errorMessage } = validateQuestion(submittedQuestion);
    if (!isValid) {
      setValidationError(errorMessage);
      return;
    }

    setValidationError('');
    onSubmit(submittedQuestion, readingType, {
      mainCategoryId,
      subCategoryId,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="relative z-10 max-w-3xl mx-auto px-4">
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

      <div className="mb-6">
        <label className="block text-sm text-[var(--color-text-secondary)] mb-3 text-center font-body">
          {t.mainCategoryLabel}
        </label>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {categories.map((category) => {
            const isActive = category.id === mainCategoryId;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => handleMainCategorySelect(category.id)}
                aria-pressed={isActive}
                className={`glass-panel rounded-2xl px-4 py-4 text-left transition-all duration-300 ${
                  isActive
                    ? 'border-[var(--color-accent-gold)] shadow-[0_0_30px_rgba(212,160,23,0.35)]'
                    : 'hover:border-[var(--color-accent-purple)]'
                }`}
              >
                <div className="font-heading text-base text-gold-400">{category.label}</div>
                <div className="mt-1 text-xs leading-relaxed text-[var(--color-text-muted)]">
                  {category.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm text-[var(--color-text-secondary)] mb-3 text-center font-body">
          {t.subCategoryLabel}
        </label>

        <div className="glass-panel rounded-3xl p-4">
          <div className="flex flex-wrap gap-2">
            {(activeMainCategory?.subcategories ?? []).map((subcategory) => {
              const isActive = subcategory.id === subCategoryId;

              return (
                <button
                  key={`${activeMainCategory?.id}-${subcategory.id}`}
                  type="button"
                  onClick={() => handleSubCategorySelect(subcategory.id)}
                  aria-pressed={isActive}
                  disabled={!activeMainCategory}
                  className={`rounded-full border px-4 py-2 text-sm transition-all duration-200 ${
                    isActive
                      ? 'border-[var(--color-accent-gold)] bg-[rgba(212,160,23,0.14)] text-gold-300'
                      : 'border-[rgba(255,255,255,0.12)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent-purple)]'
                  }`}
                >
                  {subcategory.shortLabel}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-center text-xs text-[var(--color-text-muted)]">
            {activeMainCategory ? subCategoryHelpMessage : t.subCategoryHint}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <label className="mb-3 block text-sm text-[var(--color-text-secondary)] text-center font-body">
          {t.questionInputLabel}
        </label>

        <p className="mb-3 text-center text-xs text-[var(--color-text-muted)]">
          {t.questionInputHelpText}
        </p>

        <textarea
          value={question}
          onChange={(e) => {
            setQuestion(e.target.value);
            setValidationError('');
          }}
          placeholder={placeholder}
          className="mystic-textarea"
          rows={4}
          maxLength={500}
          disabled={isLoading}
        />

        <div className="mt-2 flex justify-between text-xs">
          {validationError ? (
            <span className="text-red-400">{validationError}</span>
          ) : (
            <span className="text-[var(--color-text-muted)]">
              {activeMainCategory?.label
                ? `${activeMainCategory.label}${subCategoryId ? ' · ' : ''}${
                    activeMainCategory.subcategories.find((item) => item.id === subCategoryId)?.label ?? ''
                  }`
                : t.questionInputHelpText}
            </span>
          )}
          <span className="text-[var(--color-text-muted)]">{question.length}/500</span>
        </div>
      </div>

      <div className="text-center">
        <button
          type="submit"
          disabled={isLoading || !mainCategoryId || !subCategoryId}
          className="glow-button font-body"
        >
          <span className="flex items-center justify-center gap-2">
            <span>✦</span>
            {t.selectCardButton}
            <span>✦</span>
          </span>
        </button>
      </div>
    </form>
  );
}
