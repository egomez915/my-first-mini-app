import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["static.usernames.app-backend.toolsforhumanity.com"],
  },
  allowedDevOrigins: ["http://localhost:3000", "http://192.168.1.6:3000"], // Add your dev origin here
  reactStrictMode: false,
};

export default nextConfig;
