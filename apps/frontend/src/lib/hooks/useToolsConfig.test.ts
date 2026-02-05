import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AgentConfig, ToolConfig } from "@/lib/explore/types";
import { useToolsConfig } from "./useToolsConfig";

const mockTools: ToolConfig[] = [
  { name: "tool1", description: "Tool 1" },
  { name: "tool2", description: "Tool 2" },
  { name: "tool3", description: "Tool 3" },
] as ToolConfig[];

const mockInitialTools: ToolConfig[] = [
  { name: "initTool1", description: "Initial Tool 1" },
  { name: "initTool2", description: "Initial Tool 2" },
] as ToolConfig[];

const mockConfig: AgentConfig = {
  tools: mockTools,
  initialTools: mockInitialTools,
} as unknown as AgentConfig;

const mockEditedConfig: AgentConfig = {
  tools: [mockTools[0]],
  initialTools: [mockInitialTools[0]],
} as unknown as AgentConfig;

describe("useToolsConfig", () => {
  let mockOnUpdate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnUpdate = vi.fn();
  });

  describe("addTool", () => {
    it("should add a tool", () => {
      const { result } = renderHook(() =>
        useToolsConfig(mockConfig, mockEditedConfig, mockOnUpdate),
      );

      act(() => {
        result.current.addTool("tool2");
      });

      expect(mockOnUpdate).toHaveBeenCalledWith({
        tools: [mockTools[0], mockTools[1]],
      });
    });

    it("should not add tool if not found in config", () => {
      const { result } = renderHook(() =>
        useToolsConfig(mockConfig, mockEditedConfig, mockOnUpdate),
      );

      act(() => {
        result.current.addTool("nonexistent");
      });

      expect(mockOnUpdate).not.toHaveBeenCalled();
    });

    it("should not add tool if config.tools is undefined", () => {
      const configWithoutTools = {} as AgentConfig;

      const { result } = renderHook(() =>
        useToolsConfig(configWithoutTools, mockEditedConfig, mockOnUpdate),
      );

      act(() => {
        result.current.addTool("tool1");
      });

      expect(mockOnUpdate).not.toHaveBeenCalled();
    });

    it("should not add tool if editedConfig.tools is undefined", () => {
      const editedWithoutTools = {} as AgentConfig;

      const { result } = renderHook(() =>
        useToolsConfig(mockConfig, editedWithoutTools, mockOnUpdate),
      );

      act(() => {
        result.current.addTool("tool2");
      });

      expect(mockOnUpdate).not.toHaveBeenCalled();
    });
  });

  describe("removeTool", () => {
    it("should remove a tool", () => {
      const { result } = renderHook(() =>
        useToolsConfig(mockConfig, mockEditedConfig, mockOnUpdate),
      );

      act(() => {
        result.current.removeTool("tool1");
      });

      expect(mockOnUpdate).toHaveBeenCalledWith({
        tools: [],
      });
    });

    it("should not remove tool if editedConfig.tools is undefined", () => {
      const editedWithoutTools = {} as AgentConfig;

      const { result } = renderHook(() =>
        useToolsConfig(mockConfig, editedWithoutTools, mockOnUpdate),
      );

      act(() => {
        result.current.removeTool("tool1");
      });

      expect(mockOnUpdate).not.toHaveBeenCalled();
    });
  });

  describe("getAvailableTools", () => {
    it("should return tools not in editedConfig", () => {
      const { result } = renderHook(() =>
        useToolsConfig(mockConfig, mockEditedConfig, mockOnUpdate),
      );

      const availableTools = result.current.getAvailableTools();

      expect(availableTools).toHaveLength(2);
      expect(availableTools.map((t) => t.name)).toEqual(["tool2", "tool3"]);
    });

    it("should return empty array if config.tools is undefined", () => {
      const configWithoutTools = {} as AgentConfig;

      const { result } = renderHook(() =>
        useToolsConfig(configWithoutTools, mockEditedConfig, mockOnUpdate),
      );

      const availableTools = result.current.getAvailableTools();

      expect(availableTools).toEqual([]);
    });

    it("should return empty array if editedConfig.tools is undefined", () => {
      const editedWithoutTools = {} as AgentConfig;

      const { result } = renderHook(() =>
        useToolsConfig(mockConfig, editedWithoutTools, mockOnUpdate),
      );

      const availableTools = result.current.getAvailableTools();

      expect(availableTools).toEqual([]);
    });
  });

  describe("addInitialTool", () => {
    it("should add an initial tool", () => {
      const { result } = renderHook(() =>
        useToolsConfig(mockConfig, mockEditedConfig, mockOnUpdate),
      );

      act(() => {
        result.current.addInitialTool("initTool2");
      });

      expect(mockOnUpdate).toHaveBeenCalledWith({
        initialTools: [mockInitialTools[0], mockInitialTools[1]],
      });
    });

    it("should not add initial tool if not found in config", () => {
      const { result } = renderHook(() =>
        useToolsConfig(mockConfig, mockEditedConfig, mockOnUpdate),
      );

      act(() => {
        result.current.addInitialTool("nonexistent");
      });

      expect(mockOnUpdate).not.toHaveBeenCalled();
    });

    it("should not add initial tool if config.initialTools is undefined", () => {
      const configWithoutInitialTools = { tools: mockTools } as AgentConfig;

      const { result } = renderHook(() =>
        useToolsConfig(
          configWithoutInitialTools,
          mockEditedConfig,
          mockOnUpdate,
        ),
      );

      act(() => {
        result.current.addInitialTool("initTool1");
      });

      expect(mockOnUpdate).not.toHaveBeenCalled();
    });

    it("should not add initial tool if editedConfig.initialTools is undefined", () => {
      const editedWithoutInitialTools = {
        tools: [mockTools[0]],
      } as AgentConfig;

      const { result } = renderHook(() =>
        useToolsConfig(mockConfig, editedWithoutInitialTools, mockOnUpdate),
      );

      act(() => {
        result.current.addInitialTool("initTool2");
      });

      expect(mockOnUpdate).not.toHaveBeenCalled();
    });
  });

  describe("removeInitialTool", () => {
    it("should remove an initial tool", () => {
      const { result } = renderHook(() =>
        useToolsConfig(mockConfig, mockEditedConfig, mockOnUpdate),
      );

      act(() => {
        result.current.removeInitialTool("initTool1");
      });

      expect(mockOnUpdate).toHaveBeenCalledWith({
        initialTools: [],
      });
    });

    it("should not remove initial tool if editedConfig.initialTools is undefined", () => {
      const editedWithoutInitialTools = {
        tools: [mockTools[0]],
      } as AgentConfig;

      const { result } = renderHook(() =>
        useToolsConfig(mockConfig, editedWithoutInitialTools, mockOnUpdate),
      );

      act(() => {
        result.current.removeInitialTool("initTool1");
      });

      expect(mockOnUpdate).not.toHaveBeenCalled();
    });
  });

  describe("getAvailableInitialTools", () => {
    it("should return initial tools not in editedConfig", () => {
      const { result } = renderHook(() =>
        useToolsConfig(mockConfig, mockEditedConfig, mockOnUpdate),
      );

      const availableInitialTools = result.current.getAvailableInitialTools();

      expect(availableInitialTools).toHaveLength(1);
      expect(availableInitialTools[0].name).toBe("initTool2");
    });

    it("should return empty array if config.initialTools is undefined", () => {
      const configWithoutInitialTools = { tools: mockTools } as AgentConfig;

      const { result } = renderHook(() =>
        useToolsConfig(
          configWithoutInitialTools,
          mockEditedConfig,
          mockOnUpdate,
        ),
      );

      const availableInitialTools = result.current.getAvailableInitialTools();

      expect(availableInitialTools).toEqual([]);
    });

    it("should return empty array if editedConfig.initialTools is undefined", () => {
      const editedWithoutInitialTools = {
        tools: [mockTools[0]],
      } as AgentConfig;

      const { result } = renderHook(() =>
        useToolsConfig(mockConfig, editedWithoutInitialTools, mockOnUpdate),
      );

      const availableInitialTools = result.current.getAvailableInitialTools();

      expect(availableInitialTools).toEqual([]);
    });
  });
});
