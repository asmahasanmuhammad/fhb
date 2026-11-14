import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
      { protocol: "https", hostname: "assets.dhakapost.com" },
      { protocol: "https", hostname: "a.espncdn.com" },
      { protocol: "https", hostname: "ichef.bbci.co.uk" },
      { protocol: "https", hostname: "cdn.jagonews24.com" },
      { protocol: "https", hostname: "z-cdn.chatglm.cn" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "cdn.pixabay.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "thumb.wikimedia.org" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  /* config options here */
  outputFileTracingIncludes: {
    '/**/*': ['./db/custom.db', './prisma/custom.db'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
