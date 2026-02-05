import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MermaidDiagram } from "./mermaidDiagram";

vi.mock("mermaid", () => ({
  default: {
    initialize: vi.fn(),
    run: vi.fn().mockResolvedValue(undefined),
  },
}));

describe("MermaidDiagram", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders 'No diagram available' when chart is empty", () => {
    render(<MermaidDiagram chart="" />);

    expect(screen.getByText("No diagram available")).toBeInTheDocument();
  });

  it("renders 'No diagram available' with custom className when chart is empty", () => {
    render(<MermaidDiagram chart="" className="custom-class" />);

    const container = screen.getByText("No diagram available").parentElement;
    expect(container).toHaveClass("custom-class");
  });

  it("renders the mermaid container when chart is provided", async () => {
    const chartContent = "graph TD; A-->B;";
    const { container } = render(<MermaidDiagram chart={chartContent} />);

    const mermaidDiv = container.querySelector(".mermaid");
    expect(mermaidDiv).toBeInTheDocument();
  });

  it("applies custom className to mermaid container", async () => {
    const chartContent = "graph TD; A-->B;";
    const { container } = render(
      <MermaidDiagram chart={chartContent} className="custom-diagram" />,
    );

    const mermaidDiv = container.querySelector(".mermaid");
    expect(mermaidDiv).toHaveClass("custom-diagram");
  });

  it("calls mermaid.run when chart is provided", async () => {
    const mermaid = await import("mermaid");
    const chartContent = "graph TD; A-->B;";

    render(<MermaidDiagram chart={chartContent} />);

    await waitFor(() => {
      expect(mermaid.default.run).toHaveBeenCalled();
    });
  });

  it("updates when chart prop changes", async () => {
    const mermaid = await import("mermaid");
    const { rerender } = render(<MermaidDiagram chart="graph TD; A-->B;" />);

    await waitFor(() => {
      expect(mermaid.default.run).toHaveBeenCalledTimes(1);
    });

    rerender(<MermaidDiagram chart="graph TD; C-->D;" />);

    await waitFor(() => {
      expect(mermaid.default.run).toHaveBeenCalledTimes(2);
    });
  });

  it("has overflow-auto class for scrolling", () => {
    const { container } = render(<MermaidDiagram chart="graph TD; A-->B;" />);

    const mermaidDiv = container.querySelector(".mermaid");
    expect(mermaidDiv).toHaveClass("overflow-auto");
  });

  it("has flex justify-center class for centering", () => {
    const { container } = render(<MermaidDiagram chart="graph TD; A-->B;" />);

    const mermaidDiv = container.querySelector(".mermaid");
    expect(mermaidDiv).toHaveClass("flex");
    expect(mermaidDiv).toHaveClass("justify-center");
  });
});
