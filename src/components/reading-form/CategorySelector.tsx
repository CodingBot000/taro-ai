'use client';

import type { MainCategoryConfig, MainCategoryId } from '@/lib/questionCategories';

interface CategorySelectorProps {
  categories: MainCategoryConfig[];
  label: string;
  onSelect: (mainCategoryId: MainCategoryId) => void;
  selectedMainCategoryId: MainCategoryId | null;
}

export default function CategorySelector({
  categories,
  label,
  onSelect,
  selectedMainCategoryId,
}: CategorySelectorProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm text-[var(--color-text-secondary)] mb-3 text-center font-body">
        {label}
      </label>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {categories.map((category) => {
          const isActive = category.id === selectedMainCategoryId;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelect(category.id)}
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
  );
}
