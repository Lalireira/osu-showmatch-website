import { NextResponse } from 'next/server';

// このAPIは現在未使用です
export async function GET() {
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
} 