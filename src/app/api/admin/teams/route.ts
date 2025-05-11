import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';

// チーム一覧の取得
export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      include: {
        members: true,
      },
    });
    return NextResponse.json(teams);
  } catch (error) {
    console.error('Failed to fetch teams:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// チームの更新
export async function PUT(request: Request) {
  try {
    const { id, name, members } = await request.json();

    const updatedTeam = await prisma.team.update({
      where: { id },
      data: {
        name,
        members: {
          deleteMany: {},
          create: members.map((member: any) => ({
            osuId: member.osuId,
            username: member.username,
          })),
        },
      },
      include: {
        members: true,
      },
    });

    return NextResponse.json(updatedTeam);
  } catch (error) {
    console.error('Failed to update team:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 