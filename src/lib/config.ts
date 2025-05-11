// アプリケーション全体の設定を管理するファイル

// キャッシュ設定
export const CACHE_CONFIG = {
  DURATION: {
    SERVER_SIDE: {
      DEFAULT: 3 * 60, // 3分
      BEATMAP: 3 * 60, // 3分
      PLAYER: 3 * 60, // 3分
    },
    CLIENT_SIDE: {
      DEFAULT: 3 * 60 * 1000, // 3分
      BEATMAP: 3 * 60 * 1000, // 3分
      PLAYER: 3 * 60 * 1000, // 3分
    },
  },
  VERSIONS: {
    BEATMAP: '1.0.0',
    PLAYER: '1.0.0',
  },
} as const;

// API設定
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || '',
  TIMEOUT: 5000, // 5秒
  RETRY_ATTEMPTS: 3,
} as const;

// バリデーション設定
export const VALIDATION_CONFIG = {
  TEAM: {
    NAME_MAX_LENGTH: 50,
    PLAYER_MAX_COUNT: 4,
  },
  MAP: {
    URL_PATTERN: /^https:\/\/osu\.ppy\.sh\/beatmapsets\/\d+#osu\/\d+$/,
  },
} as const;

// エラーメッセージ
export const ERROR_MESSAGES = {
  AUTH: {
    UNAUTHORIZED: '認証が必要です',
    INVALID_CREDENTIALS: 'ユーザー名またはパスワードが正しくありません',
  },
  TEAM: {
    NOT_FOUND: 'チームが見つかりません',
    INVALID_NAME: 'チーム名が無効です',
    TOO_MANY_PLAYERS: 'プレイヤー数が多すぎます',
  },
  MAP: {
    NOT_FOUND: 'マップが見つかりません',
    INVALID_URL: 'マップのURLが無効です',
  },
  CACHE: {
    INVALID_VERSION: 'キャッシュのバージョンが無効です',
    EXPIRED: 'キャッシュの有効期限が切れています',
  },
  SERVER_ERROR: '予期せぬエラーが発生しました。しばらく時間をおいて再度お試しください。',
} as const;
