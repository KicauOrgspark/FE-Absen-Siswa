import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://reihan.biz.id/api/:path*',
      },
    ];
  },
};

export default nextConfig;
