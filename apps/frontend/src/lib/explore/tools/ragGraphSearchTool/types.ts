import type { VectorSearchOptions } from "@/lib/explore/tools/graphSearchBase";

export interface PortfolioRagGraphSearchArgs {
  query: string;
  topK?: number;
  embeddingModelName: string;
  searchOptions?: VectorSearchOptions;
}
