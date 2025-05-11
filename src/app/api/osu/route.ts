import { NextResponse } from 'next/server';
import axios from 'axios';
import { withRateLimit } from '@/lib/rateLimit';
import { withCSRF, setCSRFToken } from '@/lib/csrf';

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
    const response = await axios.post<TokenResponse>('https://osu.ppy.sh/oauth/token', {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
      scope: 'public',
    });

    if (!response.data.access_token) {
      throw new Error('No access token received');
    }

    const newToken = response.data.access_token;
    accessToken = newToken;
    tokenExpiry = Date.now() + (response.data.expires_in * 1000);
    return newToken;
  } catch (error: any) {
    console.error('Error getting access token:', error.response?.data || error.message);
    throw error;
  }
}

async function handler(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  try {
    const token = await getAccessToken();
    const response = await axios.get(`https://osu.ppy.sh/api/v2/users/${username}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        mode: 'osu',
      },
    });

    const nextResponse = NextResponse.json(response.data);
    return setCSRFToken(nextResponse);
  } catch (error: any) {
    console.error('Error fetching user data:', error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data?.error || error.message },
      { status: error.response?.status || 500 }
    );
  }
}

export const GET = withRateLimit(withCSRF(handler));
