"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Metric } from "@/app/constants";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/atoms/dialog";
import { TypographyH2 } from "@/components/atoms/h2";
import { TypographyH3 } from "@/components/atoms/h3";
import { MermaidDiagram } from "@/components/atoms/mermaidDiagram";
import { TypographyP } from "@/components/atoms/p";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/atoms/tooltip";
import { LLMConfigSection } from "@/components/molecules/llmConfigSection";
import { SystemPromptSection } from "@/components/molecules/systemPromptSection";
import { ToolsSection } from "@/components/molecules/toolsSection";
import type { AgentConfig } from "@/lib/explore/types";
import { useConfigState } from "@/lib/hooks/useConfigState";
import { useJsonDownload } from "@/lib/hooks/useJsonDownload";
import { useLLMConfig } from "@/lib/hooks/useLLMConfig";
import { useToolsConfig } from "@/lib/hooks/useToolsConfig";
import { useChatStore } from "@/lib/stores/chatStore";

interface ConfigPanelProps {
  config: AgentConfig;
  branchUrl?: string;
  className?: string;
}

export function ConfigPanel({
  config,
  branchUrl,
  className,
}: ConfigPanelProps) {
  const QUICK_EVAL_SIZE = 10;
  const [editedConfig, setEditedConfig] = useState<AgentConfig>(config);
  const { graphMermaid } = useChatStore();

  const {
    updateField,
    resetConfig,
    handleEvaluate,
    evaluate,
    progress,
    percentage,
    total,
    evalError,
    setEvalError,
    decision,
    setDecision,
    setMetricType,
    metricType,
  } = useConfigState(config, branchUrl, setEditedConfig, editedConfig);

  const { filename, setFilename, downloadJson } = useJsonDownload({
    defaultFilename: branchUrl,
  });

  const { selectLLM, updateLLMArgs, getCurrentLLMIndex } = useLLMConfig(
    config,
    editedConfig,
    (updates) => updateField("llms", updates.llms || editedConfig.llms),
  );

  const { addTool, removeTool, getAvailableTools } = useToolsConfig(
    config,
    editedConfig,
    (updates) => updateField("tools", updates.tools || editedConfig.tools),
  );

  const {
    addTool: addInitialTool,
    removeTool: removeInitialTool,
    getAvailableTools: getAvailableInitialTools,
  } = useToolsConfig(config, editedConfig, (updates) =>
    updateField(
      "initialTools",
      updates.initialTools || editedConfig.initialTools,
    ),
  );

  const handleAnswerFormatterSelection = (index: number) => {
    updateField("answerFormatters", [config.answerFormatters[index]]);
  };

  const handleSave = () => {
    setEditedConfig(editedConfig);
    useChatStore.getState().setConfig(editedConfig);
    toast.success("Configuration saved", {
      description: "Your agent configuration has been updated.",
    });
  };

  const handleReset = () => {
    resetConfig();
    toast.info("Configuration reset", {
      description: "Agent configuration has been reset to defaults.",
    });
  };

  const handleDownloadConfig = () => {
    downloadJson(editedConfig);
    toast.success("Download started", {
      description: `${filename || "config"}.json`,
    });
  };

  const currentAnswerFormatterIndex =
    editedConfig.answerFormatters?.length > 0
      ? config.answerFormatters.findIndex(
          (formatter) =>
            formatter.name === editedConfig.answerFormatters[0].name,
        )
      : 0;

  return (
    <div
      className={`flex flex-col max-h-[75vh] overflow-hidden bg-card/30 backdrop-blur-sm rounded-2xl border border-border/20 shadow-2xl p-6 ${
        className ?? ""
      }`}
    >
      <div className="mb-4 shrink-0">
        <TypographyH2 text="Agent Configuration" />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto mb-4 space-y-4">
        <SystemPromptSection
          value={editedConfig.systemPrompt}
          onChange={(value) => updateField("systemPrompt", value)}
        />

        <label className="block bg-card/30 backdrop-blur-sm p-3 rounded-xl border border-border/20">
          <span className="block text-sm font-medium text-foreground/80 mb-1">
            Default Agent Action Log
          </span>
          <textarea
            value={editedConfig.defaultAgentActionLog}
            onChange={(e) =>
              updateField("defaultAgentActionLog", e.target.value)
            }
            className="w-full px-3 py-2 border border-border/20 rounded-md bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary h-16 resize-none"
            placeholder="Enter default action log..."
          />
        </label>

        <LLMConfigSection
          config={config}
          editedConfig={editedConfig}
          currentLLMIndex={getCurrentLLMIndex()}
          onLLMSelect={selectLLM}
          onLLMArgChange={updateLLMArgs}
        />

        <ToolsSection
          availableTools={getAvailableTools()}
          selectedTools={editedConfig.tools}
          onAddTool={addTool}
          onRemoveTool={removeTool}
          heading="Tools"
        />

        <ToolsSection
          availableTools={getAvailableInitialTools()}
          selectedTools={editedConfig.initialTools}
          onAddTool={addInitialTool}
          onRemoveTool={removeInitialTool}
          heading="Initial Tools"
        />

        <div className="bg-card/30 backdrop-blur-sm p-3 rounded-xl border border-border/20">
          <div className="mb-3">
            <TypographyH3 text="Answer Formatter" />
          </div>
          <label className="block">
            <span className="block text-sm font-medium text-foreground/80 mb-1">
              Select Answer Formatter
            </span>
            <select
              title="Select an answer formatter"
              value={
                currentAnswerFormatterIndex >= 0
                  ? currentAnswerFormatterIndex
                  : 0
              }
              onChange={(e) =>
                handleAnswerFormatterSelection(
                  Number.parseInt(e.target.value, 10),
                )
              }
              className="w-full px-3 py-2 border border-border/20 rounded-md bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {config.answerFormatters.map((formatter, index) => (
                <option key={formatter.name} value={index}>
                  {formatter.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="bg-card/30 backdrop-blur-sm p-3 rounded-xl border border-border/20">
          <div className="mb-3">
            <TypographyH3 text="Download Configuration" />
          </div>
          <div className="flex gap-2">
            <label className="flex-1 block">
              <span className="block text-sm font-medium text-foreground/80 mb-1">
                Filename
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <input
                      type="text"
                      value={filename}
                      onChange={(e) => setFilename(e.target.value)}
                      className="w-full px-3 py-2 border border-border/20 rounded-md bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter filename (without .json)"
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="max-w-xs break-all">
                      {filename || "Enter filename"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </label>
            <div className="flex items-end">
              <button
                data-testid="download-agent-config-button"
                type="button"
                onClick={handleDownloadConfig}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary transition-colors cursor-pointer"
              >
                Download JSON
              </button>
            </div>
          </div>
        </div>

        <div className="bg-card/30 backdrop-blur-sm p-3 rounded-xl border border-border/20">
          <div className="mb-3">
            <TypographyH3 text="Evaluation Type" />
          </div>
          <div className="flex items-center space-x-3">
            <span
              className={`text-sm font-medium ${
                metricType === Metric.RAG
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              Retrieval
            </span>
            <button
              type="button"
              className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              style={{
                backgroundColor:
                  metricType === Metric.GENERATION
                    ? "hsl(var(--primary))"
                    : "hsl(var(--muted))",
              }}
              onClick={() =>
                setMetricType(
                  metricType === Metric.RAG ? Metric.GENERATION : Metric.RAG,
                )
              }
            >
              <span
                className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                style={{
                  transform:
                    metricType === Metric.GENERATION
                      ? "translateX(20px)"
                      : "translateX(0px)",
                }}
              />
            </button>
            <span
              className={`text-sm font-medium ${
                metricType === Metric.GENERATION
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              Generation
            </span>
          </div>
          <div className="mt-2">
            <TypographyP
              text={
                metricType === Metric.RAG
                  ? "Evaluate information retrieval accuracy, relevance, and search metrics"
                  : "Evaluate conversation quality, response accuracy, and appropriateness"
              }
            />
          </div>
        </div>

        {!evaluate && (
          <div className="space-y-2">
            <button
              onClick={() => handleEvaluate(QUICK_EVAL_SIZE)}
              type="button"
              data-testid="eval-metrics-quick"
              className="block w-full text-center bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors cursor-pointer"
            >
              Quick Evaluate
            </button>
            <button
              onClick={() => handleEvaluate()}
              type="button"
              data-testid="eval-metrics"
              className="block w-full text-center bg-destructive text-white py-2 rounded-lg hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-destructive transition-colors cursor-pointer"
            >
              Evaluate
            </button>
          </div>
        )}

        {evaluate && (
          <div className="w-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground/80 capitalize">
                evaluating...
              </span>
              <div className="text-sm text-muted-foreground">
                <span className="mr-2">
                  {progress}/{total}
                </span>
                <span className="font-medium">{Math.round(percentage)}%</span>
              </div>
            </div>

            <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${percentage}%` }}
              >
                <div className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full" />
              </div>
            </div>
          </div>
        )}

        {evalError && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-xl flex justify-between items-start gap-3 whitespace-pre-wrap break-all">
            <button
              type="button"
              onClick={() => setEvalError(null)}
              className="text-destructive hover:text-destructive/80 font-bold text-lg leading-none shrink-0 cursor-pointer"
              aria-label="Dismiss error"
            >
              ×
            </button>
            <span className="flex-1 break-words">{evalError}</span>
          </div>
        )}

        {decision && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-600 px-4 py-3 rounded-xl">
            <button
              type="button"
              onClick={() => setDecision(undefined)}
              className="text-green-500 hover:text-green-600 font-bold text-lg leading-none shrink-0 cursor-pointer"
              aria-label="Dismiss result"
            >
              ×
            </button>
            <div className="mb-2">
              <TypographyH3 text="Evaluation Results" />
            </div>
            <pre className="whitespace-pre-wrap break-all text-foreground">
              {decision}
            </pre>
          </div>
        )}
      </div>

      <div className="shrink-0 space-y-2 pt-2">
        <div className="flex gap-2">
          <button
            data-testid="save-agent-config-button"
            type="button"
            onClick={handleSave}
            className="border border-border/20 flex-1 bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary transition-colors cursor-pointer"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 bg-muted text-muted-foreground py-2 rounded-lg hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-muted transition-colors cursor-pointer"
          >
            Reset
          </button>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <button
              type="button"
              disabled={!graphMermaid}
              className="block w-full text-center bg-violet-600 text-white py-2 rounded-lg hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              View Agent Graph
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Agent Graph</DialogTitle>
              <DialogDescription>
                Visual representation of the agent workflow
              </DialogDescription>
            </DialogHeader>
            <div className="bg-muted/30 rounded-lg p-4 min-h-[300px]">
              {graphMermaid ? (
                <MermaidDiagram chart={graphMermaid} className="w-full" />
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No graph available yet. Send a message to generate the agent
                  graph.
                </p>
              )}
            </div>
            <DialogFooter showCloseButton />
          </DialogContent>
        </Dialog>

        <Link
          data-testid="observe-agent-link"
          href={config.langsmithUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center bg-emerald-800 !text-white font-medium py-2 rounded-lg hover:bg-emerald-900 hover:!text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors cursor-pointer"
        >
          Observe Agent In Langsmith
        </Link>
      </div>
    </div>
  );
}
