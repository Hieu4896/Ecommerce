import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    domains: ["cdn.dummyjson.com", "dummyjson.com"],
  },
};

export default nextConfig;
