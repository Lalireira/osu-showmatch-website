import axios from 'axios';
import { CACHE_DURATIONS, CACHE_VERSIONS, getFromLocalStorage, saveToLocalStorage } from './cacheConfig';

const API_BASE_URL = '/api/osu';
const clientId = process.env.NEXT_PUBLIC_OSU_CLIENT_ID;
const clientSecret = process.env.OSU_CLIENT_SECRET;

interface TokenResponse {
  token_type: string;
  expires_in: number;
  access_token: string;
}

let accessToken: string | null = null;
let tokenExpiry: number = 0;

// レート制限の状態を管理
const rateLimitState = {
  remaining: 1000,
  reset: Date.now() + 60000,
};

// レート制限のチェック
function checkRateLimit() {
  const now = Date.now();
  if (now >= rateLimitState.reset) {
    rateLimitState.remaining = 1000;
    rateLimitState.reset = now + 60000;
  }
  return rateLimitState.remaining > 0;
}

// レート制限の更新
function updateRateLimit(headers: any) {
  if (headers['x-ratelimit-remaining']) {
    rateLimitState.remaining = parseInt(headers['x-ratelimit-remaining']);
  }
  if (headers['x-ratelimit-reset']) {
    rateLimitState.reset = parseInt(headers['x-ratelimit-reset']) * 1000;
  }
}

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (accessToken && now < tokenExpiry) {
    return accessToken;
  }

  if (!clientId || !clientSecret) {
    console.error('Missing OSU_CLIENT_ID or OSU_CLIENT_SECRET environment variables');
    throw new Error('API credentials not configured');
  }

  try {
    const response = await axios.post<TokenResponse>('https://osu.ppy.sh/oauth/token', {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
      scope: 'public',
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.data.access_token) {
      throw new Error('No access token in response');
    }

    accessToken = response.data.access_token;
    tokenExpiry = now + (response.data.expires_in * 1000);
    return accessToken;
  } catch (error: any) {
    console.error('Error getting access token:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw new Error(`Failed to get access token: ${error.response?.data?.error || error.message}`);
  }
}

export async function getUserData(userId: string) {
  try {
    const response = await axios.get(`${API_BASE_URL}/user/${userId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching user data:', error.response?.data || error.message);
    throw error;
  }
}

export async function getBeatmapData(beatmapId: string) {
  try {
    const response = await axios.get(`${API_BASE_URL}/beatmap?beatmapId=${beatmapId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching beatmap data:', error.response?.data || error.message);
    throw error;
  }
}

export { getAccessToken }; 