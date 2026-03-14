'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';

interface AuthEntryButtonsProps {
  align?: 'left' | 'center' | 'right';
  fullWidth?: boolean;
}

export default function AuthEntryButtons({
  align = 'right',
  fullWidth = false,
}: AuthEntryButtonsProps) {
  const { loginWithGoogle, status } = useAuth();
  const [isPending, setIsPending] = useState(false);

  const justifyClass =
    align === 'left' ? 'justify-start' : align === 'center' ? 'justify-center' : 'justify-end';

  const handleStart = () => {
    setIsPending(true);
    loginWithGoogle();
  };

  return (
    <div className={`flex ${justifyClass} ${fullWidth ? 'w-full' : ''}`}>
      <button
        type="button"
        onClick={handleStart}
        disabled={status === 'loading'}
        className={`rounded-full border border-[rgba(212,160,23,0.38)] bg-[linear-gradient(135deg,rgba(212,160,23,0.28),rgba(139,61,255,0.32))] px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(139,61,255,0.22)] ${fullWidth ? 'w-full' : ''}`}
      >
        {isPending ? '이동 중...' : 'Google로 시작하기'}
      </button>
    </div>
  );
}
