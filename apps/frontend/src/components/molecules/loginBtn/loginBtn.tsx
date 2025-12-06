/* v8 ignore next -- @preserve */
import Link from "next/link";
import { Button } from "@/components/atoms/button";

interface LoginButtonProps {
  text: string;
}
export const LoginButton = ({ text }: LoginButtonProps) => (
  <Button
    asChild
    size="lg"
    className="bg-ctp-blue/20 hover:bg-ctp-blue/30 text-ctp-blue border border-ctp-blue/40 hover:border-ctp-blue/60"
  >
    <Link href="/auth/login?returnTo=%2F%23explore">{text}</Link>
  </Button>
);
