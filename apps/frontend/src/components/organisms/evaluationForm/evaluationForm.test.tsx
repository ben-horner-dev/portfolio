import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DrizzleHumanEvaluationUpdateMetrics } from "@/lib/db/types";
import { EvaluationForm } from "./evaluationForm";

vi.mock("@/lib/hooks/useEvaluationForm", () => ({
  useEvaluationForm: vi.fn(),
}));

vi.mock("@/components/molecules/evaluationField", () => ({
  EvaluationField: vi.fn(
    ({
      label,
      value,
      onChange,
      error,
      disabled,
    }: {
      label: string;
      value: number;
      onChange: (value: number) => void;
      error?: string;
      disabled?: boolean;
    }) => (
      <div
        data-testid={`evaluation-field-${label
          .toLowerCase()
          .replace(/\s+/g, "-")}`}
      >
        <span>{label}</span>
        <span data-testid="value">{value}/5</span>
        <input
          type="range"
          aria-label={label}
          aria-valuemin={1}
          aria-valuemax={5}
          aria-valuenow={value}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          data-disabled={disabled ? "" : undefined}
        />
        {error && <span data-testid="error">{error}</span>}
      </div>
    ),
  ),
}));

const mockInitialValues: DrizzleHumanEvaluationUpdateMetrics = {
  informationAccuracy: 3,
  responseHelpfulness: 3,
  responseRelevance: 3,
  responseCompleteness: 3,
  conversationalQuality: 3,
  overallSatisfaction: 3,
};

