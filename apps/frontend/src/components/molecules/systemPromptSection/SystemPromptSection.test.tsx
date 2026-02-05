import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SystemPromptSection } from "./SystemPromptSection";

vi.mock("@/components/atoms/h3", () => ({
  TypographyH3: vi.fn(({ text }: { text: string }) => (
    <h3 data-testid="typography-h3">{text}</h3>
  )),
}));

describe("SystemPromptSection", () => {
  let mockOnChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockOnChange = vi.fn();
  });

  it("renders the section header", () => {
    render(<SystemPromptSection value="" onChange={mockOnChange} />);

    expect(screen.getByText("System Prompt")).toBeInTheDocument();
  });

  it("renders the textarea with the provided value", () => {
    render(
      <SystemPromptSection
        value="You are a helpful assistant."
        onChange={mockOnChange}
      />,
    );

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveValue("You are a helpful assistant.");
  });

  it("calls onChange when textarea value changes", () => {
    render(<SystemPromptSection value="" onChange={mockOnChange} />);

    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "New prompt" } });

    expect(mockOnChange).toHaveBeenCalledWith("New prompt");
  });

  it("renders with placeholder text", () => {
    render(<SystemPromptSection value="" onChange={mockOnChange} />);

    const textarea = screen.getByPlaceholderText("Enter system prompt...");
    expect(textarea).toBeInTheDocument();
  });

  it("renders textarea with empty value", () => {
    render(<SystemPromptSection value="" onChange={mockOnChange} />);

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveValue("");
  });

  it("renders with styling classes", () => {
    const { container } = render(
      <SystemPromptSection value="" onChange={mockOnChange} />,
    );

    const section = container.firstChild as HTMLElement;
    expect(section).toHaveClass("bg-card/30");
    expect(section).toHaveClass("backdrop-blur-sm");
    expect(section).toHaveClass("rounded-xl");
  });

  it("handles multi-line text input", () => {
    const multiLineText = "Line 1\nLine 2\nLine 3";
    render(
      <SystemPromptSection value={multiLineText} onChange={mockOnChange} />,
    );

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveValue(multiLineText);
  });

  it("handles special characters in text", () => {
    const specialText = "You are a <helpful> assistant & guide.";
    render(<SystemPromptSection value={specialText} onChange={mockOnChange} />);

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveValue(specialText);
  });
});
