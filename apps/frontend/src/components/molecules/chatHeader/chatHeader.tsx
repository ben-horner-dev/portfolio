import type { TypographyH2 } from "@/components/atoms/h2";
import type { TypographyP } from "@/components/atoms/p";

interface ChatHeaderProps {
  title: React.ReactElement<React.ComponentProps<typeof TypographyH2>>;
  subtitle: React.ReactElement<React.ComponentProps<typeof TypographyP>>;
  action?: React.ReactNode;
}

export function ChatHeader({ title, subtitle, action }: ChatHeaderProps) {
  return (
    <div className="bg-ctp-surface0/80 backdrop-blur-md px-6 py-4 border-b border-ctp-surface2/50 shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-ctp-red rounded-full animate-pulse" />
          <div className="w-3 h-3 bg-ctp-yellow rounded-full animate-pulse [animation-delay:0.2s]" />
          <div className="w-3 h-3 bg-ctp-green rounded-full animate-pulse [animation-delay:0.4s]" />
        </div>
        {action}
      </div>
      <div className="space-y-1">
        {title}
        {subtitle}
      </div>
    </div>
  );
}
