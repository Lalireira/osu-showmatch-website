import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RequestRecord {
  count: number;
  resetTime: number;
}

const defaultConfig: RateLimitConfig = {
  maxRequests: 100,
  windowMs: 60 * 1000, // 1分
};

const ipRequests = new Map<string, RequestRecord>();

export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  config: RateLimitConfig = defaultConfig
) {
  return async (req: NextRequest) => {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const now = Date.now();

    // 古いリクエスト記録をクリア
    for (const [key, value] of ipRequests.entries()) {
      if (now > value.resetTime) {
        ipRequests.delete(key);
      }
    }

    // 現在のIPのリクエスト数を取得
    const currentRequests = ipRequests.get(ip) || { count: 0, resetTime: now + config.windowMs };

    // レート制限チェック
    if (currentRequests.count >= config.maxRequests) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // リクエスト数を更新
    currentRequests.count++;
    ipRequests.set(ip, currentRequests);

    // 元のハンドラーを実行
    return handler(req);
  };
}
