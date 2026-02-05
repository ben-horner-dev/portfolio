import type { Neogma } from "neogma";
import { RELATIONSHIP_TYPES } from "@/lib/neo4j/relationships";

export interface Neo4jNode {
  type: "node";
  id: string;
  labels: string[];
  properties: Record<string, unknown>;
}

export interface Neo4jRelationship {
  type: "relationship";
  id: string;
  label: string;
  start: Neo4jNode;
  end: Neo4jNode;
  properties?: Record<string, unknown>;
}

export type Neo4jRecord = Neo4jNode | Neo4jRelationship;

export async function parseNeo4jJsonl(
  jsonlPath: string,
  options: { maxNodes?: number; maxRelationships?: number } = {},
): Promise<{ nodes: Neo4jNode[]; relationships: Neo4jRelationship[] }> {
  const { maxNodes = 100, maxRelationships = 200 } = options;

  const fs = await import("node:fs");
  const readline = await import("node:readline");

  const nodes: Neo4jNode[] = [];
  const relationships: Neo4jRelationship[] = [];

  const fileStream = fs.createReadStream(jsonlPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Number.POSITIVE_INFINITY,
  });

  for await (const line of rl) {
    if (!line.trim()) continue;

    try {
      const record = JSON.parse(line) as Neo4jRecord;

      if (record.type === "node" && nodes.length < maxNodes) {
        nodes.push(record);
      } else if (
        record.type === "relationship" &&
        relationships.length < maxRelationships
      ) {
        relationships.push(record);
      }

      if (
        nodes.length >= maxNodes &&
        relationships.length >= maxRelationships
      ) {
        break;
      }
    } catch {}
  }

  return { nodes, relationships };
}

