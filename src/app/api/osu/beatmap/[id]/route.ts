import { NextResponse } from 'next/server';
import { getBeatmapData } from '@/lib/osuApi';
import { generateCacheHeaders } from '@/lib/cacheConfig';
import { handleAPIError, withTimeout } from '@/lib/apiErrorHandler';

export const runtime = 'edge'; // エッジ関数として実行

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // タイムアウト付きでビートマップデータを取得
    const data = await withTimeout(getBeatmapData(id));

    // ビートマップデータは頻繁に更新されないため、LONGキャッシュを使用
    const headers = generateCacheHeaders('LONG');

    return NextResponse.json(data, { headers });
  } catch (error) {
    return handleAPIError(error);
  }
}
