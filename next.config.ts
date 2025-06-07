
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  distDir: 'build', // <<< Added this line
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'image.pollinations.ai',
        port: '',
        pathname: '/**',
      },
      { // Added for Runware image URLs (e.g., from im.runware.ai)
        protocol: 'https',
        hostname: 'im.runware.ai',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
