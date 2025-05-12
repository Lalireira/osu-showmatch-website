import { NextResponse } from 'next/server';
import { getBeatmapData } from '@/lib/osuApi';
import { generateCacheHeaders } from '@/lib/cacheConfig';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const data = await getBeatmapData(id);

    // レスポンスヘッダーにキャッシュ制御を追加
    const headers = generateCacheHeaders();

    return NextResponse.json(data, { headers });
  } catch (error) {
    console.error('Error in beatmap API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch beatmap data' },
      { status: 500 }
    );
  }
}
