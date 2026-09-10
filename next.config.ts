import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self)",
  },
];

const nextConfig: NextConfig = {
  // Next 16.3 regression (vercel/next.js#96646): `output: "standalone"` +
  // Vercel's adapter skips emitting .next/next-server.js.nft.json, which Vercel's
  // onBuildComplete still reads → ENOENT. Keep standalone for Docker/self-host,
  // degrade to Vercel's default output when building on Vercel.
  output: process.env.VERCEL ? undefined : "standalone",
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**.supabase.in" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
