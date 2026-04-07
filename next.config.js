/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // We'll keep this if specific tsconfig is needed, but usually default is fine
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
