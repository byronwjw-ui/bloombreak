/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // We rely on TS for prod build correctness; do not block deploy on lint warnings.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
