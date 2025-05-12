import { NextRequest, NextResponse } from 'next/server';
import { ERROR_MESSAGES } from '@/lib/config';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    // 環境変数の生の値を確認
    console.log('Raw environment variables:', {
      ADMIN_USERNAME: process.env.ADMIN_USERNAME,
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
      // 環境変数の生の値を文字コードで確認
      ADMIN_USERNAME_CHARS: process.env.ADMIN_USERNAME?.split('').map(c => c.charCodeAt(0)),
      ADMIN_PASSWORD_CHARS: process.env.ADMIN_PASSWORD?.split('').map(c => c.charCodeAt(0)),
    });

    // 環境変数から認証情報を取得（より安全な方法）
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

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

    // パスワードの比較を改善
    // 1. 両方のパスワードを正規化（trimと改行文字の削除）
    const normalizedProvidedPassword = password.trim().replace(/[\r\n]+/g, '');
    const normalizedEnvPassword = ADMIN_PASSWORD.trim().replace(/[\r\n]+/g, '');

    // 2. 文字列としての比較
    const passwordMatch = normalizedProvidedPassword === normalizedEnvPassword;

    // デバッグ用の文字コード比較（問題診断用）
    const usernameChars = [...username].map(c => c.charCodeAt(0));
    const envUsernameChars = [...ADMIN_USERNAME].map(c => c.charCodeAt(0));
    const passwordChars = [...normalizedProvidedPassword].map(c => c.charCodeAt(0));
    const envPasswordChars = [...normalizedEnvPassword].map(c => c.charCodeAt(0));

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
          provided: normalizedProvidedPassword.length,
          env: normalizedEnvPassword.length,
          match: normalizedProvidedPassword.length === normalizedEnvPassword.length
        },
        characters: Array.from({ length: Math.max(normalizedProvidedPassword.length, normalizedEnvPassword.length) }, (_, i) => ({
          index: i,
          provided: normalizedProvidedPassword[i] ? normalizedProvidedPassword[i].charCodeAt(0) : null,
          env: normalizedEnvPassword[i] ? normalizedEnvPassword[i].charCodeAt(0) : null,
          match: normalizedProvidedPassword[i] === normalizedEnvPassword[i]
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
