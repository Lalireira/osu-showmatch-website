import { NextResponse } from 'next/server';
import axios from 'axios';
import { getAccessToken } from '@/lib/osuApi';
import { generateCacheHeaders, CACHE_DURATIONS } from '@/lib/cacheConfig';

export async function GET(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;
    console.log(`[API] Getting data for user ID: ${userId}`);

    const token = await getAccessToken();
    console.log(`[API] Got access token: ${token.substring(0, 10)}...`);

    const apiUrl = `https://osu.ppy.sh/api/v2/users/${userId}`;
    console.log(`[API] Calling osu API: ${apiUrl}`);

    const response = await axios.get(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log(`[API] osu API response status: ${response.status}`);
    console.log(`[API] osu API response data:`, JSON.stringify(response.data).substring(0, 500));

    // レスポンスヘッダーにキャッシュ制御を追加
    const headers = generateCacheHeaders();

    const userData = response.data;

    // 正しいユーザー名があるかチェック
    if (!userData.username) {
      console.error(`[API] Missing username in osu API response for user ${userId}:`, userData);
    }

    // デバッグ：API応答の構造を詳細に確認
    console.log(`[API] User data structure for ${userId}:`, {
      username: userData.username,
      username_type: typeof userData.username,
      has_username_property: 'username' in userData,
      avatar_url: userData.avatar_url,
      country_code: userData.country_code,
      statistics: userData.statistics ? {
        pp: userData.statistics.pp,
        accuracy: userData.statistics.hit_accuracy,
        global_rank: userData.statistics.global_rank,
        country_rank: userData.statistics.country_rank,
        play_count: userData.statistics.play_count
      } : 'No statistics'
    });

    const responseData = {
      username: userData.username && userData.username !== 'undefined' ? userData.username : `Player ${userId}`,
      avatar_url: userData.avatar_url || 'https://osu.ppy.sh/images/layout/avatar-guest.png',
      country: userData.country_code || '',
      statistics: {
        pp: userData.statistics?.pp ?? 0,
        accuracy: userData.statistics?.hit_accuracy ?? 0,
        global_rank: userData.statistics?.global_rank ?? 0,
        country_rank: userData.statistics?.country_rank ?? 0,
        play_count: userData.statistics?.play_count ?? 0,
      },
      comment: userData.comment ?? '',
    };

    console.log(`[API] Sending response for user ${userId}:`, responseData);

    return NextResponse.json(responseData, { headers });
  } catch (error: any) {
    console.error('Error fetching user data:', error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to fetch user data' },
      { status: error.response?.status || 500 }
    );
  }
}
