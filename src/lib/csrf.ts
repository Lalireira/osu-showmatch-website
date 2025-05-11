import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

const CSRF_TOKEN_COOKIE = 'csrf_token';
const CSRF_TOKEN_HEADER = 'x-csrf-token';

export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}

export function withCSRF(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: { cookieName?: string; headerName?: string } = {}
) {
  const cookieName = options.cookieName || CSRF_TOKEN_COOKIE;
  const headerName = options.headerName || CSRF_TOKEN_HEADER;

  return async (req: NextRequest) => {
    // GETリクエストの場合はCSRFチェックをスキップ
    if (req.method === 'GET') {
      return handler(req);
    }

    const token = req.headers.get(headerName);
    const cookieToken = req.cookies.get(cookieName)?.value;

    if (!token || !cookieToken || token !== cookieToken) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    return handler(req);
  };
}

export function setCSRFToken(response: NextResponse): NextResponse {
  const token = generateCSRFToken();
  response.cookies.set(CSRF_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
  return response;
}
