import axios from 'axios';

const clientId = process.env.NEXT_PUBLIC_OSU_CLIENT_ID;
const clientSecret = process.env.OSU_CLIENT_SECRET;

interface TokenResponse {
  token_type: string;
  expires_in: number;
  access_token: string;
}

interface RateLimitHeaders {
  'x-ratelimit-remaining'?: string;
  'x-ratelimit-reset'?: string;
}

let accessToken: string | null = null;
let tokenExpiry: number | null = null;

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
function updateRateLimit(headers: RateLimitHeaders) {
  if (headers['x-ratelimit-remaining']) {
    rateLimitState.remaining = parseInt(headers['x-ratelimit-remaining']);
  }
  if (headers['x-ratelimit-reset']) {
    rateLimitState.reset = parseInt(headers['x-ratelimit-reset']) * 1000;
  }
}

export async function getAccessToken(): Promise<string> {
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
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error getting access token:', error.response?.data || error.message);
    } else {
      console.error('Error getting access token:', error);
    }
    throw error;
  }
}

export async function getUserData(userId: string) {
  try {
    const token = await getAccessToken();
    const response = await fetch(`https://osu.ppy.sh/api/v2/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    const data = await response.json();
    return {
      id: parseInt(userId, 10),
      username: data.username,
      avatar_url: data.avatar_url,
      country: data.country_code,
      statistics: {
        pp: data.statistics?.pp ?? 0,
        accuracy: data.statistics?.hit_accuracy ?? 0,
        global_rank: data.statistics?.global_rank ?? 0,
        country_rank: data.statistics?.country_rank ?? 0,
        play_count: data.statistics?.play_count ?? 0,
      },
      comment: data.comment ?? '',
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
}

export async function getBeatmapData(beatmapId: string) {
  try {
    const token = await getAccessToken();
    const response = await fetch(`https://osu.ppy.sh/api/v2/beatmaps/${beatmapId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch beatmap data');
    }

    const data = await response.json();
    return {
      id: data.id,
      beatmapset_id: data.beatmapset_id,
      version: data.version,
      total_length: data.total_length,
      difficulty_rating: data.difficulty_rating,
      bpm: data.bpm,
      cs: data.cs,
      ar: data.ar,
      accuracy: data.accuracy,
      drain: data.drain,
      artist: data.beatmapset?.artist || data.artist,
      title: data.beatmapset?.title || data.title,
      creator: data.beatmapset?.creator || data.creator,
      beatmapset: {
        artist: data.beatmapset?.artist || data.artist,
        title: data.beatmapset?.title || data.title,
        creator: data.beatmapset?.creator || data.creator
      }
    };
  } catch (error) {
    console.error('Error fetching beatmap data:', error);
    throw error;
  }
}

interface Beatmap {
  id: number;
  version: string;
  difficulty_rating: number;
  mode: string;
  status: string;
}

interface Beatmapset {
  id: number;
  artist: string;
  title: string;
  creator: string;
  covers: Record<string, string>;
  status: string;
  beatmaps: Beatmap[];
}

export async function getBeatmapsetData(beatmapsetId: string) {
  try {
    const token = await getAccessToken();
    const response = await fetch(`https://osu.ppy.sh/api/v2/beatmapsets/${beatmapsetId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch beatmapset data');
    }

    const data = await response.json() as Beatmapset;
    return {
      id: data.id,
      artist: data.artist,
      title: data.title,
      creator: data.creator,
      covers: data.covers,
      status: data.status,
      beatmaps: data.beatmaps.map(beatmap => ({
        id: beatmap.id,
        version: beatmap.version,
        difficulty_rating: beatmap.difficulty_rating,
        mode: beatmap.mode,
        status: beatmap.status
      }))
    };
  } catch (error) {
    console.error('Error fetching beatmapset data:', error);
    throw error;
  }
}