export function createMinimalTestFixtures(): {
  nodes: Neo4jNode[];
  relationships: Neo4jRelationship[];
} {
  const nodes: Neo4jNode[] = [
    {
      type: "node",
      id: "0",
      labels: ["Technology"],
      properties: {
        name: "TypeScript",
        id: "tech-typescript",
        category: "Language",
      },
    },
    {
      type: "node",
      id: "1",
      labels: ["Technology"],
      properties: { name: "React", id: "tech-react", category: "Frontend" },
    },
    {
      type: "node",
      id: "2",
      labels: ["Technology"],
      properties: { name: "Next.js", id: "tech-nextjs", category: "Frontend" },
    },
    {
      type: "node",
      id: "3",
      labels: ["Technology"],
      properties: { name: "Neo4j", id: "tech-neo4j", category: "Database" },
    },
    {
      type: "node",
      id: "4",
      labels: ["Technology"],
      properties: { name: "Python", id: "tech-python", category: "Language" },
    },
    {
      type: "node",
      id: "10",
      labels: ["Skill"],
      properties: {
        name: "Leadership",
        id: "skill-leadership",
        level: "expert",
      },
    },
    {
      type: "node",
      id: "11",
      labels: ["Skill"],
      properties: {
        name: "Software Architecture",
        id: "skill-architecture",
        level: "expert",
      },
    },
    {
      type: "node",
      id: "12",
      labels: ["Skill"],
      properties: {
        name: "Design Patterns",
        id: "skill-design-patterns",
        level: "expert",
      },
    },
    {
      type: "node",
      id: "20",
      labels: ["Pattern"],
      properties: {
        name: "Atomic Design",
        id: "pattern-atomic",
        category: "UI",
      },
    },
    {
      type: "node",
      id: "21",
      labels: ["Pattern"],
      properties: {
        name: "Microservices",
        id: "pattern-microservices",
        category: "Architecture",
      },
    },
    {
      type: "node",
      id: "30",
      labels: ["Project"],
      properties: {
        id: "proj-portfolio",
        title: "Portfolio Website",
        description:
          "A personal portfolio website built with Next.js, React, and Neo4j graph database for career data visualization",
        role: "Full Stack Developer",
        completedDate: "2024-01-15",
        complexity: 8,
        fileCount: 150,
        impact: "Demonstrates full-stack capabilities",
      },
    },
    {
      type: "node",
      id: "31",
      labels: ["Project"],
      properties: {
        id: "proj-api-service",
        title: "GraphQL API Service",
        description:
          "A scalable GraphQL API service with TypeScript and microservices architecture",
        role: "Backend Developer",
        completedDate: "2023-08-20",
        complexity: 7,
        fileCount: 80,
        impact: "Improved API response time by 40%",
      },
    },
    {
      type: "node",
      id: "40",
      labels: ["Employment"],
      properties: {
        id: "emp-current",
        company: "Electric Kiwi",
        position: "Senior Software Engineer",
        startDate: "2022-01-01",
        isCurrent: true,
        description:
          "Leading a team of engineers on a major customer service platform migration",
      },
    },
    {
      type: "node",
      id: "41",
      labels: ["Employment"],
      properties: {
        id: "emp-previous",
        company: "Tech Corp",
        position: "Software Engineer",
        startDate: "2020-01-01",
        endDate: "2021-12-31",
        isCurrent: false,
        description: "Developed React applications and Python backend services",
      },
    },
    {
      type: "node",
      id: "50",
      labels: ["Achievement"],
      properties: {
        id: "ach-1",
        description:
          "Led migration of customer service platform to Zendesk, improving ticket resolution time by 35%",
        impact: "high",
      },
    },
    {
      type: "node",
      id: "51",
      labels: ["Achievement"],
      properties: {
        id: "ach-2",
        description: "Managed a team of 5 engineers to deliver project on time",
        impact: "high",
      },
    },
    {
      type: "node",
      id: "60",
      labels: ["Education"],
      properties: {
        id: "edu-1",
        grade: "First Class Honours",
        startDate: "2015-01-01",
        endDate: "2018-12-01",
      },
    },
    {
      type: "node",
      id: "61",
      labels: ["Institution"],
      properties: {
        id: "inst-1",
        name: "University of Technology",
      },
    },
    {
      type: "node",
      id: "62",
      labels: ["Degree"],
      properties: {
        id: "degree-1",
        name: "Bachelor of Computer Science",
      },
    },
  ];

  const relationships: Neo4jRelationship[] = [
    {
      type: "relationship",
      id: "r1",
      label: RELATIONSHIP_TYPES.USES,
      start: nodes.find(
        (n) => n.properties.id === "proj-portfolio",
      ) as Neo4jNode,
      end: nodes.find(
        (n) => n.properties.id === "tech-typescript",
      ) as Neo4jNode,
    },
    {
      type: "relationship",
      id: "r2",
      label: RELATIONSHIP_TYPES.USES,
      start: nodes.find(
        (n) => n.properties.id === "proj-portfolio",
      ) as Neo4jNode,
      end: nodes.find((n) => n.properties.id === "tech-react") as Neo4jNode,
    },
    {
      type: "relationship",
      id: "r3",
      label: RELATIONSHIP_TYPES.USES,
      start: nodes.find(
        (n) => n.properties.id === "proj-portfolio",
      ) as Neo4jNode,
      end: nodes.find((n) => n.properties.id === "tech-nextjs") as Neo4jNode,
    },
    {
      type: "relationship",
      id: "r4",
      label: RELATIONSHIP_TYPES.USES,
      start: nodes.find(
        (n) => n.properties.id === "proj-portfolio",
      ) as Neo4jNode,
      end: nodes.find((n) => n.properties.id === "tech-neo4j") as Neo4jNode,
    },
    {
      type: "relationship",
      id: "r5",
      label: RELATIONSHIP_TYPES.USES,
      start: nodes.find(
        (n) => n.properties.id === "proj-api-service",
      ) as Neo4jNode,
      end: nodes.find(
        (n) => n.properties.id === "tech-typescript",
      ) as Neo4jNode,
    },
    {
      type: "relationship",
      id: "r10",
      label: RELATIONSHIP_TYPES.DEMONSTRATES,
      start: nodes.find(
        (n) => n.properties.id === "proj-portfolio",
      ) as Neo4jNode,
      end: nodes.find(
        (n) => n.properties.id === "skill-architecture",
      ) as Neo4jNode,
    },
    {
      type: "relationship",
      id: "r11",
      label: RELATIONSHIP_TYPES.DEMONSTRATES,
      start: nodes.find(
        (n) => n.properties.id === "proj-api-service",
      ) as Neo4jNode,
      end: nodes.find(
        (n) => n.properties.id === "skill-design-patterns",
      ) as Neo4jNode,
    },
    {
      type: "relationship",
      id: "r20",
      label: RELATIONSHIP_TYPES.IMPLEMENTS,
      start: nodes.find(
        (n) => n.properties.id === "proj-portfolio",
      ) as Neo4jNode,
      end: nodes.find((n) => n.properties.id === "pattern-atomic") as Neo4jNode,
    },
    {
      type: "relationship",
      id: "r21",
      label: RELATIONSHIP_TYPES.IMPLEMENTS,
      start: nodes.find(
        (n) => n.properties.id === "proj-api-service",
      ) as Neo4jNode,
      end: nodes.find(
        (n) => n.properties.id === "pattern-microservices",
      ) as Neo4jNode,
    },
    {
      type: "relationship",
      id: "r30",
      label: RELATIONSHIP_TYPES.USED_TECHNOLOGY,
      start: nodes.find((n) => n.properties.id === "emp-current") as Neo4jNode,
      end: nodes.find(
        (n) => n.properties.id === "tech-typescript",
      ) as Neo4jNode,
    },
    {
      type: "relationship",
      id: "r31",
      label: RELATIONSHIP_TYPES.USED_TECHNOLOGY,
      start: nodes.find((n) => n.properties.id === "emp-current") as Neo4jNode,
      end: nodes.find((n) => n.properties.id === "tech-react") as Neo4jNode,
    },
    {
      type: "relationship",
      id: "r32",
      label: RELATIONSHIP_TYPES.USED_TECHNOLOGY,
      start: nodes.find((n) => n.properties.id === "emp-previous") as Neo4jNode,
      end: nodes.find((n) => n.properties.id === "tech-python") as Neo4jNode,
    },
    {
      type: "relationship",
      id: "r40",
      label: RELATIONSHIP_TYPES.ACHIEVED,
      start: nodes.find((n) => n.properties.id === "emp-current") as Neo4jNode,
      end: nodes.find((n) => n.properties.id === "ach-1") as Neo4jNode,
    },
    {
      type: "relationship",
      id: "r41",
      label: RELATIONSHIP_TYPES.ACHIEVED,
      start: nodes.find((n) => n.properties.id === "emp-current") as Neo4jNode,
      end: nodes.find((n) => n.properties.id === "ach-2") as Neo4jNode,
    },
    {
      type: "relationship",
      id: "r50",
      label: RELATIONSHIP_TYPES.DEMONSTRATES,
      start: nodes.find((n) => n.properties.id === "ach-1") as Neo4jNode,
      end: nodes.find(
        (n) => n.properties.id === "skill-leadership",
      ) as Neo4jNode,
    },
    {
      type: "relationship",
      id: "r51",
      label: RELATIONSHIP_TYPES.DEMONSTRATES,
      start: nodes.find((n) => n.properties.id === "ach-2") as Neo4jNode,
      end: nodes.find(
        (n) => n.properties.id === "skill-leadership",
      ) as Neo4jNode,
    },
    {
      type: "relationship",
      id: "r60",
      label: RELATIONSHIP_TYPES.AT_INSTITUTION,
      start: nodes.find((n) => n.properties.id === "edu-1") as Neo4jNode,
      end: nodes.find((n) => n.properties.id === "inst-1") as Neo4jNode,
    },
    {
      type: "relationship",
      id: "r61",
      label: RELATIONSHIP_TYPES.FOR_DEGREE,
      start: nodes.find((n) => n.properties.id === "edu-1") as Neo4jNode,
      end: nodes.find((n) => n.properties.id === "degree-1") as Neo4jNode,
    },
  ];

  return { nodes, relationships };
}

