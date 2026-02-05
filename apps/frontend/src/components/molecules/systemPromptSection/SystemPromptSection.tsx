"use client";

import { TypographyH3 } from "@/components/atoms/h3";

interface SystemPromptSectionProps {
  value: string;
  onChange: (value: string) => void;
}

export function SystemPromptSection({
  value,
  onChange,
}: SystemPromptSectionProps) {
  return (
    <div className="bg-card/30 backdrop-blur-sm p-3 rounded-xl border border-border/20">
      <div className="mb-3">
        <TypographyH3 text="System Prompt" />
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-border/20 rounded-md bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary h-32 resize-none"
        placeholder="Enter system prompt..."
      />
    </div>
  );
}
