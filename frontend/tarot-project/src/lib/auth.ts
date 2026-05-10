import { buildApiUrl } from '@/lib/api';
import type { AccessTokenResponse, AuthUser, TarotError } from '@/types';

const DEFAULT_AUTH_ERROR_MESSAGE = '인증 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
const CALLBACK_TOKEN_STORAGE_KEY = 'oauth_callback_access_token';
const CALLBACK_ERROR_STORAGE_KEY = 'oauth_callback_error';

export function buildGoogleLoginUrl(returnToOrigin?: string) {
  const loginUrl = new URL(buildApiUrl('/api/auth/login/google'));
  if (returnToOrigin) {
    loginUrl.searchParams.set('returnTo', returnToOrigin);
  }
  return loginUrl.toString();
}

export async function requestCurrentUser(accessToken: string): Promise<AuthUser> {
  const response = await fetch(buildApiUrl('/api/auth/me'), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: 'include',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return response.json() as Promise<AuthUser>;
}

export async function requestRefresh(): Promise<AccessTokenResponse> {
  const response = await fetch(buildApiUrl('/api/auth/refresh'), {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return response.json() as Promise<AccessTokenResponse>;
}

export async function requestLogout() {
  const response = await fetch(buildApiUrl('/api/auth/logout'), {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store',
  });

  if (!response.ok && response.status !== 204) {
    throw new Error(await readApiError(response));
  }
}

export async function requestWithAccessToken(path: string, accessToken: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${accessToken}`);

  return fetch(buildApiUrl(path), {
    ...init,
    headers,
    credentials: 'include',
    cache: 'no-store',
  });
}

export function storeCallbackAccessToken(accessToken: string) {
  window.sessionStorage.setItem(CALLBACK_TOKEN_STORAGE_KEY, accessToken);
}

export function readStoredCallbackAccessToken() {
  return window.sessionStorage.getItem(CALLBACK_TOKEN_STORAGE_KEY);
}

export function clearStoredCallbackAccessToken() {
  window.sessionStorage.removeItem(CALLBACK_TOKEN_STORAGE_KEY);
}

export function storeCallbackError(error: string) {
  window.sessionStorage.setItem(CALLBACK_ERROR_STORAGE_KEY, error);
}

export function readStoredCallbackError() {
  return window.sessionStorage.getItem(CALLBACK_ERROR_STORAGE_KEY);
}

export function clearStoredCallbackError() {
  window.sessionStorage.removeItem(CALLBACK_ERROR_STORAGE_KEY);
}

async function readApiError(response: Response) {
  const data = (await response.json().catch(() => null)) as TarotError | null;
  return data?.error || DEFAULT_AUTH_ERROR_MESSAGE;
}
