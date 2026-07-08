import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  typedRoutes: true,
  experimental: {
    inlineCss: true,
    staleTimes: {
      dynamic: 30,
    },
    appNewScrollHandler: true,
  },
  reactCompiler: true,
  transpilePackages: ["firebase-admin", "jwks-rsa"],
  images: {
    remotePatterns: [
      // { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { hostname: "res.cloudinary.com", protocol: "https", port: "" },
    ],
  },
};

export default nextConfig;
