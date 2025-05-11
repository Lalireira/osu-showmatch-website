// キャッシュの保持期間を秒単位で定義
export const CACHE_DURATIONS = {
  // APIレスポンスのキャッシュ期間（秒）
  API_RESPONSE: 3 * 60, // 3分
  // クライアントサイドのキャッシュ期間（ミリ秒）
  CLIENT_SIDE: {
    DEFAULT: 3 * 60 * 1000, // 3分
    BEATMAP: 3 * 60 * 1000, // 3分
    PLAYER: 3 * 60 * 1000, // 3分
  },
} as const;

// キャッシュのバージョン管理
export const CACHE_VERSIONS = {
  BEATMAP: '1.0.0',
  PLAYER: '1.0.0',
} as const;

// キャッシュのヘッダーを生成する関数
export function generateCacheHeaders(duration: number = CACHE_DURATIONS.API_RESPONSE) {
  const headers = new Headers();
  headers.set('Cache-Control', `public, s-maxage=${duration}, stale-while-revalidate`);
  return headers;
}

// キャッシュが有効かどうかをチェックする関数
export function isCacheValid(timestamp: number, duration: number = CACHE_DURATIONS.CLIENT_SIDE.DEFAULT): boolean {
  return Date.now() - timestamp < duration;
}

// ローカルストレージからキャッシュを取得する関数
export function getFromLocalStorage<T>(key: string, version: string): T | null {
  if (typeof window === 'undefined') return null;
  
  const cached = localStorage.getItem(key);
  if (!cached) return null;

  const { data, timestamp, cacheVersion }: { data: T; timestamp: number; cacheVersion: string } = JSON.parse(cached);
  
  // キャッシュのバージョンが一致しない場合は無効
  if (cacheVersion !== version) {
    localStorage.removeItem(key);
    return null;
  }
  
  // キャッシュが有効期限内かチェック
  if (isCacheValid(timestamp)) {
    return data;
  }

  // 期限切れの場合はキャッシュを削除
  localStorage.removeItem(key);
  return null;
}

// ローカルストレージにキャッシュを保存する関数
export function saveToLocalStorage<T>(key: string, data: T, version: string): void {
  if (typeof window === 'undefined') return;

  const cacheData = {
    data,
    timestamp: Date.now(),
    cacheVersion: version
  };
  localStorage.setItem(key, JSON.stringify(cacheData));
}

// キャッシュを無効化する関数
export function invalidateCache(type: keyof typeof CACHE_VERSIONS): void {
  if (typeof window === 'undefined') return;

  // 指定されたタイプのキャッシュをすべて削除
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith(`${type.toLowerCase()}_`)) {
      localStorage.removeItem(key);
    }
  });
} 