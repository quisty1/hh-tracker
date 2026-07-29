import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Логотипы работодателей с CDN hh.ru
    remotePatterns: [
      { protocol: 'https', hostname: 'hhcdn.ru' },
      { protocol: 'https', hostname: 'img.hhcdn.ru' },
      { protocol: 'https', hostname: '**.hhcdn.ru' },
    ],
  },
};

export default nextConfig;
