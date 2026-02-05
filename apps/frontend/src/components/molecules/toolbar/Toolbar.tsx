"use client";

import { VercelToolbar } from "@vercel/toolbar/next";

function useIsDevLocal() {
  return (
    typeof window !== "undefined" && window.location.hostname === "localhost"
  );
}

export function DevToolbar() {
  const isDevLocal = useIsDevLocal();
  return isDevLocal ? <VercelToolbar /> : null;
}
