/// <reference types="vitest/config" />

import path from "node:path";
import { fileURLToPath } from "node:url";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  optimizeDeps: {
    include: ["@testing-library/jest-dom/matchers"],
  },
  server: {
    fs: {
      strict: false,
      allow: [dirname, path.join(dirname, "node_modules")],
    },
  },
  test: {
    globals: true,
    exclude: ["tests/**", "node_modules/**", ".next/**"],
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      enabled: true,
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "coverage",
      include: ["src/**/*"],
      exclude: [
        "src/**/*.{test,spec}.{js,ts,jsx,tsx}",
        "src/**/__tests__/**",
        "src/test/**",
        "src/**/*.stories.{js,ts,jsx,tsx}",
        "src/instrumentation-client.ts",
        "src/instrumentation.ts",
        "src/lib/db/schema.ts",
        "src/lib/db/types.ts",
        "src/lib/db/errors.ts",
        "src/flags.ts",
        "src/app/.well-known/vercel/flags/route.ts",
        "src/lib/services/mockChatService.ts",
        "src/components/organisms/chatWrapper/**",
        "src/lib/explore/graph/**",
        "src/lib/explore/llms/mockLLM/**",
        "src/lib/explore/tools/ragGraphSearchTool/**",
        "src/lib/explore/maps.ts",
        "src/lib/explore/types.ts",
        "src/lib/explore/tools/mockRag/**",
        "src/lib/neo4j/index.ts",
        "src/lib/neo4j/seed/index.ts",
        "src/lib/neo4j/data/cvData.ts",
        "src/lib/neo4j/seed/seedNeo4j.ts",
        "src/lib/neo4j/models/**",
        "src/lib/neo4j/relationships/**",
      ],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
      reportOnFailure: true,
    },
    clearMocks: true,
    passWithNoTests: true,
    projects: [
      {
        extends: true,
        test: {
          name: "all",
          include: ["src/**/*.{test,spec}.{js,ts,jsx,tsx}"],
          exclude: ["src/stories/**"],
        },
      },
      {
        extends: true,
        plugins: [
          storybookTest({
            configDir: path.join(dirname, ".storybook"),
          }),
        ],
        optimizeDeps: {
          include: [
            "react",
            "react-dom",
            "react-dom/client",
            "react/jsx-runtime",
            "react/jsx-dev-runtime",
            "@storybook/react",
            "@storybook/addon-a11y/preview",
          ],
        },
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: "playwright",
            instances: [
              {
                browser: "chromium",
              },
            ],
          },
          setupFiles: [".storybook/vitest.setup.ts"],
          testTimeout: process.env.CI === "true" ? 30000 : 10000,
          hookTimeout: process.env.CI === "true" ? 30000 : 10000,
          retry: process.env.CI === "true" ? 2 : 0,
          isolate: false,
          pool: "threads",
        },
      },
    ],
  },
});
