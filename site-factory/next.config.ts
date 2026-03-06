import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  serverExternalPackages: ["@prisma/adapter-mariadb", "mariadb", "@prisma/client"],
  images: {
    formats: ["image/avif", "image/webp"],
    domains: ["images.unsplash.com", "avatars.githubusercontent.com", "placehold.co"],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
