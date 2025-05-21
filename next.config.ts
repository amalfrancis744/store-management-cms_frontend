import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */

  images: {
    domains: [
      'google.com',
      'example.com',
      'media.istockphoto.com',
      'amybakesbread.com',
      'amybakesbread.com',
      'images.pexels.com',
      'res.cloudinary.com',
      'images.unsplash.com',
      'media.istockphoto.com',
      'res.cloudinary.com',

    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/dnvqwu9v8/image/upload/**',
      },
    ],
  },
};

export default nextConfig;

module.exports = {
  typescript: {
  
    ignoreBuildErrors: true,
  },
  eslint: {
  
    ignoreDuringBuilds: true,
  },
}
