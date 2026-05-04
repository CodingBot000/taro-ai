'use client';

import { useState } from 'react';
import {
  findFollowUpFlow,
  findMainCategory,
  getDefaultSubCategoryForMain,
  getPlaceholderForSelection,
  type FollowUpQuestion,
  type MainCategoryConfig,
  type MainCategoryId,
  type SubCategoryId,
} from '@/lib/questionCategories';
import { validateQuestion } from '@/utils/validateQuestion';
import type { CategorySelection, IntakeContextPayload, ReadingType } from '@/types';

export interface FollowUpAnswerState {
  questionId: string;
  type: 'single_select' | 'free_text_short';
  value: string;
  label?: string;
}

interface UseReadingFormStateParams {
  categories: MainCategoryConfig[];
  fallbackQuestionPlaceholder: string;
  isLoading: boolean;
  onSubmit: (
    question: string,
    readingType: ReadingType,
    categorySelection: CategorySelection,
    intakeContext: IntakeContextPayload | null
  ) => void;
}

export function useReadingFormState({
  categories,
  fallbackQuestionPlaceholder,
  isLoading,
  onSubmit,
}: UseReadingFormStateParams) {
  const [question, setQuestion] = useState('');
  const [readingType, setReadingType] = useState<ReadingType>('one-card');
  const [mainCategoryId, setMainCategoryId] = useState<MainCategoryId | null>(null);
  const [subCategoryId, setSubCategoryId] = useState<SubCategoryId | null>(null);
  const [followUpAnswers, setFollowUpAnswers] = useState<Record<string, FollowUpAnswerState>>({});
  const [validationError, setValidationError] = useState('');

  const activeMainCategory = findMainCategory(categories, mainCategoryId);
  const activeFollowUpFlow = findFollowUpFlow(categories, mainCategoryId, subCategoryId);
  const activeSubCategory = activeMainCategory?.subcategories.find((item) => item.id === subCategoryId) ?? null;
  const placeholder = getPlaceholderForSelection(categories, mainCategoryId, subCategoryId) || fallbackQuestionPlaceholder;

  const handleMainCategorySelect = (nextMainCategoryId: MainCategoryId) => {
    const defaultSubCategory = getDefaultSubCategoryForMain(categories, nextMainCategoryId);
    setMainCategoryId(nextMainCategoryId);
    setSubCategoryId(defaultSubCategory?.id ?? null);
    setFollowUpAnswers({});
    setValidationError('');
  };

  const handleSubCategorySelect = (nextSubCategoryId: SubCategoryId) => {
    setSubCategoryId(nextSubCategoryId);
    setFollowUpAnswers({});
    setValidationError('');
  };

  const handleQuestionChange = (value: string) => {
    setQuestion(value);
    setValidationError('');
  };

  const handleSingleSelectAnswer = (followUpQuestion: FollowUpQuestion, optionId: string, optionLabel: string) => {
    setFollowUpAnswers((current) => ({
      ...current,
      [followUpQuestion.id]: {
        questionId: followUpQuestion.id,
        type: 'single_select',
        value: optionId,
        label: optionLabel,
      },
    }));
    setValidationError('');
  };

  const handleFreeTextAnswer = (followUpQuestion: FollowUpQuestion, value: string) => {
    setFollowUpAnswers((current) => ({
      ...current,
      [followUpQuestion.id]: {
        questionId: followUpQuestion.id,
        type: 'free_text_short',
        value,
      },
    }));
    setValidationError('');
  };

  const buildIntakeContext = (): IntakeContextPayload | null => {
    if (!activeFollowUpFlow) {
      return null;
    }

    const answers = activeFollowUpFlow.questions.flatMap((followUpQuestion) => {
      const answer = followUpAnswers[followUpQuestion.id];
      if (!answer || !answer.value.trim()) {
        return [];
      }

      return [
        {
          questionId: followUpQuestion.id,
          type: answer.type,
          value: answer.value.trim(),
          label: answer.label,
        },
      ];
    });

    if (answers.length === 0) {
      return null;
    }

    return {
      flowId: activeFollowUpFlow.flowId,
      flowVersion: activeFollowUpFlow.version,
      answers,
    };
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (isLoading) {
      return;
    }

    if (!mainCategoryId) {
      setValidationError('질문 카테고리를 선택해주세요.');
      return;
    }

    if (!subCategoryId) {
      setValidationError('세부 상황을 선택해주세요.');
      return;
    }

    if (activeFollowUpFlow) {
      const missingRequiredQuestion = activeFollowUpFlow.questions.find((followUpQuestion) => {
        if (!followUpQuestion.required) {
          return false;
        }

        const answer = followUpAnswers[followUpQuestion.id];
        return !answer || !answer.value.trim();
      });

      if (missingRequiredQuestion) {
        setValidationError(`심화 질문에 답해주세요: ${missingRequiredQuestion.prompt}`);
        return;
      }
    }

    const submittedQuestion = question.trim() || placeholder.trim();
    const { isValid, errorMessage } = validateQuestion(submittedQuestion);
    if (!isValid) {
      setValidationError(errorMessage);
      return;
    }

    setValidationError('');
    onSubmit(
      submittedQuestion,
      readingType,
      {
        mainCategoryId,
        subCategoryId,
      },
      buildIntakeContext()
    );
  };

  return {
    activeFollowUpFlow,
    activeMainCategory,
    activeSubCategory,
    followUpAnswers,
    handleFreeTextAnswer,
    handleMainCategorySelect,
    handleQuestionChange,
    handleSingleSelectAnswer,
    handleSubCategorySelect,
    handleSubmit,
    mainCategoryId,
    placeholder,
    question,
    readingType,
    setReadingType,
    subCategoryId,
    validationError,
  };
}
