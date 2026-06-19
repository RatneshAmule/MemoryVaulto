import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NOTE: "standalone" output is for Docker/Node.js deployment.
  // For Vercel, remove output: "standalone" — Vercel handles the build automatically.
  reactStrictMode: true,
  serverExternalPackages: ["bcryptjs", "jsonwebtoken"],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
