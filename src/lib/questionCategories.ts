export type MainCategoryId = string;
export type SubCategoryId = string;
export type FollowUpQuestionType = 'single_select' | 'free_text_short';

export interface FollowUpOption {
  id: string;
  label: string;
}

export interface FollowUpQuestion {
  id: string;
  prompt: string;
  type: FollowUpQuestionType;
  required?: boolean;
  options?: FollowUpOption[];
  helpText?: string;
  maxLength?: number;
}

export interface FollowUpFlow {
  flowId: string;
  version: string;
  questions: FollowUpQuestion[];
}

export interface SubCategoryConfig {
  id: SubCategoryId;
  label: string;
  shortLabel: string;
  placeholder: string;
  examples?: string[];
  metadata: {
    questionSubtypeOneCard: string;
    questionSubtypeThreeCard: string;
  };
  followUpFlow?: FollowUpFlow;
}

export interface MainCategoryConfig {
  id: MainCategoryId;
  label: string;
  description: string;
  metadata: {
    questionDomain: string;
  };
  defaultPlaceholder: string;
  subcategories: SubCategoryConfig[];
}

export interface QuestionCategoryManifest {
  version: string;
  categories: MainCategoryConfig[];
}

const DEFAULT_QUESTION_PLACEHOLDER = '궁금한 상황을 한두 문장으로 적어주세요.';

export function findMainCategory(categories: MainCategoryConfig[], mainCategoryId?: MainCategoryId | null) {
  if (!mainCategoryId) {
    return null;
  }

  return categories.find((category) => category.id === mainCategoryId) ?? null;
}

export function findSubCategory(
  categories: MainCategoryConfig[],
  mainCategoryId?: MainCategoryId | null,
  subCategoryId?: SubCategoryId | null
) {
  return findMainCategory(categories, mainCategoryId)?.subcategories.find((subcategory) => subcategory.id === subCategoryId) ?? null;
}

export function findFollowUpFlow(
  categories: MainCategoryConfig[],
  mainCategoryId?: MainCategoryId | null,
  subCategoryId?: SubCategoryId | null
) {
  return findSubCategory(categories, mainCategoryId, subCategoryId)?.followUpFlow ?? null;
}

export function getDefaultSubCategoryForMain(categories: MainCategoryConfig[], mainCategoryId: MainCategoryId) {
  return findMainCategory(categories, mainCategoryId)?.subcategories[0] ?? null;
}

export function isValidCategorySelection(
  categories: MainCategoryConfig[],
  mainCategoryId: MainCategoryId,
  subCategoryId: SubCategoryId
) {
  return Boolean(findSubCategory(categories, mainCategoryId, subCategoryId));
}

export function getPlaceholderForSelection(
  categories: MainCategoryConfig[],
  mainCategoryId?: MainCategoryId | null,
  subCategoryId?: SubCategoryId | null
) {
  if (!mainCategoryId) {
    return DEFAULT_QUESTION_PLACEHOLDER;
  }

  if (subCategoryId) {
    const subCategory = findSubCategory(categories, mainCategoryId, subCategoryId);
    if (subCategory) {
      return subCategory.placeholder;
    }
  }

  return findMainCategory(categories, mainCategoryId)?.defaultPlaceholder ?? DEFAULT_QUESTION_PLACEHOLDER;
}
