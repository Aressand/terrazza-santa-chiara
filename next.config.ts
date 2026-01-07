import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Empty turbopack config to silence the webpack warning
  // Turbopack is optimized by default for Next.js 16
  turbopack: {},
};

export default nextConfig;
