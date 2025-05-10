import { NextResponse } from 'next/server';
import axios from 'axios';
import { getAccessToken } from '@/lib/osuApi';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const beatmapId = searchParams.get('beatmapId');

  if (!beatmapId) {
    return NextResponse.json({ error: 'beatmapId is required' }, { status: 400 });
  }

  try {
    const token = await getAccessToken();
    const response = await axios.get(`https://osu.ppy.sh/api/v2/beatmaps/${beatmapId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching beatmap data:', error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data?.error || error.message },
      { status: error.response?.status || 500 }
    );
  }
} 