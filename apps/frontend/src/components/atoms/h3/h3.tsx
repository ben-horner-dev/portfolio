import type { TypographyProps } from "@/lib/types";

export function TypographyH3({ text }: TypographyProps) {
  return (
    <h3 className="scroll-m-20 text-lg font-semibold tracking-tight">{text}</h3>
  );
}
