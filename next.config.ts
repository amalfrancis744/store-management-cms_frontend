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

    ], // Allow images from google.com
  },
};

export default nextConfig;

module.exports = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
}
