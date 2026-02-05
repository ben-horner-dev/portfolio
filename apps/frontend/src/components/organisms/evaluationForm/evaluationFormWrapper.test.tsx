import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { DrizzleHumanEvaluationUpdateMetrics } from "@/lib/db/types";

const mockEvaluationFormFn = vi.hoisted(() =>
  vi.fn(
    ({
      onSave,
      className,
    }: {
      onSave: (
        values: DrizzleHumanEvaluationUpdateMetrics,
      ) => Promise<{ isLocalDev: boolean } | undefined>;
      className?: string;
    }) => (
      <div data-testid="mock-evaluation-form" className={className}>
        <button
          type="button"
          data-testid="trigger-save"
          onClick={() => {
            const mockValues: DrizzleHumanEvaluationUpdateMetrics = {
              informationAccuracy: 4,
              responseHelpfulness: 4,
              responseRelevance: 4,
              responseCompleteness: 4,
              conversationalQuality: 4,
              overallSatisfaction: 4,
            };
            onSave(mockValues);
          }}
        >
          Save
        </button>
      </div>
    ),
  ),
);

vi.mock("./evaluationForm", () => ({
  EvaluationForm: mockEvaluationFormFn,
}));

import { EvaluationFormWrapper } from "./evaluationFormWrapper";

