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

// キャッシュの設定
const CACHE_DURATION = 5 * 60 * 1000; // 5分
const userDataCache = new Map<string, { data: any; timestamp: number }>();

async function getAccessToken(): Promise<string> {
  console.log('Getting access token...');
  console.log('Client ID:', clientId);
  console.log('Client Secret:', clientSecret ? '***' : 'undefined');

  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    console.log('Using cached token');
    return accessToken;
  }

  try {
    console.log('Requesting new token...');
    const response = await axios.post<TokenResponse>('https://osu.ppy.sh/oauth/token', {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
      scope: 'public',
    });

    console.log('Token response received');
    accessToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in * 1000);
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

export async function getUserData(userId: number) {
  const cacheKey = `user_${userId}`;
  const cachedData = userDataCache.get(cacheKey);

  // キャッシュが有効な場合はキャッシュされたデータを返す
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    return cachedData.data;
  }

  try {
    const response = await fetch(`/api/osu/user/${userId}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch user data');
    }
    const data = await response.json();
    
    // データをキャッシュに保存
    userDataCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    return data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
}

export async function getBeatmapData(beatmapId: string) {
  try {
    const response = await axios.get(`/api/osu/beatmap?beatmapId=${encodeURIComponent(beatmapId)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching beatmap data:', error);
    throw error;
  }
} 