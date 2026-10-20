import type { NextConfig } from "next";

type RemotePattern = NonNullable<
  NonNullable<NextConfig["images"]>["remotePatterns"]
>[number];

function uploadRemotePattern(): RemotePattern {
  const raw = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
  try {
    const url = new URL(raw);
    const protocol = url.protocol === "https:" ? "https" : "http";
    const pattern: RemotePattern = {
      protocol,
      hostname: url.hostname,
      pathname: "/uploads/**",
    };
    if (url.port) {
      pattern.port = url.port;
    }
    return pattern;
  } catch {
    return {
      protocol: "http",
      hostname: "localhost",
      port: "3000",
      pathname: "/uploads/**",
    };
  }
}

const nextConfig: NextConfig = {
  // Next 16 blocks /_next assets when the page origin is 127.0.0.1
  // and the dev server advertised localhost (or the reverse).
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    // Restaurant logos are uploaded to and served by the NestJS API
    // (`/uploads/logos/...`), a different origin from this Next.js app —
    // `next/image` needs every remote host explicitly allow-listed.
    remotePatterns: [uploadRemotePattern()],
  },
};

export default nextConfig;
