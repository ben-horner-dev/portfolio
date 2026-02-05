import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Metric } from "@/app/constants";
import type { AgentConfig, ToolConfig } from "@/lib/explore/types";
import { ConfigPanel } from "./ConfigPanel";

// Mock all hooks
vi.mock("@/lib/hooks/useConfigState", () => ({
  useConfigState: vi.fn(),
}));

vi.mock("@/lib/hooks/useJsonDownload", () => ({
  useJsonDownload: vi.fn(),
}));

vi.mock("@/lib/hooks/useLLMConfig", () => ({
  useLLMConfig: vi.fn(),
}));

vi.mock("@/lib/hooks/useToolsConfig", () => ({
  useToolsConfig: vi.fn(),
}));

vi.mock("@/lib/stores/chatStore", () => ({
  useChatStore: vi.fn(() => ({ graphMermaid: "" })),
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock child components
vi.mock("@/components/molecules/systemPromptSection", () => ({
  SystemPromptSection: vi.fn(
    ({
      value,
      onChange,
    }: {
      value: string;
      onChange: (value: string) => void;
    }) => (
      <div data-testid="system-prompt-section">
        <textarea
          data-testid="system-prompt-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    ),
  ),
}));

vi.mock("@/components/molecules/llmConfigSection", () => ({
  LLMConfigSection: vi.fn(
    ({
      currentLLMIndex,
      onLLMSelect,
      onLLMArgChange,
    }: {
      config: AgentConfig;
      editedConfig: AgentConfig;
      currentLLMIndex: number;
      onLLMSelect: (index: number) => void;
      onLLMArgChange: (key: string, value: unknown) => void;
    }) => (
      <div data-testid="llm-config-section">
        <span data-testid="current-llm-index">{currentLLMIndex}</span>
        <button
          data-testid="select-llm-btn"
          type="button"
          onClick={() => onLLMSelect(1)}
        >
          Select LLM
        </button>
        <button
          data-testid="update-llm-arg-btn"
          type="button"
          onClick={() => onLLMArgChange("temperature", 0.8)}
        >
          Update LLM Arg
        </button>
      </div>
    ),
  ),
}));

vi.mock("@/components/molecules/toolsSection", () => ({
  ToolsSection: vi.fn(
    ({
      heading,
      selectedTools,
      onAddTool,
      onRemoveTool,
    }: {
      availableTools: ToolConfig[];
      selectedTools: ToolConfig[];
      onAddTool: (name: string) => void;
      onRemoveTool: (name: string) => void;
      heading: string;
    }) => (
      <div
        data-testid={`tools-section-${heading
          .toLowerCase()
          .replace(/\s+/g, "-")}`}
      >
        <span data-testid="selected-tools-count">
          {selectedTools?.length ?? 0}
        </span>
        <button
          data-testid={`add-tool-btn-${heading
            .toLowerCase()
            .replace(/\s+/g, "-")}`}
          type="button"
          onClick={() => onAddTool("new_tool")}
        >
          Add Tool
        </button>
        <button
          data-testid={`remove-tool-btn-${heading
            .toLowerCase()
            .replace(/\s+/g, "-")}`}
          type="button"
          onClick={() => onRemoveTool("existing_tool")}
        >
          Remove Tool
        </button>
      </div>
    ),
  ),
}));

vi.mock("@/components/atoms/mermaidDiagram", () => ({
  MermaidDiagram: vi.fn(({ chart }: { chart: string; className?: string }) => (
    <div data-testid="mermaid-diagram">{chart}</div>
  )),
}));

vi.mock("@/components/atoms/dialog", () => ({
  Dialog: vi.fn(({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog">{children}</div>
  )),
  DialogContent: vi.fn(({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  )),
  DialogDescription: vi.fn(({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-description">{children}</div>
  )),
  DialogFooter: vi.fn(() => <div data-testid="dialog-footer" />),
  DialogHeader: vi.fn(({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-header">{children}</div>
  )),
  DialogTitle: vi.fn(({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-title">{children}</div>
  )),
  DialogTrigger: vi.fn(
    ({
      children,
      asChild,
    }: {
      children: React.ReactNode;
      asChild?: boolean;
    }) => (
      <div data-testid="dialog-trigger" data-as-child={asChild}>
        {children}
      </div>
    ),
  ),
}));

vi.mock("@/components/atoms/tooltip", () => ({
  Tooltip: vi.fn(({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip">{children}</div>
  )),
  TooltipContent: vi.fn(({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip-content">{children}</div>
  )),
  TooltipProvider: vi.fn(({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip-provider">{children}</div>
  )),
  TooltipTrigger: vi.fn(
    ({
      children,
      asChild,
    }: {
      children: React.ReactNode;
      asChild?: boolean;
    }) => (
      <div data-testid="tooltip-trigger" data-as-child={asChild}>
        {children}
      </div>
    ),
  ),
}));

const mockTool: ToolConfig = {
  name: "test_tool",
  description: "A test tool",
};

const mockAnswerFormatter = {
  name: "default_formatter",
  format: (result: unknown) => JSON.stringify(result),
};

const mockLLM = {
  provider: "openai",
  model: "gpt-4",
  providerArgs: {
    temperature: 0.7,
  },
};

const mockConfig: AgentConfig = {
  systemPrompt: "You are a helpful assistant",
  defaultAgentActionLog: "Default action log",
  llms: [mockLLM, { ...mockLLM, provider: "anthropic" }],
  tools: [mockTool],
  initialTools: [mockTool],
  answerFormatters: [mockAnswerFormatter, { name: "custom_formatter" }],
  langsmithUrl: "https://langsmith.com/project",
} as unknown as AgentConfig;

describe("ConfigPanel", () => {
  let mockUpdateField: ReturnType<typeof vi.fn>;
  let mockResetConfig: ReturnType<typeof vi.fn>;
  let mockHandleEvaluate: ReturnType<typeof vi.fn>;
  let mockSetEvalError: ReturnType<typeof vi.fn>;
  let mockSetDecision: ReturnType<typeof vi.fn>;
  let mockSetMetricType: ReturnType<typeof vi.fn>;
  let mockDownloadJson: ReturnType<typeof vi.fn>;
  let mockSetFilename: ReturnType<typeof vi.fn>;
  let mockSelectLLM: ReturnType<typeof vi.fn>;
  let mockUpdateLLMArgs: ReturnType<typeof vi.fn>;
  let mockGetCurrentLLMIndex: ReturnType<typeof vi.fn>;
  let mockAddTool: ReturnType<typeof vi.fn>;
  let mockRemoveTool: ReturnType<typeof vi.fn>;
  let mockGetAvailableTools: ReturnType<typeof vi.fn>;
  let mockSetConfig: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    cleanup();
    vi.clearAllMocks();

    mockUpdateField = vi.fn();
    mockResetConfig = vi.fn();
    mockHandleEvaluate = vi.fn();
    mockSetEvalError = vi.fn();
    mockSetDecision = vi.fn();
    mockSetMetricType = vi.fn();
    mockDownloadJson = vi.fn();
    mockSetFilename = vi.fn();
    mockSelectLLM = vi.fn();
    mockUpdateLLMArgs = vi.fn();
    mockGetCurrentLLMIndex = vi.fn(() => 0);
    mockAddTool = vi.fn();
    mockRemoveTool = vi.fn();
    mockGetAvailableTools = vi.fn(() => []);
    mockSetConfig = vi.fn();

    const { useConfigState } = await import("@/lib/hooks/useConfigState");
    vi.mocked(useConfigState).mockReturnValue({
      updateField: mockUpdateField,
      resetConfig: mockResetConfig,
      handleEvaluate: mockHandleEvaluate,
      evaluate: false,
      progress: 0,
      percentage: 0,
      total: 0,
      evalError: null,
      setEvalError: mockSetEvalError,
      decision: undefined,
      setDecision: mockSetDecision,
      metricType: Metric.RAG,
      setMetricType: mockSetMetricType,
    });

    const { useJsonDownload } = await import("@/lib/hooks/useJsonDownload");
    vi.mocked(useJsonDownload).mockReturnValue({
      filename: "test-config",
      setFilename: mockSetFilename,
      downloadJson: mockDownloadJson,
    });

    const { useLLMConfig } = await import("@/lib/hooks/useLLMConfig");
    vi.mocked(useLLMConfig).mockReturnValue({
      selectLLM: mockSelectLLM,
      updateLLMArgs: mockUpdateLLMArgs,
      getCurrentLLMIndex: mockGetCurrentLLMIndex,
    });

    const { useToolsConfig } = await import("@/lib/hooks/useToolsConfig");
    vi.mocked(useToolsConfig).mockReturnValue({
      addTool: mockAddTool,
      removeTool: mockRemoveTool,
      getAvailableTools: mockGetAvailableTools,
      addInitialTool: mockAddTool,
      removeInitialTool: mockRemoveTool,
      getAvailableInitialTools: mockGetAvailableTools,
    });

    const { useChatStore } = await import("@/lib/stores/chatStore");
    vi.mocked(useChatStore).mockImplementation((selector?: unknown) => {
      const state = {
        graphMermaid: "",
        setConfig: mockSetConfig,
      };
      if (typeof selector === "function") {
        return selector(state);
      }
      return state;
    });

    // Mock useChatStore.getState()
    vi.mocked(useChatStore).getState = vi.fn(() => ({
      graphMermaid: "",
      setConfig: mockSetConfig,
    })) as unknown as typeof useChatStore.getState;
  });

  it("renders the header", () => {
    render(<ConfigPanel config={mockConfig} />);

    expect(screen.getByText("Agent Configuration")).toBeInTheDocument();
  });

  it("renders the system prompt section", () => {
    render(<ConfigPanel config={mockConfig} />);

    expect(screen.getByTestId("system-prompt-section")).toBeInTheDocument();
  });

  it("renders the default agent action log textarea", () => {
    render(<ConfigPanel config={mockConfig} />);

    expect(
      screen.getByPlaceholderText("Enter default action log..."),
    ).toBeInTheDocument();
  });

  it("renders LLM config section", () => {
    render(<ConfigPanel config={mockConfig} />);

    expect(screen.getByTestId("llm-config-section")).toBeInTheDocument();
  });

  it("renders both tools sections", () => {
    render(<ConfigPanel config={mockConfig} />);

    expect(screen.getByTestId("tools-section-tools")).toBeInTheDocument();
    expect(
      screen.getByTestId("tools-section-initial-tools"),
    ).toBeInTheDocument();
  });

  it("renders answer formatter section", () => {
    render(<ConfigPanel config={mockConfig} />);

    expect(screen.getByText("Answer Formatter")).toBeInTheDocument();
    expect(screen.getByText("Select Answer Formatter")).toBeInTheDocument();
  });

  it("renders download configuration section", () => {
    render(<ConfigPanel config={mockConfig} />);

    expect(screen.getByText("Download Configuration")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter filename (without .json)"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("download-agent-config-button"),
    ).toBeInTheDocument();
  });

  it("renders evaluation type toggle", () => {
    render(<ConfigPanel config={mockConfig} />);

    expect(screen.getByText("Evaluation Type")).toBeInTheDocument();
    expect(screen.getByText("Retrieval")).toBeInTheDocument();
    expect(screen.getByText("Generation")).toBeInTheDocument();
  });

  it("renders evaluate buttons when not evaluating", () => {
    render(<ConfigPanel config={mockConfig} />);

    expect(screen.getByTestId("eval-metrics-quick")).toBeInTheDocument();
    expect(screen.getByTestId("eval-metrics")).toBeInTheDocument();
  });

  it("renders save and reset buttons", () => {
    render(<ConfigPanel config={mockConfig} />);

    expect(screen.getByTestId("save-agent-config-button")).toBeInTheDocument();
    expect(screen.getByText("Reset")).toBeInTheDocument();
  });

  it("renders View Agent Graph button", () => {
    render(<ConfigPanel config={mockConfig} />);

    expect(screen.getByText("View Agent Graph")).toBeInTheDocument();
  });

  it("renders Observe Agent link", () => {
    render(<ConfigPanel config={mockConfig} />);

    const link = screen.getByTestId("observe-agent-link");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", mockConfig.langsmithUrl);
  });

  it("applies custom className", () => {
    const { container } = render(
      <ConfigPanel config={mockConfig} className="custom-class" />,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  // Interaction tests
  it("calls updateField when default action log changes", () => {
    render(<ConfigPanel config={mockConfig} />);

    const textarea = screen.getByPlaceholderText("Enter default action log...");
    fireEvent.change(textarea, { target: { value: "New action log" } });

    expect(mockUpdateField).toHaveBeenCalledWith(
      "defaultAgentActionLog",
      "New action log",
    );
  });

  it("calls handleEvaluate with QUICK_EVAL_SIZE when quick evaluate is clicked", () => {
    render(<ConfigPanel config={mockConfig} />);

    const quickEvalBtn = screen.getByTestId("eval-metrics-quick");
    fireEvent.click(quickEvalBtn);

    expect(mockHandleEvaluate).toHaveBeenCalledWith(10);
  });

  it("calls handleEvaluate without size when full evaluate is clicked", () => {
    render(<ConfigPanel config={mockConfig} />);

    const evalBtn = screen.getByTestId("eval-metrics");
    fireEvent.click(evalBtn);

    expect(mockHandleEvaluate).toHaveBeenCalledWith();
  });

  it("calls downloadJson and shows toast when download button is clicked", async () => {
    const { toast } = await import("sonner");
    render(<ConfigPanel config={mockConfig} />);

    const downloadBtn = screen.getByTestId("download-agent-config-button");
    fireEvent.click(downloadBtn);

    expect(mockDownloadJson).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith("Download started", {
      description: "test-config.json",
    });
  });

  it("calls setFilename when filename input changes", () => {
    render(<ConfigPanel config={mockConfig} />);

    const filenameInput = screen.getByPlaceholderText(
      "Enter filename (without .json)",
    );
    fireEvent.change(filenameInput, { target: { value: "my-config" } });

    expect(mockSetFilename).toHaveBeenCalledWith("my-config");
  });

  it("toggles metric type from RAG to GENERATION when toggle button is clicked", () => {
    render(<ConfigPanel config={mockConfig} />);

    const toggleButton = screen.getByRole("button", { name: "" });
    fireEvent.click(toggleButton);

    expect(mockSetMetricType).toHaveBeenCalledWith(Metric.GENERATION);
  });

  it("toggles metric type from GENERATION to RAG when toggle button is clicked", async () => {
    const { useConfigState } = await import("@/lib/hooks/useConfigState");
    vi.mocked(useConfigState).mockReturnValue({
      updateField: mockUpdateField,
      resetConfig: mockResetConfig,
      handleEvaluate: mockHandleEvaluate,
      evaluate: false,
      progress: 0,
      percentage: 0,
      total: 0,
      evalError: null,
      setEvalError: mockSetEvalError,
      decision: undefined,
      setDecision: mockSetDecision,
      metricType: Metric.GENERATION,
      setMetricType: mockSetMetricType,
    });

    render(<ConfigPanel config={mockConfig} />);

    const toggleButton = screen.getByRole("button", { name: "" });
    fireEvent.click(toggleButton);

    expect(mockSetMetricType).toHaveBeenCalledWith(Metric.RAG);
  });

  it("saves configuration and shows toast when save button is clicked", async () => {
    const { toast } = await import("sonner");
    render(<ConfigPanel config={mockConfig} />);

    const saveBtn = screen.getByTestId("save-agent-config-button");
    fireEvent.click(saveBtn);

    expect(mockSetConfig).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith("Configuration saved", {
      description: "Your agent configuration has been updated.",
    });
  });

  it("resets configuration and shows toast when reset button is clicked", async () => {
    const { toast } = await import("sonner");
    render(<ConfigPanel config={mockConfig} />);

    const resetBtn = screen.getByText("Reset");
    fireEvent.click(resetBtn);

    expect(mockResetConfig).toHaveBeenCalled();
    expect(toast.info).toHaveBeenCalledWith("Configuration reset", {
      description: "Agent configuration has been reset to defaults.",
    });
  });

  it("changes answer formatter when selection changes", () => {
    render(<ConfigPanel config={mockConfig} />);

    const select = screen.getByTitle("Select an answer formatter");
    fireEvent.change(select, { target: { value: "1" } });

    expect(mockUpdateField).toHaveBeenCalledWith("answerFormatters", [
      mockConfig.answerFormatters[1],
    ]);
  });

  // Evaluation state tests
  it("shows progress bar when evaluating", async () => {
    const { useConfigState } = await import("@/lib/hooks/useConfigState");
    vi.mocked(useConfigState).mockReturnValue({
      updateField: mockUpdateField,
      resetConfig: mockResetConfig,
      handleEvaluate: mockHandleEvaluate,
      evaluate: true,
      progress: 5,
      percentage: 50,
      total: 10,
      evalError: null,
      setEvalError: mockSetEvalError,
      decision: undefined,
      setDecision: mockSetDecision,
      metricType: Metric.RAG,
      setMetricType: mockSetMetricType,
    });

    render(<ConfigPanel config={mockConfig} />);

    expect(screen.getByText("evaluating...")).toBeInTheDocument();
    expect(screen.getByText("5/10")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("hides evaluate buttons when evaluating", async () => {
    const { useConfigState } = await import("@/lib/hooks/useConfigState");
    vi.mocked(useConfigState).mockReturnValue({
      updateField: mockUpdateField,
      resetConfig: mockResetConfig,
      handleEvaluate: mockHandleEvaluate,
      evaluate: true,
      progress: 0,
      percentage: 0,
      total: 10,
      evalError: null,
      setEvalError: mockSetEvalError,
      decision: undefined,
      setDecision: mockSetDecision,
      metricType: Metric.RAG,
      setMetricType: mockSetMetricType,
    });

    render(<ConfigPanel config={mockConfig} />);

    expect(screen.queryByTestId("eval-metrics-quick")).not.toBeInTheDocument();
    expect(screen.queryByTestId("eval-metrics")).not.toBeInTheDocument();
  });

  it("shows error message when evalError is set", async () => {
    const { useConfigState } = await import("@/lib/hooks/useConfigState");
    vi.mocked(useConfigState).mockReturnValue({
      updateField: mockUpdateField,
      resetConfig: mockResetConfig,
      handleEvaluate: mockHandleEvaluate,
      evaluate: false,
      progress: 0,
      percentage: 0,
      total: 0,
      evalError: "Test error message",
      setEvalError: mockSetEvalError,
      decision: undefined,
      setDecision: mockSetDecision,
      metricType: Metric.RAG,
      setMetricType: mockSetMetricType,
    });

    render(<ConfigPanel config={mockConfig} />);

    expect(screen.getByText("Test error message")).toBeInTheDocument();
  });

  it("dismisses error when dismiss button is clicked", async () => {
    const { useConfigState } = await import("@/lib/hooks/useConfigState");
    vi.mocked(useConfigState).mockReturnValue({
      updateField: mockUpdateField,
      resetConfig: mockResetConfig,
      handleEvaluate: mockHandleEvaluate,
      evaluate: false,
      progress: 0,
      percentage: 0,
      total: 0,
      evalError: "Test error message",
      setEvalError: mockSetEvalError,
      decision: undefined,
      setDecision: mockSetDecision,
      metricType: Metric.RAG,
      setMetricType: mockSetMetricType,
    });

    render(<ConfigPanel config={mockConfig} />);

    const dismissBtn = screen.getByLabelText("Dismiss error");
    fireEvent.click(dismissBtn);

    expect(mockSetEvalError).toHaveBeenCalledWith(null);
  });

  it("shows decision results when decision is set", async () => {
    const { useConfigState } = await import("@/lib/hooks/useConfigState");
    vi.mocked(useConfigState).mockReturnValue({
      updateField: mockUpdateField,
      resetConfig: mockResetConfig,
      handleEvaluate: mockHandleEvaluate,
      evaluate: false,
      progress: 10,
      percentage: 100,
      total: 10,
      evalError: null,
      setEvalError: mockSetEvalError,
      decision: "Evaluation complete (mock)",
      setDecision: mockSetDecision,
      metricType: Metric.RAG,
      setMetricType: mockSetMetricType,
    });

    render(<ConfigPanel config={mockConfig} />);

    expect(screen.getByText("Evaluation Results")).toBeInTheDocument();
    expect(screen.getByText("Evaluation complete (mock)")).toBeInTheDocument();
  });

  it("dismisses decision when dismiss button is clicked", async () => {
    const { useConfigState } = await import("@/lib/hooks/useConfigState");
    vi.mocked(useConfigState).mockReturnValue({
      updateField: mockUpdateField,
      resetConfig: mockResetConfig,
      handleEvaluate: mockHandleEvaluate,
      evaluate: false,
      progress: 10,
      percentage: 100,
      total: 10,
      evalError: null,
      setEvalError: mockSetEvalError,
      decision: "Evaluation complete (mock)",
      setDecision: mockSetDecision,
      metricType: Metric.RAG,
      setMetricType: mockSetMetricType,
    });

    render(<ConfigPanel config={mockConfig} />);

    const dismissBtn = screen.getByLabelText("Dismiss result");
    fireEvent.click(dismissBtn);

    expect(mockSetDecision).toHaveBeenCalledWith(undefined);
  });

  // Metric type display tests
  it("shows RAG description when metric type is RAG", () => {
    render(<ConfigPanel config={mockConfig} />);

    expect(
      screen.getByText(
        "Evaluate information retrieval accuracy, relevance, and search metrics",
      ),
    ).toBeInTheDocument();
  });

  it("shows Generation description when metric type is GENERATION", async () => {
    const { useConfigState } = await import("@/lib/hooks/useConfigState");
    vi.mocked(useConfigState).mockReturnValue({
      updateField: mockUpdateField,
      resetConfig: mockResetConfig,
      handleEvaluate: mockHandleEvaluate,
      evaluate: false,
      progress: 0,
      percentage: 0,
      total: 0,
      evalError: null,
      setEvalError: mockSetEvalError,
      decision: undefined,
      setDecision: mockSetDecision,
      metricType: Metric.GENERATION,
      setMetricType: mockSetMetricType,
    });

    render(<ConfigPanel config={mockConfig} />);

    expect(
      screen.getByText(
        "Evaluate conversation quality, response accuracy, and appropriateness",
      ),
    ).toBeInTheDocument();
  });

  // View Agent Graph tests
  it("disables View Agent Graph button when no graphMermaid", () => {
    render(<ConfigPanel config={mockConfig} />);

    const graphBtn = screen.getByText("View Agent Graph");
    expect(graphBtn).toBeDisabled();
  });

  it("enables View Agent Graph button when graphMermaid exists", async () => {
    const { useChatStore } = await import("@/lib/stores/chatStore");
    vi.mocked(useChatStore).mockImplementation((selector?: unknown) => {
      const state = {
        graphMermaid: "graph TD; A-->B;",
        setConfig: mockSetConfig,
      };
      if (typeof selector === "function") {
        return selector(state);
      }
      return state;
    });

    render(<ConfigPanel config={mockConfig} />);

    const graphBtn = screen.getByText("View Agent Graph");
    expect(graphBtn).not.toBeDisabled();
  });

  // LLM Config interaction tests
  it("passes getCurrentLLMIndex to LLMConfigSection", () => {
    mockGetCurrentLLMIndex.mockReturnValue(1);

    render(<ConfigPanel config={mockConfig} />);

    expect(screen.getByTestId("current-llm-index")).toHaveTextContent("1");
  });

  // Answer formatter edge cases
  it("handles empty answer formatters array", () => {
    const configWithEmptyFormatters = {
      ...mockConfig,
      answerFormatters: [],
    };

    render(<ConfigPanel config={configWithEmptyFormatters} />);

    const select = screen.getByTitle("Select an answer formatter");
    expect(select).toBeInTheDocument();
  });

  it("defaults to index 0 when currentAnswerFormatterIndex is negative", () => {
    const initialConfig = {
      ...mockConfig,
      answerFormatters: [{ name: "formatter_A" }],
    };

    const { rerender } = render(<ConfigPanel config={initialConfig} />);

    const newConfig = {
      ...mockConfig,
      answerFormatters: [{ name: "formatter_B" }, { name: "formatter_C" }],
    };

    rerender(<ConfigPanel config={newConfig} />);

    const select = screen.getByTitle(
      "Select an answer formatter",
    ) as HTMLSelectElement;
    expect(select.value).toBe("0");
  });

  it("renders with branchUrl prop", () => {
    render(
      <ConfigPanel config={mockConfig} branchUrl="https://branch.url.com" />,
    );

    expect(screen.getByText("Agent Configuration")).toBeInTheDocument();
  });

  it("shows default filename in toast when filename is empty", async () => {
    const { useJsonDownload } = await import("@/lib/hooks/useJsonDownload");
    vi.mocked(useJsonDownload).mockReturnValue({
      filename: "",
      setFilename: mockSetFilename,
      downloadJson: mockDownloadJson,
    });

    const { toast } = await import("sonner");
    render(<ConfigPanel config={mockConfig} />);

    const downloadBtn = screen.getByTestId("download-agent-config-button");
    fireEvent.click(downloadBtn);

    expect(toast.success).toHaveBeenCalledWith("Download started", {
      description: "config.json",
    });
  });

  it("uses editedConfig.llms fallback when updates.llms is undefined", async () => {
    const { useLLMConfig } = await import("@/lib/hooks/useLLMConfig");

    let capturedCallback: ((updates: { llms?: unknown }) => void) | null = null;
    vi.mocked(useLLMConfig).mockImplementation(
      (config, editedConfig, callback) => {
        capturedCallback = callback;
        return {
          selectLLM: mockSelectLLM,
          updateLLMArgs: mockUpdateLLMArgs,
          getCurrentLLMIndex: mockGetCurrentLLMIndex,
        };
      },
    );

    render(<ConfigPanel config={mockConfig} />);

    capturedCallback?.({});

    expect(mockUpdateField).toHaveBeenCalledWith("llms", mockConfig.llms);
  });

  it("uses editedConfig.tools fallback when updates.tools is undefined", async () => {
    const { useToolsConfig } = await import("@/lib/hooks/useToolsConfig");

    let capturedToolsCallback: ((updates: { tools?: unknown }) => void) | null =
      null;
    let callCount = 0;
    vi.mocked(useToolsConfig).mockImplementation(
      (config, editedConfig, callback) => {
        callCount++;
        if (callCount === 1) {
          capturedToolsCallback = callback;
        }
        return {
          addTool: mockAddTool,
          removeTool: mockRemoveTool,
          getAvailableTools: mockGetAvailableTools,
          addInitialTool: mockAddTool,
          removeInitialTool: mockRemoveTool,
          getAvailableInitialTools: mockGetAvailableTools,
        };
      },
    );

    render(<ConfigPanel config={mockConfig} />);

    capturedToolsCallback?.({});

    expect(mockUpdateField).toHaveBeenCalledWith("tools", mockConfig.tools);
  });

  it("uses editedConfig.initialTools fallback when updates.initialTools is undefined", async () => {
    const { useToolsConfig } = await import("@/lib/hooks/useToolsConfig");

    let capturedInitialToolsCallback:
      | ((updates: { initialTools?: unknown }) => void)
      | null = null;
    let callCount = 0;
    vi.mocked(useToolsConfig).mockImplementation(
      (config, editedConfig, callback) => {
        callCount++;
        if (callCount === 2) {
          capturedInitialToolsCallback = callback;
        }
        return {
          addTool: mockAddTool,
          removeTool: mockRemoveTool,
          getAvailableTools: mockGetAvailableTools,
          addInitialTool: mockAddTool,
          removeInitialTool: mockRemoveTool,
          getAvailableInitialTools: mockGetAvailableTools,
        };
      },
    );

    render(<ConfigPanel config={mockConfig} />);

    capturedInitialToolsCallback?.({});

    expect(mockUpdateField).toHaveBeenCalledWith(
      "initialTools",
      mockConfig.initialTools,
    );
  });

  it("calls updateField for systemPrompt when SystemPromptSection onChange is triggered", () => {
    render(<ConfigPanel config={mockConfig} />);

    const textarea = screen.getByTestId("system-prompt-textarea");
    fireEvent.change(textarea, { target: { value: "New system prompt" } });

    expect(mockUpdateField).toHaveBeenCalledWith(
      "systemPrompt",
      "New system prompt",
    );
  });
});
