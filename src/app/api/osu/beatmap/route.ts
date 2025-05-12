import { NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/osuApi';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const beatmapId = searchParams.get('beatmapId');
  if (!beatmapId) {
    return NextResponse.json({ error: 'beatmapId is required' }, { status: 400 });
  }

  try {
    const token = await getAccessToken();
    const response = await fetch(`https://osu.ppy.sh/api/v2/beatmaps/${beatmapId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }
    return NextResponse.json(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
