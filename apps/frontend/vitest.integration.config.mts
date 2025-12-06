import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["src/**/*.integration.spec.{ts,tsx}"],
    exclude: ["src/**/*.stories.{js,ts,jsx,tsx}"],
    testTimeout: 30000,
    hookTimeout: 30000,
    clearMocks: true,
    sequence: {
      hooks: "list",
    },
  },
});
