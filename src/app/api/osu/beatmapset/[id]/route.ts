import { NextResponse } from 'next/server';
import { getBeatmapsetData } from '@/lib/osuApi';
import { generateCacheHeaders } from '@/lib/cacheConfig';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const data = await getBeatmapsetData(id);

    // レスポンスヘッダーにキャッシュ制御を追加
    const headers = generateCacheHeaders();

    return NextResponse.json(data, { headers });
  } catch (error) {
    console.error('Error in beatmapset API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch beatmapset data' },
      { status: 500 }
    );
  }
}
