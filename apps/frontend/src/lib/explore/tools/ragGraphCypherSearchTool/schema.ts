import { z } from "zod";
import {
  CypherStrategyKey,
  generateStrategyDescription,
} from "@/lib/explore/tools/graphSearchBase";

const strategyKeys = Object.values(CypherStrategyKey) as [string, ...string[]];

export const RagGraphCypherSearchSchema = z.object({
  query: z.string().describe("The user's search query"),
  cypherKey: z
    .enum(strategyKeys)
    .describe(
      `Select the most appropriate search strategy:\n${generateStrategyDescription()}`,
    ),
  topK: z
    .number()
    .optional()
    .default(10)
    .describe("Number of top results to return"),
  embeddingModelName: z
    .string()
    .describe("Embeddings model name for query embeddings"),
});