describe("EvaluationFormWrapper", () => {
  const originalLocation = window.location;
  const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  const originalEnv = process.env.NEXT_PUBLIC_METRICS_DATABASE_URI;

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    consoleSpy.mockClear();
    mockEvaluationFormFn.mockClear();
    mockEvaluationFormFn.mockImplementation(({ onSave, className }) => (
      <div data-testid="mock-evaluation-form" className={className}>
        <button
          type="button"
          data-testid="trigger-save"
          onClick={() => {
            const mockValues: DrizzleHumanEvaluationUpdateMetrics = {
              informationAccuracy: 4,
              responseHelpfulness: 4,
              responseRelevance: 4,
              responseCompleteness: 4,
              conversationalQuality: 4,
              overallSatisfaction: 4,
            };
            onSave(mockValues);
          }}
        >
          Save
        </button>
      </div>
    ));

    Object.defineProperty(window, "location", {
      value: { hostname: "example.com" },
      writable: true,
    });

    delete process.env.NEXT_PUBLIC_METRICS_DATABASE_URI;
  });

  afterAll(() => {
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
    });
    process.env.NEXT_PUBLIC_METRICS_DATABASE_URI = originalEnv;
    consoleSpy.mockRestore();
  });

  it("renders EvaluationForm component", () => {
    render(
      <EvaluationFormWrapper configId="test-config" evaluatorId="test-user" />,
    );

    expect(screen.getByTestId("mock-evaluation-form")).toBeInTheDocument();
  });

  it("passes className to EvaluationForm", () => {
    render(
      <EvaluationFormWrapper
        configId="test-config"
        evaluatorId="test-user"
        className="custom-wrapper-class"
      />,
    );

    const form = screen.getByTestId("mock-evaluation-form");
    expect(form).toHaveClass("h-full");
    expect(form).toHaveClass("custom-wrapper-class");
  });

  it("logs evaluation data when save is triggered", async () => {
    render(
      <EvaluationFormWrapper configId="test-config" evaluatorId="test-user" />,
    );

    const saveButton = screen.getByTestId("trigger-save");
    saveButton.click();

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Evaluation submitted:", {
        configId: "test-config",
        evaluatorId: "test-user",
        informationAccuracy: 4,
        responseHelpfulness: 4,
        responseRelevance: 4,
        responseCompleteness: 4,
        conversationalQuality: 4,
        overallSatisfaction: 4,
      });
    });
  });

  it("returns isLocalDev: true when on localhost without database URI", async () => {
    Object.defineProperty(window, "location", {
      value: { hostname: "localhost" },
      writable: true,
    });
    delete process.env.NEXT_PUBLIC_METRICS_DATABASE_URI;

    let capturedOnSave: (
      values: DrizzleHumanEvaluationUpdateMetrics,
    ) => Promise<{ isLocalDev: boolean } | undefined>;

    mockEvaluationFormFn.mockImplementation(({ onSave }) => {
      capturedOnSave = onSave;
      return <div data-testid="mock-evaluation-form" />;
    });

    render(
      <EvaluationFormWrapper configId="test-config" evaluatorId="test-user" />,
    );

    const result = await capturedOnSave?.({
      informationAccuracy: 4,
      responseHelpfulness: 4,
      responseRelevance: 4,
      responseCompleteness: 4,
      conversationalQuality: 4,
      overallSatisfaction: 4,
    });

    expect(result).toEqual({ isLocalDev: true });
  });

  it("returns isLocalDev: false when not on localhost", async () => {
    Object.defineProperty(window, "location", {
      value: { hostname: "production.example.com" },
      writable: true,
    });

    let capturedOnSave: (
      values: DrizzleHumanEvaluationUpdateMetrics,
    ) => Promise<{ isLocalDev: boolean } | undefined>;

    mockEvaluationFormFn.mockImplementation(({ onSave }) => {
      capturedOnSave = onSave;
      return <div data-testid="mock-evaluation-form" />;
    });

    render(
      <EvaluationFormWrapper configId="test-config" evaluatorId="test-user" />,
    );

    const result = await capturedOnSave?.({
      informationAccuracy: 4,
      responseHelpfulness: 4,
      responseRelevance: 4,
      responseCompleteness: 4,
      conversationalQuality: 4,
      overallSatisfaction: 4,
    });

    expect(result).toEqual({ isLocalDev: false });
  });

  it("returns isLocalDev: false when on localhost with database URI", async () => {
    Object.defineProperty(window, "location", {
      value: { hostname: "localhost" },
      writable: true,
    });
    process.env.NEXT_PUBLIC_METRICS_DATABASE_URI =
      "postgresql://localhost/test";

    let capturedOnSave: (
      values: DrizzleHumanEvaluationUpdateMetrics,
    ) => Promise<{ isLocalDev: boolean } | undefined>;

    mockEvaluationFormFn.mockImplementation(({ onSave }) => {
      capturedOnSave = onSave;
      return <div data-testid="mock-evaluation-form" />;
    });

    render(
      <EvaluationFormWrapper configId="test-config" evaluatorId="test-user" />,
    );

    const result = await capturedOnSave?.({
      informationAccuracy: 4,
      responseHelpfulness: 4,
      responseRelevance: 4,
      responseCompleteness: 4,
      conversationalQuality: 4,
      overallSatisfaction: 4,
    });

    expect(result).toEqual({ isLocalDev: false });
  });

  it("includes configId and evaluatorId in logged data", async () => {
    const customConfigId = "my-custom-config-123";
    const customEvaluatorId = "evaluator-456";

    render(
      <EvaluationFormWrapper
        configId={customConfigId}
        evaluatorId={customEvaluatorId}
      />,
    );

    const saveButton = screen.getByTestId("trigger-save");
    saveButton.click();

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Evaluation submitted:",
        expect.objectContaining({
          configId: customConfigId,
          evaluatorId: customEvaluatorId,
        }),
      );
    });
  });

  it("applies h-full class to form", () => {
    render(
      <EvaluationFormWrapper configId="test-config" evaluatorId="test-user" />,
    );

    const form = screen.getByTestId("mock-evaluation-form");
    expect(form).toHaveClass("h-full");
  });

  it("handles undefined className gracefully", () => {
    render(
      <EvaluationFormWrapper configId="test-config" evaluatorId="test-user" />,
    );

    const form = screen.getByTestId("mock-evaluation-form");
    expect(form.className).toContain("h-full");
  });
});
