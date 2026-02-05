import type { StructuredToolInterface } from "@langchain/core/tools";
import { tool } from "@langchain/core/tools";
import type { z } from "zod";
import type { GraphSearchResponse, GraphSearchResult } from "./types";
import { createNeo4jSession, executeQuery, rerankResults } from "./utils";
import type { VectorSearchOptions } from "./vectorSearch";
import {
  embedQuery,
  mergeSearchResults,
  performVectorSearch,
} from "./vectorSearch";

export interface CypherSelection {
  cypher: string;
  params: Record<string, unknown>;
}

export interface GraphRagToolConfig<
  TInput extends { query: string; embeddingModelName: string },
> {
  name: string;
  description: string;
  schema: z.ZodSchema<TInput>;
  selectCypher: (input: TInput) => CypherSelection;
  getTopK?: (input: TInput) => number;
  getVectorSearchOptions?: (input: TInput) => VectorSearchOptions;
}

const DEFAULT_TOP_K = 10;

async function executeGraphRagSearch<
  TInput extends { query: string; embeddingModelName: string },
>(
  input: TInput,
  config: GraphRagToolConfig<TInput>,
): Promise<GraphSearchResponse> {
  const { query, embeddingModelName } = input;
  const topK = config.getTopK?.(input) ?? DEFAULT_TOP_K;
  const vectorOptions = config.getVectorSearchOptions?.(input) ?? {};
  const { cypher, params } = config.selectCypher(input);

  const qvec = await embedQuery(embeddingModelName, query);

  const [vectorResults, cypherResults] = await Promise.all([
    (async () => {
      const vectorSession = createNeo4jSession();
      try {
        return await performVectorSearch(
          vectorSession,
          qvec,
          topK,
          vectorOptions,
        );
      } finally {
        await vectorSession.close();
      }
    })(),
    (async () => {
      const graphSession = createNeo4jSession();
      try {
        return await executeQuery(graphSession, cypher, params, "graph");
      } finally {
        await graphSession.close();
      }
    })(),
  ]);

  const merged = mergeSearchResults(vectorResults, cypherResults);
  const finalResults = await rerankResults(query, merged, { topN: topK });

  return {
    query,
    results: finalResults as GraphSearchResult[],
    resultCount: finalResults.length,
  };
}

export function createGraphRagTool<
  TInput extends { query: string; embeddingModelName: string },
>(config: GraphRagToolConfig<TInput>): StructuredToolInterface {
  return tool(
    async (input: TInput): Promise<string> => {
      const response = await executeGraphRagSearch(input, config);
      return JSON.stringify(response, null, 2);
    },
    {
      name: config.name,
      description: config.description,
      schema: config.schema,
    },
  );
}

export { executeGraphRagSearch };
