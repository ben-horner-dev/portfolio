import type { Session } from "neo4j-driver";
import neo4j from "neo4j-driver";
import { AgentGraphError } from "@/lib/explore/errors";
import { getEmbeddings } from "@/lib/explore/vector/getEmbeddings";
import { RELATIONSHIP_TYPES } from "@/lib/neo4j";
import { extractNeo4jRecord } from "./schema";
import type { GraphSearchResult } from "./types";

export interface VectorSearchOptions {
  includeCode?: boolean;
  minComplexity?: number;
  dateRange?: {
    start: string;
    end: string;
  };
  technologies?: string[];
}

interface VectorSearchParams {
  qvec: number[];
  k: ReturnType<typeof neo4j.int>;
  top: ReturnType<typeof neo4j.int>;
  minComplexity?: number;
  startDate?: string;
  endDate?: string;
  techFilter?: string[];
}

export async function embedQuery(
  embeddingModelName: string,
  query: string,
): Promise<number[]> {
  const embeddings = await getEmbeddings(embeddingModelName);
  if (typeof embeddings.embedQuery === "function") {
    return embeddings.embedQuery(query);
  }
  const [arr] = await embeddings.embedDocuments([query]);
  return arr;
}

export async function performVectorSearch(
  session: Session,
  qvec: number[],
  topK: number,
  options: VectorSearchOptions = {},
): Promise<GraphSearchResult[]> {
  const kNum = Math.max(topK * 10, 100);
  const topNum = Math.max(topK * 5, 50);

  const whereConditions: string[] = [];
  const params: VectorSearchParams = {
    qvec,
    k: neo4j.int(Math.trunc(kNum)),
    top: neo4j.int(Math.trunc(topNum)),
  };

  if (options.minComplexity) {
    whereConditions.push("p.complexity >= $minComplexity");
    params.minComplexity = options.minComplexity;
  }

  if (options.dateRange) {
    whereConditions.push(
      "p.completedDate >= date($startDate) AND p.completedDate <= date($endDate)",
    );
    params.startDate = options.dateRange.start;
    params.endDate = options.dateRange.end;
  }

  if (options.technologies?.length) {
    whereConditions.push("ANY(tech IN $techFilter WHERE tech IN technologies)");
    params.techFilter = options.technologies;
  }

  const whereClause =
    whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

  const cypher = `
    CALL db.index.vector.queryNodes('project_vec_idx', $k, $qvec)
    YIELD node AS p, score AS vecScore

    OPTIONAL MATCH (p)-[:${RELATIONSHIP_TYPES.USES}]->(t:Technology)
    OPTIONAL MATCH (p)-[:${RELATIONSHIP_TYPES.DEMONSTRATES}]->(s:Skill)
    OPTIONAL MATCH (p)-[:${RELATIONSHIP_TYPES.IMPLEMENTS}]->(pat:Pattern)
    OPTIONAL MATCH (p)-[:${RELATIONSHIP_TYPES.CONTAINS}]->(f:CodeFile)

    WITH p, vecScore,
       collect(DISTINCT t.name) AS technologies,
       collect(DISTINCT s.name) AS skills,
       collect(DISTINCT pat.name) AS patterns,
       count(DISTINCT f) AS fileCount

    ${whereClause}

    ${
      options.includeCode
        ? `
    OPTIONAL MATCH (p)-[:${RELATIONSHIP_TYPES.HAS_CHUNK}]->(chunk:CodeChunk)
    WITH p, vecScore, technologies, skills, patterns, fileCount,
       collect(DISTINCT {
         type: chunk.type,
         content: chunk.content,
         metadata: chunk.metadata
       })[0..3] AS codeSnippets
    `
        : ""
    }

    RETURN 'project' AS resultType,
         p.id AS id,
         p.title AS title,
         p.description AS description,
         p.role AS role,
         p.impact AS impact,
         p.completedDate AS completedDate,
         p.complexity AS complexity,
         p.fileCount AS fileCount,
         p.liveUrl AS liveUrl,
         p.githubUrl AS githubUrl,
         technologies,
         skills,
         patterns,
         ${options.includeCode ? "codeSnippets," : "null AS codeSnippets,"}
         null AS company,
         null AS position,
         null AS achievements,
         vecScore AS score
    ORDER BY vecScore DESC
    LIMIT $top

    UNION ALL

    CALL db.index.vector.queryNodes('employment_vec_idx', $k, $qvec)
    YIELD node AS e, score AS empScore

    OPTIONAL MATCH (e)-[:${RELATIONSHIP_TYPES.USED_TECHNOLOGY}]->(t:Technology)
    OPTIONAL MATCH (e)-[:${RELATIONSHIP_TYPES.ACHIEVED}]->(a:Achievement)-[:${
      RELATIONSHIP_TYPES.DEMONSTRATES
    }]->(s:Skill)
    OPTIONAL MATCH (e)-[:${RELATIONSHIP_TYPES.INCLUDES_PROJECT}]->(p:Project)

    WITH e, empScore,
       collect(DISTINCT t.name) AS technologies,
       collect(DISTINCT s.name) AS skills,
       collect(DISTINCT a.description) AS achievements,
       collect(DISTINCT p.title) AS relatedProjects

    RETURN 'employment' AS resultType,
         e.id AS id,
         e.position AS title,
         e.company + ' - ' +
         CASE WHEN e.isCurrent THEN 'Current'
              ELSE toString(e.endDate) END AS description,
         'professional' AS role,
         CASE WHEN size(achievements) > 0 THEN achievements[0] ELSE null END AS impact,
         e.startDate AS completedDate,
         null AS complexity,
         size(relatedProjects) AS fileCount,
         null AS liveUrl,
         null AS githubUrl,
         technologies,
         skills,
         [] AS patterns,
         null AS codeSnippets,
         e.company AS company,
         e.position AS position,
         achievements[0..3] AS achievements,
         empScore AS score
    ORDER BY empScore DESC
    LIMIT $top
  `;

  try {
    const res = await session.run(cypher, params);
    return res.records.map((r) => extractNeo4jRecord(r, "semantic"));
  } catch (error) {
    throw new AgentGraphError(
      `Vector search failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
}

export function mergeSearchResults(
  vectorResults: GraphSearchResult[],
  graphResults: GraphSearchResult[],
): GraphSearchResult[] {
  const merged = new Map<string, GraphSearchResult>();

  for (const result of vectorResults) {
    merged.set(result.id, {
      ...result,
      score: result.score * 1.2,
      matchType: "hybrid",
    });
  }

  for (const result of graphResults) {
    const existing = merged.get(result.id);
    if (existing) {
      existing.score += result.score;
      existing.matchType = "hybrid";
    } else {
      merged.set(result.id, {
        ...result,
        matchType: result.matchType ?? "graph",
      });
    }
  }

  return Array.from(merged.values()).sort((a, b) => b.score - a.score);
}
