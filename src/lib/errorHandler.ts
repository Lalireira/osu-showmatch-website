import { NextResponse } from 'next/server';
import { ERROR_MESSAGES } from './config';

// エラーの種類を定義
export type AppError = {
  code: string;
  message: string;
  status: number;
};

// エラーレスポンスを生成する関数
export function createErrorResponse(error: AppError): NextResponse {
  return NextResponse.json(
    { error: error.message },
    { status: error.status }
  );
}

// バリデーションエラーを生成する関数
export function createValidationError(field: string, message: string): AppError {
  return {
    code: 'VALIDATION_ERROR',
    message: `${field}: ${message}`,
    status: 400,
  };
}

// 認証エラーを生成する関数
export function createAuthError(message: string = ERROR_MESSAGES.AUTH.UNAUTHORIZED): AppError {
  return {
    code: 'AUTH_ERROR',
    message,
    status: 401,
  };
}

// リソース未検出エラーを生成する関数
export function createNotFoundError(resource: string): AppError {
  return {
    code: 'NOT_FOUND',
    message: `${resource}が見つかりません`,
    status: 404,
  };
}

// サーバーエラーを生成する関数
export function createServerError(message: string = 'Internal Server Error'): AppError {
  return {
    code: 'SERVER_ERROR',
    message,
    status: 500,
  };
}

// エラーハンドリングのラッパー関数
export function withErrorHandling(handler: (req: Request) => Promise<Response>) {
  return async (req: Request) => {
    try {
      return await handler(req);
    } catch (error) {
      console.error('Error in handler:', error);

      if (error instanceof Error) {
        return createErrorResponse(createServerError(error.message));
      }

      return createErrorResponse(createServerError());
    }
  };
}
