import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { teams } from '@/lib/schema';

export async function GET() {
  try {
    const teamsData = await db.select().from(teams);

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

    // 既存のデータを削除
    await db.delete(teams);

    // 新しいデータを挿入
    for (const team of newTeams) {
      for (const member of team.members) {
        await db.insert(teams).values({
          team: team.team,
          userNo: member.userNo,
          url: member.url
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update teams config:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