describe("EvaluationForm", () => {
  let mockOnSave: ReturnType<typeof vi.fn>;
  let mockSetFieldValue: ReturnType<typeof vi.fn>;
  let mockSave: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    cleanup();
    vi.clearAllMocks();

    mockOnSave = vi.fn().mockResolvedValue(undefined);
    mockSetFieldValue = vi.fn();
    mockSave = vi.fn();

    const { useEvaluationForm } = await import("@/lib/hooks/useEvaluationForm");
    vi.mocked(useEvaluationForm).mockReturnValue({
      values: mockInitialValues,
      isLoading: false,
      saveStatus: "idle",
      errorMessage: "",
      validationErrors: {},
      setFieldValue: mockSetFieldValue,
      validate: vi.fn(() => true),
      save: mockSave,
      resetStatus: vi.fn(),
    });
  });

  it("renders the form header", () => {
    render(<EvaluationForm onSave={mockOnSave} />);

    expect(
      screen.getByText("Help improve this AI assistant"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Quick feedback helps Ben make this experience better"),
    ).toBeInTheDocument();
  });

  it("renders all evaluation fields", () => {
    render(<EvaluationForm onSave={mockOnSave} />);

    expect(screen.getByText("Information Accuracy")).toBeInTheDocument();
    expect(screen.getByText("Response Helpfulness")).toBeInTheDocument();
    expect(screen.getByText("Response Relevance")).toBeInTheDocument();
    expect(screen.getByText("Response Completeness")).toBeInTheDocument();
    expect(screen.getByText("Conversational Quality")).toBeInTheDocument();
    expect(screen.getByText("Overall Satisfaction")).toBeInTheDocument();
  });

  it("renders the save button", () => {
    render(<EvaluationForm onSave={mockOnSave} />);

    expect(
      screen.getByRole("button", { name: "Save Evaluation" }),
    ).toBeInTheDocument();
  });

  it("shows loading state when saving", async () => {
    const { useEvaluationForm } = await import("@/lib/hooks/useEvaluationForm");
    vi.mocked(useEvaluationForm).mockReturnValue({
      values: mockInitialValues,
      isLoading: true,
      saveStatus: "idle",
      errorMessage: "",
      validationErrors: {},
      setFieldValue: mockSetFieldValue,
      validate: vi.fn(() => true),
      save: mockSave,
      resetStatus: vi.fn(),
    });

    render(<EvaluationForm onSave={mockOnSave} />);

    expect(
      screen.getByRole("button", { name: "Saving..." }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Saving..." })).toBeDisabled();
  });

  it("calls save when save button is clicked", () => {
    render(<EvaluationForm onSave={mockOnSave} />);

    const saveButton = screen.getByRole("button", { name: "Save Evaluation" });
    fireEvent.click(saveButton);

    expect(mockSave).toHaveBeenCalled();
  });

  it("calls setFieldValue when slider value changes", () => {
    render(<EvaluationForm onSave={mockOnSave} />);

    const sliders = screen.getAllByRole("slider");
    fireEvent.change(sliders[0], { target: { value: "5" } });

    expect(mockSetFieldValue).toHaveBeenCalledWith("informationAccuracy", 5);
  });

  it("disables save button when not all ratings are valid", async () => {
    const { useEvaluationForm } = await import("@/lib/hooks/useEvaluationForm");
    vi.mocked(useEvaluationForm).mockReturnValue({
      values: {
        ...mockInitialValues,
        informationAccuracy: 0, // Invalid rating
      },
      isLoading: false,
      saveStatus: "idle",
      errorMessage: "",
      validationErrors: {},
      setFieldValue: mockSetFieldValue,
      validate: vi.fn(() => true),
      save: mockSave,
      resetStatus: vi.fn(),
    });

    render(<EvaluationForm onSave={mockOnSave} />);

    expect(
      screen.getByRole("button", { name: "Save Evaluation" }),
    ).toBeDisabled();
  });

  it("passes initialValues to useEvaluationForm", async () => {
    const customInitialValues: DrizzleHumanEvaluationUpdateMetrics = {
      informationAccuracy: 5,
      responseHelpfulness: 5,
      responseRelevance: 5,
      responseCompleteness: 5,
      conversationalQuality: 5,
      overallSatisfaction: 5,
    };

    const { useEvaluationForm } = await import("@/lib/hooks/useEvaluationForm");

    render(
      <EvaluationForm
        onSave={mockOnSave}
        initialValues={customInitialValues}
      />,
    );

    expect(useEvaluationForm).toHaveBeenCalledWith({
      initialValues: customInitialValues,
      onSave: mockOnSave,
    });
  });

  it("uses default values when initialValues not provided", async () => {
    const { useEvaluationForm } = await import("@/lib/hooks/useEvaluationForm");

    render(<EvaluationForm onSave={mockOnSave} />);

    expect(useEvaluationForm).toHaveBeenCalledWith({
      initialValues: {
        informationAccuracy: 3,
        responseHelpfulness: 3,
        responseRelevance: 3,
        responseCompleteness: 3,
        conversationalQuality: 3,
        overallSatisfaction: 3,
      },
      onSave: mockOnSave,
    });
  });

  it("applies custom className", () => {
    render(<EvaluationForm onSave={mockOnSave} className="custom-class" />);

    const formElement = document.querySelector('[data-slot="evaluation-form"]');
    expect(formElement).toHaveClass("custom-class");
  });

  it("shows success status after saving", async () => {
    const { useEvaluationForm } = await import("@/lib/hooks/useEvaluationForm");
    vi.mocked(useEvaluationForm).mockReturnValue({
      values: mockInitialValues,
      isLoading: false,
      saveStatus: "success",
      errorMessage: "",
      validationErrors: {},
      setFieldValue: mockSetFieldValue,
      validate: vi.fn(() => true),
      save: mockSave,
      resetStatus: vi.fn(),
    });

    render(<EvaluationForm onSave={mockOnSave} />);

    expect(
      screen.getByText("Evaluation saved successfully!"),
    ).toBeInTheDocument();
  });

  it("shows error status with error message", async () => {
    const { useEvaluationForm } = await import("@/lib/hooks/useEvaluationForm");
    vi.mocked(useEvaluationForm).mockReturnValue({
      values: mockInitialValues,
      isLoading: false,
      saveStatus: "error",
      errorMessage: "Network error",
      validationErrors: {},
      setFieldValue: mockSetFieldValue,
      validate: vi.fn(() => true),
      save: mockSave,
      resetStatus: vi.fn(),
    });

    render(<EvaluationForm onSave={mockOnSave} />);

    expect(screen.getByText("Network error")).toBeInTheDocument();
  });

  it("shows local-dev status", async () => {
    const { useEvaluationForm } = await import("@/lib/hooks/useEvaluationForm");
    vi.mocked(useEvaluationForm).mockReturnValue({
      values: mockInitialValues,
      isLoading: false,
      saveStatus: "local-dev",
      errorMessage: "",
      validationErrors: {},
      setFieldValue: mockSetFieldValue,
      validate: vi.fn(() => true),
      save: mockSave,
      resetStatus: vi.fn(),
    });

    render(<EvaluationForm onSave={mockOnSave} />);

    expect(
      screen.getByText(
        "Local development mode - evaluation not saved (will work in preview deployments)",
      ),
    ).toBeInTheDocument();
  });

  it("disables fields when loading", async () => {
    const { useEvaluationForm } = await import("@/lib/hooks/useEvaluationForm");
    vi.mocked(useEvaluationForm).mockReturnValue({
      values: mockInitialValues,
      isLoading: true,
      saveStatus: "idle",
      errorMessage: "",
      validationErrors: {},
      setFieldValue: mockSetFieldValue,
      validate: vi.fn(() => true),
      save: mockSave,
      resetStatus: vi.fn(),
    });

    render(<EvaluationForm onSave={mockOnSave} />);

    const sliders = screen.getAllByRole("slider");
    sliders.forEach((slider) => {
      expect(slider).toHaveAttribute("data-disabled");
    });
  });

  it("passes validation errors to evaluation fields", async () => {
    const { useEvaluationForm } = await import("@/lib/hooks/useEvaluationForm");
    vi.mocked(useEvaluationForm).mockReturnValue({
      values: mockInitialValues,
      isLoading: false,
      saveStatus: "idle",
      errorMessage: "",
      validationErrors: {
        informationAccuracy: "Rating must be between 1 and 5",
      },
      setFieldValue: mockSetFieldValue,
      validate: vi.fn(() => false),
      save: mockSave,
      resetStatus: vi.fn(),
    });

    render(<EvaluationForm onSave={mockOnSave} />);

    expect(
      screen.getByText("Rating must be between 1 and 5"),
    ).toBeInTheDocument();
  });

  it("renders evaluation-form data slot", () => {
    render(<EvaluationForm onSave={mockOnSave} />);

    const formElement = document.querySelector('[data-slot="evaluation-form"]');
    expect(formElement).toBeInTheDocument();
  });

  it("enables save button when all ratings are valid", async () => {
    const { useEvaluationForm } = await import("@/lib/hooks/useEvaluationForm");
    vi.mocked(useEvaluationForm).mockReturnValue({
      values: {
        informationAccuracy: 4,
        responseHelpfulness: 3,
        responseRelevance: 5,
        responseCompleteness: 2,
        conversationalQuality: 1,
        overallSatisfaction: 4,
      },
      isLoading: false,
      saveStatus: "idle",
      errorMessage: "",
      validationErrors: {},
      setFieldValue: mockSetFieldValue,
      validate: vi.fn(() => true),
      save: mockSave,
      resetStatus: vi.fn(),
    });

    render(<EvaluationForm onSave={mockOnSave} />);

    expect(
      screen.getByRole("button", { name: "Save Evaluation" }),
    ).not.toBeDisabled();
  });
});
