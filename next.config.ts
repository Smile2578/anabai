import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['places.googleapis.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'places.googleapis.com',
        pathname: '/v1/**',
      },
    ],
  }
};

export default nextConfig;
