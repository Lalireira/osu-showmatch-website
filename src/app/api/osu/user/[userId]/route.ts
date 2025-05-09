import { NextResponse } from 'next/server';
import axios from 'axios';
import { getAccessToken } from '@/lib/osuApi';

const CACHE_DURATION = 5 * 60; // 5分（秒単位）

export async function GET(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;
    const token = await getAccessToken();

    const response = await axios.get(`https://osu.ppy.sh/api/v2/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    // レスポンスヘッダーにキャッシュ制御を追加
    const headers = new Headers();
    headers.set('Cache-Control', `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate`);
    
    const userData = response.data;
    return NextResponse.json({
      username: userData.username,
      avatar_url: userData.avatar_url,
      statistics: {
        pp: userData.statistics?.pp ?? 0,
        accuracy: userData.statistics?.hit_accuracy ?? 0,
        global_rank: userData.statistics?.global_rank ?? 0,
        country_rank: userData.statistics?.country_rank ?? 0,
        play_count: userData.statistics?.play_count ?? 0,
      },
      comment: userData.comment ?? '',
    }, { headers });
  } catch (error: any) {
    console.error('Error fetching user data:', error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to fetch user data' },
      { status: error.response?.status || 500 }
    );
  }
} 