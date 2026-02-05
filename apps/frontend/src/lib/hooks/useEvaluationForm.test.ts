import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DrizzleHumanEvaluationUpdateMetrics } from "@/lib/db/types";
import { useEvaluationForm } from "./useEvaluationForm";

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  },
}));

const mockInitialValues: DrizzleHumanEvaluationUpdateMetrics = {
  informationAccuracy: 3,
  responseHelpfulness: 3,
  responseRelevance: 3,
  responseCompleteness: 3,
  conversationalQuality: 3,
  overallSatisfaction: 3,
};

describe("useEvaluationForm", () => {
  let mockOnSave: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSave = vi.fn().mockResolvedValue(undefined);
  });

  it("should return initial values", () => {
    const { result } = renderHook(() =>
      useEvaluationForm({
        initialValues: mockInitialValues,
        onSave: mockOnSave,
      }),
    );

    expect(result.current.values).toEqual(mockInitialValues);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.saveStatus).toBe("idle");
    expect(result.current.errorMessage).toBe("");
    expect(result.current.validationErrors).toEqual({});
  });

  it("should update field value", () => {
    const { result } = renderHook(() =>
      useEvaluationForm({
        initialValues: mockInitialValues,
        onSave: mockOnSave,
      }),
    );

    act(() => {
      result.current.setFieldValue("informationAccuracy", 5);
    });

    expect(result.current.values.informationAccuracy).toBe(5);
  });

  it("should clear validation error when field is updated", () => {
    const { result } = renderHook(() =>
      useEvaluationForm({
        initialValues: { ...mockInitialValues, informationAccuracy: 0 },
        onSave: mockOnSave,
      }),
    );

    act(() => {
      result.current.validate();
    });

    expect(result.current.validationErrors.informationAccuracy).toBeDefined();

    act(() => {
      result.current.setFieldValue("informationAccuracy", 3);
    });

    expect(result.current.validationErrors.informationAccuracy).toBeUndefined();
  });

  it("should reset saveStatus when field is updated after save", async () => {
    const { result } = renderHook(() =>
      useEvaluationForm({
        initialValues: mockInitialValues,
        onSave: mockOnSave,
      }),
    );

    await act(async () => {
      await result.current.save();
    });

    expect(result.current.saveStatus).toBe("success");

    act(() => {
      result.current.setFieldValue("informationAccuracy", 4);
    });

    expect(result.current.saveStatus).toBe("idle");
  });

  it("should validate all fields and return true for valid values", () => {
    const { result } = renderHook(() =>
      useEvaluationForm({
        initialValues: mockInitialValues,
        onSave: mockOnSave,
      }),
    );

    let isValid = false;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid).toBe(true);
    expect(result.current.validationErrors).toEqual({});
  });

  it("should validate and return false for invalid values", () => {
    const invalidValues: DrizzleHumanEvaluationUpdateMetrics = {
      informationAccuracy: 0,
      responseHelpfulness: 6,
      responseRelevance: 3,
      responseCompleteness: 3,
      conversationalQuality: 3,
      overallSatisfaction: 3,
    };

    const { result } = renderHook(() =>
      useEvaluationForm({
        initialValues: invalidValues,
        onSave: mockOnSave,
      }),
    );

    let isValid = true;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid).toBe(false);
    expect(result.current.validationErrors.informationAccuracy).toBeDefined();
    expect(result.current.validationErrors.responseHelpfulness).toBeDefined();
  });

  it("should save successfully with valid values", async () => {
    const { result } = renderHook(() =>
      useEvaluationForm({
        initialValues: mockInitialValues,
        onSave: mockOnSave,
      }),
    );

    await act(async () => {
      await result.current.save();
    });

    expect(mockOnSave).toHaveBeenCalledWith(mockInitialValues);
    expect(result.current.saveStatus).toBe("success");
    expect(result.current.isLoading).toBe(false);
  });

  it("should handle local dev mode response", async () => {
    mockOnSave.mockResolvedValue({ isLocalDev: true });

    const { result } = renderHook(() =>
      useEvaluationForm({
        initialValues: mockInitialValues,
        onSave: mockOnSave,
      }),
    );

    await act(async () => {
      await result.current.save();
    });

    expect(result.current.saveStatus).toBe("local-dev");
  });

  it("should handle save error", async () => {
    const error = new Error("Save failed");
    mockOnSave.mockRejectedValue(error);

    const { result } = renderHook(() =>
      useEvaluationForm({
        initialValues: mockInitialValues,
        onSave: mockOnSave,
      }),
    );

    await act(async () => {
      await result.current.save();
    });

    expect(result.current.saveStatus).toBe("error");
    expect(result.current.errorMessage).toBe("Save failed");
  });

  it("should handle non-Error save failure", async () => {
    mockOnSave.mockRejectedValue("Unknown error");

    const { result } = renderHook(() =>
      useEvaluationForm({
        initialValues: mockInitialValues,
        onSave: mockOnSave,
      }),
    );

    await act(async () => {
      await result.current.save();
    });

    expect(result.current.saveStatus).toBe("error");
    expect(result.current.errorMessage).toBe("Failed to save evaluation");
  });

  it("should not save with validation errors", async () => {
    const invalidValues: DrizzleHumanEvaluationUpdateMetrics = {
      informationAccuracy: 0,
      responseHelpfulness: 3,
      responseRelevance: 3,
      responseCompleteness: 3,
      conversationalQuality: 3,
      overallSatisfaction: 3,
    };

    const { result } = renderHook(() =>
      useEvaluationForm({
        initialValues: invalidValues,
        onSave: mockOnSave,
      }),
    );

    await act(async () => {
      await result.current.save();
    });

    expect(mockOnSave).not.toHaveBeenCalled();
    expect(result.current.errorMessage).toBe(
      "Please fix the validation errors before saving.",
    );
  });

  it("should reset status", () => {
    const { result } = renderHook(() =>
      useEvaluationForm({
        initialValues: { ...mockInitialValues, informationAccuracy: 0 },
        onSave: mockOnSave,
      }),
    );

    act(() => {
      result.current.validate();
    });

    expect(Object.keys(result.current.validationErrors).length).toBeGreaterThan(
      0,
    );

    act(() => {
      result.current.resetStatus();
    });

    expect(result.current.saveStatus).toBe("idle");
    expect(result.current.errorMessage).toBe("");
    expect(result.current.validationErrors).toEqual({});
  });
});
