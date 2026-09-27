import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Allow large media uploads (up to 300MB for video lectures)
    proxyClientMaxBodySize: "300mb",
  },
};

export default nextConfig;

