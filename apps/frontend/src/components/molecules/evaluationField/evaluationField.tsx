"use client";

import { Slider } from "@/components/atoms/slider";
import { cn } from "@/lib/utils";

interface EvaluationFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  error?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  className?: string;
}

export function EvaluationField({
  label,
  value,
  onChange,
  error,
  disabled = false,
  min = 1,
  max = 5,
  className,
}: EvaluationFieldProps) {
  const handleValueChange = (values: number[]) => {
    if (values[0] !== undefined) {
      onChange(values[0]);
    }
  };

  return (
    <div className={cn("space-y-2", className)} data-slot="evaluation-field">
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "text-sm font-medium text-foreground",
            disabled && "opacity-50",
          )}
          id={`${label.replace(/\s+/g, "-").toLowerCase()}-label`}
        >
          {label}
        </span>
        <span
          className={cn(
            "text-sm font-semibold tabular-nums text-primary",
            disabled && "opacity-50",
          )}
          aria-live="polite"
        >
          {value}/{max}
        </span>
      </div>

      <Slider
        value={[value]}
        onValueChange={handleValueChange}
        min={min}
        max={max}
        step={1}
        disabled={disabled}
        aria-label={label}
        aria-labelledby={`${label.replace(/\s+/g, "-").toLowerCase()}-label`}
        className={cn(error && "ring-2 ring-destructive/50 rounded")}
      />

      {error && (
        <p
          className="text-xs text-destructive"
          role="alert"
          data-slot="evaluation-field-error"
        >
          {error}
        </p>
      )}
    </div>
  );
}
