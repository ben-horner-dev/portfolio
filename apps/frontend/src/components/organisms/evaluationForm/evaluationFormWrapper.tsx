"use client";

import type { DrizzleHumanEvaluationUpdateMetrics } from "@/lib/db/types";
import { EvaluationForm } from "./evaluationForm";

interface EvaluationFormWrapperProps {
  configId: string;
  evaluatorId: string;
  className?: string;
}

export function EvaluationFormWrapper({
  configId,
  evaluatorId,
  className,
}: EvaluationFormWrapperProps) {
  const handleSave = async (
    values: DrizzleHumanEvaluationUpdateMetrics,
  ): Promise<{ isLocalDev: boolean } | undefined> => {
    // Check if we're in local development without a database
    const isLocalDev =
      typeof window !== "undefined" && window.location.hostname === "localhost";

    // Log evaluation data for development and debugging
    console.log("Evaluation submitted:", {
      configId,
      evaluatorId,
      ...values,
    });

    if (isLocalDev && !process.env.NEXT_PUBLIC_METRICS_DATABASE_URI) {
      // In local dev without database, just log and return
      return { isLocalDev: true };
    }

    // TODO: Implement server action for persisting evaluations
    // The setHumanEval function requires a database connection that
    // needs to be established server-side. Create a dedicated server
    // action endpoint to handle this.

    return { isLocalDev: false };
  };

  return (
    <EvaluationForm
      onSave={handleSave}
      className={`h-full ${className ?? ""}`}
    />
  );
}
