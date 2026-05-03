'use client';

import CategorySelector from '@/components/reading-form/CategorySelector';
import FollowUpQuestions from '@/components/reading-form/FollowUpQuestions';
import QuestionInput from '@/components/reading-form/QuestionInput';
import ReadingFormSubmitButton from '@/components/reading-form/ReadingFormSubmitButton';
import ReadingTypeSelector from '@/components/reading-form/ReadingTypeSelector';
import SubCategorySelector from '@/components/reading-form/SubCategorySelector';
import { useReadingFormState } from '@/hooks/useReadingFormState';
import { getTranslations, type Locale } from '@/lib/i18n';
import type { MainCategoryConfig } from '@/lib/questionCategories';
import type { CategorySelection, IntakeContextPayload, ReadingType } from '@/types';

interface ReadingFormProps {
  categories: MainCategoryConfig[];
  onSubmit: (
    question: string,
    readingType: ReadingType,
    categorySelection: CategorySelection,
    intakeContext: IntakeContextPayload | null
  ) => void;
  isLoading: boolean;
  locale?: Locale;
}

export default function ReadingForm({ categories, onSubmit, isLoading, locale = 'ko' }: ReadingFormProps) {
  const t = getTranslations(locale);
  const form = useReadingFormState({
    categories,
    fallbackQuestionPlaceholder: t.questionPlaceholder,
    isLoading,
    onSubmit,
  });

  const subCategoryHelpMessage =
    form.subCategoryId === 'unknown'
      ? t.unknownSubCategoryHint
      : t.subCategoryHint;
  const categorySummary = form.activeMainCategory?.label
    ? `${form.activeMainCategory.label}${form.subCategoryId ? ' · ' : ''}${form.activeSubCategory?.label ?? ''}`
    : '';

  return (
    <form onSubmit={form.handleSubmit} className="relative z-10 max-w-3xl mx-auto px-4">
      <ReadingTypeSelector
        label={t.readingTypeLabel}
        oneCardDescription={t.oneCardDesc}
        oneCardLabel={t.oneCard}
        onChange={form.setReadingType}
        readingType={form.readingType}
        threeCardDescription={t.threeCardDesc}
        threeCardLabel={t.threeCard}
      />

      <CategorySelector
        categories={categories}
        label={t.mainCategoryLabel}
        onSelect={form.handleMainCategorySelect}
        selectedMainCategoryId={form.mainCategoryId}
      />

      <SubCategorySelector
        activeMainCategory={form.activeMainCategory}
        fallbackHelpText={t.subCategoryHint}
        helpMessage={subCategoryHelpMessage}
        label={t.subCategoryLabel}
        onSelect={form.handleSubCategorySelect}
        selectedSubCategoryId={form.subCategoryId}
      />

      <QuestionInput
        categorySummary={categorySummary}
        helpText={t.questionInputHelpText}
        isLoading={isLoading}
        label={t.questionInputLabel}
        onChange={form.handleQuestionChange}
        placeholder={form.placeholder}
        question={form.question}
        validationError={form.validationError}
      />

      <FollowUpQuestions
        followUpAnswers={form.followUpAnswers}
        followUpFlow={form.activeFollowUpFlow}
        onFreeTextAnswer={form.handleFreeTextAnswer}
        onSingleSelectAnswer={form.handleSingleSelectAnswer}
      />

      <ReadingFormSubmitButton
        disabled={isLoading || !form.mainCategoryId || !form.subCategoryId}
        label={t.selectCardButton}
      />
    </form>
  );
}
