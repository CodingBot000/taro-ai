'use client';

interface ReadingFormSubmitButtonProps {
  disabled: boolean;
  label: string;
}

export default function ReadingFormSubmitButton({ disabled, label }: ReadingFormSubmitButtonProps) {
  return (
    <div className="text-center">
      <button
        type="submit"
        disabled={disabled}
        className="glow-button font-body"
      >
        <span className="flex items-center justify-center gap-2">
          <span>✦</span>
          {label}
          <span>✦</span>
        </span>
      </button>
    </div>
  );
}
