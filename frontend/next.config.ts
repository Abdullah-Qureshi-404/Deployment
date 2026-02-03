import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true, // ignore ESLint warnings
  },
  typescript: {
    ignoreBuildErrors: true, // ignore TS errors
  },
};

export default nextConfig;
