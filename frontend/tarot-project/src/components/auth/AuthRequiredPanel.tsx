'use client';

import AuthEntryButtons from '@/components/auth/AuthEntryButtons';

export default function AuthRequiredPanel() {
  return (
    <section className="mx-auto mt-10 max-w-2xl px-4">
      <div className="glass-panel overflow-hidden rounded-[28px] border border-[rgba(212,160,23,0.14)] p-8 text-center shadow-[0_20px_80px_rgba(5,2,16,0.28)]">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(212,160,23,0.22)] bg-[radial-gradient(circle,rgba(212,160,23,0.18),rgba(15,10,30,0.2))] text-2xl text-gold-300">
          ✦
        </div>
        <h2 className="font-heading text-2xl text-gold-300">Google 계정으로 시작하세요</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--color-text-secondary)]">
          이미 가입한 사용자는 바로 로그인되고, 처음 사용하는 계정은 자동으로 가입 후 로그인됩니다.
          로그인 후 타로 리딩 생성과 세션 유지 기능이 활성화됩니다.
        </p>
        <div className="mt-6">
          <AuthEntryButtons align="center" fullWidth />
        </div>
      </div>
    </section>
  );
}
