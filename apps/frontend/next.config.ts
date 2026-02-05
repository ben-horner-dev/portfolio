import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pino", "pino-pretty", "thread-stream"],
  productionBrowserSourceMaps: true,
  images: {
    qualities: [85],
  },
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
  skipTrailingSlashRedirect: true,
};

export default withSentryConfig(nextConfig, {
  org: "benhornerdev",
  project: "portfolio",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
    automaticVercelMonitors: true,
  },
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
});
