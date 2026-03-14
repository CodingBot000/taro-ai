'use client';

import AuthHeaderActions from '@/components/auth/AuthHeaderActions';
export default function Header() {
  return (
    <header className="relative z-10 px-4 pt-5 pb-2">
      <div className="mx-auto max-w-6xl">
        <div className="relative flex min-h-[72px] items-start justify-center">
          <div className="text-center">
            <div className="inline-block mb-1">
              <div className="text-4xl mb-1" aria-hidden="true">✧</div>
            </div>
          </div>

          <div className="absolute right-0 top-0">
            <AuthHeaderActions />
          </div>
        </div>

        <div className="golden-divider mx-auto mt-2 max-w-xs" />
      </div>
    </header>
  );
}
