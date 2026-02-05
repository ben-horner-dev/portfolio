"use client";

import { useCallback, useState } from "react";
import type { AgentConfig } from "@/lib/explore/types";

export enum Metric {
  RAG = "RAG",
  GENERATION = "GENERATION",
}

interface UseConfigStateReturn {
  updateField: <K extends keyof AgentConfig>(
    field: K,
    value: AgentConfig[K],
  ) => void;
  resetConfig: () => void;
  handleEvaluate: (size?: number) => void;
  evaluate: boolean;
  progress: number;
  percentage: number;
  total: number;
  evalError: string | null;
  setEvalError: (error: string | null) => void;
  decision: string | undefined;
  setDecision: (decision: string | undefined) => void;
  metricType: Metric;
  setMetricType: (type: Metric) => void;
}

export function useConfigState(
  config: AgentConfig,
  branchUrl: string | undefined,
  setEditedConfig: React.Dispatch<React.SetStateAction<AgentConfig>>,
  editedConfig: AgentConfig,
): UseConfigStateReturn {
  const [evaluate, setEvaluate] = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [evalError, setEvalError] = useState<string | null>(null);
  const [decision, setDecision] = useState<string | undefined>(undefined);
  const [metricType, setMetricType] = useState<Metric>(Metric.RAG);

  const percentage = total > 0 ? (progress / total) * 100 : 0;

  const updateField = useCallback(
    <K extends keyof AgentConfig>(field: K, value: AgentConfig[K]) => {
      console.log("[useConfigState] updateField:", field, value);
      setEditedConfig((prev) => ({ ...prev, [field]: value }));
    },
    [setEditedConfig],
  );

  const resetConfig = useCallback(() => {
    console.log("[useConfigState] resetConfig to original:", config);
    setEditedConfig(config);
  }, [config, setEditedConfig]);

  const handleEvaluate = useCallback(
    (size?: number) => {
      console.log("[useConfigState] handleEvaluate:", {
        size,
        branchUrl,
        metricType,
        editedConfig,
      });
      setEvaluate(true);
      setTotal(size ?? 100);
      setProgress(0);

      // Simulate progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          const next = prev + 1;
          if (next >= (size ?? 100)) {
            clearInterval(interval);
            setEvaluate(false);
            setDecision("Evaluation complete (mock)");
            return size ?? 100;
          }
          return next;
        });
      }, 100);
    },
    [branchUrl, metricType, editedConfig],
  );

  return {
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
    metricType,
    setMetricType,
  };
}
