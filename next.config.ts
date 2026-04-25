import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [100, 75],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pvk9wzme5xcted1q.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
  }
};

export default nextConfig;
