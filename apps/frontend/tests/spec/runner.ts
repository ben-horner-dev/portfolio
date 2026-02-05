import { test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { parse } from "yaml";
import { autoValidate, steps, type Example, type TestContext } from "./steps";

export interface Scenario {
  name: string;
  given: string[];
  when: string[];
  then: string[];
  examples?: Example[];
}

export interface Spec {
  feature: string;
  viewport?: {
    width: number;
    height: number;
  };
  background?: {
    given?: string[];
  };
  scenarios: Scenario[];
}

export const loadSpec = (path: string): Spec =>
  parse(readFileSync(path, "utf8"));

export const createTestContext = (spec: Spec): TestContext => {
  const id = crypto.randomUUID().slice(0, 8);
  return { id, feature: spec.feature };
};

const getStep = (name: string) => {
  const step = steps[name];
  if (!step) {
    throw new Error(
      `Step not found: "${name}". Available steps: ${Object.keys(steps).join(", ")}`,
    );
  }
  return step;
};

export const runFeature = (specPath: string) => {
  const spec = loadSpec(specPath);

  test.describe(spec.feature, () => {
    if (spec.viewport) {
      test.use({ viewport: spec.viewport });
    }

    for (const scenario of spec.scenarios) {
      const examples = scenario.examples?.length ? scenario.examples : [{}];

      for (const example of examples) {
        const testName = example.desc
          ? `${scenario.name}: ${example.desc}`
          : scenario.name;

        test(testName, async ({ page }) => {
          const ctx = createTestContext(spec);

          console.log(`\n  📋 ${scenario.name}`);

          if (spec.background?.given) {
            console.log("     Background:");
            for (const stepName of spec.background.given) {
              console.log(`       • ${stepName}`);
              await getStep(stepName)(page, ctx, example);
            }
          }

          if (scenario.given?.length) {
            console.log("     Given:");
            for (const stepName of scenario.given) {
              console.log(`       • ${stepName}`);
              await getStep(stepName)(page, ctx, example);
            }
          }

          if (scenario.when?.length) {
            console.log("     When:");
            for (const stepName of scenario.when) {
              console.log(`       • ${stepName}`);
              await getStep(stepName)(page, ctx, example);
            }
          }

          if (scenario.then?.length) {
            console.log("     Then:");
            for (const stepName of scenario.then) {
              console.log(`       ✓ ${stepName}`);
              await getStep(stepName)(page, ctx, example);
            }
          }

          if (example.expect) {
            console.log(
              `     ✓ validate: ${Object.keys(example.expect).join(", ")}`,
            );
            await autoValidate(page, ctx, example);
          }
        });
      }
    }
  });
};
