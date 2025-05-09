/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_OSU_CLIENT_ID: process.env.NEXT_PUBLIC_OSU_CLIENT_ID,
    OSU_CLIENT_SECRET: process.env.OSU_CLIENT_SECRET,
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
    ],
  },
  // 開発環境でのキャッシュを無効化
  onDemandEntries: {
    maxInactiveAge: 0,
    pagesBufferLength: 0,
  },
  allowedDevOrigins: ['192.168.11.3'],
};

module.exports = nextConfig; 