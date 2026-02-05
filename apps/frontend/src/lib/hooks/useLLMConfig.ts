"use client";

import { useCallback } from "react";
import type { AgentConfig } from "@/lib/explore/types";

interface UseLLMConfigReturn {
  selectLLM: (index: number) => void;
  updateLLMArgs: (key: string, value: unknown) => void;
  getCurrentLLMIndex: () => number;
}

export function useLLMConfig(
  config: AgentConfig,
  editedConfig: AgentConfig,
  onUpdate: (updates: Partial<AgentConfig>) => void,
): UseLLMConfigReturn {
  const selectLLM = useCallback(
    (index: number) => {
      console.log("[useLLMConfig] selectLLM:", index);
      if (config.llms?.[index]) {
        onUpdate({ llms: [config.llms[index]] });
      }
    },
    [config.llms, onUpdate],
  );

  const updateLLMArgs = useCallback(
    (key: string, value: unknown) => {
      console.log("[useLLMConfig] updateLLMArgs:", key, value);
      if (editedConfig.llms?.[0]) {
        const updatedLLM = {
          ...editedConfig.llms[0],
          providerArgs: {
            ...editedConfig.llms[0].providerArgs,
            [key]: value,
          },
        };
        onUpdate({ llms: [updatedLLM] });
      }
    },
    [editedConfig.llms, onUpdate],
  );

  const getCurrentLLMIndex = useCallback(() => {
    if (!editedConfig.llms || !config.llms) return 0;
    const currentLLMProvider = editedConfig.llms[0]?.provider;
    const index = config.llms.findIndex(
      (llm) => llm.provider === currentLLMProvider,
    );
    return index >= 0 ? index : 0;
  }, [config.llms, editedConfig.llms]);

  return {
    selectLLM,
    updateLLMArgs,
    getCurrentLLMIndex,
  };
}
