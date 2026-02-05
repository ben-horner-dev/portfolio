import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AgentConfig } from "@/lib/explore/types";
import { Metric, useConfigState } from "./useConfigState";

const mockConfig: AgentConfig = {
  model: "gpt-4",
  temperature: 0.7,
  maxTokens: 1000,
} as unknown as AgentConfig;

describe("useConfigState", () => {
  let setEditedConfig: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    setEditedConfig = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return initial state values", () => {
    const { result } = renderHook(() =>
      useConfigState(
        mockConfig,
        "https://branch.url",
        setEditedConfig,
        mockConfig,
      ),
    );

    expect(result.current.evaluate).toBe(false);
    expect(result.current.progress).toBe(0);
    expect(result.current.percentage).toBe(0);
    expect(result.current.total).toBe(0);
    expect(result.current.evalError).toBeNull();
    expect(result.current.decision).toBeUndefined();
    expect(result.current.metricType).toBe(Metric.RAG);
  });

  it("should update field when updateField is called", () => {
    const { result } = renderHook(() =>
      useConfigState(
        mockConfig,
        "https://branch.url",
        setEditedConfig,
        mockConfig,
      ),
    );

    act(() => {
      result.current.updateField("temperature", 0.9);
    });

    expect(setEditedConfig).toHaveBeenCalledWith(expect.any(Function));

    const updateFn = setEditedConfig.mock.calls[0][0] as (
      prev: AgentConfig,
    ) => AgentConfig;
    const updatedConfig = updateFn(mockConfig);
    expect(updatedConfig).toEqual({ ...mockConfig, temperature: 0.9 });
  });

  it("should reset config when resetConfig is called", () => {
    const { result } = renderHook(() =>
      useConfigState(
        mockConfig,
        "https://branch.url",
        setEditedConfig,
        mockConfig,
      ),
    );

    act(() => {
      result.current.resetConfig();
    });

    expect(setEditedConfig).toHaveBeenCalledWith(mockConfig);
  });

  it("should set evaluation state when handleEvaluate is called", () => {
    const { result } = renderHook(() =>
      useConfigState(
        mockConfig,
        "https://branch.url",
        setEditedConfig,
        mockConfig,
      ),
    );

    act(() => {
      result.current.handleEvaluate(10);
    });

    expect(result.current.evaluate).toBe(true);
    expect(result.current.total).toBe(10);
    expect(result.current.progress).toBe(0);
  });

  it("should use default size of 100 when handleEvaluate is called without size", () => {
    const { result } = renderHook(() =>
      useConfigState(
        mockConfig,
        "https://branch.url",
        setEditedConfig,
        mockConfig,
      ),
    );

    act(() => {
      result.current.handleEvaluate();
    });

    expect(result.current.total).toBe(100);
  });

  it("should complete evaluation with default size when handleEvaluate is called without size", () => {
    const { result } = renderHook(() =>
      useConfigState(
        mockConfig,
        "https://branch.url",
        setEditedConfig,
        mockConfig,
      ),
    );

    act(() => {
      result.current.handleEvaluate();
    });

    expect(result.current.total).toBe(100);
    expect(result.current.evaluate).toBe(true);

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(result.current.progress).toBe(100);
    expect(result.current.evaluate).toBe(false);
    expect(result.current.decision).toBe("Evaluation complete (mock)");
  });

  it("should update progress during evaluation simulation", () => {
    const { result } = renderHook(() =>
      useConfigState(
        mockConfig,
        "https://branch.url",
        setEditedConfig,
        mockConfig,
      ),
    );

    act(() => {
      result.current.handleEvaluate(5);
    });

    expect(result.current.progress).toBe(0);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.progress).toBe(1);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.progress).toBe(2);
  });

  it("should complete evaluation and set decision when progress reaches total", () => {
    const { result } = renderHook(() =>
      useConfigState(
        mockConfig,
        "https://branch.url",
        setEditedConfig,
        mockConfig,
      ),
    );

    act(() => {
      result.current.handleEvaluate(3);
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.progress).toBe(3);
    expect(result.current.evaluate).toBe(false);
    expect(result.current.decision).toBe("Evaluation complete (mock)");
  });

  it("should calculate percentage correctly", () => {
    const { result } = renderHook(() =>
      useConfigState(
        mockConfig,
        "https://branch.url",
        setEditedConfig,
        mockConfig,
      ),
    );

    act(() => {
      result.current.handleEvaluate(10);
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.progress).toBe(5);
    expect(result.current.percentage).toBe(50);
  });

  it("should allow setting evalError", () => {
    const { result } = renderHook(() =>
      useConfigState(
        mockConfig,
        "https://branch.url",
        setEditedConfig,
        mockConfig,
      ),
    );

    act(() => {
      result.current.setEvalError("Test error");
    });

    expect(result.current.evalError).toBe("Test error");
  });

  it("should allow setting decision", () => {
    const { result } = renderHook(() =>
      useConfigState(
        mockConfig,
        "https://branch.url",
        setEditedConfig,
        mockConfig,
      ),
    );

    act(() => {
      result.current.setDecision("Custom decision");
    });

    expect(result.current.decision).toBe("Custom decision");
  });

  it("should allow setting metricType", () => {
    const { result } = renderHook(() =>
      useConfigState(
        mockConfig,
        "https://branch.url",
        setEditedConfig,
        mockConfig,
      ),
    );

    act(() => {
      result.current.setMetricType(Metric.GENERATION);
    });

    expect(result.current.metricType).toBe(Metric.GENERATION);
  });
});
