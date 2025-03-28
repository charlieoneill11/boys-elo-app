/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
  },
  eslint: {
    // This disables ESLint during production builds
    // You can still run ESLint manually with 'npm run lint'
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;