import { buildApiUrl } from '@/lib/api';
import type { QuestionCategoryManifest } from '@/lib/questionCategories';

const QUESTION_CATEGORY_MANIFEST_STORAGE_KEY = 'question-category-manifest';

export async function fetchQuestionCategoryManifest(): Promise<QuestionCategoryManifest> {
  const response = await fetch(buildApiUrl('/api/question-categories'), {
    credentials: 'include',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('질문 카테고리 정보를 불러오지 못했습니다.');
  }

  const manifest = (await response.json()) as QuestionCategoryManifest;
  if (!isQuestionCategoryManifest(manifest)) {
    throw new Error('질문 카테고리 응답 형식이 올바르지 않습니다.');
  }

  return manifest;
}

export function readCachedQuestionCategoryManifest(): QuestionCategoryManifest | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(QUESTION_CATEGORY_MANIFEST_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return isQuestionCategoryManifest(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeCachedQuestionCategoryManifest(manifest: QuestionCategoryManifest) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(QUESTION_CATEGORY_MANIFEST_STORAGE_KEY, JSON.stringify(manifest));
}

function isQuestionCategoryManifest(value: unknown): value is QuestionCategoryManifest {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<QuestionCategoryManifest>;
  return typeof candidate.version === 'string' && Array.isArray(candidate.categories);
}
