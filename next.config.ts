import type { NextConfig } from "next";

const nextConfig = {
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

export default nextConfig;
