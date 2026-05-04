'use client';

import type { ReadingType } from '@/types';

interface ReadingTypeSelectorProps {
  label: string;
  oneCardDescription: string;
  oneCardLabel: string;
  onChange: (readingType: ReadingType) => void;
  readingType: ReadingType;
  threeCardDescription: string;
  threeCardLabel: string;
}

export default function ReadingTypeSelector({
  label,
  oneCardDescription,
  oneCardLabel,
  onChange,
  readingType,
  threeCardDescription,
  threeCardLabel,
}: ReadingTypeSelectorProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm text-[var(--color-text-secondary)] mb-3 text-center font-body">
        {label}
      </label>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange('one-card')}
          className={`glass-panel p-4 text-center transition-all duration-300 cursor-pointer ${
            readingType === 'one-card'
              ? 'border-[var(--color-accent-gold)] shadow-[0_0_30px_rgba(212,160,23,0.5)]'
              : 'hover:border-[var(--color-accent-purple)]'
          }`}
        >
          <div className="text-2xl mb-1">🂡</div>
          <div className="font-heading text-sm text-gold-400">{oneCardLabel}</div>
          <div className="text-xs text-[var(--color-text-muted)] mt-1">{oneCardDescription}</div>
        </button>

        <button
          type="button"
          onClick={() => onChange('three-card')}
          className={`glass-panel p-4 text-center transition-all duration-300 cursor-pointer ${
            readingType === 'three-card'
              ? 'border-[var(--color-accent-gold)] shadow-[0_0_30px_rgba(212,160,23,0.5)]'
              : 'hover:border-[var(--color-accent-purple)]'
          }`}
        >
          <div className="text-2xl mb-1">🂡🂡🂡</div>
          <div className="font-heading text-sm text-gold-400">{threeCardLabel}</div>
          <div className="text-xs text-[var(--color-text-muted)] mt-1">{threeCardDescription}</div>
        </button>
      </div>
    </div>
  );
}
