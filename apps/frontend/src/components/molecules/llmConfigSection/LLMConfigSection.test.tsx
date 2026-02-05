import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AgentConfig } from "@/lib/explore/types";
import { LLMConfigSection } from "./LLMConfigSection";

vi.mock("@/components/atoms/h3", () => ({
  TypographyH3: vi.fn(({ text }: { text: string }) => (
    <h3 data-testid="typography-h3">{text}</h3>
  )),
}));

describe("LLMConfigSection", () => {
  let mockOnLLMSelect: ReturnType<typeof vi.fn>;
  let mockOnLLMArgChange: ReturnType<typeof vi.fn>;

  const baseConfig: AgentConfig = {
    llms: [
      {
        provider: "OpenAI",
        providerArgs: { temperature: 0.7, maxTokens: 1000 },
      },
      { provider: "Anthropic", providerArgs: { temperature: 0.5 } },
    ],
    tools: [],
    systemPrompt: "Test prompt",
  };

  const editedConfig: AgentConfig = {
    llms: [
      {
        provider: "OpenAI",
        providerArgs: { temperature: 0.8, maxTokens: 2000 },
      },
    ],
    tools: [],
    systemPrompt: "Test prompt",
  };

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockOnLLMSelect = vi.fn();
    mockOnLLMArgChange = vi.fn();
  });

  it("renders the section header", () => {
    render(
      <LLMConfigSection
        config={baseConfig}
        editedConfig={editedConfig}
        currentLLMIndex={0}
        onLLMSelect={mockOnLLMSelect}
        onLLMArgChange={mockOnLLMArgChange}
      />,
    );

    expect(screen.getByText("LLM Configuration")).toBeInTheDocument();
  });

  it("renders the select dropdown with all LLM options", () => {
    render(
      <LLMConfigSection
        config={baseConfig}
        editedConfig={editedConfig}
        currentLLMIndex={0}
        onLLMSelect={mockOnLLMSelect}
        onLLMArgChange={mockOnLLMArgChange}
      />,
    );

    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByText("OpenAI")).toBeInTheDocument();
    expect(screen.getByText("Anthropic")).toBeInTheDocument();
  });

  it("calls onLLMSelect when a different LLM is selected", () => {
    render(
      <LLMConfigSection
        config={baseConfig}
        editedConfig={editedConfig}
        currentLLMIndex={0}
        onLLMSelect={mockOnLLMSelect}
        onLLMArgChange={mockOnLLMArgChange}
      />,
    );

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "1" } });

    expect(mockOnLLMSelect).toHaveBeenCalledWith(1);
  });

  it("displays the current LLM index as selected", () => {
    render(
      <LLMConfigSection
        config={baseConfig}
        editedConfig={editedConfig}
        currentLLMIndex={1}
        onLLMSelect={mockOnLLMSelect}
        onLLMArgChange={mockOnLLMArgChange}
      />,
    );

    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("1");
  });

  it("renders LLM arguments from editedConfig", () => {
    render(
      <LLMConfigSection
        config={baseConfig}
        editedConfig={editedConfig}
        currentLLMIndex={0}
        onLLMSelect={mockOnLLMSelect}
        onLLMArgChange={mockOnLLMArgChange}
      />,
    );

    expect(screen.getByText("temperature:")).toBeInTheDocument();
    expect(screen.getByText("maxTokens:")).toBeInTheDocument();
    expect(screen.getByDisplayValue("0.8")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2000")).toBeInTheDocument();
  });

  it("calls onLLMArgChange when a number argument is changed", () => {
    render(
      <LLMConfigSection
        config={baseConfig}
        editedConfig={editedConfig}
        currentLLMIndex={0}
        onLLMSelect={mockOnLLMSelect}
        onLLMArgChange={mockOnLLMArgChange}
      />,
    );

    const temperatureInput = screen.getByDisplayValue("0.8");
    fireEvent.change(temperatureInput, { target: { value: "0.9" } });

    expect(mockOnLLMArgChange).toHaveBeenCalledWith("temperature", 0.9);
  });

  it("calls onLLMArgChange with string value for string arguments", () => {
    const configWithStringArg: AgentConfig = {
      llms: [{ provider: "OpenAI", providerArgs: { model: "gpt-4" } }],
      tools: [],
      systemPrompt: "Test",
    };

    render(
      <LLMConfigSection
        config={configWithStringArg}
        editedConfig={configWithStringArg}
        currentLLMIndex={0}
        onLLMSelect={mockOnLLMSelect}
        onLLMArgChange={mockOnLLMArgChange}
      />,
    );

    const modelInput = screen.getByDisplayValue("gpt-4");
    fireEvent.change(modelInput, { target: { value: "gpt-4-turbo" } });

    expect(mockOnLLMArgChange).toHaveBeenCalledWith("model", "gpt-4-turbo");
  });

  it("does not render LLM arguments section when providerArgs is empty", () => {
    const configWithoutArgs: AgentConfig = {
      llms: [{ provider: "OpenAI" }],
      tools: [],
      systemPrompt: "Test",
    };

    render(
      <LLMConfigSection
        config={configWithoutArgs}
        editedConfig={configWithoutArgs}
        currentLLMIndex={0}
        onLLMSelect={mockOnLLMSelect}
        onLLMArgChange={mockOnLLMArgChange}
      />,
    );

    expect(screen.queryByText("LLM Arguments")).not.toBeInTheDocument();
  });

  it("renders correct input type for number values", () => {
    render(
      <LLMConfigSection
        config={baseConfig}
        editedConfig={editedConfig}
        currentLLMIndex={0}
        onLLMSelect={mockOnLLMSelect}
        onLLMArgChange={mockOnLLMArgChange}
      />,
    );

    const temperatureInput = screen.getByDisplayValue("0.8");
    expect(temperatureInput).toHaveAttribute("type", "number");
  });

  it("renders correct input type for string values", () => {
    const configWithStringArg: AgentConfig = {
      llms: [{ provider: "OpenAI", providerArgs: { model: "gpt-4" } }],
      tools: [],
      systemPrompt: "Test",
    };

    render(
      <LLMConfigSection
        config={configWithStringArg}
        editedConfig={configWithStringArg}
        currentLLMIndex={0}
        onLLMSelect={mockOnLLMSelect}
        onLLMArgChange={mockOnLLMArgChange}
      />,
    );

    const modelInput = screen.getByDisplayValue("gpt-4");
    expect(modelInput).toHaveAttribute("type", "text");
  });

  it("handles empty llms array gracefully", () => {
    const emptyConfig: AgentConfig = {
      llms: [],
      tools: [],
      systemPrompt: "Test",
    };

    render(
      <LLMConfigSection
        config={emptyConfig}
        editedConfig={emptyConfig}
        currentLLMIndex={0}
        onLLMSelect={mockOnLLMSelect}
        onLLMArgChange={mockOnLLMArgChange}
      />,
    );

    expect(screen.getByText("LLM Configuration")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });
});
