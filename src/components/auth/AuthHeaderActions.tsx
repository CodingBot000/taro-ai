'use client';

import { useState } from 'react';
import AuthEntryButtons from '@/components/auth/AuthEntryButtons';
import { useAuth } from '@/providers/AuthProvider';

export default function AuthHeaderActions() {
  const { logout, status, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (status === 'loading') {
    return (
      <div className="rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(15,10,30,0.72)] px-4 py-2 text-xs text-[var(--color-text-secondary)]">
        세션 확인 중
      </div>
    );
  }

  if (!user) {
    return <AuthEntryButtons />;
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
  };

  return (
    <div className="flex items-center gap-3 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(15,10,30,0.78)] px-3 py-2 shadow-[0_12px_32px_rgba(5,2,16,0.28)] backdrop-blur-xl">
      <div className="flex items-center gap-3">
        {user.profileImageUrl ? (
          <img
            src={user.profileImageUrl}
            alt={`${user.name} 프로필`}
            className="h-9 w-9 rounded-full border border-[rgba(212,160,23,0.35)] object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(212,160,23,0.35)] bg-[rgba(212,160,23,0.14)] text-sm font-semibold text-gold-300">
            {user.name.slice(0, 1)}
          </div>
        )}
        <div className="hidden text-left sm:block">
          <div className="text-sm font-medium text-[var(--color-text-primary)]">{user.name}</div>
          <div className="text-[11px] text-[var(--color-text-muted)]">
            {user.email || 'Google 계정'}
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="rounded-full border border-[rgba(255,255,255,0.12)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-accent-purple)] hover:text-[var(--color-text-primary)]"
      >
        {isLoggingOut ? '정리 중...' : '로그아웃'}
      </button>
    </div>
  );
}
