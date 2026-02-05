import { CohereClient } from "cohere-ai";
import type { Session } from "neo4j-driver";
import { AgentGraphError } from "@/lib/explore/errors";
import { getNeogma } from "@/lib/neo4j";
import { extractNeo4jRecord } from "./schema";
import type { GraphSearchResult, RerankOptions } from "./types";

const DEFAULT_RERANK_MODEL = "rerank-english-v3.0";

export const createNeo4jSession = (): Session => {
  let neogma: ReturnType<typeof getNeogma>;
  try {
    neogma = getNeogma();
  } catch (error) {
    throw new AgentGraphError(
      error instanceof Error
        ? error.message
        : "Failed to initialize Neo4j connection",
    );
  }
  return neogma.driver.session();
};

export const executeQuery = async (
  session: Session,
  cypher: string,
  params: Record<string, unknown>,
  matchType: "semantic" | "graph" | "hybrid" | "template" = "template",
): Promise<GraphSearchResult[]> => {
  try {
    const result = await session.run(cypher, params);
    return result.records.map((record) =>
      extractNeo4jRecord(record, matchType),
    );
  } catch (error) {
    throw new AgentGraphError(
      `Failed to execute query: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
};

export const buildRerankDocument = (result: GraphSearchResult): string => {
  const parts = [
    result.title,
    result.description,
    result.role,
    result.impact,
    result.technologies.length > 0
      ? `Technologies: ${result.technologies.join(", ")}`
      : null,
    result.skills.length > 0 ? `Skills: ${result.skills.join(", ")}` : null,
    result.patterns.length > 0
      ? `Patterns: ${result.patterns.join(", ")}`
      : null,
  ];

  return parts.filter(Boolean).join(" | ");
};

export const rerankResults = async (
  query: string,
  results: GraphSearchResult[],
  options: RerankOptions = {},
): Promise<GraphSearchResult[]> => {
  const { enabled = true, topN = 10, model = DEFAULT_RERANK_MODEL } = options;

  if (!enabled || results.length === 0) {
    return results;
  }

  if (results.length <= topN) {
    return results;
  }

  const cohereApiKey = process.env.COHERE_API_KEY;
  if (!cohereApiKey) {
    return results.slice(0, topN);
  }

  try {
    const cohere = new CohereClient({ token: cohereApiKey });
    const documents = results.map((r) => buildRerankDocument(r));

    const reranked = await cohere.rerank({
      model,
      query,
      documents,
      topN,
    });

    return reranked.results.map((r) => results[r.index]);
  } catch {
    return results.slice(0, topN);
  }
};
