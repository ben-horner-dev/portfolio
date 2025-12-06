import * as matchers from "@testing-library/jest-dom/matchers";
import { expect, vi } from "vitest";

expect.extend(matchers);

vi.mock("@/flags", () => ({
  chatEvalFlag: vi.fn(),
  createFeatureFlag: vi.fn(),
}));

vi.mock("@ai-sdk/rsc", () => ({
  readStreamableValue: vi.fn(),
  createStreamableValue: vi.fn(),
}));
