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
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { hostname: "res.cloudinary.com", protocol: "https", port: "" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
