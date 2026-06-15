import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Allow uploaded Supabase Storage images to be served through next/image. */
const remotePatterns = [];
if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  try {
    const { hostname } = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
    remotePatterns.push({
      protocol: "https",
      hostname,
      pathname: "/storage/v1/object/**",
    });
  } catch {
    // Invalid URL — skip; local/static images still work.
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
  outputFileTracingIncludes: {
    "/**": ["./supabase/email-templates/**"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns,
  },
  // Disabled due to causing 500 Internal Server Errors with framer-motion in some Next 15 setups
  /* experimental: {
    optimizePackageImports: ["framer-motion", "lucide-react"],
  }, */
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
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "base-uri 'self'",
              "form-action 'self'",
              "object-src 'none'",
              "frame-ancestors 'none'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "media-src 'self' blob: data: https://*.supabase.co",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://region1.google-analytics.com",
              "frame-src 'self' https://www.youtube.com https://player.vimeo.com",
            ].join("; "),
          },
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
