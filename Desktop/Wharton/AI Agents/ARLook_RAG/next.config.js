/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Ensure environment variables are available
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  },
  // Output configuration for Vercel
  output: 'standalone',
};

module.exports = nextConfig;

