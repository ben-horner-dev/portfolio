"use client";

import { TypographyH3 } from "@/components/atoms/h3";
import type { ToolConfig } from "@/lib/explore/types";

interface ToolsSectionProps {
  availableTools: ToolConfig[];
  selectedTools?: ToolConfig[];
  onAddTool: (toolName: string) => void;
  onRemoveTool: (toolName: string) => void;
  heading: string;
}

export function ToolsSection({
  availableTools,
  selectedTools = [],
  onAddTool,
  onRemoveTool,
  heading,
}: ToolsSectionProps) {
  return (
    <div className="bg-card/30 backdrop-blur-sm p-3 rounded-xl border border-border/20">
      <div className="mb-3">
        <TypographyH3 text={heading} />
      </div>

      <div className="space-y-3">
        {/* Selected Tools */}
        <div>
          <span className="block text-sm font-medium text-foreground/80 mb-1">
            Selected Tools
          </span>
          <div className="flex flex-wrap gap-2">
            {selectedTools.map((tool) => (
              <span
                key={tool.name}
                className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary rounded text-sm"
              >
                {tool.name}
                <button
                  type="button"
                  onClick={() => onRemoveTool(tool.name)}
                  className="text-primary hover:text-primary/80 font-bold"
                  aria-label={`Remove ${tool.name}`}
                >
                  ×
                </button>
              </span>
            ))}
            {selectedTools.length === 0 && (
              <span className="text-sm text-muted-foreground">
                No tools selected
              </span>
            )}
          </div>
        </div>

        {/* Add Tool */}
        {availableTools.length > 0 && (
          <label className="block">
            <span className="block text-sm font-medium text-foreground/80 mb-1">
              Add Tool
            </span>
            <select
              title="Add a tool"
              onChange={(e) => {
                if (e.target.value) {
                  onAddTool(e.target.value);
                  e.target.value = "";
                }
              }}
              className="w-full px-3 py-2 border border-border/20 rounded-md bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              defaultValue=""
            >
              <option value="" disabled>
                Select a tool to add...
              </option>
              {availableTools.map((tool) => (
                <option key={tool.name} value={tool.name}>
                  {tool.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
    </div>
  );
}
