"use client";

import mermaid from "mermaid";
import { useEffect, useRef } from "react";

interface MermaidDiagramProps {
  chart: string;
  className?: string;
}

mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  securityLevel: "loose",
});

export function MermaidDiagram({ chart, className }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const render = async () => {
      if (containerRef.current && chart) {
        containerRef.current.innerHTML = chart;
        containerRef.current.removeAttribute("data-processed");
        await mermaid.run({ nodes: [containerRef.current] });
      }
    };
    render();
  }, [chart]);

  if (!chart) {
    return (
      <div
        className={`flex items-center justify-center p-8 ${className ?? ""}`}
      >
        <span className="text-muted-foreground">No diagram available</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`mermaid overflow-auto flex justify-center ${className ?? ""}`}
    />
  );
}
