import { NextResponse } from 'next/server';
import axios from 'axios';

const CLIENT_ID = '40631';
const CLIENT_SECRET = 'DPhnBPS6zcT8wTWN1Zsx7q3k4PozY328qAThrswD';

let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    const response = await axios.post(
      'https://osu.ppy.sh/oauth/token',
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'client_credentials',
        scope: 'public',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    const token = response.data.access_token;
    if (!token) {
      throw new Error('No access token received');
    }

    accessToken = token;
    tokenExpiry = Date.now() + (response.data.expires_in * 1000);
    return token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  try {
    const token = await getAccessToken();
    const response = await axios.get(`https://osu.ppy.sh/api/v2/users/${username}/osu`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      params: {
        mode: 'osu',
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching user data:', error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to fetch user data' },
      { status: error.response?.status || 500 }
    );
  }
} 