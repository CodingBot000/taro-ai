'use client';

import type { FollowUpAnswerState } from '@/hooks/useReadingFormState';
import type { FollowUpFlow, FollowUpQuestion } from '@/lib/questionCategories';

interface FollowUpQuestionsProps {
  followUpAnswers: Record<string, FollowUpAnswerState>;
  followUpFlow: FollowUpFlow | null;
  onFreeTextAnswer: (followUpQuestion: FollowUpQuestion, value: string) => void;
  onSingleSelectAnswer: (followUpQuestion: FollowUpQuestion, optionId: string, optionLabel: string) => void;
}

export default function FollowUpQuestions({
  followUpAnswers,
  followUpFlow,
  onFreeTextAnswer,
  onSingleSelectAnswer,
}: FollowUpQuestionsProps) {
  if (!followUpFlow) {
    return null;
  }

  return (
    <div className="mb-6">
      <label className="mb-3 block text-sm text-[var(--color-text-secondary)] text-center font-body">
        심화 질문
      </label>

      <div className="glass-panel rounded-3xl p-4 md:p-5">
        <div className="space-y-5">
          {followUpFlow.questions.map((followUpQuestion) => {
            const answer = followUpAnswers[followUpQuestion.id];

            return (
              <div key={followUpQuestion.id}>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {followUpQuestion.prompt}
                  {followUpQuestion.required ? ' *' : ''}
                </p>
                {followUpQuestion.helpText ? (
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">{followUpQuestion.helpText}</p>
                ) : null}

                {followUpQuestion.type === 'single_select' ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(followUpQuestion.options ?? []).map((option) => {
                      const isActive = answer?.value === option.id;

                      return (
                        <button
                          key={`${followUpQuestion.id}-${option.id}`}
                          type="button"
                          onClick={() => onSingleSelectAnswer(followUpQuestion, option.id, option.label)}
                          aria-pressed={isActive}
                          className={`rounded-full border px-4 py-2 text-sm transition-all duration-200 ${
                            isActive
                              ? 'border-[var(--color-accent-gold)] bg-[rgba(212,160,23,0.14)] text-gold-300'
                              : 'border-[rgba(255,255,255,0.12)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent-purple)]'
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={answer?.value ?? ''}
                    onChange={(event) => onFreeTextAnswer(followUpQuestion, event.target.value)}
                    maxLength={followUpQuestion.maxLength ?? 120}
                    className="mt-3 w-full rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.04)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition-colors duration-200 placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent-purple)]"
                    placeholder="짧게 적어주세요."
                  />
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-center text-xs text-[var(--color-text-muted)]">
          선택한 답변은 질문 맥락을 더 정확하게 파악하는 데만 사용됩니다.
        </p>
      </div>
    </div>
  );
}
