import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Employer logos from the hh.ru CDN
    remotePatterns: [
      { protocol: 'https', hostname: 'hhcdn.ru' },
      { protocol: 'https', hostname: 'img.hhcdn.ru' },
      { protocol: 'https', hostname: '**.hhcdn.ru' },
    ],
  },
};

export default nextConfig;
