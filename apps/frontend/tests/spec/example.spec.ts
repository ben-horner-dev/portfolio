import { existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "@playwright/test";
import { runFeature } from "./runner";

const __dirname = dirname(fileURLToPath(import.meta.url));
const featuresDir = join(__dirname, ".", "features");

const featureFiles = existsSync(featuresDir)
  ? readdirSync(featuresDir).filter((f) => f.endsWith(".yaml"))
  : [];

if (featureFiles.length === 0) {
  test.skip("no feature files found", () => {});
} else {
  for (const file of featureFiles) {
    runFeature(join(featuresDir, file));
  }
}
