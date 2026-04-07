import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  async rewrites() {
    return {
      fallback: [
        {
          source: "/media/:path*",
          destination: "/api/media/file/:path*",
        },
      ],
    };
  },
};

export default nextConfig;
