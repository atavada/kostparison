import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Naikkan body size limit untuk route upload foto (default 4.5 MB)
  // Vercel Blob menerima file lewat server, jadi request body bisa sampai 5 MB
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
