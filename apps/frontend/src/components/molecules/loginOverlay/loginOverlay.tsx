import type { Button } from "@/components/atoms/button";
import type { TypographyH2 } from "@/components/atoms/h2";
import type { TypographyP } from "@/components/atoms/p";

interface LoginOverlayProps {
  title: React.ReactElement<React.ComponentProps<typeof TypographyH2>>;
  description: React.ReactElement<React.ComponentProps<typeof TypographyP>>;
  loginButton: React.ReactElement<React.ComponentProps<typeof Button>>;
  guestButton?: React.ReactElement<React.ComponentProps<typeof Button>>;
}

export function LoginOverlay({
  title,
  description,
  loginButton,
  guestButton,
}: LoginOverlayProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/5 backdrop-blur-[4px] rounded-2xl">
      <div className="text-center space-y-6 p-8 bg-background backdrop-blur-sm rounded-xl border border-border/20 shadow-lg animate-terminal-glow transition-all duration-500">
        <div className="space-y-2">
          {title}
          {description}
        </div>
        <div className="flex flex-col gap-3">
          {loginButton}
          {guestButton && (
            <>
              <span className="text-muted-foreground text-sm">or</span>
              {guestButton}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
