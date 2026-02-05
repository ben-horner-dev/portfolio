import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EvaluationField } from "./evaluationField";

vi.mock("@/components/atoms/slider", () => ({
  Slider: vi.fn(
    ({
      value,
      onValueChange,
      min,
      max,
      disabled,
      "aria-label": ariaLabel,
      className,
    }: {
      value: number[];
      onValueChange: (values: number[]) => void;
      min: number;
      max: number;
      disabled?: boolean;
      "aria-label"?: string;
      className?: string;
    }) => (
      <div data-testid="slider-container" className={className}>
        <input
          type="range"
          value={value[0]}
          onChange={(e) => onValueChange([Number(e.target.value)])}
          min={min}
          max={max}
          disabled={disabled}
          aria-label={ariaLabel}
          data-testid="slider"
        />
      </div>
    ),
  ),
}));

describe("EvaluationField", () => {
  let mockOnChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockOnChange = vi.fn();
  });

  it("renders the label", () => {
    render(
      <EvaluationField label="Test Label" value={3} onChange={mockOnChange} />,
    );

    expect(screen.getByText("Test Label")).toBeInTheDocument();
  });

  it("displays the current value", () => {
    render(
      <EvaluationField label="Rating" value={4} onChange={mockOnChange} />,
    );

    expect(screen.getByText("4/5")).toBeInTheDocument();
  });

  it("displays value with custom max", () => {
    render(
      <EvaluationField
        label="Rating"
        value={7}
        onChange={mockOnChange}
        max={10}
      />,
    );

    expect(screen.getByText("7/10")).toBeInTheDocument();
  });

  it("calls onChange when slider value changes", () => {
    render(
      <EvaluationField label="Rating" value={3} onChange={mockOnChange} />,
    );

    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "5" } });

    expect(mockOnChange).toHaveBeenCalledWith(5);
  });

  it("renders with disabled state", () => {
    render(
      <EvaluationField
        label="Rating"
        value={3}
        onChange={mockOnChange}
        disabled={true}
      />,
    );

    const slider = screen.getByRole("slider");
    expect(slider).toBeDisabled();
  });

  it("applies opacity to label when disabled", () => {
    render(
      <EvaluationField
        label="Rating"
        value={3}
        onChange={mockOnChange}
        disabled={true}
      />,
    );

    const label = screen.getByText("Rating");
    expect(label).toHaveClass("opacity-50");
  });

  it("displays error message when provided", () => {
    render(
      <EvaluationField
        label="Rating"
        value={3}
        onChange={mockOnChange}
        error="Invalid rating"
      />,
    );

    expect(screen.getByText("Invalid rating")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("does not display error message when not provided", () => {
    render(
      <EvaluationField label="Rating" value={3} onChange={mockOnChange} />,
    );

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <EvaluationField
        label="Rating"
        value={3}
        onChange={mockOnChange}
        className="custom-class"
      />,
    );

    const fieldContainer = container.querySelector(
      '[data-slot="evaluation-field"]',
    );
    expect(fieldContainer).toHaveClass("custom-class");
  });

  it("renders with data-slot attribute", () => {
    const { container } = render(
      <EvaluationField label="Rating" value={3} onChange={mockOnChange} />,
    );

    const fieldContainer = container.querySelector(
      '[data-slot="evaluation-field"]',
    );
    expect(fieldContainer).toBeInTheDocument();
  });

  it("creates accessible label id from label text", () => {
    render(
      <EvaluationField
        label="Information Accuracy"
        value={3}
        onChange={mockOnChange}
      />,
    );

    const label = screen.getByText("Information Accuracy");
    expect(label).toHaveAttribute("id", "information-accuracy-label");
  });

  it("uses default min and max values", () => {
    render(
      <EvaluationField label="Rating" value={3} onChange={mockOnChange} />,
    );

    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("min", "1");
    expect(slider).toHaveAttribute("max", "5");
  });

  it("uses custom min and max values", () => {
    render(
      <EvaluationField
        label="Rating"
        value={5}
        onChange={mockOnChange}
        min={0}
        max={10}
      />,
    );

    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("min", "0");
    expect(slider).toHaveAttribute("max", "10");
  });

  it("has aria-live attribute for value display", () => {
    render(
      <EvaluationField label="Rating" value={3} onChange={mockOnChange} />,
    );

    const valueDisplay = screen.getByText("3/5");
    expect(valueDisplay).toHaveAttribute("aria-live", "polite");
  });

  it("does not call onChange when slider returns empty array", async () => {
    const { Slider } = vi.mocked(await import("@/components/atoms/slider"));

    let capturedOnValueChange: (values: number[]) => void = () => {};

    vi.mocked(Slider).mockImplementation(({ onValueChange }) => {
      capturedOnValueChange = onValueChange as (values: number[]) => void;
      return <div data-testid="mock-slider" />;
    });

    render(
      <EvaluationField label="Rating" value={3} onChange={mockOnChange} />,
    );

    capturedOnValueChange([]);
    expect(mockOnChange).not.toHaveBeenCalled();
  });
});
