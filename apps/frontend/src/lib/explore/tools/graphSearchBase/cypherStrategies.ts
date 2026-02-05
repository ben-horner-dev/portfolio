import { RELATIONSHIP_TYPES } from "@/lib/neo4j";

export enum CypherStrategyKey {
  TECHNOLOGY = "technology",
  SKILL = "skill",
  PATTERN = "pattern",
  EMPLOYMENT = "employment",
  ACHIEVEMENT = "achievement",
  EDUCATION = "education",
  LEADERSHIP = "leadership",
  GENERAL = "general",
}

export interface CypherStrategy {
  description: string;
  cypher: string;
}

export const CYPHER_STRATEGIES: Record<CypherStrategyKey, CypherStrategy> = {
  [CypherStrategyKey.TECHNOLOGY]: {
    description:
      "Find projects using specific technologies (React, Python, AWS, etc.)",
    cypher: `
      MATCH (t:Technology)<-[:${RELATIONSHIP_TYPES.USES}]-(p:Project)
      WHERE toLower(t.name) CONTAINS toLower($query)
      OPTIONAL MATCH (p)-[:${RELATIONSHIP_TYPES.DEMONSTRATES}]->(s:Skill)
      OPTIONAL MATCH (p)-[:${RELATIONSHIP_TYPES.IMPLEMENTS}]->(pat:Pattern)

      WITH p, collect(DISTINCT s.name) AS skills,
         collect(DISTINCT pat.name) AS patterns,
         [(p)-[:${RELATIONSHIP_TYPES.USES}]->(tech:Technology) | tech.name] AS technologies

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
           null AS codeSnippets,
           null AS company,
           null AS position,
           null AS achievements,
           1.0 AS score
      ORDER BY p.completedDate DESC
    `,
  },

  [CypherStrategyKey.SKILL]: {
    description: "Find projects demonstrating specific skills",
    cypher: `
      MATCH (s:Skill)<-[:${RELATIONSHIP_TYPES.DEMONSTRATES}]-(p:Project)
      WHERE toLower(s.name) CONTAINS toLower($query)
      OPTIONAL MATCH (p)-[:${RELATIONSHIP_TYPES.USES}]->(t:Technology)
      OPTIONAL MATCH (p)-[:${RELATIONSHIP_TYPES.IMPLEMENTS}]->(pat:Pattern)

      WITH p, s, collect(DISTINCT t.name) AS technologies,
         collect(DISTINCT pat.name) AS patterns

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
           [s.name] AS skills,
           patterns,
           null AS codeSnippets,
           null AS company,
           null AS position,
           null AS achievements,
           p.complexity / 10.0 AS score
      ORDER BY p.completedDate DESC
    `,
  },

  [CypherStrategyKey.PATTERN]: {
    description:
      "Find projects implementing design patterns (MVC, microservices, etc.)",
    cypher: `
      MATCH (pat:Pattern)<-[:${RELATIONSHIP_TYPES.IMPLEMENTS}]-(p:Project)
      WHERE toLower(pat.name) CONTAINS toLower($query)
      OPTIONAL MATCH (p)-[:${RELATIONSHIP_TYPES.USES}]->(t:Technology)
      OPTIONAL MATCH (p)-[:${RELATIONSHIP_TYPES.DEMONSTRATES}]->(s:Skill)

      WITH p, collect(DISTINCT t.name) AS technologies,
         collect(DISTINCT s.name) AS skills,
         [pat.name] AS patterns

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
           null AS codeSnippets,
           null AS company,
           null AS position,
           null AS achievements,
           1.0 AS score
    `,
  },

  [CypherStrategyKey.EMPLOYMENT]: {
    description: "Work history, jobs, companies, positions held",
    cypher: `
      MATCH (e:Employment)
      OPTIONAL MATCH (e)-[:${RELATIONSHIP_TYPES.USED_TECHNOLOGY}]->(t:Technology)
      OPTIONAL MATCH (e)-[:${RELATIONSHIP_TYPES.ACHIEVED}]->(a:Achievement)
      OPTIONAL MATCH (e)-[:${RELATIONSHIP_TYPES.INCLUDES_PROJECT}]->(p:Project)

      WITH e, collect(DISTINCT t.name) AS technologies,
         collect(DISTINCT a.description) AS achievements,
         collect(DISTINCT p.title) AS relatedProjects

      RETURN 'employment' AS resultType,
           e.id AS id,
           e.position AS title,
           e.company + ' (' + toString(e.startDate) +
           CASE WHEN e.isCurrent THEN ' - Present)'
                ELSE ' - ' + toString(e.endDate) + ')' END AS description,
           'professional' AS role,
           CASE WHEN size(achievements) > 0 THEN achievements[0] ELSE null END AS impact,
           e.startDate AS completedDate,
           null AS complexity,
           size(relatedProjects) AS fileCount,
           null AS liveUrl,
           null AS githubUrl,
           technologies,
           [] AS skills,
           [] AS patterns,
           null AS codeSnippets,
           e.company AS company,
           e.position AS position,
           achievements[0..3] AS achievements,
           1.0 AS score
      ORDER BY e.startDate DESC
    `,
  },

  [CypherStrategyKey.ACHIEVEMENT]: {
    description: "Accomplishments, impact, what was delivered or improved",
    cypher: `
      CALL db.index.fulltext.queryNodes('achievement_search', $query)
      YIELD node AS a, score

      MATCH (a)<-[:${RELATIONSHIP_TYPES.ACHIEVED}]-(e:Employment)
      OPTIONAL MATCH (a)-[:${RELATIONSHIP_TYPES.DEMONSTRATES}]->(s:Skill)
      OPTIONAL MATCH (e)-[:${RELATIONSHIP_TYPES.USED_TECHNOLOGY}]->(t:Technology)

      WITH a, e, score,
         collect(DISTINCT s.name) AS skills,
         collect(DISTINCT t.name) AS technologies

      RETURN 'achievement' AS resultType,
           a.id AS id,
           'Achievement at ' + e.company AS title,
           a.description AS description,
           'achievement' AS role,
           a.description AS impact,
           e.startDate AS completedDate,
           CASE a.impact
             WHEN 'high' THEN 8
             WHEN 'medium' THEN 5
             WHEN 'low' THEN 3
             ELSE 1 END AS complexity,
           null AS fileCount,
           null AS liveUrl,
           null AS githubUrl,
           technologies,
           skills,
           [] AS patterns,
           null AS codeSnippets,
           e.company AS company,
           e.position AS position,
           [a.description] AS achievements,
           score
      ORDER BY score DESC
      LIMIT 20
    `,
  },

  [CypherStrategyKey.EDUCATION]: {
    description: "Degrees, universities, institutions, subjects studied",
    cypher: `
      MATCH (ed:Education)
      OPTIONAL MATCH (ed)-[:${RELATIONSHIP_TYPES.AT_INSTITUTION}]->(i:Institution)
      OPTIONAL MATCH (ed)-[:${RELATIONSHIP_TYPES.FOR_DEGREE}]->(d:Degree)
      OPTIONAL MATCH (ed)-[:${RELATIONSHIP_TYPES.COVERED}]->(s:Subject)

      WITH ed, i, d, collect(DISTINCT s.name) AS subjects

      RETURN 'education' AS resultType,
           ed.id AS id,
           d.name + ' at ' + i.name AS title,
           'Graduated ' + toString(ed.endDate) +
           CASE WHEN ed.grade IS NOT NULL THEN ' with ' + ed.grade ELSE '' END AS description,
           'education' AS role,
           null AS impact,
           ed.endDate AS completedDate,
           null AS complexity,
           size(subjects) AS fileCount,
           null AS liveUrl,
           null AS githubUrl,
           [] AS technologies,
           subjects AS skills,
           [] AS patterns,
           null AS codeSnippets,
           i.name AS company,
           d.name AS position,
           [] AS achievements,
           1.0 AS score
      ORDER BY ed.endDate DESC
    `,
  },

  [CypherStrategyKey.LEADERSHIP]: {
    description: "Team leadership, management experience, mentoring",
    cypher: `
      MATCH (e:Employment)-[:${RELATIONSHIP_TYPES.ACHIEVED}]->(a:Achievement)
      WHERE a.description CONTAINS 'lead' OR a.description CONTAINS 'team'
         OR a.description CONTAINS 'manage' OR a.description CONTAINS 'mentor'
         OR a.description CONTAINS 'Led' OR a.description CONTAINS 'Managed'

      OPTIONAL MATCH (e)-[:${RELATIONSHIP_TYPES.USED_TECHNOLOGY}]->(t:Technology)
      OPTIONAL MATCH (a)-[:${RELATIONSHIP_TYPES.DEMONSTRATES}]->(s:Skill)

      WITH e, collect(DISTINCT a.description) AS achievements,
           collect(DISTINCT t.name) AS technologies,
           collect(DISTINCT s.name) AS skills

      WHERE size(achievements) > 0

      RETURN 'leadership' AS resultType,
           e.id AS id,
           'Leadership at ' + e.company AS title,
           e.position + ' - Leadership & Management Experience' AS description,
           'leadership' AS role,
           achievements[0] AS impact,
           e.startDate AS completedDate,
           size(achievements) AS complexity,
           null AS fileCount,
           null AS liveUrl,
           null AS githubUrl,
           technologies,
           skills + ['Leadership', 'Team Management'] AS skills,
           [] AS patterns,
           null AS codeSnippets,
           e.company AS company,
           e.position AS position,
           achievements[0..3] AS achievements,
           toFloat(size(achievements)) AS score
      ORDER BY score DESC
      LIMIT 20
    `,
  },

  [CypherStrategyKey.GENERAL]: {
    description: "General project search by title, description, or content",
    cypher: `
      CALL db.index.fulltext.queryNodes('project_search', $query)
      YIELD node AS p, score

      OPTIONAL MATCH (p)-[:${RELATIONSHIP_TYPES.USES}]->(t:Technology)
      OPTIONAL MATCH (p)-[:${RELATIONSHIP_TYPES.DEMONSTRATES}]->(s:Skill)
      OPTIONAL MATCH (p)-[:${RELATIONSHIP_TYPES.IMPLEMENTS}]->(pat:Pattern)

      WITH p, score, collect(DISTINCT t.name) AS technologies,
         collect(DISTINCT s.name) AS skills,
         collect(DISTINCT pat.name) AS patterns

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
           null AS codeSnippets,
           null AS company,
           null AS position,
           null AS achievements,
           score
      ORDER BY score DESC
      LIMIT 20
    `,
  },
};

export const getCypherStrategy = (key: CypherStrategyKey): CypherStrategy => {
  return CYPHER_STRATEGIES[key];
};

export const generateStrategyDescription = (): string => {
  return Object.entries(CYPHER_STRATEGIES)
    .map(([key, strategy]) => `- ${key}: ${strategy.description}`)
    .join("\n");
};
