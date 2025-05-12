import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { teams } from '@/lib/schema';
import { eq } from 'drizzle-orm';

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

    // 既存データを取得
    const before = await db.select().from(teams);
    // 変更内容を比較してログ出力
    console.log('--- teams 更新リクエスト ---');
    console.log('Before:', before);
    console.log('After:', newTeams);
    before.forEach(oldMember => {
      const newTeam = newTeams.find((t: any) => t.team === oldMember.team);
      const newMember = newTeam?.members.find((m: any) => m.userNo === oldMember.userNo);
      if (newMember && newMember.url !== oldMember.url) {
        console.log(`team ${oldMember.team} userNo ${oldMember.userNo}: URL changed from ${oldMember.url} to ${newMember.url}`);
      }
    });
    newTeams.forEach((newTeam: any) => {
      newTeam.members.forEach((newMember: any) => {
        const oldMember = before.find((m: any) => m.team === newTeam.team && m.userNo === newMember.userNo);
        if (!oldMember) {
          console.log(`team ${newTeam.team} userNo ${newMember.userNo}: 新規追加 (URL: ${newMember.url})`);
        }
      });
    });
    before.forEach(oldMember => {
      const newTeam = newTeams.find((t: any) => t.team === oldMember.team);
      const newMember = newTeam?.members.find((m: any) => m.userNo === oldMember.userNo);
      if (!newMember) {
        console.log(`team ${oldMember.team} userNo ${oldMember.userNo}: 削除されました (元URL: ${oldMember.url})`);
      }
    });

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
