'use client';

import { useEffect, useRef, useState } from 'react';
import {
  storeCallbackAccessToken,
  storeCallbackError,
} from '@/lib/auth';

export default function AuthCallbackPage() {
  const hasHandledCallback = useRef(false);
  const [message, setMessage] = useState('로그인 정보를 안전하게 확인하고 있어요.');

  useEffect(() => {
    if (hasHandledCallback.current) {
      return;
    }
    hasHandledCallback.current = true;

    const finalizeOAuthLogin = async () => {
      const { nextAccessToken, error } = readCallbackPayload();

      if (error) {
        setMessage('로그인을 완료하지 못했습니다. 다시 시도해주세요.');
        storeCallbackError(error);
        return;
      }

      if (!nextAccessToken) {
        setMessage('인증 토큰이 없습니다. 다시 로그인해주세요.');
        return;
      }

      setMessage('로그인을 마무리하고 있어요.');
      storeCallbackAccessToken(nextAccessToken);
      window.location.replace('/');
    };

    void finalizeOAuthLogin();
  }, []);

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4">
      <div className="glass-panel max-w-lg rounded-[28px] p-8 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(212,160,23,0.22)] bg-[radial-gradient(circle,rgba(212,160,23,0.18),rgba(15,10,30,0.2))] text-2xl text-gold-300">
          ✦
        </div>
        <h1 className="font-heading text-2xl text-gold-300">Google 인증 처리 중</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">{message}</p>
      </div>
    </main>
  );
}

function readCallbackPayload() {
  const hash = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash;
  const params = new URLSearchParams(hash);
  const hashAccessToken = params.get('accessToken');
  const hashError = params.get('error');

  if (hashAccessToken || hashError) {
    window.history.replaceState(null, '', '/auth/callback');
  }

  return {
    nextAccessToken: hashAccessToken,
    error: hashError,
  };
}
