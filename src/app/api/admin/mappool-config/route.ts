import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mappool } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const mappoolData = await db.select().from(mappool).orderBy(mappool.mapNo);
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

    // 1. 新データをフラット化（mapNo, url）
    const flatNew = maps.map((m: { mapNo: string; url: string }) => ({
      mapNo: m.mapNo,
      url: m.url,
    }));

    // 2. 既存データをフラット化（id, mapNo, url）
    const flatBefore = before.map((m: { id: number; mapNo: string; url: string }) => ({
      id: m.id,
      mapNo: m.mapNo,
      url: m.url,
    }));

    // 3. 削除対象（新データに存在しないもの）
    for (const oldMap of flatBefore) {
      if (!flatNew.find((n: { mapNo: string; url: string }) => n.mapNo === oldMap.mapNo)) {
        await db.delete(mappool).where(
          eq(mappool.mapNo, oldMap.mapNo)
        );
      }
    }

    // 4. 追加・更新対象
    for (const newMap of flatNew) {
      const old = flatBefore.find((o) => o.mapNo === newMap.mapNo);
      if (!old) {
        // 新規追加
        await db.insert(mappool).values({
          mapNo: newMap.mapNo,
          url: newMap.url,
        });
      } else if (old.url !== newMap.url) {
        // URLが違う場合は更新
        await db.update(mappool)
          .set({ url: newMap.url })
          .where(eq(mappool.mapNo, newMap.mapNo));
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update mappool config:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
