import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const saveStatusVariants = cva("text-sm text-center", {
  variants: {
    status: {
      idle: "text-muted-foreground",
      success: "text-green-600 dark:text-green-400",
      "local-dev": "text-blue-600 dark:text-blue-400",
      error: "text-destructive",
    },
  },
  defaultVariants: {
    status: "idle",
  },
});

export type SaveStatusType = "idle" | "success" | "local-dev" | "error";

interface SaveStatusProps extends VariantProps<typeof saveStatusVariants> {
  status: SaveStatusType;
  message?: string;
  className?: string;
}

const defaultMessages: Record<SaveStatusType, string> = {
  idle: "",
  success: "Evaluation saved successfully!",
  "local-dev":
    "Local development mode - evaluation not saved (will work in preview deployments)",
  error: "Failed to save evaluation",
};

export function SaveStatus({ status, message, className }: SaveStatusProps) {
  if (status === "idle" && !message) {
    return null;
  }

  const displayMessage = message ?? defaultMessages[status];

  return (
    <div
      className={cn(saveStatusVariants({ status }), className)}
      role="alert"
      aria-live="polite"
      data-slot="save-status"
    >
      {displayMessage}
    </div>
  );
}
