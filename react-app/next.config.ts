import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/portal',
        destination: '/portal.html',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/auth/callback',
        destination: '/portal.html',
      },
    ];
  },
};

export default nextConfig;
