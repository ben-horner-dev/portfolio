"use client";

import { useCallback, useState } from "react";

interface UseJsonDownloadOptions {
  defaultFilename?: string;
}

interface UseJsonDownloadReturn {
  filename: string;
  setFilename: (filename: string) => void;
  downloadJson: (data: unknown) => void;
}

export function useJsonDownload({
  defaultFilename = "config",
}: UseJsonDownloadOptions = {}): UseJsonDownloadReturn {
  const [filename, setFilename] = useState(defaultFilename);

  const downloadJson = useCallback(
    (data: unknown) => {
      console.log("[useJsonDownload] downloadJson:", {
        filename,
        data,
      });

      // Mock download - in real implementation would create blob and trigger download
      const jsonString = JSON.stringify(data, null, 2);
      console.log("[useJsonDownload] JSON content:", jsonString);

      // Simulate download
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    [filename],
  );

  return {
    filename,
    setFilename,
    downloadJson,
  };
}
