/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  importScripts: ["/push-sw.js"],
  disable: process.env.NODE_ENV === "development",
  // Exclude ALL webpack-emitted assets from the precache manifest.
  // Next.js 14 App Router emits several manifest JSON files (app-build-manifest,
  // middleware-manifest, etc.) that are not served as static files on Vercel CDN
  // and return 404 — causing Workbox to abort SW installation entirely.
  // Offline support is still provided by runtimeCaching (cache-on-first-use).
  buildExcludes: [/.*/],
});

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizeCss: false,
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "recharts",
      "date-fns",
    ],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 dias
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

module.exports = withPWA(nextConfig);
