/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'a.ppy.sh',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.ppy.sh',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig; 