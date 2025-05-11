import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function PUT(request: Request) {
  try {
    const { teams } = await request.json();

    // ファイルパスを取得
    const filePath = join(process.cwd(), 'src', 'data', 'teams.ts');

    // ファイルの内容を生成
    const fileContent = `export const teams = ${JSON.stringify(teams, null, 2)};\n`;

    // ファイルに書き込み
    await writeFile(filePath, fileContent, 'utf-8');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update teams config:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 