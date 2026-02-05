"use client";

import { Button } from "@/components/atoms/button";
import { TypographyH2 } from "@/components/atoms/h2";
import { TypographyP } from "@/components/atoms/p";
import { EvaluationField } from "@/components/molecules/evaluationField";
import { SaveStatus } from "@/components/molecules/saveStatus";
import type { DrizzleHumanEvaluationUpdateMetrics } from "@/lib/db/types";
import {
  type EvaluationFieldConfig,
  useEvaluationForm,
} from "@/lib/hooks/useEvaluationForm";
import { cn } from "@/lib/utils";

const EVALUATION_FIELDS: EvaluationFieldConfig[] = [
  { key: "informationAccuracy", label: "Information Accuracy" },
  { key: "responseHelpfulness", label: "Response Helpfulness" },
  { key: "responseRelevance", label: "Response Relevance" },
  { key: "responseCompleteness", label: "Response Completeness" },
  { key: "conversationalQuality", label: "Conversational Quality" },
  { key: "overallSatisfaction", label: "Overall Satisfaction" },
];

const DEFAULT_VALUES: DrizzleHumanEvaluationUpdateMetrics = {
  informationAccuracy: 3,
  responseHelpfulness: 3,
  responseRelevance: 3,
  responseCompleteness: 3,
  conversationalQuality: 3,
  overallSatisfaction: 3,
};

interface EvaluationFormProps {
  initialValues?: DrizzleHumanEvaluationUpdateMetrics;
  onSave: (
    values: DrizzleHumanEvaluationUpdateMetrics,
  ) => Promise<{ isLocalDev: boolean } | undefined>;
  className?: string;
}

export function EvaluationForm({
  initialValues = DEFAULT_VALUES,
  onSave,
  className,
}: EvaluationFormProps) {
  const {
    values,
    isLoading,
    saveStatus,
    errorMessage,
    validationErrors,
    setFieldValue,
    save,
  } = useEvaluationForm({
    initialValues,
    onSave,
  });

  const hasAllRatings = Object.values(values).every(
    (value) => value >= 1 && value <= 5,
  );

  return (
    <div
      className={cn(
        "h-full max-h-[75vh] flex flex-col bg-card/30 backdrop-blur-sm rounded-2xl border border-border/20 shadow-2xl p-6",
        className,
      )}
      data-slot="evaluation-form"
    >
      <div className="space-y-1 mb-6">
        <TypographyH2 text="Help improve this AI assistant" />
        <TypographyP text="Quick feedback helps Ben make this experience better" />
      </div>

      <div className="flex-1 overflow-visible xl:overflow-y-auto space-y-4 mb-6">
        {EVALUATION_FIELDS.map((field) => (
          <EvaluationField
            key={field.key}
            label={field.label}
            value={values[field.key]}
            onChange={(value) => setFieldValue(field.key, value)}
            error={validationErrors[field.key]}
            disabled={isLoading}
          />
        ))}
      </div>

      <div className="space-y-3 mt-auto">
        <Button
          type="button"
          onClick={save}
          disabled={isLoading || !hasAllRatings}
          variant="default"
          size="sm"
          className="w-full"
        >
          {isLoading ? "Saving..." : "Save Evaluation"}
        </Button>

        <SaveStatus
          status={saveStatus}
          message={saveStatus === "error" ? errorMessage : undefined}
        />
      </div>
    </div>
  );
}
