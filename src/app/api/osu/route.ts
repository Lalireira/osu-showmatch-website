import { NextResponse } from 'next/server';
import axios from 'axios';
import { withRateLimit } from '@/lib/rateLimit';
import { withCSRF, setCSRFToken } from '@/lib/csrf';
import { handleAPIError, withTimeout, APIError } from '@/lib/apiErrorHandler';
import { generateCacheHeaders } from '@/lib/cacheConfig';

const clientId = process.env.NEXT_PUBLIC_OSU_CLIENT_ID;
const clientSecret = process.env.OSU_CLIENT_SECRET;

interface TokenResponse {
  access_token: string;
  expires_in: number;
}

let accessToken: string | null = null;
let tokenExpiry: number | null = null;

async function getAccessToken(): Promise<string> {
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    const response = await withTimeout(
      axios.post<TokenResponse>('https://osu.ppy.sh/oauth/token', {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
        scope: 'public',
      })
    );

    if (!response.data.access_token) {
      throw new APIError('No access token received', 500);
    }

    const newToken = response.data.access_token;
    accessToken = newToken;
    tokenExpiry = Date.now() + (response.data.expires_in * 1000);
    return newToken;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

export const runtime = 'edge'; // エッジ関数として実行

async function handler(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    throw new APIError('Username is required', 400);
  }

  try {
    const token = await getAccessToken();
    const response = await withTimeout(
      axios.get(`https://osu.ppy.sh/api/v2/users/${username}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          mode: 'osu',
        },
      })
    );

    // ユーザーデータは頻繁に更新される可能性があるためSHORTキャッシュを使用
    const headers = generateCacheHeaders('SHORT');
    const nextResponse = NextResponse.json(response.data, { headers });
    return setCSRFToken(nextResponse);
  } catch (error) {
    return handleAPIError(error);
  }
}

// レート制限とCSRF保護を適用
export const GET = withCSRF(withRateLimit(handler));
