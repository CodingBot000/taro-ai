'use client';

import { useEffect, useState } from 'react';
import type { QuestionCategoryManifest } from '@/lib/questionCategories';
import {
  fetchQuestionCategoryManifest,
  readCachedQuestionCategoryManifest,
  writeCachedQuestionCategoryManifest,
} from '@/lib/questionCategoryManifest';

export function useQuestionCategoryManifest() {
  const [questionCategoryManifest, setQuestionCategoryManifest] = useState<QuestionCategoryManifest | null>(null);
  const [questionCategoryError, setQuestionCategoryError] = useState('');
  const [isQuestionCategoryLoading, setIsQuestionCategoryLoading] = useState(true);
  const [questionCategoryReloadKey, setQuestionCategoryReloadKey] = useState(0);

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

  const retryQuestionCategoryManifest = () => {
    setQuestionCategoryError('');
    setIsQuestionCategoryLoading(true);
    setQuestionCategoryReloadKey((current) => current + 1);
  };

  return {
    isQuestionCategoryLoading,
    questionCategoryError,
    questionCategoryManifest,
    retryQuestionCategoryManifest,
  };
}
