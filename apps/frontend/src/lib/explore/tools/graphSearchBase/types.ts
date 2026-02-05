export interface GraphSearchResult {
  id: string;
  title: string;
  description: string;
  role: string;
  impact?: string | null;
  completedDate: string;
  complexity: number | null;
  fileCount: number | null;
  liveUrl?: string | null;
  githubUrl?: string | null;
  technologies: string[];
  skills: string[];
  patterns: string[];
  codeSnippets?: unknown[] | null;
  resultType: string;
  company?: string | null;
  position?: string | null;
  achievements?: string[] | null;
  score: number;
  matchType?: "semantic" | "graph" | "hybrid" | "template";
}

export interface GraphSearchResponse<TMeta = Record<string, unknown>> {
  query: string;
  results: GraphSearchResult[];
  resultCount: number;
  metadata?: TMeta;
}

export interface RerankOptions {
  enabled?: boolean;
  topN?: number;
  model?: string;
}
