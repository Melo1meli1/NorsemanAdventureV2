import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: "/turer", destination: "/tours" },
      { source: "/turer/:path*", destination: "/tours/:path*" },
      { source: "/galleri", destination: "/gallery" },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    qualities: [70, 75, 80, 85],
  },
};

export default nextConfig;