export async function seedIntegrationTestFixtures(
  neogma: Neogma,
  fixtures: { nodes: Neo4jNode[]; relationships: Neo4jRelationship[] },
): Promise<void> {
  const session = neogma.driver.session();
  const dummyEmbedding = new Array(1536).fill(0.1);

  try {
    for (const node of fixtures.nodes) {
      const labels = node.labels.join(":");
      const props = { ...node.properties };

      if (labels.includes("Project") || labels.includes("Employment")) {
        props.embedding = dummyEmbedding;
      }

      await session.run(
        `MERGE (n:${labels} {id: $id}) ON CREATE SET n = $props`,
        { id: props.id, props },
      );
    }

    for (const rel of fixtures.relationships) {
      if (!rel.start || !rel.end) continue;

      const startId = rel.start.properties.id;
      const endId = rel.end.properties.id;

      await session.run(
        `
        MATCH (start {id: $startId})
        MATCH (end {id: $endId})
        MERGE (start)-[:${rel.label}]->(end)
        `,
        { startId, endId },
      );
    }
  } finally {
    await session.close();
  }
}

export async function clearIntegrationTestDatabase(
  neogma: Neogma,
): Promise<void> {
  const session = neogma.driver.session();
  try {
    await session.run("MATCH (n) DETACH DELETE n");
  } finally {
    await session.close();
  }
}

