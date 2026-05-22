/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // We rely on TS for prod build correctness; do not block deploy on lint warnings.
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      { source: '/game', destination: '/games/match', permanent: false },
    ];
  },
};

export default nextConfig;
