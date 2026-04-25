import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["framer-motion", "lucide-react"],
  },
  webpack: (config, { nextRuntime, webpack }) => {
    // Fix: next/dist/compiled/cookie includes ncc-compiled code that references
    // __dirname when __nccwpck_require__ is defined. Vercel's Edge Runtime defines
    // __nccwpck_require__ globally, which triggers the __dirname access and throws
    // ReferenceError since __dirname is not available in Edge Runtime.
    // Explicitly define __dirname as "/" for edge builds to prevent this.
    if (nextRuntime === "edge") {
      config.plugins.push(
        new webpack.DefinePlugin({
          __dirname: JSON.stringify("/"),
        })
      );
    }
    return config;
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
