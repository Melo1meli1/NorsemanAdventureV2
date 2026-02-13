import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: "/turer", destination: "/public/tours" },
      { source: "/turer/:path*", destination: "/public/tours/:path*" },
      { source: "/galleri", destination: "/public/gallery" },
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
  },
};

export default nextConfig;
