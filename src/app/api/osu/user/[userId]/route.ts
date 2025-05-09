import { NextResponse } from 'next/server';
import axios from 'axios';

const clientId = process.env.NEXT_PUBLIC_OSU_CLIENT_ID;
const clientSecret = process.env.OSU_CLIENT_SECRET;

interface TokenResponse {
  token_type: string;
  expires_in: number;
  access_token: string;
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

    accessToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in * 1000);
    return accessToken;
  } catch (error: any) {
    console.error('Error getting access token:', error.response?.data || error.message);
    throw new Error('Failed to get access token');
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId } = await context.params;
  
  try {
    const token = await getAccessToken();

    const response = await axios.get(`https://osu.ppy.sh/api/v2/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const userData = response.data;
    return NextResponse.json({
      username: userData.username,
      avatar_url: userData.avatar_url,
      country_code: userData.country_code,
      statistics: {
        pp: userData.statistics?.pp ?? 0,
        accuracy: userData.statistics?.hit_accuracy ?? 0,
        global_rank: userData.statistics?.global_rank ?? 0,
        country_rank: userData.statistics?.country_rank ?? 0,
      },
    });
  } catch (error: any) {
    console.error('Error fetching user data:', error.response?.data || error.message);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: error.response?.status || 500 }
    );
  }
} 