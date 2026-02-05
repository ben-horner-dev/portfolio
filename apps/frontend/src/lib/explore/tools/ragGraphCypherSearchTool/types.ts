import type {
  CypherStrategyKey,
  VectorSearchOptions,
} from "@/lib/explore/tools/graphSearchBase";

export interface RagGraphCypherSearchArgs {
  query: string;
  cypherKey: CypherStrategyKey;
  topK?: number;
  embeddingModelName: string;
  searchOptions?: VectorSearchOptions;
}
