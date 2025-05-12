import { NextRequest, NextResponse } from 'next/server';

const CSRF_TOKEN_COOKIE = 'csrf_token';
const CSRF_TOKEN_HEADER = 'x-csrf-token';

export async function generateCSRFToken(): Promise<string> {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
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

export async function setCSRFToken(response: NextResponse): Promise<NextResponse> {
  const token = await generateCSRFToken();
  response.cookies.set(CSRF_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
  return response;
}
