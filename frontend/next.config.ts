import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Restaurant logos are uploaded to and served by the NestJS API
    // (`/uploads/logos/...`), a different origin from this Next.js app —
    // `next/image` needs every remote host explicitly allow-listed.
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "3000", pathname: "/uploads/**" },
    ],
  },
};

export default nextConfig;
