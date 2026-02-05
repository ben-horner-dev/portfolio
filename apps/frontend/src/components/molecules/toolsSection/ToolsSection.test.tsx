import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ToolConfig } from "@/lib/explore/types";
import { ToolsSection } from "./ToolsSection";

vi.mock("@/components/atoms/h3", () => ({
  TypographyH3: vi.fn(({ text }: { text: string }) => (
    <h3 data-testid="typography-h3">{text}</h3>
  )),
}));

describe("ToolsSection", () => {
  let mockOnAddTool: ReturnType<typeof vi.fn>;
  let mockOnRemoveTool: ReturnType<typeof vi.fn>;

  const availableTools: ToolConfig[] = [
    { name: "search", description: "Search tool" },
    { name: "calculator", description: "Calculator tool" },
    { name: "weather", description: "Weather tool" },
  ];

  const selectedTools: ToolConfig[] = [
    { name: "search", description: "Search tool" },
  ];

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockOnAddTool = vi.fn();
    mockOnRemoveTool = vi.fn();
  });

  it("renders the section heading", () => {
    render(
      <ToolsSection
        availableTools={availableTools}
        selectedTools={selectedTools}
        onAddTool={mockOnAddTool}
        onRemoveTool={mockOnRemoveTool}
        heading="Available Tools"
      />,
    );

    expect(screen.getByText("Available Tools")).toBeInTheDocument();
  });

  it("renders selected tools", () => {
    render(
      <ToolsSection
        availableTools={availableTools}
        selectedTools={selectedTools}
        onAddTool={mockOnAddTool}
        onRemoveTool={mockOnRemoveTool}
        heading="Tools"
      />,
    );

    // "search" appears both in selected tools and in the dropdown
    const searchElements = screen.getAllByText("search");
    expect(searchElements.length).toBeGreaterThanOrEqual(1);
  });

  it("renders 'No tools selected' when no tools are selected", () => {
    render(
      <ToolsSection
        availableTools={availableTools}
        selectedTools={[]}
        onAddTool={mockOnAddTool}
        onRemoveTool={mockOnRemoveTool}
        heading="Tools"
      />,
    );

    expect(screen.getByText("No tools selected")).toBeInTheDocument();
  });

  it("calls onRemoveTool when remove button is clicked", () => {
    render(
      <ToolsSection
        availableTools={availableTools}
        selectedTools={selectedTools}
        onAddTool={mockOnAddTool}
        onRemoveTool={mockOnRemoveTool}
        heading="Tools"
      />,
    );

    const removeButton = screen.getByRole("button", { name: "Remove search" });
    fireEvent.click(removeButton);

    expect(mockOnRemoveTool).toHaveBeenCalledWith("search");
  });

  it("renders the add tool dropdown with available tools", () => {
    render(
      <ToolsSection
        availableTools={availableTools}
        selectedTools={selectedTools}
        onAddTool={mockOnAddTool}
        onRemoveTool={mockOnRemoveTool}
        heading="Tools"
      />,
    );

    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();

    // Check for tool options
    expect(screen.getByRole("option", { name: "search" })).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "calculator" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "weather" })).toBeInTheDocument();
  });

  it("calls onAddTool when a tool is selected from dropdown", () => {
    render(
      <ToolsSection
        availableTools={availableTools}
        selectedTools={selectedTools}
        onAddTool={mockOnAddTool}
        onRemoveTool={mockOnRemoveTool}
        heading="Tools"
      />,
    );

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "calculator" } });

    expect(mockOnAddTool).toHaveBeenCalledWith("calculator");
  });

  it("does not call onAddTool when empty option is selected", () => {
    render(
      <ToolsSection
        availableTools={availableTools}
        selectedTools={selectedTools}
        onAddTool={mockOnAddTool}
        onRemoveTool={mockOnRemoveTool}
        heading="Tools"
      />,
    );

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "" } });

    expect(mockOnAddTool).not.toHaveBeenCalled();
  });

  it("renders multiple selected tools", () => {
    const multipleSelected: ToolConfig[] = [
      { name: "search", description: "Search tool" },
      { name: "calculator", description: "Calculator tool" },
    ];

    render(
      <ToolsSection
        availableTools={availableTools}
        selectedTools={multipleSelected}
        onAddTool={mockOnAddTool}
        onRemoveTool={mockOnRemoveTool}
        heading="Tools"
      />,
    );

    // "search" and "calculator" appear both in selected tools and in the dropdown
    const searchElements = screen.getAllByText("search");
    const calculatorElements = screen.getAllByText("calculator");
    expect(searchElements.length).toBeGreaterThanOrEqual(1);
    expect(calculatorElements.length).toBeGreaterThanOrEqual(1);
  });

  it("does not render add tool dropdown when no tools are available", () => {
    render(
      <ToolsSection
        availableTools={[]}
        selectedTools={selectedTools}
        onAddTool={mockOnAddTool}
        onRemoveTool={mockOnRemoveTool}
        heading="Tools"
      />,
    );

    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.queryByText("Add Tool")).not.toBeInTheDocument();
  });

  it("renders with default empty selectedTools", () => {
    render(
      <ToolsSection
        availableTools={availableTools}
        onAddTool={mockOnAddTool}
        onRemoveTool={mockOnRemoveTool}
        heading="Tools"
      />,
    );

    expect(screen.getByText("No tools selected")).toBeInTheDocument();
  });

  it("renders the placeholder option in dropdown", () => {
    render(
      <ToolsSection
        availableTools={availableTools}
        selectedTools={selectedTools}
        onAddTool={mockOnAddTool}
        onRemoveTool={mockOnRemoveTool}
        heading="Tools"
      />,
    );

    expect(
      screen.getByRole("option", { name: "Select a tool to add..." }),
    ).toBeInTheDocument();
  });

  it("renders remove buttons with correct aria-labels", () => {
    const multipleSelected: ToolConfig[] = [
      { name: "search", description: "Search tool" },
      { name: "calculator", description: "Calculator tool" },
    ];

    render(
      <ToolsSection
        availableTools={availableTools}
        selectedTools={multipleSelected}
        onAddTool={mockOnAddTool}
        onRemoveTool={mockOnRemoveTool}
        heading="Tools"
      />,
    );

    expect(
      screen.getByRole("button", { name: "Remove search" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Remove calculator" }),
    ).toBeInTheDocument();
  });

  it("renders with custom heading", () => {
    render(
      <ToolsSection
        availableTools={availableTools}
        selectedTools={selectedTools}
        onAddTool={mockOnAddTool}
        onRemoveTool={mockOnRemoveTool}
        heading="Custom Heading"
      />,
    );

    expect(screen.getByText("Custom Heading")).toBeInTheDocument();
  });
});
