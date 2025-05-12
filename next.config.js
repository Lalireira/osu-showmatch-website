/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_OSU_CLIENT_ID: process.env.NEXT_PUBLIC_OSU_CLIENT_ID,
    OSU_CLIENT_SECRET: process.env.OSU_CLIENT_SECRET,
    ADMIN_USERNAME: process.env.ADMIN_USERNAME,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'a.ppy.sh',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ppy.sh',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'osu.ppy.sh',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.ppy.sh',
        pathname: '/**',
      },
    ],
    // 画像の最適化設定
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  // 開発環境でのキャッシュを無効化
  onDemandEntries: {
    maxInactiveAge: 0,
    pagesBufferLength: 0,
  },
  allowedDevOrigins: ['192.168.11.3'],
  // ビルド最適化設定
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    styledComponents: true,
  },
  // エッジ関数の設定
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '192.168.11.3'],
    },
    optimizeCss: true,
    optimizePackageImports: ['@heroicons/react', '@headlessui/react'],
  },
  // キャッシュ設定
  generateEtags: true,
  // 静的生成の設定
  output: 'standalone',
  // 圧縮設定
  compress: true,
  // パフォーマンス最適化
  poweredByHeader: false,
  reactStrictMode: true,
};

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');

module.exports = (phase) => {
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return {
      ...nextConfig,
    };
  }
  return withBundleAnalyzer(nextConfig);
};
