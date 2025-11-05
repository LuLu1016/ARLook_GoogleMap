/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicitly set outputFileTracingRoot to fix workspace root warning
  outputFileTracingRoot: process.cwd(),
};

module.exports = nextConfig;

