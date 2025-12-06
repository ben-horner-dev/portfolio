import path from "node:path";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/nextjs-vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest",
  ],
  framework: {
    name: "@storybook/nextjs-vite",
    options: {},
  },
  viteFinal: async (config) => {
    config.cacheDir = path.join(
      __dirname,
      "../node_modules/.cache/storybook-vite",
    );

    config.optimizeDeps = {
      ...config.optimizeDeps,
      include: ["react", "react-dom", "axe-core"],
      force: process.env.CI === "true",
    };

    config.define = {
      ...config.define,
      "process.env.NODE_ENV": JSON.stringify("development"),
    };

    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        "next/image": path.resolve(__dirname, "./mock-image.tsx"),
        "next/link": path.resolve(__dirname, "./mock-link.tsx"),
      },
    };

    if (process.env.CI === "true") {
      config.build = {
        ...config.build,
        rollupOptions: {
          ...config.build?.rollupOptions,
          output: {
            ...config.build?.rollupOptions?.output,
            manualChunks: undefined,
          },
        },
      };
    }

    return config;
  },
};
export default config;
