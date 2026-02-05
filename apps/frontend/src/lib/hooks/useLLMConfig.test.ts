import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AgentConfig } from "@/lib/explore/types";
import { useLLMConfig } from "./useLLMConfig";

const mockConfig: AgentConfig = {
  llms: [
    { provider: "openai", providerArgs: { temperature: 0.7 } },
    { provider: "anthropic", providerArgs: { temperature: 0.5 } },
    { provider: "google", providerArgs: { temperature: 0.9 } },
  ],
} as unknown as AgentConfig;

const mockEditedConfig: AgentConfig = {
  llms: [{ provider: "openai", providerArgs: { temperature: 0.7 } }],
} as unknown as AgentConfig;

describe("useLLMConfig", () => {
  let mockOnUpdate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnUpdate = vi.fn();
  });

  it("should select LLM by index", () => {
    const { result } = renderHook(() =>
      useLLMConfig(mockConfig, mockEditedConfig, mockOnUpdate),
    );

    act(() => {
      result.current.selectLLM(1);
    });

    expect(mockOnUpdate).toHaveBeenCalledWith({
      llms: [{ provider: "anthropic", providerArgs: { temperature: 0.5 } }],
    });
  });

  it("should not update if LLM index is invalid", () => {
    const { result } = renderHook(() =>
      useLLMConfig(mockConfig, mockEditedConfig, mockOnUpdate),
    );

    act(() => {
      result.current.selectLLM(99);
    });

    expect(mockOnUpdate).not.toHaveBeenCalled();
  });

  it("should not update if config.llms is undefined", () => {
    const configWithoutLLMs = {} as AgentConfig;

    const { result } = renderHook(() =>
      useLLMConfig(configWithoutLLMs, mockEditedConfig, mockOnUpdate),
    );

    act(() => {
      result.current.selectLLM(0);
    });

    expect(mockOnUpdate).not.toHaveBeenCalled();
  });

  it("should update LLM args", () => {
    const { result } = renderHook(() =>
      useLLMConfig(mockConfig, mockEditedConfig, mockOnUpdate),
    );

    act(() => {
      result.current.updateLLMArgs("temperature", 0.8);
    });

    expect(mockOnUpdate).toHaveBeenCalledWith({
      llms: [
        {
          provider: "openai",
          providerArgs: { temperature: 0.8 },
        },
      ],
    });
  });

  it("should not update LLM args if editedConfig.llms is undefined", () => {
    const editedConfigWithoutLLMs = {} as AgentConfig;

    const { result } = renderHook(() =>
      useLLMConfig(mockConfig, editedConfigWithoutLLMs, mockOnUpdate),
    );

    act(() => {
      result.current.updateLLMArgs("temperature", 0.8);
    });

    expect(mockOnUpdate).not.toHaveBeenCalled();
  });

  it("should not update LLM args if editedConfig.llms[0] is undefined", () => {
    const editedConfigEmptyLLMs = { llms: [] } as unknown as AgentConfig;

    const { result } = renderHook(() =>
      useLLMConfig(mockConfig, editedConfigEmptyLLMs, mockOnUpdate),
    );

    act(() => {
      result.current.updateLLMArgs("temperature", 0.8);
    });

    expect(mockOnUpdate).not.toHaveBeenCalled();
  });

  it("should get current LLM index", () => {
    const { result } = renderHook(() =>
      useLLMConfig(mockConfig, mockEditedConfig, mockOnUpdate),
    );

    const index = result.current.getCurrentLLMIndex();

    expect(index).toBe(0);
  });

  it("should get current LLM index for different provider", () => {
    const editedWithAnthropic = {
      llms: [{ provider: "anthropic", providerArgs: { temperature: 0.5 } }],
    } as unknown as AgentConfig;

    const { result } = renderHook(() =>
      useLLMConfig(mockConfig, editedWithAnthropic, mockOnUpdate),
    );

    const index = result.current.getCurrentLLMIndex();

    expect(index).toBe(1);
  });

  it("should return 0 if current provider is not found", () => {
    const editedWithUnknown = {
      llms: [{ provider: "unknown", providerArgs: {} }],
    } as unknown as AgentConfig;

    const { result } = renderHook(() =>
      useLLMConfig(mockConfig, editedWithUnknown, mockOnUpdate),
    );

    const index = result.current.getCurrentLLMIndex();

    expect(index).toBe(0);
  });

  it("should return 0 if editedConfig.llms is undefined", () => {
    const editedConfigWithoutLLMs = {} as AgentConfig;

    const { result } = renderHook(() =>
      useLLMConfig(mockConfig, editedConfigWithoutLLMs, mockOnUpdate),
    );

    const index = result.current.getCurrentLLMIndex();

    expect(index).toBe(0);
  });

  it("should return 0 if config.llms is undefined", () => {
    const configWithoutLLMs = {} as AgentConfig;

    const { result } = renderHook(() =>
      useLLMConfig(configWithoutLLMs, mockEditedConfig, mockOnUpdate),
    );

    const index = result.current.getCurrentLLMIndex();

    expect(index).toBe(0);
  });
});
