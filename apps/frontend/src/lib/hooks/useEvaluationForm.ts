"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { SaveStatusType } from "@/components/molecules/saveStatus";
import type { DrizzleHumanEvaluationUpdateMetrics } from "@/lib/db/types";

export type EvaluationFieldKey = keyof DrizzleHumanEvaluationUpdateMetrics;

export interface EvaluationFieldConfig {
  key: EvaluationFieldKey;
  label: string;
}

export interface UseEvaluationFormOptions {
  initialValues: DrizzleHumanEvaluationUpdateMetrics;
  onSave: (
    values: DrizzleHumanEvaluationUpdateMetrics,
  ) => Promise<{ isLocalDev: boolean } | undefined>;
}

export interface UseEvaluationFormReturn {
  values: DrizzleHumanEvaluationUpdateMetrics;
  isLoading: boolean;
  saveStatus: SaveStatusType;
  errorMessage: string;
  validationErrors: Record<string, string>;
  setFieldValue: (field: EvaluationFieldKey, value: number) => void;
  validate: () => boolean;
  save: () => Promise<void>;
  resetStatus: () => void;
}

const MIN_RATING = 1;
const MAX_RATING = 5;

export const useEvaluationForm = ({
  initialValues,
  onSave,
}: UseEvaluationFormOptions): UseEvaluationFormReturn => {
  const [values, setValues] =
    useState<DrizzleHumanEvaluationUpdateMetrics>(initialValues);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatusType>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const setFieldValue = useCallback(
    (field: EvaluationFieldKey, value: number) => {
      setValues((prev) => ({
        ...prev,
        [field]: value,
      }));

      if (validationErrors[field]) {
        setValidationErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }

      if (saveStatus !== "idle") {
        setSaveStatus("idle");
        setErrorMessage("");
      }
    },
    [validationErrors, saveStatus],
  );

  const validate = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    const fields: EvaluationFieldKey[] = [
      "informationAccuracy",
      "responseHelpfulness",
      "responseRelevance",
      "responseCompleteness",
      "conversationalQuality",
      "overallSatisfaction",
    ];

    for (const field of fields) {
      const value = values[field];
      if (value < MIN_RATING || value > MAX_RATING) {
        errors[field] =
          `Rating must be between ${MIN_RATING} and ${MAX_RATING}`;
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [values]);

  const save = useCallback(async () => {
    if (!validate()) {
      setErrorMessage("Please fix the validation errors before saving.");
      toast.error("Validation failed", {
        description: "Please fix the errors before saving.",
      });
      return;
    }

    setIsLoading(true);
    setSaveStatus("idle");
    setErrorMessage("");

    try {
      const result = await onSave(values);
      if (result?.isLocalDev) {
        setSaveStatus("local-dev");
        toast.info("Local development mode", {
          description: "Evaluation logged to console (no database connection).",
        });
      } else {
        setSaveStatus("success");
        toast.success("Evaluation saved", {
          description: "Thank you for your feedback!",
        });
      }
    } catch (error) {
      setSaveStatus("error");
      const message =
        error instanceof Error ? error.message : "Failed to save evaluation";
      setErrorMessage(message);
      toast.error("Failed to save", {
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [validate, onSave, values]);

  const resetStatus = useCallback(() => {
    setSaveStatus("idle");
    setErrorMessage("");
    setValidationErrors({});
  }, []);

  return {
    values,
    isLoading,
    saveStatus,
    errorMessage,
    validationErrors,
    setFieldValue,
    validate,
    save,
    resetStatus,
  };
};
