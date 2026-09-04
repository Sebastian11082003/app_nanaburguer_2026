import type { NextConfig } from "next";

function uploadRemotePattern() {
  const raw = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
  try {
    const url = new URL(raw);
    const protocol = url.protocol === "https:" ? "https" : "http";
    return {
      protocol,
      hostname: url.hostname,
      ...(url.port ? { port: url.port } : {}),
      pathname: "/uploads/**" as const,
    };
  } catch {
    return {
      protocol: "http" as const,
      hostname: "localhost",
      port: "3000",
      pathname: "/uploads/**" as const,
    };
  }
}

const nextConfig: NextConfig = {
  images: {
    // Restaurant logos are uploaded to and served by the NestJS API
    // (`/uploads/logos/...`), a different origin from this Next.js app —
    // `next/image` needs every remote host explicitly allow-listed.
    remotePatterns: [uploadRemotePattern()],
  },
};

export default nextConfig;