export async function createIntegrationTestIndexes(
  neogma: Neogma,
): Promise<void> {
  const session = neogma.driver.session();

  try {
    const constraints = [
      "CREATE CONSTRAINT project_id_unique IF NOT EXISTS FOR (p:Project) REQUIRE p.id IS UNIQUE",
      "CREATE CONSTRAINT employment_id_unique IF NOT EXISTS FOR (e:Employment) REQUIRE e.id IS UNIQUE",
      "CREATE CONSTRAINT achievement_id_unique IF NOT EXISTS FOR (a:Achievement) REQUIRE a.id IS UNIQUE",
      "CREATE CONSTRAINT technology_id_unique IF NOT EXISTS FOR (t:Technology) REQUIRE t.id IS UNIQUE",
      "CREATE CONSTRAINT skill_id_unique IF NOT EXISTS FOR (s:Skill) REQUIRE s.id IS UNIQUE",
      "CREATE CONSTRAINT pattern_id_unique IF NOT EXISTS FOR (p:Pattern) REQUIRE p.id IS UNIQUE",
      "CREATE CONSTRAINT education_id_unique IF NOT EXISTS FOR (e:Education) REQUIRE e.id IS UNIQUE",
      "CREATE CONSTRAINT institution_id_unique IF NOT EXISTS FOR (i:Institution) REQUIRE i.id IS UNIQUE",
      "CREATE CONSTRAINT degree_id_unique IF NOT EXISTS FOR (d:Degree) REQUIRE d.id IS UNIQUE",
    ];

    for (const constraint of constraints) {
      try {
        await session.run(constraint);
      } catch {}
    }

    const fulltextIndexes = [
      `CREATE FULLTEXT INDEX project_search IF NOT EXISTS FOR (p:Project) ON EACH [p.title, p.description, p.role]`,
      `CREATE FULLTEXT INDEX employment_search IF NOT EXISTS FOR (e:Employment) ON EACH [e.company, e.position, e.description]`,
      `CREATE FULLTEXT INDEX achievement_search IF NOT EXISTS FOR (a:Achievement) ON EACH [a.description]`,
    ];

    for (const index of fulltextIndexes) {
      try {
        await session.run(index);
      } catch {}
    }

    const vectorIndexes = [
      `CREATE VECTOR INDEX project_vec_idx IF NOT EXISTS FOR (p:Project) ON (p.embedding) OPTIONS {indexConfig: {\`vector.dimensions\`: 1536, \`vector.similarity_function\`: 'cosine'}}`,
      `CREATE VECTOR INDEX employment_vec_idx IF NOT EXISTS FOR (e:Employment) ON (e.embedding) OPTIONS {indexConfig: {\`vector.dimensions\`: 1536, \`vector.similarity_function\`: 'cosine'}}`,
    ];

    for (const index of vectorIndexes) {
      try {
        await session.run(index);
      } catch {}
    }

    await session.run("CALL db.awaitIndexes(60)");
  } finally {
    await session.close();
  }
}

export function getTestNeogma(): Neogma {
  const { Neogma } = require("neogma") as typeof import("neogma");

  const NEO4J_URI = process.env.NEO4J_URI;
  const NEO4J_USER = process.env.NEO4J_USER;
  const NEO4J_PASS = process.env.NEO4J_PASS;

  if (!NEO4J_URI || !NEO4J_USER || !NEO4J_PASS) {
    throw new Error(
      "NEO4J_URI, NEO4J_USER, and NEO4J_PASS environment variables must be set for integration tests",
    );
  }

  return new Neogma({
    url: NEO4J_URI,
    username: NEO4J_USER,
    password: NEO4J_PASS,
  });
}
