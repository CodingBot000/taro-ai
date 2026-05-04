'use client';

import type { MainCategoryConfig, SubCategoryId } from '@/lib/questionCategories';

interface SubCategorySelectorProps {
  activeMainCategory: MainCategoryConfig | null;
  fallbackHelpText: string;
  helpMessage: string;
  label: string;
  onSelect: (subCategoryId: SubCategoryId) => void;
  selectedSubCategoryId: SubCategoryId | null;
}

export default function SubCategorySelector({
  activeMainCategory,
  fallbackHelpText,
  helpMessage,
  label,
  onSelect,
  selectedSubCategoryId,
}: SubCategorySelectorProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm text-[var(--color-text-secondary)] mb-3 text-center font-body">
        {label}
      </label>

      <div className="glass-panel rounded-3xl p-4">
        <div className="flex flex-wrap gap-2">
          {(activeMainCategory?.subcategories ?? []).map((subcategory) => {
            const isActive = subcategory.id === selectedSubCategoryId;

            return (
              <button
                key={`${activeMainCategory?.id}-${subcategory.id}`}
                type="button"
                onClick={() => onSelect(subcategory.id)}
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
          {activeMainCategory ? helpMessage : fallbackHelpText}
        </p>
      </div>
    </div>
  );
}
