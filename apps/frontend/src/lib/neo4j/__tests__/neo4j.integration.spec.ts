import { Neogma } from "neogma";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createModels, type Models } from "@/lib/neo4j/models";
import { RELATIONSHIP_TYPES } from "@/lib/neo4j/relationships";
import {
  clearTestDatabase,
  createTestIndexes,
  seedTestFixtures,
  TEST_FIXTURES,
} from "./fixtures";

const NEO4J_URI = process.env.NEO4J_URI;
const NEO4J_USER = process.env.NEO4J_USER;
const NEO4J_PASS = process.env.NEO4J_PASS;

describe("Neo4j Integration Tests", () => {
  let neogma: Neogma;
  let models: Models;

  beforeAll(async () => {
    if (!NEO4J_URI || !NEO4J_USER || !NEO4J_PASS) {
      throw new Error(
        "NEO4J_URI, NEO4J_USER, and NEO4J_PASS environment variables must be set",
      );
    }

    neogma = new Neogma({
      url: NEO4J_URI,
      username: NEO4J_USER,
      password: NEO4J_PASS,
    });

    models = createModels(neogma);

    await clearTestDatabase(neogma);
    await createTestIndexes(neogma);
    await seedTestFixtures(models, neogma);
  });

  afterAll(async () => {
    if (neogma) {
      await clearTestDatabase(neogma);
      await neogma.driver.close();
    }
  });

  describe("Connection", () => {
    it("should connect to Neo4j and verify connectivity", async () => {
      const session = neogma.driver.session();
      try {
        const result = await session.run("RETURN 1 AS num");
        expect(result.records[0].get("num").toNumber()).toBe(1);
      } finally {
        await session.close();
      }
    });
  });

  describe("Technology Model", () => {
    it("should find all seeded technologies", async () => {
      const technologies = await models.Technology.findMany();
      expect(technologies.length).toBe(TEST_FIXTURES.technologies.length);
    });

    it("should find technology by id", async () => {
      const tech = await models.Technology.findOne({
        where: { id: "test-tech-typescript" },
      });
      expect(tech).not.toBeNull();
      expect(tech?.name).toBe("TypeScript");
      expect(tech?.category).toBe("Language");
    });
  });

  describe("Project Model", () => {
    it("should find all seeded projects", async () => {
      const projects = await models.Project.findMany();
      expect(projects.length).toBe(TEST_FIXTURES.projects.length);
    });

    it("should find project by id with correct properties", async () => {
      const project = await models.Project.findOne({
        where: { id: "test-project-portfolio" },
      });
      expect(project).not.toBeNull();
      expect(project?.title).toBe("Portfolio Website");
      expect(project?.complexity).toBe(8);
    });
  });

  describe("Employment Model", () => {
    it("should find all seeded employments", async () => {
      const employments = await models.Employment.findMany();
      expect(employments.length).toBe(TEST_FIXTURES.employments.length);
    });

    it("should find current employment", async () => {
      const emp = await models.Employment.findOne({
        where: { isCurrent: true },
      });
      expect(emp).not.toBeNull();
      expect(emp?.company).toBe("Test Company");
      expect(emp?.position).toBe("Senior Software Engineer");
    });
  });

  describe("Relationships", () => {
    it("should find technologies used by a project", async () => {
      const session = neogma.driver.session();
      try {
        const result = await session.run(
          `
					MATCH (p:Project {id: $projectId})-[:${RELATIONSHIP_TYPES.USES}]->(t:Technology)
					RETURN t.name AS techName
					ORDER BY t.name
				`,
          { projectId: "test-project-portfolio" },
        );

        const techNames = result.records.map((r) => r.get("techName"));
        expect(techNames).toContain("TypeScript");
        expect(techNames).toContain("React");
        expect(techNames).toContain("Next.js");
        expect(techNames).toContain("Neo4j");
      } finally {
        await session.close();
      }
    });

    it("should find skills demonstrated by a project", async () => {
      const session = neogma.driver.session();
      try {
        const result = await session.run(
          `
					MATCH (p:Project {id: $projectId})-[:${RELATIONSHIP_TYPES.DEMONSTRATES}]->(s:Skill)
					RETURN s.name AS skillName
					ORDER BY s.name
				`,
          { projectId: "test-project-portfolio" },
        );

        const skillNames = result.records.map((r) => r.get("skillName"));
        expect(skillNames).toContain("Frontend Development");
        expect(skillNames).toContain("System Architecture");
      } finally {
        await session.close();
      }
    });

    it("should find patterns implemented by a project", async () => {
      const session = neogma.driver.session();
      try {
        const result = await session.run(
          `
					MATCH (p:Project {id: $projectId})-[:${RELATIONSHIP_TYPES.IMPLEMENTS}]->(pat:Pattern)
					RETURN pat.name AS patternName
				`,
          { projectId: "test-project-portfolio" },
        );

        const patternNames = result.records.map((r) => r.get("patternName"));
        expect(patternNames).toContain("Atomic Design");
      } finally {
        await session.close();
      }
    });

    it("should find achievements for an employment", async () => {
      const session = neogma.driver.session();
      try {
        const result = await session.run(
          `
					MATCH (e:Employment {id: $empId})-[:${RELATIONSHIP_TYPES.ACHIEVED}]->(a:Achievement)
					RETURN a.description AS description, a.impact AS impact
				`,
          { empId: "test-emp-current" },
        );

        expect(result.records.length).toBe(2);
        const descriptions = result.records.map((r) => r.get("description"));
        expect(descriptions).toContain(
          "Led migration to modern frontend architecture",
        );
        expect(descriptions).toContain(
          "Implemented comprehensive testing strategy",
        );
      } finally {
        await session.close();
      }
    });

    it("should find technologies used by an employment", async () => {
      const session = neogma.driver.session();
      try {
        const result = await session.run(
          `
					MATCH (e:Employment {id: $empId})-[:${RELATIONSHIP_TYPES.USED_TECHNOLOGY}]->(t:Technology)
					RETURN t.name AS techName
					ORDER BY t.name
				`,
          { empId: "test-emp-current" },
        );

        const techNames = result.records.map((r) => r.get("techName"));
        expect(techNames).toContain("TypeScript");
        expect(techNames).toContain("React");
        expect(techNames).toContain("Next.js");
      } finally {
        await session.close();
      }
    });
  });

  describe("Graph Traversal Queries", () => {
    it("should find projects using a specific technology", async () => {
      const session = neogma.driver.session();
      try {
        const result = await session.run(
          `
					MATCH (t:Technology {name: $techName})<-[:${RELATIONSHIP_TYPES.USES}]-(p:Project)
					RETURN p.title AS title
					ORDER BY p.title
				`,
          { techName: "TypeScript" },
        );

        const titles = result.records.map((r) => r.get("title"));
        expect(titles).toContain("Portfolio Website");
        expect(titles).toContain("GraphQL API Service");
      } finally {
        await session.close();
      }
    });

    it("should find all skills demonstrated across projects and achievements", async () => {
      const session = neogma.driver.session();
      try {
        const result = await session.run(`
					MATCH (s:Skill)<-[:${RELATIONSHIP_TYPES.DEMONSTRATES}]-(source)
					RETURN DISTINCT s.name AS skillName, labels(source)[0] AS sourceType
					ORDER BY s.name
				`);

        const skills = result.records.map((r) => ({
          name: r.get("skillName"),
          sourceType: r.get("sourceType"),
        }));

        expect(skills.length).toBeGreaterThan(0);
        expect(skills.some((s) => s.sourceType === "Project")).toBe(true);
        expect(skills.some((s) => s.sourceType === "Achievement")).toBe(true);
      } finally {
        await session.close();
      }
    });

    it("should count relationships per project", async () => {
      const session = neogma.driver.session();
      try {
        const result = await session.run(
          `
					MATCH (p:Project {id: $projectId})
					OPTIONAL MATCH (p)-[:${RELATIONSHIP_TYPES.USES}]->(t:Technology)
					OPTIONAL MATCH (p)-[:${RELATIONSHIP_TYPES.DEMONSTRATES}]->(s:Skill)
					OPTIONAL MATCH (p)-[:${RELATIONSHIP_TYPES.IMPLEMENTS}]->(pat:Pattern)
					RETURN
						p.title AS title,
						count(DISTINCT t) AS techCount,
						count(DISTINCT s) AS skillCount,
						count(DISTINCT pat) AS patternCount
				`,
          { projectId: "test-project-portfolio" },
        );

        const record = result.records[0];
        expect(record.get("title")).toBe("Portfolio Website");
        expect(record.get("techCount").toNumber()).toBe(4);
        expect(record.get("skillCount").toNumber()).toBe(2);
        expect(record.get("patternCount").toNumber()).toBe(1);
      } finally {
        await session.close();
      }
    });
  });

  describe("Fulltext Search", () => {
    it("should find projects by fulltext search on title", async () => {
      const session = neogma.driver.session();
      try {
        const result = await session.run(`
					CALL db.index.fulltext.queryNodes('project_search', 'Portfolio')
					YIELD node, score
					RETURN node.title AS title, score
					ORDER BY score DESC
				`);

        expect(result.records.length).toBeGreaterThan(0);
        expect(result.records[0].get("title")).toBe("Portfolio Website");
      } finally {
        await session.close();
      }
    });

    it("should find employments by fulltext search on company", async () => {
      const session = neogma.driver.session();
      try {
        const result = await session.run(`
					CALL db.index.fulltext.queryNodes('employment_search', 'Test Company')
					YIELD node, score
					RETURN node.company AS company, node.position AS position
				`);

        expect(result.records.length).toBeGreaterThan(0);
        expect(result.records[0].get("company")).toBe("Test Company");
      } finally {
        await session.close();
      }
    });
  });
});
