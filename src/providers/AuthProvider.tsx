'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  buildGoogleLoginUrl,
  clearStoredCallbackAccessToken,
  clearStoredCallbackError,
  readStoredCallbackAccessToken,
  readStoredCallbackError,
  requestCurrentUser,
  requestLogout,
  requestRefresh,
  requestWithAccessToken,
} from '@/lib/auth';
import type { AuthStatus, AuthUser } from '@/types';

interface AuthContextValue {
  accessToken: string | null;
  errorMessage: string;
  isAuthenticated: boolean;
  status: AuthStatus;
  user: AuthUser | null;
  clearError: () => void;
  completeOAuthLogin: (accessToken: string) => Promise<void>;
  fetchWithAuth: (path: string, init?: RequestInit) => Promise<Response>;
  loginWithGoogle: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);
  const accessTokenRef = useRef<string | null>(null);

  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname === '/auth/callback') {
      return;
    }

    let active = true;

    const initializeSession = async () => {
      if (typeof window !== 'undefined') {
        const callbackError = readStoredCallbackError();
        if (callbackError) {
          clearStoredCallbackError();
          clearAuthState();
          setStatus('unauthenticated');
          setErrorMessage('로그인을 완료하지 못했습니다. 다시 시도해주세요.');
          return;
        }

        const callbackAccessToken = readStoredCallbackAccessToken();
        if (callbackAccessToken) {
          try {
            await hydrateSession(callbackAccessToken);
            clearStoredCallbackAccessToken();
            return;
          } catch (error) {
            clearStoredCallbackAccessToken();
            clearAuthState();
            setStatus('unauthenticated');
            if (error instanceof Error) {
              setErrorMessage(error.message);
            }
            return;
          }
        }
      }

      const token = await refreshSession(true);
      if (!active || token) {
        return;
      }
      clearAuthState();
      setStatus('unauthenticated');
    };

    void initializeSession();

    return () => {
      active = false;
    };
  }, []);

  const setAuthenticatedState = (nextAccessToken: string, nextUser: AuthUser) => {
    accessTokenRef.current = nextAccessToken;
    setAccessToken(nextAccessToken);
    setUser(nextUser);
    setStatus('authenticated');
    setErrorMessage('');
  };

  const clearAuthState = () => {
    accessTokenRef.current = null;
    setAccessToken(null);
    setUser(null);
  };

  const hydrateSession = async (nextAccessToken: string) => {
    const currentUser = await requestCurrentUser(nextAccessToken);
    setAuthenticatedState(nextAccessToken, currentUser);
  };

  const refreshSession = async (silent: boolean) => {
    try {
      const refreshed = await requestRefresh();
      await hydrateSession(refreshed.accessToken);
      return refreshed.accessToken;
    } catch (error) {
      clearAuthState();
      setStatus('unauthenticated');
      if (!silent && error instanceof Error) {
        setErrorMessage(error.message);
      }
      return null;
    }
  };

  const completeOAuthLogin = async (nextAccessToken: string) => {
    setStatus('loading');
    try {
      await hydrateSession(nextAccessToken);
    } catch (error) {
      clearAuthState();
      setStatus('unauthenticated');
      setErrorMessage(
        error instanceof Error ? error.message : '로그인 정보를 불러오지 못했습니다.'
      );
      throw error;
    }
  };

  const fetchWithAuth = async (path: string, init: RequestInit = {}) => {
    let token = accessTokenRef.current;

    if (!token) {
      token = await refreshSession(true);
    }

    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    let response = await requestWithAccessToken(path, token, init);
    if (response.status !== 401) {
      return response;
    }

    const refreshedToken = await refreshSession(true);
    if (!refreshedToken) {
      throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }

    response = await requestWithAccessToken(path, refreshedToken, init);
    return response;
  };

  const loginWithGoogle = () => {
    if (typeof window !== 'undefined') {
      window.location.assign(buildGoogleLoginUrl(window.location.origin));
    }
  };

  const logout = async () => {
    try {
      await requestLogout();
    } finally {
      clearAuthState();
      setStatus('unauthenticated');
      setErrorMessage('');
    }
  };

  const clearError = () => {
    setErrorMessage('');
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        clearError,
        completeOAuthLogin,
        errorMessage,
        fetchWithAuth,
        isAuthenticated: status === 'authenticated',
        loginWithGoogle,
        logout,
        status,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
