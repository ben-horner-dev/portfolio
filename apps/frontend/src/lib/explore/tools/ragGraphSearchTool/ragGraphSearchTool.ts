import { RagGraphSearchSchema } from "@/lib/explore/schema";
import {
  CypherStrategyKey,
  createGraphRagTool,
  type GraphRagToolConfig,
  getCypherStrategy,
} from "@/lib/explore/tools/graphSearchBase";
import { getToolConfig } from "@/lib/explore/tools/utils";
import {
  AchievementKeywords,
  CodeKeywords,
  EducationKeywords,
  EmploymentKeywords,
  LeadershipKeywords,
  PatternKeywords,
  SkillKeywords,
  TechnologyKeywords,
  TOOL_NAME,
} from "./constants";
import type { PortfolioRagGraphSearchArgs } from "./types";

export function parseSearchIntent(query: string): CypherStrategyKey {
  const lowerQuery = query.toLowerCase();

  if (Object.values(EmploymentKeywords).some((kw) => lowerQuery.includes(kw))) {
    return CypherStrategyKey.EMPLOYMENT;
  }

  if (
    Object.values(AchievementKeywords).some((kw) => lowerQuery.includes(kw))
  ) {
    return CypherStrategyKey.ACHIEVEMENT;
  }

  if (Object.values(EducationKeywords).some((kw) => lowerQuery.includes(kw))) {
    return CypherStrategyKey.EDUCATION;
  }

  if (Object.values(LeadershipKeywords).some((kw) => lowerQuery.includes(kw))) {
    return CypherStrategyKey.LEADERSHIP;
  }

  if (Object.values(TechnologyKeywords).some((kw) => lowerQuery.includes(kw))) {
    return CypherStrategyKey.TECHNOLOGY;
  }

  if (Object.values(SkillKeywords).some((kw) => lowerQuery.includes(kw))) {
    return CypherStrategyKey.SKILL;
  }

  if (Object.values(PatternKeywords).some((kw) => lowerQuery.includes(kw))) {
    return CypherStrategyKey.PATTERN;
  }

  if (Object.values(CodeKeywords).some((kw) => lowerQuery.includes(kw))) {
    return CypherStrategyKey.GENERAL;
  }

  return CypherStrategyKey.GENERAL;
}

const config: GraphRagToolConfig<PortfolioRagGraphSearchArgs> = {
  name: TOOL_NAME,
  description: (await getToolConfig(TOOL_NAME)).description,
  schema:
    RagGraphSearchSchema as GraphRagToolConfig<PortfolioRagGraphSearchArgs>["schema"],
  selectCypher: (input) => {
    const strategyKey = parseSearchIntent(input.query);
    const strategy = getCypherStrategy(strategyKey);
    return { cypher: strategy.cypher, params: { query: input.query } };
  },
  getTopK: (input) => input.topK,
  getVectorSearchOptions: (input) => input.searchOptions,
};

export const ragGraphSearchTool = createGraphRagTool(config);
