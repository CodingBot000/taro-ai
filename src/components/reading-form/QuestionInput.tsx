'use client';

interface QuestionInputProps {
  categorySummary: string;
  helpText: string;
  isLoading: boolean;
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  question: string;
  validationError: string;
}

export default function QuestionInput({
  categorySummary,
  helpText,
  isLoading,
  label,
  onChange,
  placeholder,
  question,
  validationError,
}: QuestionInputProps) {
  return (
    <div className="mb-6">
      <label className="mb-3 block text-sm text-[var(--color-text-secondary)] text-center font-body">
        {label}
      </label>

      <p className="mb-3 text-center text-xs text-[var(--color-text-muted)]">
        {helpText}
      </p>

      <textarea
        value={question}
        onChange={(event) => onChange(event.target.value)}
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
            {categorySummary || helpText}
          </span>
        )}
        <span className="text-[var(--color-text-muted)]">{question.length}/500</span>
      </div>
    </div>
  );
}
