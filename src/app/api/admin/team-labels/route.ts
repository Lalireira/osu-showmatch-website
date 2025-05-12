import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { teamLabels } from '@/lib/schema';

export async function GET() {
  try {
    const labels = await db.select().from(teamLabels);
    return NextResponse.json(labels);
  } catch (error) {
    console.error('Failed to fetch team labels:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { labels } = await request.json(); // [{ team, displayName }]
    // UPSERT（onConflictDoUpdate）で重複エラーを防ぐ
    for (const label of labels) {
      await db.insert(teamLabels).values({
        team: label.team,
        displayName: label.displayName
      }).onConflictDoUpdate({
        target: teamLabels.team,
        set: { displayName: label.displayName }
      });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update team labels:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
