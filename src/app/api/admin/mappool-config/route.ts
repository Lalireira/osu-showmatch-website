import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

interface MapConfig {
  category: string;
  number: number;
  url: string;
}

// mappoolConfigの更新
export async function PUT(request: Request) {
  try {
    const { maps } = await request.json() as { maps: MapConfig[] };

    // mappoolConfigの形式に変換
    const mappoolConfig = maps.map((map) => ({
      mapNo: `${map.category}${map.number}`,
      url: map.url,
    }));

    // ファイルパスを取得
    const filePath = join(process.cwd(), 'src', 'data', 'mappool.ts');

    // ファイルの内容を生成
    const fileContent = `// このファイルは自動生成されます。直接編集しないでください。
export const mappoolConfig = ${JSON.stringify(mappoolConfig, null, 2)};
`;

    // ファイルに書き込み
    await writeFile(filePath, fileContent, 'utf-8');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update mappool config:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
