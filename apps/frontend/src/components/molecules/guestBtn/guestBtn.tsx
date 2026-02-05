/* v8 ignore next -- @preserve */
import Link from "next/link";
import { Button } from "@/components/atoms/button";

interface GuestButtonProps {
  text: string;
}

export const GuestButton = ({ text }: GuestButtonProps) => (
  <Button
    asChild
    size="lg"
    variant="outline"
    className="bg-transparent hover:bg-muted/50 text-muted-foreground border border-border/40 hover:border-border/60"
  >
    <Link href="/?guest=true#explore">{text}</Link>
  </Button>
);
