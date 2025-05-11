import { useState, useEffect } from 'react';
import { ERROR_MESSAGES } from '../config';

// 認証状態の型定義
export type AuthState = {
  isAuthenticated: boolean;
  error: string | null;
};

// ローカルストレージのキー
const AUTH_STATE_KEY = 'admin_auth_state';

// クライアントサイドでの認証状態管理
export function useAdminAuth() {
  const [authState, setAuthState] = useState<AuthState>(() => {
    // 初期状態をローカルストレージから復元
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem(AUTH_STATE_KEY);
      if (savedState) {
        try {
          return JSON.parse(savedState);
        } catch (e) {
          console.error('Failed to parse saved auth state:', e);
        }
      }
    }
    return {
      isAuthenticated: false,
      error: null,
    };
  });

  // 認証状態が変更されたらローカルストレージに保存
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_STATE_KEY, JSON.stringify(authState));
    }
  }, [authState]);

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        setAuthState({
          isAuthenticated: true,
          error: null,
        });
        return true;
      }

      const data = await response.json();
      setAuthState({
        isAuthenticated: false,
        error: data.error || ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS,
      });
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      setAuthState({
        isAuthenticated: false,
        error: ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS,
      });
      return false;
    }
  };

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      error: null,
    });
    // ローカルストレージから認証状態を削除
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_STATE_KEY);
    }
  };

  return {
    ...authState,
    login,
    logout,
  };
} 