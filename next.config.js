/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: ['mongoose'],
  },
  images: {
    remotePatterns: [
      {
        hostname: 'img.clerk.com',
        protocol: 'https',
      },
      {
        hostname: 'images.clerk.dev',
        protocol: 'https',
      },
      {
        hostname: 'uploadthing.com',
        protocol: 'https',
      },
      {
        hostname: 'placehold.co',
        protocol: 'https',
      },
    ],
  },
};

module.exports = nextConfig;
