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

async function getAccessToken() {
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    const response = await axios.post('https://osu.ppy.sh/oauth/token', {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
      scope: 'public',
    });

    accessToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in * 1000);
    return accessToken;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

export async function getUserData(userId: number) {
  try {
    const token = await getAccessToken();
    const response = await axios.get(`https://osu.ppy.sh/api/v2/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
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