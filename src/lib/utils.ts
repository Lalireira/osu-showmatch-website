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
  const match = url.match(/osu\.ppy\.sh\/users\/(\d+)/);
  if (!match) throw new Error(`Invalid user URL format: ${url}`);
  return parseInt(match[1], 10);
} 