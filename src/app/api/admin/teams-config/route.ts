import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { teams } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

export async function GET() {
  try {
    const teamsData = await db.select().from(teams).orderBy(teams.team, teams.userNo);

    // データをチームごとにグループ化
    const groupedTeams = teamsData.reduce((acc, curr) => {
      if (!acc[curr.team]) {
        acc[curr.team] = {
          team: curr.team,
          members: []
        };
      }
      acc[curr.team].members.push({
        userNo: curr.userNo,
        url: curr.url
      });
      return acc;
    }, {} as Record<string, { team: string; members: { userNo: string; url: string }[] }>);

    return NextResponse.json(Object.values(groupedTeams));
  } catch (error) {
    console.error('Failed to fetch teams config:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { teams: newTeams } = await request.json();

    // 既存データを取得
    const before = await db.select().from(teams);

    // 1. 新データをフラット化（team, userNo, url）
    const flatNew = newTeams.flatMap((t: { team: string; members: { userNo: string; url: string }[] }) =>
      t.members.map((m: { userNo: string; url: string }) => ({
        team: t.team,
        userNo: m.userNo,
        url: m.url,
      }))
    );

    // 2. 既存データをフラット化（id, team, userNo, url）
    const flatBefore = before.map((m: any) => ({
      id: m.id,
      team: m.team,
      userNo: m.userNo,
      url: m.url,
    }));

    // 3. 削除対象（新データに存在しないもの）
    for (const oldMember of flatBefore) {
      if (!flatNew.find((n: any) => n.team === oldMember.team && n.userNo === oldMember.userNo)) {
        await db.delete(teams).where(
          and(eq(teams.team, oldMember.team), eq(teams.userNo, oldMember.userNo))
        );
      }
    }

    // 4. 追加・更新対象
    for (const newMember of flatNew) {
      const old = flatBefore.find((o: any) => o.team === newMember.team && o.userNo === newMember.userNo);
      if (!old) {
        // 新規追加
        await db.insert(teams).values({
          team: newMember.team,
          userNo: newMember.userNo,
          url: newMember.url,
        });
      } else if (old.url !== newMember.url) {
        // URLが違う場合は更新
        await db.update(teams)
          .set({ url: newMember.url })
          .where(and(eq(teams.team, newMember.team), eq(teams.userNo, newMember.userNo)));
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update teams config:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
