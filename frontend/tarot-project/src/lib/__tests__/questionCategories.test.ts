import { describe, expect, it } from 'vitest';
import {
  findFollowUpFlow,
  findMainCategory,
  getDefaultSubCategoryForMain,
  getPlaceholderForSelection,
  isValidCategorySelection,
  type MainCategoryConfig,
} from '../questionCategories';

const categories: MainCategoryConfig[] = [
  {
    id: 'love',
    label: '연애',
    description: '관계 흐름',
    metadata: { questionDomain: 'love' },
    defaultPlaceholder: '연애 흐름이 궁금해요.',
    subcategories: [
      {
        id: 'reunion',
        label: '재회',
        shortLabel: '재회',
        placeholder: '재회 가능성이 궁금해요.',
        metadata: {
          questionSubtypeOneCard: 'relationship_guidance',
          questionSubtypeThreeCard: 'relationship_reading',
        },
        followUpFlow: {
          flowId: 'love-reunion-v1',
          version: 'followup-v1',
          questions: [],
        },
      },
    ],
  },
];

describe('questionCategories helpers', () => {
  it('finds main category, subcategory, and follow-up flow', () => {
    expect(findMainCategory(categories, 'love')?.label).toBe('연애');
    expect(getDefaultSubCategoryForMain(categories, 'love')?.id).toBe('reunion');
    expect(findFollowUpFlow(categories, 'love', 'reunion')?.flowId).toBe('love-reunion-v1');
  });

  it('validates category pairs and resolves placeholders', () => {
    expect(isValidCategorySelection(categories, 'love', 'reunion')).toBe(true);
    expect(isValidCategorySelection(categories, 'love', 'unknown')).toBe(false);
    expect(getPlaceholderForSelection(categories, 'love', 'reunion')).toBe('재회 가능성이 궁금해요.');
  });
});
