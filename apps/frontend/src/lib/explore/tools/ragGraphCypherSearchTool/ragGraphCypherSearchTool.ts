import {
  type CypherStrategyKey,
  createGraphRagTool,
  type GraphRagToolConfig,
  getCypherStrategy,
} from "@/lib/explore/tools/graphSearchBase";
import { getToolConfig } from "@/lib/explore/tools/utils";
import { TOOL_NAME } from "./constants";
import { RagGraphCypherSearchSchema } from "./schema";
import type { RagGraphCypherSearchArgs } from "./types";

const config: GraphRagToolConfig<RagGraphCypherSearchArgs> = {
  name: TOOL_NAME,
  description: (await getToolConfig(TOOL_NAME)).description,
  schema:
    RagGraphCypherSearchSchema as GraphRagToolConfig<RagGraphCypherSearchArgs>["schema"],
  selectCypher: (input) => {
    const strategy = getCypherStrategy(input.cypherKey as CypherStrategyKey);
    return { cypher: strategy.cypher, params: { query: input.query } };
  },
  getTopK: (input) => input.topK,
  getVectorSearchOptions: (input) => input.searchOptions,
};

export const ragGraphCypherSearchTool = createGraphRagTool(config);
