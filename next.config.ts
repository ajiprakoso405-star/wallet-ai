import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client"],
  images: {
    domains: ["logo.clearbit.com"],
  },
};

export default nextConfig;
