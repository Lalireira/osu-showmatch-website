import { NextResponse } from 'next/server';
import axios from 'axios';
import { getAccessToken } from '@/lib/osuApi';
import { generateCacheHeaders } from '@/lib/cacheConfig';
import { handleAPIError, withTimeout, APIError } from '@/lib/apiErrorHandler';

export const runtime = 'edge'; // エッジ関数として実行

export async function GET(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;
    console.log(`[API] Getting data for user ID: ${userId}`);

    // タイムアウト付きでアクセストークンを取得
    const token = await withTimeout(getAccessToken());
    console.log(`[API] Got access token: ${token.substring(0, 10)}...`);

    const apiUrl = `https://osu.ppy.sh/api/v2/users/${userId}`;
    console.log(`[API] Calling osu API: ${apiUrl}`);

    // タイムアウト付きでAPIリクエストを実行
    const response = await withTimeout(
      axios.get(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
    );

    console.log(`[API] osu API response status: ${response.status}`);

    // レスポンスヘッダーにキャッシュ制御を追加（ユーザーデータは頻繁に更新される可能性があるためSHORTを使用）
    const headers = generateCacheHeaders('SHORT');

    const userData = response.data;

    // 正しいユーザー名があるかチェック
    if (!userData.username) {
      throw new APIError(`Missing username in osu API response for user ${userId}`, 404);
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
  } catch (error) {
    return handleAPIError(error);
  }
}
