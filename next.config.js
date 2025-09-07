const dest = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${dest}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;