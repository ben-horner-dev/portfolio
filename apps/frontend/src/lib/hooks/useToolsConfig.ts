"use client";

import { useCallback } from "react";
import type { AgentConfig, ToolConfig } from "@/lib/explore/types";

interface UseToolsConfigReturn {
  addTool: (toolName: string) => void;
  removeTool: (toolName: string) => void;
  getAvailableTools: () => ToolConfig[];
  addInitialTool: (toolName: string) => void;
  removeInitialTool: (toolName: string) => void;
  getAvailableInitialTools: () => ToolConfig[];
}

export function useToolsConfig(
  config: AgentConfig,
  editedConfig: AgentConfig,
  onUpdate: (updates: Partial<AgentConfig>) => void,
): UseToolsConfigReturn {
  const addTool = useCallback(
    (toolName: string) => {
      console.log("[useToolsConfig] addTool:", toolName);
      const toolToAdd = config.tools?.find((t) => t.name === toolName);
      if (toolToAdd && editedConfig.tools) {
        onUpdate({ tools: [...editedConfig.tools, toolToAdd] });
      }
    },
    [config.tools, editedConfig.tools, onUpdate],
  );

  const removeTool = useCallback(
    (toolName: string) => {
      console.log("[useToolsConfig] removeTool:", toolName);
      if (editedConfig.tools) {
        onUpdate({
          tools: editedConfig.tools.filter((t) => t.name !== toolName),
        });
      }
    },
    [editedConfig.tools, onUpdate],
  );

  const getAvailableTools = useCallback(() => {
    if (!config.tools || !editedConfig.tools) return [];
    const selectedNames = new Set(editedConfig.tools.map((t) => t.name));
    return config.tools.filter((t) => !selectedNames.has(t.name));
  }, [config.tools, editedConfig.tools]);

  const addInitialTool = useCallback(
    (toolName: string) => {
      console.log("[useToolsConfig] addInitialTool:", toolName);
      const toolToAdd = config.initialTools?.find((t) => t.name === toolName);
      if (toolToAdd && editedConfig.initialTools) {
        onUpdate({ initialTools: [...editedConfig.initialTools, toolToAdd] });
      }
    },
    [config.initialTools, editedConfig.initialTools, onUpdate],
  );

  const removeInitialTool = useCallback(
    (toolName: string) => {
      console.log("[useToolsConfig] removeInitialTool:", toolName);
      if (editedConfig.initialTools) {
        onUpdate({
          initialTools: editedConfig.initialTools.filter(
            (t) => t.name !== toolName,
          ),
        });
      }
    },
    [editedConfig.initialTools, onUpdate],
  );

  const getAvailableInitialTools = useCallback(() => {
    if (!config.initialTools || !editedConfig.initialTools) return [];
    const selectedNames = new Set(editedConfig.initialTools.map((t) => t.name));
    return config.initialTools.filter((t) => !selectedNames.has(t.name));
  }, [config.initialTools, editedConfig.initialTools]);

  return {
    addTool,
    removeTool,
    getAvailableTools,
    addInitialTool,
    removeInitialTool,
    getAvailableInitialTools,
  };
}
