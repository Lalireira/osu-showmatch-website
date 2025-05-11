import { NextRequest, NextResponse } from 'next/server';
import { ERROR_MESSAGES } from '@/lib/config';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    // 環境変数から認証情報を取得（より安全な方法）
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME?.trim() || '';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD?.trim() || '';

    // デバッグログ（より詳細な情報）
    console.log('Environment variables:', {
      ADMIN_USERNAME: ADMIN_USERNAME ? '***' : 'undefined',
      ADMIN_PASSWORD: ADMIN_PASSWORD ? '***' : 'undefined',
      ADMIN_USERNAME_LENGTH: ADMIN_USERNAME?.length,
      ADMIN_PASSWORD_LENGTH: ADMIN_PASSWORD?.length,
      ADMIN_PASSWORD_RAW: ADMIN_PASSWORD,
      // 環境変数の生の値を確認
      ENV_KEYS: Object.keys(process.env).filter(key => key.startsWith('ADMIN_')),
      ENV_VALUES: Object.entries(process.env)
        .filter(([key]) => key.startsWith('ADMIN_'))
        .map(([key, value]) => ({ key, length: value?.length }))
    });

    console.log('Login attempt:', {
      providedUsername: username,
      providedPassword: password ? '***' : undefined,
      providedUsernameLength: username?.length,
      providedPasswordLength: password?.length,
      providedPasswordRaw: password,
    });

    // 認証情報の検証
    if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
      console.error('Environment variables not set:', {
        hasUsername: !!ADMIN_USERNAME,
        hasPassword: !!ADMIN_PASSWORD,
        envKeys: Object.keys(process.env).filter(key => key.startsWith('ADMIN_'))
      });
      return NextResponse.json(
        { error: '認証設定が正しくありません' },
        { status: 500 }
      );
    }

    // 文字列の比較を詳細に確認
    const usernameMatch = username === ADMIN_USERNAME;
    const passwordMatch = password === ADMIN_PASSWORD;

    // 文字コードの比較
    const usernameChars = [...username].map(c => c.charCodeAt(0));
    const envUsernameChars = [...ADMIN_USERNAME].map(c => c.charCodeAt(0));
    const passwordChars = [...password].map(c => c.charCodeAt(0));
    const envPasswordChars = [...ADMIN_PASSWORD].map(c => c.charCodeAt(0));

    console.log('Authentication details:', {
      usernameMatch,
      passwordMatch,
      usernameChars,
      envUsernameChars,
      passwordChars,
      envPasswordChars,
      // 文字列の比較結果を詳細に表示
      passwordComparison: {
        length: {
          provided: password.length,
          env: ADMIN_PASSWORD.length,
          match: password.length === ADMIN_PASSWORD.length
        },
        characters: Array.from({ length: Math.max(password.length, ADMIN_PASSWORD.length) }, (_, i) => ({
          index: i,
          provided: password[i] ? password[i].charCodeAt(0) : null,
          env: ADMIN_PASSWORD[i] ? ADMIN_PASSWORD[i].charCodeAt(0) : null,
          match: password[i] === ADMIN_PASSWORD[i]
        }))
      }
    });

    if (!usernameMatch || !passwordMatch) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS },
        { status: 401 }
      );
    }

    // 認証成功時のレスポンス
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS },
      { status: 500 }
    );
  }
} 