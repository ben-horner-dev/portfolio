"use client";

import { TypographyH3 } from "@/components/atoms/h3";
import type { AgentConfig } from "@/lib/explore/types";

interface LLMConfigSectionProps {
  config: AgentConfig;
  editedConfig: AgentConfig;
  currentLLMIndex: number;
  onLLMSelect: (index: number) => void;
  onLLMArgChange: (key: string, value: unknown) => void;
}

export function LLMConfigSection({
  config,
  editedConfig,
  currentLLMIndex,
  onLLMSelect,
  onLLMArgChange,
}: LLMConfigSectionProps) {
  const currentLLM = editedConfig.llms?.[0];

  return (
    <div className="bg-card/30 backdrop-blur-sm p-3 rounded-xl border border-border/20">
      <div className="mb-3">
        <TypographyH3 text="LLM Configuration" />
      </div>

      <div className="space-y-3">
        <label className="block">
          <span className="block text-sm font-medium text-foreground/80 mb-1">
            Select LLM
          </span>
          <select
            title="Select an LLM"
            value={currentLLMIndex}
            onChange={(e) => onLLMSelect(Number.parseInt(e.target.value, 10))}
            className="w-full px-3 py-2 border border-border/20 rounded-md bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {config.llms?.map((llm, index) => (
              <option key={llm.provider} value={index}>
                {llm.provider}
              </option>
            ))}
          </select>
        </label>

        {currentLLM?.providerArgs && (
          <div className="space-y-2">
            <span className="block text-sm font-medium text-foreground/80">
              LLM Arguments
            </span>
            {Object.entries(currentLLM.providerArgs).map(([key, value]) => (
              <label key={key} className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground w-24">
                  {key}:
                </span>
                <input
                  type={typeof value === "number" ? "number" : "text"}
                  value={String(value)}
                  onChange={(e) =>
                    onLLMArgChange(
                      key,
                      typeof value === "number"
                        ? Number.parseFloat(e.target.value)
                        : e.target.value,
                    )
                  }
                  className="flex-1 px-2 py-1 border border-border/20 rounded text-sm bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
