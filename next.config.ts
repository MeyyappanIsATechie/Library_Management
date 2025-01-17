import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        // pathname: "/path/to/images/**"
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
        // pathname: "/path/to/images/**"
      },
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        port: '',
      },
    ],
  },
};

export default nextConfig;
