import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mappool } from '@/lib/schema';

export async function GET() {
  try {
    const mappoolData = await db.select().from(mappool);
    return NextResponse.json(mappoolData);
  } catch (error) {
    console.error('Failed to fetch mappool config:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { maps } = await request.json();

    // 既存データを取得
    const before = await db.select().from(mappool);

    // 変更内容を比較してログ出力
    console.log('--- mappool 更新リクエスト ---');
    console.log('Before:', before);
    console.log('After:', maps);
    before.forEach((oldMap: { mapNo: string; url: string }) => {
      const newMap = maps.find((m: { mapNo: string; url: string }) => m.mapNo === oldMap.mapNo);
      if (newMap && newMap.url !== oldMap.url) {
        console.log(`mapNo ${oldMap.mapNo}: URL changed from ${oldMap.url} to ${newMap.url}`);
      }
    });
    maps.forEach((newMap: { mapNo: string; url: string }) => {
      const oldMap = before.find((m: { mapNo: string; url: string }) => m.mapNo === newMap.mapNo);
      if (!oldMap) {
        console.log(`mapNo ${newMap.mapNo}: 新規追加 (URL: ${newMap.url})`);
      }
    });
    before.forEach((oldMap: { mapNo: string; url: string }) => {
      const newMap = maps.find((m: { mapNo: string; url: string }) => m.mapNo === oldMap.mapNo);
      if (!newMap) {
        console.log(`mapNo ${oldMap.mapNo}: 削除されました (元URL: ${oldMap.url})`);
      }
    });

    // 既存のデータを削除
    await db.delete(mappool);

    // 新しいデータを挿入
    for (const map of maps) {
      if (!map.mapNo) continue;
      await db.insert(mappool).values({
        mapNo: map.mapNo,
        url: map.url
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update mappool config:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
