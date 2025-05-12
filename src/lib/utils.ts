export function formatNumber(num: number | undefined): string {
  if (num === undefined) return '0';
  return num.toLocaleString();
}

// Beatmap URLからbeatmapset_idとbeatmap_idを抽出する共通関数
export function extractIdsFromUrl(url: string): { beatmapset_id: number; beatmap_id: number } {
  const match = url.match(/beatmapsets\/(\d+)#osu\/(\d+)/);
  if (!match) {
    throw new Error(`Invalid beatmap URL format: ${url}`);
  }
  return {
    beatmapset_id: parseInt(match[1], 10),
    beatmap_id: parseInt(match[2], 10)
  };
}

// ユーザーURLからユーザーIDを抽出する関数
export function extractUserIdFromUrl(url: string): number {
  console.log('Extracting user ID from URL:', url);

  // 複数のURLパターンに対応
  const patterns = [
    /osu\.ppy\.sh\/users\/(\d+)(?:\/osu)?/,  // https://osu.ppy.sh/users/12345 または https://osu.ppy.sh/users/12345/osu
    /osu\.ppy\.sh\/u\/(\d+)/                 // 古い形式: https://osu.ppy.sh/u/12345
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      const id = parseInt(match[1], 10);
      console.log('Extracted ID:', id);
      return id;
    }
  }

  console.error(`Invalid user URL format: ${url}`);
  throw new Error(`Invalid user URL format: ${url}`);
}
